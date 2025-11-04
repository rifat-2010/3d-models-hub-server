const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = 3000
app.use(cors())
app.use(express.json())

const uri = "mongodb+srv://model-db:y9d7ocojZfdiGnZv@cluster0.qwnp7az.mongodb.net/?appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();

    const db = client.db('model-db')
    const modelCollection = db.collection('models')

    // find
    // findOne

    app.get('/models', async (req, res) => {
        const result = await modelCollection.find().toArray() 
        res.send(result)
    })



    app.get('/models/:id', async (req, res) => {
        const {id} = req.params
        const objectId = new ObjectId(id)

        const result = await modelCollection.findOne({_id: objectId})
           
        res.send({
            success: true,
            result
        })
    })

    // post method
    //  insertOne
   //  insertMany
   
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


//    latest 6 data 
// get
// find

  app.get('/latest-models', async (req, res) => {

    const result = await modelCollection.find().sort({created_at: 'desc'}).limit(6).toArray()

    console.log(result)

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