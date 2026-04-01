const { MongoClient } = require('mongodb');

class MongoDatabase {
  constructor(uri) {
    this.client = new MongoClient(uri);
    this.db = null;
  }

  async connect() {
    await this.client.connect();
    this.db = this.client.db();
    console.log('Connected to MongoDB');
  }

  async close() {
    await this.client.close();
  }

  // Read all records from a collection
  async findAll(collection) {
    try {
      return await this.db.collection(collection).find({}, { projection: { _id: 0 } }).toArray();
    } catch (error) {
      console.error(`Error reading ${collection}:`, error);
      return [];
    }
  }

  // Find a record by ID
  async findById(collection, id) {
    return await this.db.collection(collection).findOne({ id }, { projection: { _id: 0 } });
  }

  // Find records matching a condition
  async find(collection, condition = {}) {
    return await this.db.collection(collection).find(condition, { projection: { _id: 0 } }).toArray();
  }

  // Save all records to a collection (replaces entire collection)
  async saveAll(collection, records) {
    try {
      await this.db.collection(collection).deleteMany({});
      if (records.length > 0) {
        await this.db.collection(collection).insertMany(records);
      }
      return true;
    } catch (error) {
      console.error(`Error saving ${collection}:`, error);
      return false;
    }
  }

  // Insert a new record
  async insert(collection, record) {
    try {
      // Auto-generate ID if not provided
      if (!record.id) {
        const maxDoc = await this.db.collection(collection)
          .find({}, { projection: { id: 1, _id: 0 } })
          .sort({ id: -1 })
          .limit(1)
          .toArray();
        const maxId = maxDoc.length > 0 ? (maxDoc[0].id || 0) : 0;
        record.id = maxId + 1;
      }

      await this.db.collection(collection).insertOne(record);
      // Return without _id
      const { _id, ...result } = record;
      return result;
    } catch (error) {
      console.error(`Error inserting into ${collection}:`, error);
      return null;
    }
  }

  // Update a record by ID
  async update(collection, id, updates) {
    const result = await this.db.collection(collection).findOneAndUpdate(
      { id },
      { $set: { ...updates, id } },
      { returnDocument: 'after', projection: { _id: 0 } }
    );
    return result || null;
  }

  // Delete a record by ID
  async delete(collection, id) {
    const result = await this.db.collection(collection).deleteOne({ id });
    return result.deletedCount > 0;
  }

  // Delete all records matching a condition object
  async deleteWhere(collection, condition) {
    const result = await this.db.collection(collection).deleteMany(condition);
    return result.deletedCount > 0;
  }

  // Get collection statistics
  async getStats(collection) {
    const count = await this.db.collection(collection).countDocuments();
    return { count, lastModified: null };
  }

  // Get last modified time (not applicable for MongoDB)
  async getLastModified(collection) {
    return null;
  }

  // Calculate average rating for an entity
  async getAverageRating(entityType, entityId) {
    const reviews = await this.find('reviews', { entityType, entityId });

    if (reviews.length === 0) {
      return { average: 0, count: 0 };
    }

    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    const average = sum / reviews.length;

    return {
      average: Math.round(average * 10) / 10,
      count: reviews.length
    };
  }

  // Get an entity with its rating
  async getWithRating(collection, id) {
    const entity = await this.findById(collection, id);
    if (!entity) return null;

    const entityType = collection.slice(0, -1);
    const ratingInfo = await this.getAverageRating(entityType, id);

    return {
      ...entity,
      rating: ratingInfo.average,
      reviewCount: ratingInfo.count
    };
  }

  // Get all entities with their ratings
  async getAllWithRatings(collection) {
    const entities = await this.findAll(collection);
    const entityType = collection.slice(0, -1);

    return await Promise.all(entities.map(async (entity) => {
      const ratingInfo = await this.getAverageRating(entityType, entity.id);
      return {
        ...entity,
        rating: ratingInfo.average,
        reviewCount: ratingInfo.count
      };
    }));
  }
}

module.exports = MongoDatabase;
