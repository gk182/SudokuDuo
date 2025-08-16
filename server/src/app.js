import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import debugLib from 'debug';

dotenv.config();
const debug = debugLib('sudoku:app');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/', (_req, res) => res.json({ ok: true, msg: 'Sudoku Duo API' }));

// const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/sudoku';
const MONGO_URL = process.env.MONGO_URL;

mongoose.connect(MONGO_URL).then(()=> debug('MongoDB connected')).catch(err => {
  console.error('MongoDB connection error', err);
});

export default app;
