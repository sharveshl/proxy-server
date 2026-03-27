const http = require('http');
const net = require('net');

const BLOCKED_SITES = ["youtube.com", "facebook.com"];

const server = http.createServer();


server.on('connect', (req, clientSocket, head) => {
    console.log("CONNECT request:", req.url);

    let status = "ALLOWED";

    for (let site of BLOCKED_SITES) {
        if (req.url.includes(site)) {
            status = "BLOCKED";
            console.log("Blocked:", req.url);
            sendLog(req.url, status);
            clientSocket.write("HTTP/1.1 403 Forbidden\r\n\r\n");
            clientSocket.destroy();
            return;
        }
    }

    const [host, port] = req.url.split(':');

    const serverSocket = net.connect(port || 443, host, () => {
        clientSocket.write("HTTP/1.1 200 Connection Established\r\n\r\n");
        serverSocket.write(head);
        serverSocket.pipe(clientSocket);
        clientSocket.pipe(serverSocket);
    });

    serverSocket.on('error', (err)=>{
        console.log("serversocket error",err.message);
        clientSocket.destroy();
    });
    ckientSocket.on('error', (err)=>{
        console.log("clientsocket error",err.message);
        serverSocket.destroy();
    });

    sendLog(req.url, status);
});

function sendLog(url, status) {
    const data = {
        user: "emp1",
        url: url,
        status: status,
        time: new Date().toLocaleString()
    };

    console.log("LOG:", data);
}

server.listen(8080, '0.0.0.0', () => {
    console.log("Proxy running on port 8080");
});