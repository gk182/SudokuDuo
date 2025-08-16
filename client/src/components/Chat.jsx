import { useState } from "react";

export default function Chat({ messages, onSend }) {
  const [text, setText] = useState("");

  return (
    <div>
      <div className="chat-controls">
        <input
          className="input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Gõ tin nhắn..."
        />
        <button
          className="btn"
          onClick={() => {
            if (text.trim()) {
              onSend(text);
              setText("");
            }
          }}
        >
          Gửi
        </button>
      </div>
      <div className="chat-stream">
        {messages.map((m, i) => (
          <div key={i} className="chat-item">
            <div className="chat-time">{new Date(m.at).toLocaleTimeString()}</div>
            <div className="chat-text">
              <strong>{m.from}</strong>: {m.message}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
