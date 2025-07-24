import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());

let db;

(async () => {
  db = await open({
    filename: './chat.db',
    driver: sqlite3.Database
  });

  // Create tables if not exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS chats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      title TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chatId INTEGER NOT NULL,
      sender TEXT NOT NULL,
      content TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(chatId) REFERENCES chats(id) ON DELETE CASCADE
    );
  `);
})();

// List all chats for a user
app.get('/chats', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId required' });
  const chats = await db.all('SELECT * FROM chats WHERE userId = ? ORDER BY createdAt DESC', userId);
  res.json(chats);
});

// Create a new chat
app.post('/chats', async (req, res) => {
  const { userId, title } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId required' });
  const result = await db.run('INSERT INTO chats (userId, title) VALUES (?, ?)', userId, title || 'New Chat');
  const chat = await db.get('SELECT * FROM chats WHERE id = ?', result.lastID);
  res.json(chat);
});

// Delete a chat
app.delete('/chats/:chatId', async (req, res) => {
  const { chatId } = req.params;
  await db.run('DELETE FROM chats WHERE id = ?', chatId);
  res.json({ success: true });
});

// Get messages for a chat
app.get('/chats/:chatId/messages', async (req, res) => {
  const { chatId } = req.params;
  const messages = await db.all('SELECT * FROM messages WHERE chatId = ? ORDER BY timestamp ASC', chatId);
  res.json(messages);
});

// Add a message to a chat
app.post('/chats/:chatId/messages', async (req, res) => {
  const { chatId } = req.params;
  const { sender, content } = req.body;
  if (!sender || !content) return res.status(400).json({ error: 'sender and content required' });
  const result = await db.run('INSERT INTO messages (chatId, sender, content) VALUES (?, ?, ?)', chatId, sender, content);
  const message = await db.get('SELECT * FROM messages WHERE id = ?', result.lastID);
  res.json(message);
});

app.listen(PORT, () => {
  console.log(`Chat backend running on http://localhost:${PORT}`);
});