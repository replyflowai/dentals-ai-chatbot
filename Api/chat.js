module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'No message provided' });
  }

  const systemPrompt = `You are a friendly and professional AI assistant for SmileCare Dental Clinic.

Your job is to help patients with:
- Booking and rescheduling appointments
- Information about dental treatments (cleaning, fillings, root canal, braces, whitening, implants)
- Clinic hours (Mon-Sat: 9am to 7pm, Sunday: Closed)
- Pricing (cleaning: ₹500, filling: ₹800-1500, whitening: ₹3000, consultation: ₹300)
- Location (123 Health Street, City Center)
- Contact number (+91 98765 43210)

Rules:
- Always be warm, friendly and reassuring
- Keep responses short and clear (2-4 sentences max)
- If someone wants to book, ask for their preferred date and time
- If you don't know something, say "I'll connect you with our team for that"
- Never give medical diagnoses
- Respond in the same language the patient uses`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 300,
        temperature: 0.7
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      console.error('Groq response:', JSON.stringify(data));
      return res.status(500).json({ error: 'No reply from Groq' });
    }

    return res.status(200).json({ reply });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Failed to get response' });
  }
}