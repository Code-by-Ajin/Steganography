const express = require('express');
const multer = require('multer');
const router = express.Router();
const { encode, decode, getHistory, clearHistory } = require('../controllers/stegoController');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

router.post('/encode', upload.single('image'), encode);
router.post('/decode', upload.single('image'), decode);
router.get('/history', getHistory);
router.delete('/history', clearHistory);

module.exports = router;
