const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { connectDB, DB_NAME } = require('./db');
const { v4: uuidv4 } = require('uuid');

const JWT_SECRET = process.env.JWT_SECRET || 'apna-madrasa-secret-key-2024';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const body = event.body ? JSON.parse(event.body) : {};
  const action = body.action; // 'login' or 'register'

  try {
    const client = await connectDB();
    const db = client.db(DB_NAME);
    const users = db.collection('users');

    // ---- REGISTER ----
    if (action === 'register') {
      const { email, password, name, phone } = body;
      const existing = await users.findOne({ email });
      if (existing) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Email already registered' }) };
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = uuidv4();
      const newUser = { id: userId, email, password: hashedPassword, name, phone, createdAt: new Date() };
      await users.insertOne(newUser);

      const profiles = db.collection('profiles');
      await profiles.insertOne({ uid: userId, madrasa_name: name, phone, createdAt: new Date() });

      const token = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '30d' });
      return { statusCode: 200, headers, body: JSON.stringify({ token, user: { id: userId, email, name, phone } }) };
    }

    // ---- LOGIN ----
    if (action === 'login') {
      const { email, password } = body;
      const user = await users.findOne({ email });
      if (!user) {
        return { statusCode: 401, headers, body: JSON.stringify({ error: 'Invalid email or password' }) };
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return { statusCode: 401, headers, body: JSON.stringify({ error: 'Invalid email or password' }) };
      }
      const token = jwt.sign({ id: user.id, email }, JWT_SECRET, { expiresIn: '30d' });
      return { statusCode: 200, headers, body: JSON.stringify({ token, user: { id: user.id, email: user.email, name: user.name, phone: user.phone } }) };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unknown action' }) };

  } catch (err) {
    console.error('Auth error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
