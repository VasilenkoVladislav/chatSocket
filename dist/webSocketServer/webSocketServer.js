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
                this.redis.subscribe(`${message}?${client}`);
            });
            socket.on('disconnect', () => {
                this.redis.unsubscribe();
            });
        });
    }
    broadcastMessage(channel, message) {
        const conversationId = channel.split('?')[0];
        const clientId = channel.split('?')[1];
        if (conversationId && clientId) {
            this.io.sockets.connected[this.clients[clientId].socket].broadcast.to(conversationId).emit('evt', message);
        }
    }
}
WebSocketServer.PORT = 8080;
exports.default = WebSocketServer;
