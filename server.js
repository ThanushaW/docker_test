let express = require('express');
let path = require('path');
let fs = require('fs');
const { MongoClient, ObjectId } = require('mongodb');
let bodyParser = require('body-parser');
let app = express();
const port = 3000;
const mongoUrl = 'mongodb://admin:password@52.146.33.108:27017';
const databaseName = 'user-account';
let mongoClientOptions = { useNewUrlParser: true, useUnifiedTopology: true };

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, "index.html"));
  });

app.get('/profile-picture', function (req, res) {
  let img = fs.readFileSync(path.join(__dirname, "profile-1.jpg"));
  res.writeHead(200, {'Content-Type': 'image/jpg' });
  res.end(img, 'binary');
});


// GET request to fetch user by ID
app.get('/users/:id', (req, res) => {
    const userId = req.params.id;
  
    MongoClient.connect(mongoUrl, (err, client) => {
      if (err) {
        console.error(err);
        res.status(500).send('Failed to connect to the database');
        return;
      }
  
      const db = client.db(databaseName);
      const usersCollection = db.collection('users');
  
      usersCollection.findOne({ _id: ObjectId(userId) }, (err, user) => {
        if (err) {
          console.error(err);
          res.status(500).send('Failed to fetch user from the database');
          return;
        }
  
        if (!user) {
          res.status(404).send('User not found');
          return;
        }
  
        res.json(user);
      });
    });
  });

// POST request to create a new user
app.post('/users', (req, res) => {
    const newUser = req.body;
  
    MongoClient.connect(mongoUrl, (err, client) => {
      if (err) {
        console.error(err);
        res.status(500).send('Failed to connect to the database');
        return;
      }
  
      const db = client.db(databaseName);
      const usersCollection = db.collection('users');
  
      usersCollection.insertOne(newUser, (err, result) => {
        if (err) {
          console.error(err);
          res.status(500).send('Failed to create a new user');
          return;
        }
  
        res.status(201).send('User created successfully');
      });
    });
  });
  
  // PUT request to update an existing user
  app.put('/users/:id', (req, res) => {
    const userId = req.params.id;
    const updatedUser = req.body;
  
    MongoClient.connect(mongoUrl, (err, client) => {
      if (err) {
        console.error(err);
        res.status(500).send('Failed to connect to the database');
        return;
      }
  
      const db = client.db(databaseName);
      const usersCollection = db.collection('users');
  
      usersCollection.updateOne(
        { _id: ObjectId(userId) },
        { $set: updatedUser },
        (err, result) => {
          if (err) {
            console.error(err);
            res.status(500).send('Failed to update the user');
            return;
          }
  
          if (result.modifiedCount === 0) {
            res.status(404).send('User not found');
            return;
          }
  
          res.send('User updated successfully');
        }
      );
    });
  });
  

// Start the server
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
