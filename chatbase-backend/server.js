const express = require('express');
const crypto = require('crypto'); // Built-in module, no need to install
const cors = require('cors');
const app = express();

const PORT = 3000; // Use any free port if needed
const secret = 'YOUR_SECRET_KEY'; // Replace with your Chatbase secret key

app.use(cors());
app.use(express.json());

// Test Route: Check if server is working
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Endpoint to generate HMAC
app.post('/generate-hash', (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'User ID is required' });

  const hash = crypto.createHmac('sha256', secret)
                     .update(userId)
                     .digest('hex');

  res.json({ hash });
});

// Start the server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
