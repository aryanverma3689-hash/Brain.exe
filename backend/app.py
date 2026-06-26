import json
import sqlite3
import requests
from flask import Flask, request, Response, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DB_PATH = "chat.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            title TEXT,
            mood TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT,
            role TEXT,
            content TEXT,
            images TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (session_id) REFERENCES sessions (id)
        )
    ''')
    conn.commit()
    conn.close()

init_db()

SYSTEM_PROMPTS = {
    'general': 'You are a highly capable, premium AI assistant named Nexus. You are concise, intelligent, and helpful. Always format your responses using markdown when applicable.',
    'learning': 'You are a world-class tutor and professor. Break down complex topics into easy-to-understand concepts using analogies. Never just give the answer; guide the user to it.',
    'coding': 'You are an elite 10x senior software engineer. Provide production-ready, highly optimized code. Always use markdown code blocks with the correct language tag. Be brief and focus on the code.',
    'creative': 'You are a visionary creative director and writer. Think outside the box, write beautifully, and provide unconventional, brilliant ideas.'
}

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/api/sessions', methods=['GET'])
def get_sessions():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM sessions ORDER BY created_at DESC")
    sessions = cursor.fetchall()
    
    result = []
    for s in sessions:
        session_id = s['id']
        cursor.execute("SELECT * FROM messages WHERE session_id = ? ORDER BY id ASC", (session_id,))
        msgs = cursor.fetchall()
        messages = []
        for m in msgs:
            msg_dict = {"role": m['role'], "content": m['content']}
            if m['images']:
                msg_dict['images'] = json.loads(m['images'])
            messages.append(msg_dict)
            
        result.append({
            "id": session_id,
            "title": s['title'],
            "mood": s['mood'],
            "messages": messages
        })
    conn.close()
    return jsonify(result)

@app.route('/api/sessions', methods=['POST'])
def create_session():
    data = request.json
    session_id = data.get('id')
    title = data.get('title', 'New Chat')
    mood = data.get('mood', 'general')
    
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO sessions (id, title, mood) VALUES (?, ?, ?)", (session_id, title, mood))
    conn.commit()
    conn.close()
    return jsonify({"status": "success", "id": session_id})

@app.route('/api/sessions/<session_id>', methods=['DELETE'])
def delete_session(session_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM messages WHERE session_id = ?", (session_id,))
    cursor.execute("DELETE FROM sessions WHERE id = ?", (session_id,))
    conn.commit()
    conn.close()
    return jsonify({"status": "success"})

@app.route('/api/sessions/<session_id>', methods=['PUT'])
def update_session(session_id):
    data = request.json
    title = data.get('title')
    if title:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("UPDATE sessions SET title = ? WHERE id = ?", (title, session_id))
        conn.commit()
        conn.close()
    return jsonify({"status": "success"})

import PyPDF2

@app.route('/api/extract-text', methods=['POST'])
def extract_text():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    filename = file.filename.lower()
    text = ""
    
    try:
        if filename.endswith('.pdf'):
            reader = PyPDF2.PdfReader(file)
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
        else:
            text = file.read().decode('utf-8')
            
        return jsonify({"text": text, "filename": file.filename})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

from ddgs import DDGS
import datetime

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    session_id = data.get('session_id')
    user_prompt = data.get('prompt')
    history = data.get('history', [])
    mood = data.get('mood', 'general')
    images = data.get('images', [])
    web_search = data.get('web_search', False)

    conn = get_db()
    cursor = conn.cursor()
    images_json = json.dumps(images) if images else None
    cursor.execute("INSERT INTO messages (session_id, role, content, images) VALUES (?, ?, ?, ?)", 
                   (session_id, 'user', user_prompt, images_json))
    conn.commit()

    system_prompt = SYSTEM_PROMPTS.get(mood, SYSTEM_PROMPTS['general'])
    current_date = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    system_prompt += f"\n\n[CRITICAL SYSTEM INFO]\nThe current date and time is {current_date}. Keep this in mind when answering questions about current events, recent past, or the future."
    
    if web_search:
        print("WEB SEARCH TRIGGERED", flush=True)
        try:
            ddgs = DDGS()
            text_results = []
            news_results = []
            
            try:
                text_results = ddgs.text(user_prompt, max_results=3)
            except Exception as e:
                print("DDGS text search failed:", e, flush=True)
                
            try:
                news_results = ddgs.news(user_prompt, max_results=3)
            except Exception as e:
                print("DDGS news search failed:", e, flush=True)
            
            combined_results = (text_results if text_results else []) + (news_results if news_results else [])
            
            if combined_results:
                context = ""
                for r in combined_results:
                    title = r.get('title', '')
                    body = r.get('body', '')
                    date = r.get('date', '')
                    context += f"- [{date}] {title}: {body}\n"
                    
                # Mimic Gemini/ChatGPT by deep scraping the top result URL
                top_url = None
                for r in combined_results:
                    top_url = r.get('href') or r.get('url')
                    if top_url:
                        break
                
                if top_url:
                    try:
                        import requests
                        from bs4 import BeautifulSoup
                        print(f"SCRAPING TOP URL: {top_url}", flush=True)
                        headers = {'User-Agent': 'Mozilla/5.0'}
                        page = requests.get(top_url, headers=headers, timeout=5)
                        soup = BeautifulSoup(page.content, 'html.parser')
                        paragraphs = soup.find_all('p')
                        page_text = " ".join([p.get_text() for p in paragraphs])
                        page_text = page_text[:5000] # truncate to avoid overflowing context
                        if page_text.strip():
                            context += f"\n\n[DEEP SCRAPED ARTICLE TEXT ({top_url})]:\n{page_text}\n"
                    except Exception as e:
                        print("Scraping failed:", e, flush=True)
                
                # Remove non-ascii characters to ensure safe handling
                context = context.encode('ascii', 'ignore').decode('ascii')
                
                system_prompt += f"\n\n[CRITICAL INSTRUCTION: LIVE WEB SEARCH RESULTS]\nYou are provided with real-time context from the internet below. You MUST use this data to answer the user's question, as your internal knowledge is outdated. Ignore your training cutoff date.\n<context>\n{context}\n</context>\nCRITICAL: Answer the user based on the above context. If the context does not explicitly contain the exact answer, you MUST reply: 'I do not have enough information from the live internet search to answer this.' DO NOT guess, DO NOT hallucinate, and DO NOT use your internal knowledge to fill in the blanks. However, if the user provides an image, you MAY use your visual understanding of the image to supplement the context and identify subjects."
            else:
                system_prompt += "\n\n[CRITICAL INSTRUCTION]\nThe user requested a live web search, but the search engine returned no results or blocked the request. You must explicitly tell the user: 'My live web search failed to return results, so I cannot answer based on live data.'"
        except Exception as e:
            system_prompt += "\n\n[CRITICAL INSTRUCTION]\nThe user requested a live web search, but the search engine failed. You must explicitly tell the user: 'My live web search encountered an error, so I cannot answer based on live data.'"

    import google.generativeai as genai
    import base64
    import os
    genai.configure(api_key=os.environ.get("GEMINI_API_KEY", ""))

    model = genai.GenerativeModel(
        model_name="gemini-2.5-flash",
        system_instruction=system_prompt
    )
    
    gemini_history = []
    for msg in history:
        role = "user" if msg.get("role") == "user" else "model"
        parts = [msg.get("content")]
        if msg.get("images"):
            for img in msg.get("images"):
                parts.append({"mime_type": "image/jpeg", "data": base64.b64decode(img)})
        gemini_history.append({"role": role, "parts": parts})
        
    try:
        chat = model.start_chat(history=gemini_history)
    except Exception as e:
        print("Error starting chat:", e, flush=True)
        chat = model.start_chat()
        
    current_parts = [user_prompt]
    if images:
        for img in images:
            current_parts.append({"mime_type": "image/jpeg", "data": base64.b64decode(img)})
            
    def generate():
        full_response = ""
        try:
            response = chat.send_message(current_parts, stream=True)
            for chunk in response:
                try:
                    content = chunk.text
                except ValueError:
                    continue
                if content:
                    full_response += content
                    sse_data = json.dumps({"response": content})
                    yield f"data: {sse_data}\n\n"
                
            yield "data: [DONE]\n\n"
            
            cursor.execute("INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)", 
                           (session_id, 'assistant', full_response))
            conn.commit()
            conn.close()

        except Exception as e:
            conn.close()
            error_data = json.dumps({"response": f"\n\n**Error:** {str(e)}"})
            yield f"data: {error_data}\n\n"
            yield "data: [DONE]\n\n"

    return Response(generate(), mimetype='text/event-stream')

if __name__ == '__main__':
    app.run(port=5000, debug=True)
