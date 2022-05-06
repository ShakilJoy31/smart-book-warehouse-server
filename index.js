const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
app.use(cors());
require('dotenv').config();
app.use(express.json());
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');


// Verifying to token
function verifyJWT(req, res, next) {
    const authheader = req?.headers?.authorization;
    if (!authheader) {
        return res.status(401).send({ message: 'Unauthorized access' })
    }
    const token = authheader.split(' ')[1];
    jwt.verify(token, process.env.AccessTokenSecret, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidded access' })
        }
        req.decoded = decoded;
    })
    next();
}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.BD_PASS}@cluster0.bkjf1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const booksCollection = client.db('smartBook').collection('allBook');
        const booksCollectionWithEmail = client.db('smartBook').collection('emailWiseBook');


        // Using Token. 
        app.post('/loginToken', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.AccessTokenSecret, {
                expiresIn: '1d'
            });
            res.send({ accessToken });
        })

        app.post('/signInToken', async (req, res) => {
            const user = await req.body;
            console.log('got email ',user.email); 
            const accessToken = jwt.sign(user, process.env.AccessTokenSecret, {
                expiresIn: '1d'
            });
            res.send({ accessToken });
        })   

        



        // Getting all collcetion from database. 
        app.get('/books', async (req, res) => {
            const query = {};
            const cursor = booksCollection.find(query);
            const books = await cursor.toArray();
            res.send(books);
        });


        // Getting a particullar collection from database. 
        app.get(`/particularBook/:id`, verifyJWT, async (req, res) => {
            const decodedEmail = req?.decoded?.email;
            const email = req?.headers?.email;
            console.log(decodedEmail); 
            console.log(email); 
            if (decodedEmail === email) {
                const id = req.params.id;
                const query = { _id: ObjectId(id) };
                const getBook = await booksCollection.findOne(query);
                res.send(getBook);
            }
            else {
                res.status(403).send({ message: 'Forbidden Access' })
            }

        });

        // Updating quantity 
        app.put('/updateQuantity/:id', async (req, res) => {
            const id = req.params.id;
            const updatedQuantity = req.body;
            const getId = { _id: ObjectId(id) };
            const option = { upsert: true };
            const updateDoc = {
                $set: {
                    quantity: updatedQuantity.quantity
                }
            };
            const result = await booksCollection.updateOne(getId, updateDoc, option);
            res.send(result);
        });


        // Stocked quantity update stockedQuantity
        app.put('/stockedQuantity/:id', async (req, res) => {
            const id = req.params.id;
            const updatedStock = req.body;
            console.log(updatedStock);
            const getId = { _id: ObjectId(id) };
            const option = { upsert: true };
            const updateDoc = {
                $set: {
                    quantity: updatedStock.totalQuantity
                }
            };
            const result = await booksCollection.updateOne(getId, updateDoc, option);
            res.send(result);
        });

        // Delete a particular item from database. 
        app.delete('/delete/:id', async (req, res) => {
            const id = req.params.id;
            const foundId = { _id: ObjectId(id) };
            const result = await booksCollection.deleteOne(foundId);
            res.send(result);
        });

        // Add a new book to the database. 

        app.post('/addBook', async (req, res) => {
            const newBook = req.body;
            const sentBookToTheDatabase = await booksCollection.insertOne(newBook);
            res.send(sentBookToTheDatabase);
        });



        // Add books email wise
        app.post('/addBook', async (req, res) => {
            const newBook = req.body;
            const sentBookToTheDatabase = await booksCollection.insertOne(newBook);
            res.send(sentBookToTheDatabase);
        });
        // Gettig the books email wise from the database. 
        app.get('/addBook', verifyJWT, async (req, res) => {
            const decodedEmail = req?.decoded?.email;
            const email = req?.headers?.email;
            if (decodedEmail === email) {
                const query = {};
                const getBook = booksCollection.find(query);
                const result = await getBook.toArray();
                res.send(result); 
            }
            else {
                res.status(403).send({ message: 'Forbidden Access' })
            }

        });
        // Delete a particular book a person has added. 
        app.delete(`/deleteSpecificBook/:id`, async (req, res) => {
            const id = req.params.id;
            const foundId = { _id: ObjectId(id) };
            const result = await booksCollection.deleteOne(foundId);
            res.send(result);
        })
    }
    finally {

    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Smartbook warehouse is running.');
});

app.listen(port, () => {
    console.log('Listening to the port ', port);
})