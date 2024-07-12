const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const nodemailer = require("nodemailer");

const app = express();
const port = process.env.PORT || 5000;
// console.log(process.env.DB_USER)
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.il352b3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Middleware
app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173", 
    credentials: true, 
}
));

app.get('/', (req, res) => {
    res.send("profile Server is available");
});

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server
        // await client.connect();
        // Send a ping to confirm a successful connection
        const database = client.db("profile");
        const projectCollection = database.collection("projects");

        app.get("/projects",async(req,res)=>{
            const result=await projectCollection.find().toArray();
            res.send(result);
            // console.log(result);
        })

        app.post('/emailSend', async (req, res) => {
            const data = req.body;

            // Create Nodemailer transporter
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.APP_EMAIL,
                    pass: process.env.APP_PASSWORD
                }
            });

            // Email content
            const mailOptions = {
                from: process.env.APP_EMAIL,
                to: data.senderEmail,
                subject: "Make a Connection",
                text: `${data.senderNumber}\n${data.emailBody}`
            };

            // Send email
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error("Error sending email:", error);
                    res.status(500).send("Error sending email");
                } else {
                    console.log("Email sent:", info.response);
                    res.status(200).send(info.response);
                }
            });
        });

        app.get("/projectsDetails/:id",async(req,res)=>{
            const id=req.params.id;
            // console.log(id)
            const query = { _id: new ObjectId(id) };
            const result=await projectCollection.findOne(query);
            // console.log(result)
            res.send(result);
        })
        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } catch (err) {
        console.error("Failed to connect to MongoDB", err);
    }
}

run().catch(console.log);

app.listen(port, () => {
    console.log(`profile Server is available on port ${port}`);
});