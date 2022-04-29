const express = require('express'); 
const app = express(); 
const port = process.env.PORT || 5000; 
const cors = require('cors');
app.use(cors());  
require('dotenv').config();
app.use(express.json()); 
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.BD_PASS}@cluster0.bkjf1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        await client.connect(); 
        const booksCollection = client.db('smartBook').collection('allBook'); 

        // Getting all collcetion from database. 
        app.get('/books', async (req, res)=>{
            const query = {}; 
            const cursor = booksCollection.find(query); 
            const books = await cursor.toArray(); 
            res.send(books); 
        }); 


        // Getting a particullar collection from database. 
        app.get(`/particularBook/:id`, async (req, res)=>{
            const id = req.params.id; 
            const query = {_id:ObjectId(id)};
            const getBook = await booksCollection.findOne(query); 
            res.send(getBook); 
        }); 
    }
    finally{

    }
}
run().catch(console.dir); 




app.get('/', (req, res)=>{
    res.send('Smartbook warehouse is running.'); 
}); 

app.listen(port, ()=> {
    console.log('Listening to the port ',port); 
})