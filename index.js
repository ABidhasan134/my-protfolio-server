const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const nodemailer = require("nodemailer");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 5000;
// console.log(process.env.DB_USER)
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.il352b3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://abid_profile.surge.sh",
      "https://profile-abidhasan134.web.app",
    ],
    credentials: true,
  })
);
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production" ? true : false,
  maxAge: 3600000,
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  expires: new Date(Date.now() + 1 * 3600000), // 1 hours
};

app.get("/", (req, res) => {
  res.send("profile Server is available");
});

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server
    // await client.connect();
    // Send a ping to confirm a successful connection
    const database = client.db("profile");
    const projectCollection = database.collection("projects");
    const developersCollection = database.collection("developers");
    const skillsCollection = database.collection("skills");
    const BlogsCollection = database.collection("blogs");
    app.post("/jwt", async (req, res) => {
      const developer = req.body;
      const token = jwt.sign(developer, process.env.ACCESS_TOKEN, {
        expiresIn: "1h",
      });
      return res.cookie("dev_access", token, cookieOptions).send(token);
    });
    app.get("/projects", async (req, res) => {
      const result = await projectCollection.find().toArray();
      res.send(result);
      // console.log(result);
    });
    app.put("/projects/:id", async (req, res) => {
      const info = req.body;
      const filter = { _id: new ObjectId(req.params.id) };
      // console.log(filter,info);
      const updateDoc = {
        $set: {
          project_category: info.project_category,
          project_name: info.project_name,
          project_sort_discription: info.project_sort_discription,
          project_long_discription: info.project_long_discription,
          live_link: info.live_link,
          repository_link: info.repository_link,
          ficture: [
            info.ficture1,
            info.ficture2,
            info.ficture3,
            info.ficture4,
            info.ficture5,
          ],
          project_motivation: info.project_motivation,
          homepage_img: info.img_hoting_URL,
        },
      };
      const result = await projectCollection.updateOne(filter, updateDoc);
      console.log(result);
      return res.send({ massege: "project put", result });
    });

    app.post("/emailSend", async (req, res) => {
      const data = req.body;

      // Create Nodemailer transporter
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.APP_EMAIL,
          pass: process.env.APP_PASSWORD,
        },
      });

      // Email content
      const mailOptions = {
        from: process.env.APP_EMAIL,
        to: data.senderEmail,
        subject: "Make a Connection",
        text: `${data.senderNumber}\n${data.emailBody}`,
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

    app.get("/projectsDetails/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id)
      const query = { _id: new ObjectId(id) };
      const result = await projectCollection.findOne(query);
      // console.log(result)
      res.send(result);
    });
    app.post("/logInDev", async (req, res) => {
      const { userName, password } = req.body;
      const query = { userName: userName };
      const result = await developersCollection.findOne(query);
      if (!result) {
        return res.send({
          message: "Developer not found",
          status: 404,
        });
      }
      if (result?.password !== password) {
        return res.send({
          message: "you are not aurthor",
          status: 403,
        });
      }
      console.log(result);
      return res.send({
        result: result,
        status: 200,
      });
    });
    app.get("/skills", async (req, res) => {
      const result = await skillsCollection.find().toArray();
      res.send({
        result: result,
        status: 200,
      });
    });
    app.get("/allBlogs", async (req, res) => {
      const result = await BlogsCollection.find().toArray();
      res.send({
        result: result,
        status: 200,
      });
    });
    app.get("/blog/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await BlogsCollection.findOne(query);
      if (!result) return res.status(404).send({ message: "Blog not found" });
      res.send(result);
    });
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
