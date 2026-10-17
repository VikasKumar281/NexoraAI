import express from "express"
import dotenv from "dotenv"
import proxy from "express-http-proxy"

dotenv.config()

const port = process.env.PORT


const app = express()

app.use("/auth", proxy(process.env.AUTH_SERVICE))

app.get("/",(req,res)=>{
    res.json({message:"Hello from gateway"})
})

app.listen(port,()=>{
    console.log(`gateway started at ${port}`)
})