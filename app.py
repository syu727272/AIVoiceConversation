import os
import logging
from flask import Flask, render_template, request, jsonify
from openai import OpenAI

# Configure logging
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET")

# Initialize OpenAI client
openai = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_message = data.get('message', '')
        conversation_history = data.get('history', [])

        # Prepare messages for OpenAI API
        messages = [{"role": "system", "content": "あなたは親切なアシスタントで、日本語で簡潔で有益な回答を提供します。"}]

        # Add conversation history
        for msg in conversation_history:
            messages.append({
                "role": "user" if msg["type"] == "question" else "assistant",
                "content": msg["content"]
            })

        # Add current message
        messages.append({"role": "user", "content": user_message})

        # the newest OpenAI model is "gpt-4o" which was released May 13, 2024.
        response = openai.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            max_tokens=150
        )

        answer = response.choices[0].message.content

        return jsonify({
            "success": True,
            "response": answer
        })

    except Exception as e:
        logging.error(f"Error in chat endpoint: {str(e)}")
        return jsonify({
            "success": False,
            "error": "リクエストの処理中にエラーが発生しました。"
        }), 500