import express from "express"
import dotenv from "dotenv"
import connectDb from "./config/db.js";
import router from "./routes/auth.route.js";
import cors from "cors";



dotenv.config()

const port = process.env.PORT


const app = express()

// ADDED CORS CONFIGURATION
app.use(
  cors({
    origin: "https://d3iiwisdl9f36.cloudfront.net",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());
app.use("/", router);

app.get("/",(req,res)=>{
    res.json({message:"Hello from auth"})
})

app.listen(port,()=>{
    console.log(`auth started at ${port}`)
    connectDb()
})