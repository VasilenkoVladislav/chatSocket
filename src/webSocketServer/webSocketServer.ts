import * as socketIo from 'socket.io';
import { RedisClient } from 'redis';

export default class WebSocketServer {
    public static readonly PORT :number = 8080;
    private io :SocketIO.Server;
    private redis :RedisClient;
    private port :string | number;

    constructor (redis: RedisClient) {
        this.port = process.env.PORT || WebSocketServer.PORT;
        this.redis = redis;
        this.io = socketIo();
        this.listen();
    }

    private listen(): void {
        this.io.listen(this.port);
        this.io.on('connect', (socket: SocketIO.Socket) => {
            socket.on('subscribeChannel', (message: string) => {
                console.log('subscribed: ' + message);
                this.redis.subscribe(message);
            });
            socket.on('disconnect', () => {
                this.redis.unsubscribe();
            });
        });
    }

    public broadcast(channel: string, message: string): void {
        console.log('broadcast');
    }

}
