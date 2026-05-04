const jwt = require('jsonwebtoken');
const { getDbStore } = require('./db');
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
    const store = getDbStore();
    const collectionKey = collection === 'profiles' ? 'profiles' : `${collection}_${uid}`;
    let collData = await store.get(collectionKey, { type: 'json' }) || [];

    // GET - fetch all
    if (action === 'get') {
      if (collection === 'profiles') {
        const doc = collData.find(p => p.uid === uid);
        return { statusCode: 200, headers, body: JSON.stringify(doc || {}) };
      }
      // Sort by createdAt descending
      collData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return { statusCode: 200, headers, body: JSON.stringify(collData) };
    }

    // ADD - insert new
    if (action === 'add') {
      if (collection === 'profiles') {
        const index = collData.findIndex(p => p.uid === uid);
        if (index > -1) {
          collData[index] = { ...collData[index], ...item, uid };
        } else {
          collData.push({ ...item, uid, createdAt: new Date().toISOString() });
        }
        await store.setJSON(collectionKey, collData);
        const updated = collData.find(p => p.uid === uid);
        return { statusCode: 200, headers, body: JSON.stringify(updated) };
      }
      
      const newItem = { ...item, id: uuidv4(), uid, createdAt: new Date().toISOString() };
      collData.push(newItem);
      await store.setJSON(collectionKey, collData);
      return { statusCode: 200, headers, body: JSON.stringify(newItem) };
    }

    // UPDATE
    if (action === 'update') {
      const { id: itemId, ...updateData } = item;
      const index = collData.findIndex(d => d.id === itemId && d.uid === uid);
      if (index > -1) {
        collData[index] = { ...collData[index], ...updateData };
        await store.setJSON(collectionKey, collData);
      }
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    // DELETE
    if (action === 'delete') {
      collData = collData.filter(d => !(d.id === id && d.uid === uid));
      await store.setJSON(collectionKey, collData);
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unknown action' }) };

  } catch (err) {
    console.error('Data error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
