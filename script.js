const messagesContainer = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
let conversationHistory = [];
let isLoading = false;

// Generate next 7 available dates (skip Sundays)
function getAvailableDates() {
  const dates = [];
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  let d = new Date();
  d.setDate(d.getDate() + 1);
  while (dates.length < 6) {
    if (d.getDay() !== 0) {
      dates.push(`${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`);
    }
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

const availableDates = getAvailableDates();
const availableTimes = [
  '9:00 AM','10:00 AM','11:00 AM',
  '12:00 PM','2:00 PM','3:00 PM',
  '4:00 PM','5:00 PM','6:00 PM'
];

userInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !isLoading) sendMessage();
});

function formatBotMessage(text) {
  // Clickable date buttons
  availableDates.forEach(date => {
    text = text.split(date).join(
      `<button class="slot-btn" onclick="quickSend('${date}')">📅 ${date}</button>`
    );
  });

  // Clickable time buttons
  availableTimes.forEach(time => {
    const regex = new RegExp(`•\\s*${time}`, 'g');
    text = text.replace(regex,
      `<button class="slot-btn" onclick="quickSend('${time}')">🕐 ${time}</button>`
    );
  });

  // Clickable maps link
  text = text.replace(
    /https:\/\/maps\.google\.com\/[^\s<]*/g,
    '<a class="maps-link" href="$&" target="_blank">🗺️ Open in Google Maps</a>'
  );

  // Clickable phone
  text = text.replace(
    /\+91\s*98765\s*43210/g,
    '<a href="tel:+919876543210" style="color:#1a73e8;font-weight:600;">📞 +91 98765 43210</a>'
  );

  return text;
}

function addMessage(text, role) {
  const div = document.createElement('div');
  div.className = `message ${role === 'user' ? 'user-message' : 'bot-message'}`;

  if (role === 'bot') {
    div.innerHTML = `
      <div class="bot-avatar">🦷</div>
      <div class="bubble">${formatBotMessage(text)}</div>`;
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
  if (isLoading) return;
  userInput.value = text;
  sendMessage();
}

async function callAPI(messages) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages })
  });
  if (!response.ok) throw new Error('API error');
  return await response.json();
}

async function sendMessage() {
  const text = userInput.value.trim();
  if (!text || isLoading) return;

  isLoading = true;
  addMessage(text, 'user');
  userInput.value = '';
  sendBtn.disabled = true;

  conversationHistory.push({ role: 'user', content: text });
  showTyping();

  try {
    const data = await callAPI(conversationHistory);
    removeTyping();

    if (data.reply) {
      addMessage(data.reply, 'bot');
      conversationHistory.push({ role: 'assistant', content: data.reply });
    } else {
      addMessage("I'm having trouble connecting. Please try again.", 'bot');
    }
  } catch (e) {
    removeTyping();
    addMessage("Connection error. Please try again in a moment.", 'bot');
  }

  isLoading = false;
  sendBtn.disabled = false;
  userInput.focus();
}

// Auto-start conversation
async function startConversation() {
  showTyping();
  try {
    const data = await callAPI([{ role: 'user', content: '__start__' }]);
    removeTyping();
    if (data.reply) {
      addMessage(data.reply, 'bot');
      conversationHistory.push({ role: 'user', content: '__start__' });
      conversationHistory.push({ role: 'assistant', content: data.reply });
    }
  } catch(e) {
    removeTyping();
    addMessage("Welcome to SmileCare Dental Clinic! 😊 How can I help you today?", 'bot');
  }
}

window.onload = startConversation;