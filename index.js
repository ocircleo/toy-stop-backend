const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
// middlewere
app.use(cors());
app.use(express.json());
//mongo db
// Replace the uri string with your MongoDB deployment's connection string.
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@ocircleo.zgezjlp.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    client.connect((err) => {
      if (err) {
        console.log(err);
      }
      return;
    });
    const toysDB = client.db("toysDB");
    const toysCollection = toysDB.collection("toys");
    const usersCollection = toysDB.collection("users");
    // serever starting poing
    app.get("/", (req, res) => {
      res.send(`hello ! littel kid to my toy shop`);
    });
    //gets all the toys info
    app.get("/toys", async (req, res) => {
      //succes
      const allToysData = toysCollection.find();
      const result = await allToysData.toArray();
      res.send(result);
    });
    // gets logged in users email based data
    app.get("/toys/user/:email", async (req, res) => {
      //succes
      const reqEmail = req.params.email;
      const fillter = { email: reqEmail };
      const usersToys = toysCollection.find(fillter);
      const result = await usersToys.toArray();
      res.send(result);
    });
    // gets limited number of info
    app.get("/toys/get", async (req, res) => {
      //succes
      const someToysData = toysCollection.aggregate([{ $limit: 20 }]);
      const result = await someToysData.toArray();
      res.send(result);
    });
    //gets single data
    app.get("/toys/:id", async (req, res) => {
      // succes
      const id = req.params.id;
      const fillter = { _id: new ObjectId(id) };
      const singleToyData = await toysCollection.findOne(fillter);
      res.send(singleToyData);
    });
    //performe text searech
    app.get("/toys/search/:text", async (req, res) => {
      //succes
      const text = req.params.text;
      const result = await toysCollection.find({ toyName: { $regex: text, $options: "i" } ,
      }).toArray()
      res.send(result);
    });
    //get sorted data
    app.get('/toys/sort/:by', async (req, res) => {
      const by = parseInt(req.params.by)
      const result = await toysCollection.aggregate([{ $sort: { price: by } }]).toArray()
      res.send(result)
    })
    // creates new data in server
    app.post("/toys", async (req, res) => {
      //succes
      const reqBody = req.body;
      const result = await toysCollection.insertOne(reqBody);
      res.send(result);
    });
    //updates single data on the server
    app.put("/toys/:id", async (req, res) => {
      //succes
      const id = req.params.id;
      const fillter = { _id: new ObjectId(id) };
      const reqBody = req.body;
      const upsert = { upsert: true };
      const updateSingleToyData = {
        $set: {
          picture: reqBody.picture,
          toyName: reqBody.toyName,
          sellerName: reqBody.sellerName,
          sellerEmail: reqBody.sellerEmail,
          price: reqBody.price,
          rating: reqBody.rating,
          availableQuantity: reqBody.availableQuantity,
          detaill: reqBody.detaill,
          catagory: reqBody.catagory,
        },
      };
      const result = await toysCollection.updateOne(
        fillter,
        updateSingleToyData,
        upsert
      );
      res.send(result);
    });
    //Delets single data from the server
    app.delete("/toys/:id", async (req, res) => {
      //succes
      const id = req.params.id;
      const fillter = { _id: new ObjectId(id) };
      const result = await toysCollection.deleteOne(fillter);
      res.send(result);
    });

    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`app is running at port ${port}`);
});
