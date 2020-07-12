import WebSocket from "ws";

export interface SocketRequest {
    actionName: string,
}

interface Handler {
    actionName: string,
    callback: (request: SocketRequest) => void
}

export class UserSocket extends WebSocket.Server {

    private handlers: Handler[] = [];

    constructor(data: any) {
        super(data);
        this.on("connection", (conection, request) => {
            conection.on("message", (message: SocketRequest) => {
                this.delegateMessage(message, this.handlers);
            })
        })
    }

    delegateMessage(message: SocketRequest, handlers: Handler[]) {
        for(let i = 0; i < handlers.length; i++) {
            if (message.actionName == handlers[i].actionName) {
                handlers[i].callback(message);
                break;
            }
        }
    }

    get(actionName: string, callback: (request: SocketRequest) => void) {
        this.handlers.push({
            actionName: actionName,
            callback: callback
        })
    }

}