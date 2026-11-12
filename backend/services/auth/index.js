import express from "express"
import dotenv from "dotenv"
import connectDb from "./config/db.js";
import router from "./routes/auth.route.js";
import cors from "cors";



dotenv.config()

// const port = process.env.PORT


const app = express()

// ADDED CORS CONFIGURATION
app.use(
  cors({
    // origin: "https://d3iiwisdl9f36.cloudfront.net",
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());


app.use(async (req, res, next) => {
    try {
        await connectDb();
        next();
    } catch (error) {
        console.error("Database connection failed:", error);
        res.status(503).json({
            message: "Database connection failed"
        });
    }
});

app.use("/", router);


app.get("/",(req,res)=>{
    res.json({message:"Hello from auth"})
})

// app.listen(port,()=>{
//     console.log(`auth started at ${port}`)
//     connectDb()
// })



if (!process.env.VERCEL) {
    const port = process.env.PORT || 8001;

    app.listen(port, async () => {
        console.log(`Auth service started at ${port}`);
        await connectDb();
    });
}

// Vercel serverless export
export default app;