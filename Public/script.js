async function sendMessage() {
  const userInput = document.getElementById('userInput');
  const text = userInput.value.trim();
  if (!text) return;

  addMessage(text, 'user'); // Add your UI function here
  userInput.value = '';

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text }) 
    });

    const data = await response.json();
    
    if (data.reply) {
      addMessage(data.reply, 'bot');
    } else {
      addMessage("I'm having trouble connecting to the clinic. Try again?", 'bot');
    }
  } catch (e) {
    addMessage("Connection error.", 'bot');
  }
}