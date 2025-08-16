import Game from '../models/Game.js';
import Move from '../models/Move.js';
import { toIndex, isMoveValid } from '../sudoku/validator.js';

export async function createGame({ roomCode, board, solution, ownerSocketId, ownerName }){
  const game = await Game.create({
    roomCode,
    board: board.map((v, idx) => ({ r: Math.floor(idx/9), c: idx%9, value: v||0, fixed: v!==0 })),
    solution,
    players: [{ userId: ownerSocketId, name: ownerName, score: 0, wrongCount: 0 }],
    status: 'waiting',
    startedAt: null
  });
  return game;
}

export async function joinGame({ roomCode, socketId, name }){
  const game = await Game.findOne({ roomCode });
  if(!game) throw new Error('Room not found');
  if(game.players.length >= 2) throw new Error('Room full');
  game.players.push({ userId: socketId, name, score: 0, wrongCount: 0 });
  game.status = 'playing';
  game.startedAt = new Date();
  await game.save();
  return game;
}

export async function makeMove({ roomCode, socketId, r, c, value }){
  const game = await Game.findOne({ roomCode });
  if(!game) throw new Error('Game not found');
  const idx = toIndex(r,c);
  const cell = game.board[idx];
  if(cell.fixed) throw new Error('Cell is fixed');

  const correct = game.solution && Number.isInteger(game.solution[idx])
    ? (game.solution[idx] === value)
    : isMoveValid(game.board, r, c, value);

  // record move
  await Move.create({ gameId: game.id, userId: socketId, r, c, value, correct });

  const player = game.players.find(p => p.userId === socketId);
  if(!player) throw new Error('Player not in game');

  if(correct){
    cell.value = value;
    cell.wrong = false;
    player.score = (player.score || 0) + 1;
  } else {
    cell.value = value;
    cell.wrong = true;
    player.wrongCount = (player.wrongCount || 0) + 1;
    player.score = (player.score || 0) - 1;
  }

  // Tổng số sai của cả game
  const totalWrong = (game.players[0]?.wrongCount || 0) + (game.players[1]?.wrongCount || 0);

  // check finished by solution match
  const finished = game.board.every((cell, i) => Number.isInteger(game.solution?.[i]) && cell.value === game.solution[i]);
  if(finished){
    game.status = 'finished';
    game.winnerUserId = socketId;
    game.finishedAt = new Date();
  }

  // Nếu tổng số sai >= 3 thì kết thúc game, không có người thắng
  if(totalWrong >= 3){
    game.status = 'finished';
    game.loserUserId = null;
    game.winnerUserId = null;
    game.finishedAt = new Date();
  }

  await game.save();
  return { game, correct, finished: game.status === 'finished', totalWrong };
}

export async function lockCell({ roomCode, socketId, r, c }){
  const game = await Game.findOne({ roomCode });
  if(!game) throw new Error('Game not found');
  game.locks = game.locks || [];
  if(game.locks.some(l => l.r === r && l.c === c)) return game;
  game.locks.push({ r, c, userId: socketId, at: new Date() });
  await game.save();
  return game;
}

export async function unlockCell({ roomCode, socketId, r, c }){
  const game = await Game.findOne({ roomCode });
  if(!game) throw new Error('Game not found');
  game.locks = (game.locks || []).filter(l => !(l.r === r && l.c === c && l.userId === socketId));
  await game.save();
  return game;
}

export async function getGame(roomCode){
  return Game.findOne({ roomCode });
}

export async function resetGame({ roomCode, board, solution }) {
  const game = await Game.findOne({ roomCode });
  if(!game) throw new Error('Game not found');
  game.board = board.map((v, idx) => ({ r: Math.floor(idx/9), c: idx%9, value: v||0, fixed: v!==0 }));
  game.solution = solution;
  game.status = 'playing';
  game.finishedAt = null;
  game.locks = [];
  game.players.forEach(p => {
    p.score = 0;
    p.wrongCount = 0;
  });
  await game.save();
  return game;
}
