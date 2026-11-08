import express from "express"
import dotenv from "dotenv"
import connectDb from "./config/db.js";
import router from "./routes/chat.routes.js";

dotenv.config()

// const port = process.env.PORT


const app = express()


// app.use(express.json());
// app.use("/", router);


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
    res.json({message:"Hello from chat"})
})


// app.listen(port,()=>{
//     console.log(`chat started at ${port}`)
//     connectDb()
// })



if (process.env.NODE_ENV !== "production") {
    const port = process.env.PORT || 8002;

    app.listen(port, async () => {
        console.log(`Chat service started at ${port}`);
        await connectDb();
    });
}

export default app;