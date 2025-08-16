import mongoose from 'mongoose';

const CellSchema = new mongoose.Schema({
  r: Number, c: Number,
  value: { type: Number, default: 0 },
  fixed: { type: Boolean, default: false }
}, { _id: false });

const PlayerSchema = new mongoose.Schema({
  userId: String,
  name: String,
  score: { type: Number, default: 0 },
  wrongCount: { type: Number, default: 0 }
}, { _id: false });

const GameSchema = new mongoose.Schema({
  roomCode: { type: String, unique: true },
  status: { type: String, enum: ['waiting','playing','finished'], default: 'waiting' },
  players: [PlayerSchema],
  board: [CellSchema],
  solution: [Number],
  locks: [{ r: Number, c: Number, userId: String, at: Date }],
  startedAt: Date,
  finishedAt: Date,
  winnerUserId: String,
  loserUserId: String
}, { timestamps: true });

export default mongoose.model('Game', GameSchema);
