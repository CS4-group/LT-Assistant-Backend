require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const DATA_DIR = path.join(__dirname, 'data');
const COLLECTIONS = ['courses', 'teachers', 'clubs', 'reviews', 'users', 'review_likes'];

async function migrate() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();
  console.log('Connected to MongoDB');

  for (const name of COLLECTIONS) {
    const filePath = path.join(DATA_DIR, `${name}.json`);
    if (!fs.existsSync(filePath)) {
      console.log(`Skipping ${name} (file not found)`);
      continue;
    }

    let data;
    try {
      data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch {
      console.log(`Skipping ${name} (invalid JSON)`);
      continue;
    }

    if (!Array.isArray(data) || data.length === 0) {
      console.log(`Skipping ${name} (empty)`);
      continue;
    }

    // Deduplicate by id (keep first occurrence)
    const seen = new Set();
    const deduped = data.filter(doc => {
      if (doc.id === undefined) return true;
      if (seen.has(doc.id)) return false;
      seen.add(doc.id);
      return true;
    });

    if (deduped.length < data.length) {
      console.log(`  Removed ${data.length - deduped.length} duplicate(s) from ${name}`);
    }

    // Drop existing collection to make script idempotent
    await db.collection(name).drop().catch(() => {});

    await db.collection(name).insertMany(deduped);
    console.log(`Migrated ${name}: ${deduped.length} documents`);
  }

  // Create indexes
  await db.collection('courses').createIndex({ id: 1 }, { unique: true });
  await db.collection('teachers').createIndex({ id: 1 }, { unique: true });
  await db.collection('clubs').createIndex({ id: 1 }, { unique: true });
  await db.collection('reviews').createIndex({ id: 1 }, { unique: true });
  await db.collection('reviews').createIndex({ entityType: 1, entityId: 1 });
  await db.collection('users').createIndex({ id: 1 }, { unique: true });
  await db.collection('users').createIndex({ googleId: 1 }, { sparse: true });
  await db.collection('review_likes').createIndex({ userId: 1, reviewId: 1 });
  console.log('Indexes created');

  await client.close();
  console.log('Migration complete');
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
