import { Server } from "./server/server";

const server = new Server();

let port = process.env.PORT || 3000;

server.listen(port);
