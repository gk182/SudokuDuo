import './app.js';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import registerSockets from './sockets/index.js';
import debugLib from 'debug';

dotenv.config();
const debug = debugLib('sudoku:server');

import app from './app.js';

const PORT = process.env.PORT || 4000;
const server = http.createServer(app);

const io = new Server(server, { cors: { origin: '*' } });

registerSockets(io);

server.listen(PORT, () => {
  debug('Server listening on http://localhost:' + PORT);
  console.log('Server listening on http://localhost:' + PORT);
});
