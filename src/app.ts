import http from 'http';
import { config } from "./config/config"
import mongoose from "mongoose"

const handleRestaurantRoutes = require('./routes/restaurant.routes')
const handleUsersRoutes = require('./routes/user.routes');
const handleOrderRoutes = require('./routes/order.routes');
const PORT = config.server.port;


mongoose.connect(config.mongo.url, {retryWrites:true, w:'majority'}).then(()=>{
    console.log('Mongo Connected');
    StartServer()
}).catch((error=>{
    console.log('Unable to connect',error)
}))

const StartServer = () => {
    const server = http.createServer();

    server.on('request', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
    });
    

    server.on('request', handleUsersRoutes);
    server.on('request', handleRestaurantRoutes);
    server.on('request', handleOrderRoutes);
    
    server.listen(PORT,'127.0.0.1', () => {
        console.log(`Server is running on port ${PORT}`);
    });
}