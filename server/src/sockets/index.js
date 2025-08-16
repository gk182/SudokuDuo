import { generatePuzzle } from '../sudoku/generator.js';
import * as gameService from '../services/gameService.js';
import debugLib from 'debug';

const debug = debugLib('sudoku:sockets');

export default function registerSockets(io){
  io.on('connection', (socket) => {
    debug('socket connected', socket.id);
    let currentRoom = null;
    let currentName = 'Player';

    socket.on('createRoom', async ({ name, difficulty }, cb) => {
      try {
        currentName = name || 'Player';
        const { board, solution } = generatePuzzle(difficulty || 'easy');
        const roomCode = Math.random().toString(36).slice(2,7).toUpperCase();
        const game = await gameService.createGame({ roomCode, board, solution, ownerSocketId: socket.id, ownerName: currentName });
        currentRoom = roomCode;
        socket.join(roomCode);
        cb && cb({ ok: true, roomCode, game });
        io.to(roomCode).emit('state', { game });
      } catch (e){
        debug('createRoom error', e);
        cb && cb({ error: e.message });
      }
    });

    socket.on('joinRoom', async ({ roomCode, name }, cb) => {
      try {
        currentName = name || 'Player';
        const game = await gameService.joinGame({ roomCode, socketId: socket.id, name: currentName });
        currentRoom = roomCode;
        socket.join(roomCode);
        io.to(roomCode).emit('start', { game });
        io.to(roomCode).emit('state', { game });
        cb && cb({ ok: true });
      } catch (e){
        debug('joinRoom error', e);
        cb && cb({ error: e.message });
      }
    });

    socket.on('lockCell', async ({ r, c }, cb) => {
      try {
        if(!currentRoom) return;
        const game = await gameService.lockCell({ roomCode: currentRoom, socketId: socket.id, r, c });
        io.to(currentRoom).emit('locks', { locks: game.locks });
        cb && cb({ ok: true });
      } catch (e){
        debug('lockCell', e);
        cb && cb({ error: e.message });
      }
    });

    socket.on('unlockCell', async ({ r, c }, cb) => {
      try {
        if(!currentRoom) return;
        const game = await gameService.unlockCell({ roomCode: currentRoom, socketId: socket.id, r, c });
        io.to(currentRoom).emit('locks', { locks: game.locks });
        cb && cb({ ok: true });
      } catch (e){
        debug('unlockCell', e);
        cb && cb({ error: e.message });
      }
    });

    socket.on('makeMove', async ({ r, c, value }, cb) => {
      try {
        if(!currentRoom) return cb && cb({ error: 'Not in room' });
        const res = await gameService.makeMove({ roomCode: currentRoom, socketId: socket.id, r, c, value });
        io.to(currentRoom).emit('moveResult', { userId: socket.id, r, c, value, correct: res.correct });
        io.to(currentRoom).emit('state', { game: res.game });
        // Nếu game kết thúc do tổng sai đủ 3, gửi thông báo chơi lại
        if(res.finished && res.totalWrong >= 3){
          io.to(currentRoom).emit('gameOver', { message: 'Cả 2 đều hết lượt! Chơi lại nhé.' });
        } else if(res.finished){
          io.to(currentRoom).emit('gameOver', { winner: res.game.winnerUserId, loser: res.game.loserUserId });
        }
        cb && cb({ ok: true, correct: res.correct });
      } catch (e){
        debug('makeMove error', e);
        cb && cb({ error: e.message });
      }
    });

    socket.on('chat', ({ message }) => {
      if(!currentRoom) return;
      io.to(currentRoom).emit('chat', { from: currentName, message, at: Date.now() });
    });

    socket.on('disconnect', async () => {
      debug('socket disconnect', socket.id);
      if(currentRoom){
        io.to(currentRoom).emit('playerLeft', { userId: socket.id });
      }
    });

    socket.on('replay', async ({ roomCode, difficulty }) => {
      try {
        const { board, solution } = generatePuzzle(difficulty || 'easy');
        const game = await gameService.resetGame({ roomCode, board, solution });
        io.to(roomCode).emit('replay', { game });
        io.to(roomCode).emit('state', { game });
      } catch (e){
        debug('replay error', e);
      }
    });
  });
}
