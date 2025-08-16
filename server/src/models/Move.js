import mongoose from 'mongoose';

const MoveSchema = new mongoose.Schema({
  gameId: String,
  userId: String,
  r: Number, c: Number,
  value: Number,
  correct: Boolean,
  at: { type: Date, default: Date.now }
});

export default mongoose.model('Move', MoveSchema);
