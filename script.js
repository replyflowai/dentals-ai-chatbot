const messagesContainer = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
let conversationHistory = [];

userInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') sendMessage();
});

function addMessage(text, role) {
  const div = document.createElement('div');
  div.className = `message ${role === 'user' ? 'user-message' : 'bot-message'}`;

  if (role === 'bot') {
    div.innerHTML = `
      <div class="bot-avatar">🦷</div>
      <div class="bubble">${text}</div>`;
  } else {
    div.innerHTML = `<div class="bubble">${text}</div>`;
  }

  messagesContainer.appendChild(div);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  return div;
}

function showTyping() {
  const div = document.createElement('div');
  div.className = 'message bot-message';
  div.id = 'typingIndicator';
  div.innerHTML = `
    <div class="bot-avatar">🦷</div>
    <div class="typing-indicator">
      <span></span><span></span><span></span>
    </div>`;
  messagesContainer.appendChild(div);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function removeTyping() {
  const t = document.getElementById('typingIndicator');
  if (t) t.remove();
}

function quickSend(text) {
  userInput.value = text;
  sendMessage();
}

async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  addMessage(text, 'user');
  userInput.value = '';
  sendBtn.disabled = true;

  conversationHistory.push({ role: 'user', content: text });
  showTyping();

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: conversationHistory })
    });

    const data = await response.json();
    removeTyping();

    if (data.reply) {
      addMessage(data.reply, 'bot');
      conversationHistory.push({ role: 'assistant', content: data.reply });
    } else {
      addMessage("I'm having trouble connecting. Please try again.", 'bot');
    }

  } catch (e) {
    removeTyping();
    addMessage("Connection error. Please try again.", 'bot');
  }

  sendBtn.disabled = false;
  userInput.focus();
}

// Start conversation automatically
window.onload = async function() {
  showTyping();
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: 'start' }] })
    });
    const data = await response.json();
    removeTyping();
    if (data.reply) {
      addMessage(data.reply, 'bot');
      conversationHistory.push({ role: 'user', content: 'start' });
      conversationHistory.push({ role: 'assistant', content: data.reply });
    }
  } catch(e) {
    removeTyping();
    addMessage("Welcome to SmileCare Dental! 😊 How can I help you today?", 'bot');
  }
};