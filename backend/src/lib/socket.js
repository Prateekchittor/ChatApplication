import { Server } from "socket.io";

import http from "http";

import express from "express";

const app = express();

const server = http.createServer(app);

const io = new Server(server,{
    cors:{
        origin : ["http://127.0.0.1:5500" ],
        credentials: true
    }
});

io.on("connection",(socket)=>{
    console.log("A user connected",socket.id);

    socket.on("disconnect",()=>{
        console.log("a user disconnected",socket.id)
    })
})
export {io,app,server};