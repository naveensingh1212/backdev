//require('dotenv').config({path:'./env'}) remove consistency
import dotenv from "dotenv";
import express from "express";
import connectDB from "./db/index.js";

dotenv.config();

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000),() => {
        console.log(`server is running  at port :${process.env.PORT}`);
    }
})
.catch((err) => {
    console.log(" mongodb is showing error : ", err);
    
})












/*
const app = express()
( async () => {
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.error("ERROR: ", error )
            throw err
        }
        )

        app.listen(process.env.prompt,()=>{
            console.log(`App is listening on port ${process.env.PORT}`)
        })
    }catch(error){
        console.error("ERROR: ", error )
        throw err
    }
} )()
    */