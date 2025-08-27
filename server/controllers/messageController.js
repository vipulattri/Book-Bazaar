// Sample message storage (in-memory array for now)
let messages = [];

// GET /api/messages
export const getMessages = (req, res) => {
  res.status(200).json(messages);
};

// POST /api/messages
export const sendMessage = (req, res) => {
  const { sender, message } = req.body;

  if (!sender || !message) {
    return res.status(400).json({ error: 'Sender and message are required' });
  }

  const newMessage = {
    id: messages.length + 1,
    sender,
    message,
    timestamp: new Date()
  };

  messages.push(newMessage);
  res.status(201).json({ message: 'Message sent', data: newMessage });
};
