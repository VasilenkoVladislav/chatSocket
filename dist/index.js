"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const webSocketServer_1 = require("./webSocketServer/webSocketServer");
const config = require('./config/config');
class App {
    constructor() {
        const env = process.env.NODE_ENV;
        const host = config[env].redisHost;
        const port = config[env].redisPort;
        const db = config[env].redisDB;
        this.client = redis_1.createClient({ host, port, db });
        this.webSocketServer = new webSocketServer_1.default(this.client);
        this.listenRedis();
    }
    listenRedis() {
        this.client.on('connect', () => {
            console.log('connected to redis');
        });
        this.client.on("message", (channel, message) => {
            this.webSocketServer.broadcastMessage(channel, message);
        });
    }
}
new App();
