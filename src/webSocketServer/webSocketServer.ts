import * as socketIo from 'socket.io';
import { RedisClient } from 'redis';

export default class WebSocketServer {
    public static readonly PORT :number = 8080;
    private io :SocketIO.Server;
    private clients: any;
    private redis :RedisClient;
    private port :string | number;

    constructor (redis: RedisClient) {
        this.port = process.env.PORT || WebSocketServer.PORT;
        this.redis = redis;
        this.io = socketIo();
        this.clients = {};
        this.listen();
    }

    private listen(): void {
        this.io.listen(this.port);
        this.io.on('connect', (socket: SocketIO.Socket) => {
            const client = socket.client.request._query.client;
            this.clients[client] = {
                'socket': socket.id
            };
            socket.on('subscribeChannel', (message: string) => {
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

    public broadcastMessage(channel: string, message: string): void {
        const clientId :string = channel.split('?')[0];
        const conversationId :string = channel.split('?')[1];
        if (conversationId && clientId) {
            this.io.sockets.connected[this.clients[clientId].socket].broadcast.to(conversationId).emit('evt', message);
        }
    }

}
