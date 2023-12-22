import { error } from "console";
import { config } from "./config/config"
import mongoose from "mongoose"

mongoose.connect(config.mongo.url, {retryWrites:true, w:'majority'}).then(()=>{
    console.log('Mongo Connected');
}).catch((error=>{
    console.log('Unable to connect')
}))