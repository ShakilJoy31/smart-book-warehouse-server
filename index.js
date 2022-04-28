const express = require('express'); 
const app = express(); 
const port = process.env.PORT || 5000; 
const cors = require('cors');
app.use(cors());  
require('dotenv').config();
app.use(express.json()); 
const { MongoClient, ServerApiVersion } = require('mongodb');


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.BD_PASS}@cluster0.bkjf1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });




app.get('/', (req, res)=>{
    res.send('Smartbook warehouse is running.'); 
}); 

app.listen(port, ()=> {
    console.log('Listening to the port ',port); 
})