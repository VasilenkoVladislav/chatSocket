"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socketIo = require("socket.io");
class WebSocketServer {
    constructor(redis) {
        this.port = process.env.PORT || WebSocketServer.PORT;
        this.redis = redis;
        this.io = socketIo();
        this.clients = {};
        this.listen();
    }
    listen() {
        this.io.listen(this.port);
        this.io.on('connect', (socket) => {
            const client = socket.client.request._query.client;
            this.clients[client] = {
                'socket': socket.id
            };
            socket.on('subscribeChannel', (message) => {
                socket.join(message);
                this.clients[client + message] = {
                    'socket': socket.id
                };
                this.redis.subscribe(`${client}?${message}`);
            });
            socket.on('disconnect', () => {
                for (let name in this.clients) {
                    if (this.clients[name].socket === socket.id) {
                        delete this.clients[name];
                        this.redis.unsubscribe(name);
                    }
                }
            });
        });
    }
    broadcastMessage(channel, message) {
        const clientId = channel.split('?')[0];
        const conversationId = channel.split('?')[1];
        if (conversationId && clientId) {
            this.io.sockets.connected[this.clients[clientId].socket].broadcast.to(conversationId).emit('evt', message);
        }
    }
}
WebSocketServer.PORT = 8080;
exports.default = WebSocketServer;
