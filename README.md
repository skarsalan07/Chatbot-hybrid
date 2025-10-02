# Mohur AI Hybrid Chatbot

A hybrid chatbot system that combines a knowledge base with LLM capabilities using Groq. The system features a React frontend and Flask backend, providing both fast responses from a local knowledge base and AI-powered responses for more complex queries.

## Features

- Hybrid response system (Knowledge Base + LLM)
- React-based user interface
- Flask REST API backend
- Knowledge base management
- Integration with Groq LLM API
- Multiple search methods for knowledge base (exact, fuzzy, keyword, partial matching)
- Health monitoring endpoint
- Production-ready with Gunicorn support

## Tech Stack

### Frontend
- React 19.1.1
- Framer Motion for animations
- CSS for styling
- React Testing Library for tests

### Backend
- Python with Flask
- Flask-CORS for cross-origin support
- Groq API for LLM integration
- JSON-based knowledge base
- Gunicorn for production deployment

## Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- npm or yarn
- pip (Python package manager)

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
   - Create a `.env` file in the backend directory
   - Add your Groq API key:
```
GROQ_API_KEY=your_api_key_here
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

### Development Mode

1. Start the backend server (from the backend directory):
```bash
python app.py
```
The backend will run on http://localhost:5000

2. Start the frontend development server (from the frontend directory):
```bash
npm start
```
The frontend will run on http://localhost:3000

### Production Mode

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Start the production server with Gunicorn:
```bash
cd backend
gunicorn app:app
```

## API Endpoints

- `POST /ask` - Send questions to the chatbot
- `GET /health` - Check system health status
- `GET /admin/kb` - Get knowledge base entries
- `POST /admin/kb` - Add new knowledge base entry
- `DELETE /admin/kb` - Remove knowledge base entry

## Project Structure

```
├── backend/
│   ├── app.py              # Main Flask application
│   ├── knowledge_base.json # JSON knowledge base
│   ├── requirements.txt    # Python dependencies
│   └── Procfile           # Production server configuration
├── frontend/
│   ├── public/            # Static assets
│   ├── src/              
│   │   ├── App.js        # Main React component
│   │   ├── ChatWindow.js # Chat interface component
│   │   └── ...          # Other React components
│   ├── package.json      # Node.js dependencies
│   └── build/           # Production build output
└── README.md
```

## Assumptions and Design Decisions

1. **Knowledge Base Priority**: The system prioritizes knowledge base responses over LLM to provide faster responses when possible.

2. **Search Algorithm**: The knowledge base search implements multiple matching methods (exact, fuzzy, keyword, partial) to maximize the chance of finding relevant answers.

3. **Error Handling**: The system includes comprehensive error handling for both frontend and backend operations.

4. **Security**: CORS is enabled for development, but should be configured appropriately for production.

5. **Scalability**: The knowledge base is file-based for simplicity, but could be migrated to a database for larger deployments.

## Contributing

1. Fork the repository
2. Create a new branch for your feature
3. Commit your changes
4. Push to your branch
5. Create a Pull Request

