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

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Extract collection name from path
  // path: /api/data/donations, /api/data/expenses, etc.
  const pathParts = event.path.replace('/.netlify/functions/data', '').replace('/api/data', '').split('/').filter(Boolean);
  const collectionName = pathParts[0]; // donations, expenses, kitchen, students, donors, profiles
  const itemId = pathParts[1]; // optional item ID

  const ALLOWED = ['donations', 'expenses', 'kitchen', 'students', 'donors', 'profiles'];
  if (!ALLOWED.includes(collectionName)) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid collection' }) };
  }

  let decoded;
  try {
    decoded = verifyToken(event);
  } catch (e) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  const uid = decoded.id;
  const body = event.body ? JSON.parse(event.body) : {};

  try {
    const client = await connectDB();
    const db = client.db(DB_NAME);
    const col = db.collection(collectionName);

    // GET - fetch all data for user
    if (event.httpMethod === 'GET') {
      if (collectionName === 'profiles') {
        const doc = await col.findOne({ uid });
        return { statusCode: 200, headers, body: JSON.stringify(doc || {}) };
      }
      const docs = await col.find({ uid }).sort({ createdAt: -1 }).toArray();
      return { statusCode: 200, headers, body: JSON.stringify(docs) };
    }

    // POST - add new item
    if (event.httpMethod === 'POST') {
      if (collectionName === 'profiles') {
        await col.updateOne({ uid }, { $set: { ...body, uid } }, { upsert: true });
        const updated = await col.findOne({ uid });
        return { statusCode: 200, headers, body: JSON.stringify(updated) };
      }
      const newItem = { ...body, id: uuidv4(), uid, createdAt: new Date() };
      await col.insertOne(newItem);
      return { statusCode: 200, headers, body: JSON.stringify(newItem) };
    }

    // PUT - update item
    if (event.httpMethod === 'PUT') {
      const { id, ...updateData } = body;
      await col.updateOne({ id: id || itemId, uid }, { $set: updateData });
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    // DELETE - delete item
    if (event.httpMethod === 'DELETE') {
      const idToDelete = itemId || body.id;
      await col.deleteOne({ id: idToDelete, uid });
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  } catch (err) {
    console.error('Data error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
