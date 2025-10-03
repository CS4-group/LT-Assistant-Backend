# Minimal Course Backend

Simple Node.js + Express backend with one course endpoint.

## Setup

1. **Delete these folders/files manually:**
   - `src/` folder
   - `scripts/` folder  
   - `logs/` folder
   - `.env` file
   - `.env.example` file

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start server:**
   ```bash
   npm start
   # or
   npm run dev
   ```

## API Endpoint

**Get Courses:**
```
GET http://localhost:3000/api/courses
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "ENGLISH I",
      "description": "English composition and literature"
    }
  ],
  "message": "Courses retrieved successfully"
}
```

## Files Structure
```
LT-Assistant-Backend/
├── server.js           # Main server file
├── package.json        # Dependencies (only express)
└── README.md          # This file
```

**That's it! Super minimal setup.** 🚀
