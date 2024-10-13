// Import necessary modules using ES6 syntax
import express from 'express';
import multer from 'multer';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Set up module path (necessary for ES6 modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Set up file storage for uploaded videos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Route for uploading video files
app.post('/upload', upload.single('video'), (req, res) => {
  const videoPath = path.join(__dirname, req.file.path);

  // Call the Python script
  const pythonProcess = spawn('python', ['path/to/your/script.py', videoPath]);

  let dataString = '';

  pythonProcess.stdout.on('data', (data) => {
    dataString += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    if (code === 0) {
      try {
        const report = JSON.parse(dataString);
        res.json(report);
      } catch (err) {
        res.status(500).json({ error: 'Error parsing JSON response' });
      }
    } else {
      res.status(500).json({ error: 'Error processing video' });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
