import WebSocket from "ws";
import session from "express-session";
import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import http from "http";

const httpApp = express();
const sessionParser = session({
    saveUninitialized: false,
    secret: '$eCuRiTy',
    resave: false
});

httpApp.use(express.static('public'));
httpApp.use(sessionParser);
httpApp.use(cookieParser());

httpApp.get("/login", (req: Request, res: Response) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Headers', 'origin, content-type, accept');
    if (req.cookies.name && req.cookies.password) {
        req.session.user_id = -1;
        res.json({status: 200, name: "nigga", password: "bitch"});
    } else {
        res.json({ status: 401 });
    }
})
httpApp.post("/login",  (req: Request, res: Response) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Headers', 'origin, content-type, accept');
    let name = req.body.name;
    let password = req.body.password;
    req.session.user_id = -1;
    res.json({status: 200, name: name, password: password});
})

const server = http.createServer(httpApp);
const wss = new WebSocket.Server({ clientTracking: false, noServer: true });

server.on('upgrade', function (request, socket, head) {
  console.log('Parsing session from request...');

  sessionParser(request, {}, () => {
    if (!request.session.user_id) {
        socket.destroy();
        return;
    }

    wss.handleUpgrade(request, socket, head, function (ws) {
      wss.emit('connection', ws, request);
    });
  });
});

wss.on("connection", (connection, request) => {
    console.log(request.session);
    connection.on("message", (data: string) => {
        let parsedData = JSON.parse(data);
        if (parsedData.action == "login") {
            connection.send(JSON.stringify({action: parsedData.action, status: 200}));
        } 
    })
})


server.listen(8080, function () {
    console.log('Listening on http://localhost:8080');
});