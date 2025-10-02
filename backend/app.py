from flask import Flask, request, jsonify
import json
import difflib
from flask_cors import CORS
import datetime
from pathlib import Path

app = Flask(__name__)
CORS(app)  # allow frontend requests

# Load knowledge base
with open("knowledge_base.json") as f:
    knowledge_base = json.load(f)

def find_best_answer(question: str):
    q_lower = question.lower()

    # Simple built-in skills
    if "date" in q_lower:
        today = datetime.date.today().strftime("%B %d, %Y")
        return f"Today's date is {today}."
    if q_lower in ["hi", "hello", "hey"]:
        return "Hello 👋! How can I help you today?"

    # Fuzzy match with KB
    questions = list(knowledge_base.keys())
    matches = difflib.get_close_matches(q_lower, questions, n=1, cutoff=0.5)
    if matches:
        return knowledge_base[matches[0]]
    else:
        return "I'm not sure about that. Try rephrasing your question."

@app.route("/ask", methods=["POST"])
def ask():
    data = request.json
    question = data.get("question", "")
    answer = find_best_answer(question)
    return jsonify({"answer": answer})

@app.route("/")
def home():
    return {"message": "Mini AI Chatbot backend running 🚀"}

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)