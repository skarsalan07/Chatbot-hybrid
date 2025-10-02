from flask import Flask, request, jsonify
import json
import difflib
from flask_cors import CORS
import datetime
import os
from groq import Groq

app = Flask(__name__)
CORS(app)

# Initialize Groq client
groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

# Load knowledge base
with open("knowledge_base.json") as f:
    knowledge_base = json.load(f)

def get_llm_response(question: str, use_kb_context: bool = True):
    """Get response from Groq LLM"""
    try:
        # Build context from knowledge base
        context = ""
        if use_kb_context and knowledge_base:
            context = "You are a helpful AI assistant. Here's some relevant information:\n\n"
            for q, a in knowledge_base.items():
                context += f"Q: {q}\nA: {a}\n\n"
            context += "\nUse this information when relevant, but you can also answer other questions with your general knowledge.\n\n"
        
        # Create chat completion (Groq call)
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": context + "You are Mohur AI, a helpful and friendly assistant. Keep responses concise and helpful."
                },
                {
                    "role": "user",
                    "content": question
                }
            ],
            model="llama-3.1-8b-instant",  # Fast model
            temperature=0.7,
            max_tokens=500,
        )
        
        return chat_completion.choices[0].message.content
    
    except Exception as e:
        print(f"LLM Error: {e}")
        return None

def find_best_answer(question: str):
    """Find answer using hybrid approach: KB first, then LLM"""
    q_lower = question.lower().strip()

    # Built-in rules
    if "date" in q_lower or "today" in q_lower:
        today = datetime.date.today().strftime("%B %d, %Y")
        return f"Today's date is {today}."
    
    if q_lower in ["hi", "hello", "hey", "hi!", "hello!", "hey!"]:
        return "Hello 👋! How can I help you today?"

    # Try fuzzy match with KB first (stricter cutoff so bad matches don’t block LLM)
    if knowledge_base:
        questions = list(knowledge_base.keys())
        matches = difflib.get_close_matches(q_lower, questions, n=1, cutoff=0.85)
        if matches:
            return knowledge_base[matches[0]]
    
    # No KB match - use LLM
    llm_response = get_llm_response(question, use_kb_context=True)
    
    if llm_response:
        return llm_response
    else:
        return "I'm having trouble processing that right now. Please try again or rephrase your question."

@app.route("/ask", methods=["POST"])
def ask():
    data = request.json
    question = data.get("question", "")
    
    if not question.strip():
        return jsonify({"answer": "Please ask me something!"}), 400
    
    answer = find_best_answer(question)
    return jsonify({"answer": answer})

@app.route("/")
def home():
    return {"message": "Mohur AI Chatbot backend running 🚀"}

@app.route("/health")
def health():
    return {"status": "healthy", "llm": "groq" if os.environ.get("GROQ_API_KEY") else "none"}

if __name__ == "__main__":
    if not os.environ.get("GROQ_API_KEY"):
        print("⚠️  Warning: GROQ_API_KEY not set. LLM features will be limited.")
    app.run(host="0.0.0.0", port=5000, debug=True)