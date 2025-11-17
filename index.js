const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require("dotenv").config();
const admin = require("firebase-admin");
const serviceAccount = require("./serviceKey.json");
const app = express()
const port = 3000
app.use(cors())
app.use(express.json())




admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});




const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_password}@cluster0.qwnp7az.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version.
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


const verifyToken = async (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return res.status(401).send({
      message: "unauthorized access. Token not found!",
    });
  }

  const token = authorization.split(" ")[1];
  try {
    await admin.auth().verifyIdToken(token);

    next();
  } catch (error) {
    res.status(401).send({
      message: "unauthorized access.",
    });
  }
};


async function run() {
  try {
    await client.connect();

    const db = client.db('model-db')
    const modelCollection = db.collection('models');
    const downloadCollection = db.collection("downloads");

    // find
    // findOne
    //get method and find use কোরে মঙ্গোডিবি থাকি ডেটা আনা
    app.get('/models', async (req, res) => {
        const result = await modelCollection.find().toArray()
        // console.log(result); 
        res.send(result)
    })


    //এখানে product details page এর জোন্য নির্দিষ্ট একটা করে id দিয়ে তার ভিতর mongodb থেকে ডাটা আনা হচ্ছে থেকে 
    // app.get('/models/:id', middleware, async (req, res) => {
    app.get('/models/:id',  async (req, res) => {
        const {id} = req.params
        const objectId = new ObjectId(id)

        const result = await modelCollection.findOne({_id: objectId})
           console.log(result)
        res.send({
            success: true,
            result
        })
    })

    // post method
    //  insertOne
   //  insertMany
// এখানে POST ব্যবহার করে কীভাবে client-side এর login form থেকে data server-এ পাঠানো হচ্ছে, সেটা বুঝানো হচ্ছে।
   app.post('/models', async (req, res) => {
        const data = req.body
        // console.log(data)
        const result = await modelCollection.insertOne(data)
        res.send({
            success: true,
            result
        })
   })

   //PUT 
   //updateOne
   //updateMany
  // এটা দিয়ে আমরা কোনো cart এর ডেটা আপডেট করতে পারি।
   app.put('/models/:id', async (req, res) => {
        const {id} = req.params
        const data = req.body
        // console.log(id)
        // console.log(data)
        const objectId = new ObjectId(id)
        const filter = {_id: objectId}
        const update = {
            $set: data
        }

       const result  = await modelCollection.updateOne(filter, update)


       res.send({
        success: true,
        result
       })
   })


   // delete
   // deleteOne
   // deleteMany
   // এটা দিয়ে আমরা নির্দিষ্ট কার্টের আইডি ধরে তার ডেটা রিমুভ করতে পারি, অর্থাৎ সেই কার্টটাই ডিলিট করে দিতে পারি।
   app.delete('/models/:id', async(req, res) => {
      const {id} = req.params
        //    const objectId = new ObjectId(id)
        // const filter = {_id: objectId}
      const result = await modelCollection.deleteOne({_id: new ObjectId(id)})

      res.send({
        success: true,
        result
      })
   })


// latest 6 data 
// get
// find

  app.get('/latest-models', async (req, res) => {
    const result = await modelCollection.find().sort({created_at: 'desc'}).limit(6).toArray()
    console.log(result)

    res.send(result)
  })


  
    app.get("/my-models", verifyToken, async(req, res) => {
      const email = req.query.email
      const result = await modelCollection.find({created_by: email}).toArray()
      res.send(result)
    })




    app.post("/models/downloads/:id", async(req, res) => {
      const data = req.body
      const id = req.params.id
      //downloads collection...
      const result = await downloadCollection.insertOne(data)



      // //downloads counted 
      const filter = {_id: new ObjectId(id)}
      const update = {
        $inc: {
          downloads: 1
        }
      }
      const downloadCounted = await modelCollection.updateOne(filter, update)
      // res.send({result, downloadCounted})
      res.send(result, downloadCounted)
    })

     app.get("/my-downloads", verifyToken, async(req, res) => {
      const email = req.query.email;
      const result = await downloadCollection.find({downloaded_by: email}).toArray()
      res.send(result)
    })

    app.get("/search", async(req, res) => {
      const search_text = req.query.search
      const result = await modelCollection.find({name: {$regex: search_text, $options: "i"}}).toArray()
      res.send(result)
    })



    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);








app.get('/', (req, res) =>  {
    res.send("Server is running fine!")
})

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`)
})  