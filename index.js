const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
require('dotenv').config();
const jwt =  require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(express.json());
app.use(cors());



const uri = `mongodb+srv://${process.env.BD_USER}:${process.env.DB_PASSWORD}@cluster0.p8qnexq.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {

        const allVagetables = client.db('kachaBazar').collection('vagetables')
        const allFruits = client.db('kachaBazar').collection('fruits')
        const allFishes = client.db('kachaBazar').collection('fish')
        const allbookings = client.db('kachaBazar').collection('bookings')
        const allUsers = client.db('kachaBazar').collection('users')
        const addProduct = client.db('kachaBazar').collection('addProducts')

        app.get('/vagetable', async (req, res) => {
            const query = {};
            const result = await allVagetables.find(query).toArray();
            res.send(result)
        })

        app.get('/fruit', async (req, res) => {
            const query = {};
            const result = await allFruits.find(query).toArray();
            res.send(result)
        })

        app.get('/fish', async (req, res) => {
            const query = {};
            const result = await allFishes.find(query).toArray();
            res.send(result)
        })

        app.post('/bookings', async (req, res) => {
            const query = req.body;
            const result = await allbookings.insertOne(query);
            res.send(result);
        })

        app.get('/bookings', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const result = await allbookings.find(query).toArray();
            res.send(result);
        })

        app.put('/bookings', async (req, res) => {
            const id = req.body._id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true }
            const updateDoc = {
                $set: {
                    newPrice: req.body.newPrice,
                    count: req.body.newCount
                }
            }
            const result = await allbookings.updateOne(filter, updateDoc, options)
            res.send(result)
        })

        app.delete('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await allbookings.deleteOne(query)
            res.send(result)
        })

        app.post('/user', async (req, res) => {
            const query = req.body;
            const inserted = await allUsers.findOne({ email: query.email })
            if (inserted) {
                return res.send({ message: 'Previously Added' })
            }
            const result = await allUsers.insertOne(query);
            res.send(result);
        })

        app.get('/user', async (req, res) => {
            const query = {};
            // const result = await allUsers.find(query).sort({"_id": -1}).toArray();
            const result = await allUsers.find(query).toArray();
            res.send(result);
        })

        app.put('/user/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const option = { upsert: true };
            const updateDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await allUsers.updateOne(filter, updateDoc, option);
            res.send(result)
        })

        app.delete('/user/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await allUsers.deleteOne(query);
            res.send(result);
        })

        app.get('/allBookings', async (req, res) => {
            const query = {}
            const result = await allbookings.find(query).toArray()
            res.send(result)
        })

        app.post('/addProduct', async (req, res) => {
            const product = req.body;
            const query = product.cetagory_name;
            if (query == 'Vagetable Item') {
                const result1 = await allVagetables.insertOne(product)
            }
            else if (query == 'Fruits Item') {
                const result2 = await allFruits.insertOne(product)
            }
            else {
                const result3 = await allFishes.insertOne(product)
            }
            const result = await addProduct.insertOne(product)
            res.send(result)
        })

        app.get('/addProduct', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const result = await addProduct.find(query).toArray();
            res.send(result)
        })

        app.get('/user/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await allUsers.findOne(query);
            res.send({ isAdmin: user?.role == 'admin' });
        })

        app.get('/user/seller/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await allUsers.findOne(query);
            res.send({ isSeller: user?.role == 'seller' || user?.role == 'admin' })
        })

        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const user = await allUsers.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN) //, {expiresIn: '1h'}
                // console.log(token);
                return res.send({ accessToken: token })
            }
            res.status(403).send({ accessToken: '' })
        })

    }
    finally {

    }
}

run().catch(console.log)



app.get('/', (req, res) => {
    res.send('kacha bazar is running')
})

app.listen(port, () => {
    console.log(`Kacha bazar start on port ${port}`)
})