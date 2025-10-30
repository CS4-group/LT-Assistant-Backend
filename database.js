const fs = require('fs');
const path = require('path');

class JSONDatabase {
  constructor(dataDir = './data') {
    this.dataDir = dataDir;
    // Create data directory if it doesn't exist
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  // Get the file path for a collection
  getFilePath(collection) {
    return path.join(this.dataDir, `${collection}.json`);
  }

  // Read all records from a collection
  findAll(collection) {
    try {
      const filePath = this.getFilePath(collection);
      if (!fs.existsSync(filePath)) {
        return [];
      }
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading ${collection}:`, error);
      return [];
    }
  }

  // Find a record by ID
  findById(collection, id) {
    const records = this.findAll(collection);
    return records.find(record => record.id === id);
  }

  // Find records matching a condition
  find(collection, condition = {}) {
    const records = this.findAll(collection);
    return records.filter(record => {
      return Object.keys(condition).every(key => 
        record[key] === condition[key]
      );
    });
  }

  // Save all records to a collection
  saveAll(collection, records) {
    try {
      const filePath = this.getFilePath(collection);
      fs.writeFileSync(filePath, JSON.stringify(records, null, 2));
      return true;
    } catch (error) {
      console.error(`Error saving ${collection}:`, error);
      return false;
    }
  }

  // Insert a new record
  insert(collection, record) {
    const records = this.findAll(collection);
    
    // Auto-generate ID if not provided
    if (!record.id) {
      const maxId = records.length > 0 
        ? Math.max(...records.map(r => r.id || 0))
        : 0;
      record.id = maxId + 1;
    }

    records.push(record);
    const success = this.saveAll(collection, records);
    return success ? record : null;
  }

  // Update a record by ID
  update(collection, id, updates) {
    const records = this.findAll(collection);
    const index = records.findIndex(record => record.id === id);
    
    if (index === -1) {
      return null;
    }

    records[index] = { ...records[index], ...updates, id }; // Ensure ID doesn't change
    const success = this.saveAll(collection, records);
    return success ? records[index] : null;
  }

  // Delete a record by ID
  delete(collection, id) {
    const records = this.findAll(collection);
    const filteredRecords = records.filter(record => record.id !== id);
    
    if (filteredRecords.length === records.length) {
      return false; // Record not found
    }

    return this.saveAll(collection, filteredRecords);
  }

  // Get collection statistics
  getStats(collection) {
    const records = this.findAll(collection);
    return {
      count: records.length,
      lastModified: this.getLastModified(collection)
    };
  }

  // Get last modified time of a collection file
  getLastModified(collection) {
    try {
      const filePath = this.getFilePath(collection);
      if (!fs.existsSync(filePath)) {
        return null;
      }
      const stats = fs.statSync(filePath);
      return stats.mtime;
    } catch (error) {
      return null;
    }
  }

  // Calculate average rating for an entity (course, teacher, or club)
  getAverageRating(entityType, entityId) {
    const reviews = this.find('reviews', { 
      entityType: entityType, 
      entityId: entityId 
    });
    
    if (reviews.length === 0) {
      return {
        average: 0,
        count: 0
      };
    }

    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    const average = sum / reviews.length;

    return {
      average: Math.round(average * 10) / 10, // Round to 1 decimal place
      count: reviews.length
    };
  }

  // Get an entity with its rating
  getWithRating(collection, id) {
    const entity = this.findById(collection, id);
    if (!entity) {
      return null;
    }

    // Map collection name to entity type for reviews
    const entityType = collection.slice(0, -1); // Remove 's' (courses -> course)
    const ratingInfo = this.getAverageRating(entityType, id);

    return {
      ...entity,
      rating: ratingInfo.average,
      reviewCount: ratingInfo.count
    };
  }

  // Get all entities with their ratings
  getAllWithRatings(collection) {
    const entities = this.findAll(collection);
    const entityType = collection.slice(0, -1); // Remove 's'

    return entities.map(entity => {
      const ratingInfo = this.getAverageRating(entityType, entity.id);
      return {
        ...entity,
        rating: ratingInfo.average,
        reviewCount: ratingInfo.count
      };
    });
  }
}

module.exports = JSONDatabase;
