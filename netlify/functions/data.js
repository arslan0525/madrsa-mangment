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

function verifyToken(event) {
  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader) throw new Error('No token');
  const token = authHeader.replace('Bearer ', '');
  return jwt.verify(token, JWT_SECRET);
}

const ALLOWED = ['donations', 'expenses', 'kitchen', 'students', 'donors', 'profiles'];

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  let decoded;
  try {
    decoded = verifyToken(event);
  } catch (e) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  const uid = decoded.id;
  const body = event.body ? JSON.parse(event.body) : {};
  const { collection, action, item, id } = body;

  if (!ALLOWED.includes(collection)) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid collection: ' + collection }) };
  }

  try {
    const client = await connectDB();
    const db = client.db(DB_NAME);
    const col = db.collection(collection);

    // GET - fetch all
    if (action === 'get') {
      if (collection === 'profiles') {
        const doc = await col.findOne({ uid });
        return { statusCode: 200, headers, body: JSON.stringify(doc || {}) };
      }
      const docs = await col.find({ uid }).sort({ createdAt: -1 }).toArray();
      return { statusCode: 200, headers, body: JSON.stringify(docs) };
    }

    // ADD - insert new
    if (action === 'add') {
      if (collection === 'profiles') {
        await col.updateOne({ uid }, { $set: { ...item, uid } }, { upsert: true });
        const updated = await col.findOne({ uid });
        return { statusCode: 200, headers, body: JSON.stringify(updated) };
      }
      const newItem = { ...item, id: uuidv4(), uid, createdAt: new Date() };
      await col.insertOne(newItem);
      return { statusCode: 200, headers, body: JSON.stringify(newItem) };
    }

    // UPDATE
    if (action === 'update') {
      const { id: itemId, ...updateData } = item;
      await col.updateOne({ id: itemId, uid }, { $set: updateData });
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    // DELETE
    if (action === 'delete') {
      await col.deleteOne({ id, uid });
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unknown action' }) };

  } catch (err) {
    console.error('Data error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
