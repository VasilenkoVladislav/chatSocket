import  { RedisClient, createClient } from 'redis';
import WebSocketServer from './webSocketServer/webSocketServer';

const config = require('./config/config');

class App {
    private client :RedisClient;
    private webSocketServer :WebSocketServer;

    constructor () {
        const env: any = process.env.NODE_ENV;
        const host: string = config[env].redisHost;
        const port: number = config[env].redisPort;
        const db: string = config[env].redisDB;
        this.client = createClient( { host, port, db });
        this.webSocketServer = new WebSocketServer(this.client);
        this.listenRedis();
    }

    private listenRedis(): void {
        this.client.on('connect', () => {
            console.log('connected to redis');
        });
        this.client.on("message", (channel: string, message: string) => {
            this.webSocketServer.broadcast(channel, message);
        })
    }
}

new App();