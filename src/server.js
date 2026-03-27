const http = require('http');
const net = require('net');
const axios = require('axios');


const blockedSites = ['www.youtube.com', 'www.facebook.com' , 'www.twitter.com'];

const server = http.createServer();

server.on('connect', (req, clientSocket, head)=>{
    let status = "ALLOWED";
    for(let site of blockedSites){
        if(req.url.includes(site)){
            status = "BLOCKED";
            break;
        }
    }
    if(status==="BLOCKED"){
        console.log("Blocked",req.url);
        clientSocket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
        clientSocket.end();
        return;
    }
    console.log("Allowed",req.url);
    const [host,port] = req.url.split(':');
    const serverSocket = net.connect(port || 443, host, ()=>{
        clientSocket.write("HTTP/1.1. 200 Connection established\r\n\r\n");
        serverSocket.write(head);
        serverSocket.pipe(clientSocket);
        clientSocket.pipe(serverSocket);
    }); 
    serverSocket.on("error", ()=> clientSocket.end());
});

server.listen(8080, ()=>{
    console.log("Proxy-server is running on port 8080");
});