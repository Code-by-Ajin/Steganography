const express = require('express');
const cors = require('cors');
const stegoRoutes = require('./routes/stego');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use('/api', stegoRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Steganography API running at http://localhost:${PORT}`);
});
