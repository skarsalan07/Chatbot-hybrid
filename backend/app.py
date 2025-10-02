from flask import Flask, request, jsonify, send_from_directory
import os
import json
import difflib
import datetime
from flask_cors import CORS
from groq import Groq
import re

app = Flask(__name__, static_folder="../frontend/build", static_url_path="")
CORS(app)

# Initialize Groq client
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

# Load knowledge base
def load_knowledge_base():
    try:
        with open("knowledge_base.json", "r", encoding="utf-8") as f:
            data = json.load(f)
            print(f"✅ Loaded knowledge base with {len(data)} entries")
            return data
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"❌ Error loading knowledge base: {e}")
        return {}

def save_knowledge_base():
    try:
        with open("knowledge_base.json", "w", encoding="utf-8") as f:
            json.dump(knowledge_base, f, indent=2, ensure_ascii=False)
        print("💾 Knowledge base saved")
    except Exception as e:
        print(f"Error saving knowledge base: {e}")

knowledge_base = load_knowledge_base()

# Enhanced knowledge base search
def search_knowledge_base(question: str):
    """
    Search knowledge base using multiple methods:
    1. Exact match
    2. Fuzzy matching with difflib
    3. Keyword matching
    4. Partial matching
    """
    if not knowledge_base:
        return None
    
    q_lower = question.lower().strip()
    
    # Method 1: Exact match
    if q_lower in knowledge_base:
        print(f"✅ Exact match found: {q_lower}")
        return knowledge_base[q_lower]
    
    # Method 2: Fuzzy matching with difflib
    matches = difflib.get_close_matches(q_lower, knowledge_base.keys(), n=2, cutoff=0.7)
    if matches:
        print(f"✅ Fuzzy match found: {matches[0]} (similarity: {difflib.SequenceMatcher(None, q_lower, matches[0]).ratio():.2f})")
        return knowledge_base[matches[0]]
    
    # Method 3: Keyword matching
    question_words = set(re.findall(r'\b\w+\b', q_lower))
    best_match = None
    best_score = 0
    
    for kb_question, answer in knowledge_base.items():
        kb_words = set(re.findall(r'\b\w+\b', kb_question.lower()))
        common_words = question_words.intersection(kb_words)
        
        if common_words:
            score = len(common_words) / len(question_words.union(kb_words))
            if score > best_score and score > 0.3:  # Threshold for keyword matching
                best_score = score
                best_match = answer
    
    if best_match:
        print(f"✅ Keyword match found (score: {best_score:.2f})")
        return best_match
    
    # Method 4: Check if any knowledge base question is contained in user question
    for kb_question in knowledge_base.keys():
        if kb_question.lower() in q_lower:
            print(f"✅ Partial match found: {kb_question}")
            return knowledge_base[kb_question]
    
    return None

# LLM Call function
def get_llm_response(question: str):
    if not groq_client:
        return "AI service is currently unavailable. Please try again later."
    
    # Include knowledge base context for LLM
    kb_context = ""
    if knowledge_base:
        kb_context = "Here is some relevant knowledge that might help:\n"
        for q, a in list(knowledge_base.items())[:5]:  # Include top 5 entries as context
            kb_context += f"- {q}: {a}\n"
        kb_context += "\n"

    try:
        print(f"🔗 Calling LLM for: {question[:50]}...")
        chat_completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            temperature=0.7,
            max_tokens=500,
            messages=[
                {
                    "role": "system", 
                    "content": f"""You are Mohur AI, a helpful and friendly assistant. 
                    {kb_context}
                    Provide clear, concise, and accurate responses. If you're using information from the knowledge base, 
                    make sure it's relevant to the user's question."""
                },
                {"role": "user", "content": question},
            ],
        )
        return chat_completion.choices[0].message.content
    except Exception as e:
        print(f"❌ LLM Error: {e}")
        return "I'm having trouble processing your request right now. Please try again later."

# Enhanced answer finding logic
def find_best_answer(question: str):
    if not question.strip():
        return "Please ask me something!"
    
    print(f"🔍 Searching for: '{question}'")
    
    # Step 1: First check knowledge base thoroughly
    kb_answer = search_knowledge_base(question)
    if kb_answer:
        print("🎯 Using knowledge base answer")
        return kb_answer
    
    # Step 2: Handle common system queries
    q_lower = question.lower().strip()
    
    if any(word in q_lower for word in ["date", "today", "what day"]):
        return f"Today's date is {datetime.date.today().strftime('%B %d, %Y')}."
    
    if any(word in q_lower for word in ["time", "current time"]):
        return f"The current time is {datetime.datetime.now().strftime('%I:%M %p')}."
    
    if any(word in q_lower for word in ["hello", "hi", "hey", "greetings"]):
        return "Hello! 👋 I'm Mohur AI. How can I help you today?"
    
    if any(word in q_lower for word in ["thank", "thanks"]):
        return "You're welcome! 😊 Is there anything else I can help you with?"
    
    # Step 3: Fall back to LLM only if no knowledge base match found
    print("🤖 No KB match found, calling LLM...")
    llm_response = get_llm_response(question)
    return llm_response

# API Endpoints
@app.route("/ask", methods=["POST"])
def ask():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"answer": "Invalid JSON in request"}), 400
            
        question = data.get("question", "").strip()
        if not question:
            return jsonify({"answer": "Please ask me something!"}), 400
        
        answer = find_best_answer(question)
        return jsonify({"answer": answer})
        
    except Exception as e:
        print(f"❌ Error in /ask endpoint: {e}")
        return jsonify({"answer": "Sorry, I encountered an error processing your request."}), 500

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy", 
        "llm": "groq" if GROQ_API_KEY else "none",
        "knowledge_base_entries": len(knowledge_base)
    })

# Enhanced admin endpoints for knowledge base management
@app.route("/admin/kb", methods=["GET", "POST", "DELETE"])
def manage_knowledge_base():
    if request.method == "GET":
        return jsonify({
            "count": len(knowledge_base),
            "entries": knowledge_base
        })
    
    elif request.method == "POST":
        try:
            data = request.get_json()
            question = data.get("question", "").strip()
            answer = data.get("answer", "").strip()
            
            if not question or not answer:
                return jsonify({"error": "Both question and answer are required"}), 400
            
            knowledge_base[question.lower()] = answer
            save_knowledge_base()
            return jsonify({
                "message": "Knowledge base updated successfully",
                "total_entries": len(knowledge_base)
            })
            
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    elif request.method == "DELETE":
        try:
            data = request.get_json()
            question = data.get("question", "").strip().lower()
            
            if question in knowledge_base:
                del knowledge_base[question]
                save_knowledge_base()
                return jsonify({
                    "message": "Question removed from knowledge base",
                    "total_entries": len(knowledge_base)
                })
            else:
                return jsonify({"error": "Question not found in knowledge base"}), 404
                
        except Exception as e:
            return jsonify({"error": str(e)}), 500

# Serve React frontend
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, "index.html")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"🚀 Starting Mohur AI Hybrid Chatbot")
    print(f"📚 Knowledge base entries: {len(knowledge_base)}")
    print(f"🤖 LLM: {'Groq' if GROQ_API_KEY else 'Disabled'}")
    app.run(host="0.0.0.0", port=port, debug=False)