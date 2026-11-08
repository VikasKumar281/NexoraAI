import express from "express"
import dotenv from "dotenv"
import connectDb from "./config/db.js";
import router from "./routes/agent.route.js";

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



app.use((err, req, res, next)=>{
    console.log(err);

    if(err.status){
        return res.status(err.status).json(err.data);
    }

    return res.status(500).json({message: `agent error ${err}`})
})

app.get("/",(req,res)=>{
    res.json({message:"Hello from agent"})
})


// app.listen(port,()=>{
//     console.log(`agent started at ${port}`)
//     connectDb()
// })



if (process.env.NODE_ENV !== "production") {
    const port = process.env.PORT || 8003;

    app.listen(port, async () => {
        console.log(`Agent service started at ${port}`);
        await connectDb();
    });
}

export default app;