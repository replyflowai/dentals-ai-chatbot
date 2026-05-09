const messagesContainer = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

// Allow Enter key to send
userInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') sendMessage();
});

function addMessage(text, role) {
  const div = document.createElement('div');
  div.className = `message ${role === 'user' ? 'user-message' : 'bot-message'}`;
  div.innerHTML = `<div class="bubble">${text}</div>`;
  messagesContainer.appendChild(div);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  return div;
}

async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  addMessage(text, 'user');
  userInput.value = '';
  sendBtn.disabled = true;

  const typingDiv = addMessage('Typing...', 'bot');
  typingDiv.querySelector('.bubble').style.color = '#999';
  typingDiv.querySelector('.bubble').style.fontStyle = 'italic';

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    });

    const data = await response.json();
    typingDiv.remove();

    if (data.reply) {
      addMessage(data.reply, 'bot');
    } else {
      addMessage("I'm having trouble connecting. Please try again.", 'bot');
    }

  } catch (e) {
    typingDiv.remove();
    addMessage("Connection error. Please try again.", 'bot');
  }

  sendBtn.disabled = false;
  userInput.focus();
}