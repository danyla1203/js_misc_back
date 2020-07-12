import WebSocket, { prototype } from "ws";
import session from "express-session";
import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import multer from "multer";
import http from "http";
import { SocketRequest, UserSocket } from "./UserSocket";

const mulsterInst = multer();
const httpApp = express();
const sessionParser = session({
    secret: '$eCuRiTy',
    cookie: {
        domain: "localhost:3000",
        path: "/"
    }
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
httpApp.post("/login", mulsterInst.none(), (req: Request, res: Response) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Headers', 'origin, content-type, accept'); 
    console.log(req.body);
    let name = req.body.name;
    let password = req.body.password;
    req.session.user_id = 1;
    console.log(req.session);
    let userData = { name: name, password: password }
    res.json({status: 200, userData: userData});
})

const server = http.createServer(httpApp);
const wss = new UserSocket({ clientTracking: false, noServer: true });

server.on('upgrade', function (request, socket, head) {
  console.log('Parsing session from request...');

  sessionParser(request, {}, () => {
    if (!request.session.user_id) {
        console.log("her");
        socket.destroy();
        return;
    }

    wss.handleUpgrade(request, socket, head, function (ws) {
      wss.emit('connection', ws, request);
    });
  });
});

wss.get("message", (request: SocketRequest) => {
    // 1) add message to db.
    // 2) send message to other connected users
})

server.listen(8080, function () {
    console.log('Listening on http://localhost:8080');
});