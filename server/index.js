const express = require('express')
const cors = require('cors')
const axios = require('axios')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const OpenAI = require ("openai");

const openai = new OpenAI({ apiKey: '' });

const app = express();
app.use(bodyParser.json());
app.use(cors());


const loginCollection = require("./schemas/loginSchema")

const DB_URL = "mongodb://goune:goune1407@ac-nef3pac-shard-00-02.0x9jwgi.mongodb.net:27017,ac-nef3pac-shard-00-01.0x9jwgi.mongodb.net:27017,ac-nef3pac-shard-00-00.0x9jwgi.mongodb.net:27017/NotesApp?authSource=admin&replicaSet=atlas-tibrt3-shard-0&ssl=true";

async function connectToDatabase() {
    try {
      await mongoose.connect(DB_URL);
      console.log("Connecté à la base de données MongoDB");
    } catch (error) {
      console.error(`Impossible de se connecter à la base de données MongoDB: ${error}`);
    }
}

connectToDatabase()



app.post('/api/signup', async (req, res) => {
    const formData = req.body;
    console.log(formData)
    // Traitez les données du formulaire ici (par exemple, enregistrez-les dans une base de données)
    const data = {
        username: formData.username,
        email: formData.email,
        password: formData.password
    }
  
    const user = await loginCollection.findOne({email: formData.email})
  
    if (user) {
      return res.status(400).json({ message: "Cet utilisateur existe déjà !" });
    }
  
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(formData.password, saltRounds)
    data.password = hashedPassword
  
    const userdata = await loginCollection.insertMany(data)
  

    res.status(200).json({ message: "Correctly Logged IN", user: data });
});

app.post("/api/login", async (req, res) => {
  const formData = req.body;

  const data = {
    email: formData.email,
    password: formData.password
  }

  const user = await loginCollection.findOne({ email: data.email })

  if (!user) {
    return res.status(400).json({ message: "Cet utilisateur n'existe pas !" });
  }

  const isMatch = await bcrypt.compare(data.password, user.password);

  if (!isMatch) {
    return res.status(400).json({ message: "Mot de passe incorrect !" });
  }

  const dataSent = {
    username: user.username,
    email: data.email
  }

  res.status(200).json({ message: "Correctly Logged IN", user: dataSent });
})

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/';
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Save the file with the original name
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

// Endpoint to handle audio file uploads
app.post('/api/sound-upload', upload.single('file'), async (req, res) => {
  try {
    // req.file contains information about the uploaded file
    const file = req.file;
    console.log('File uploaded successfuly');

    // Send the audio file to OpenAI API for transcription
    const openaiResponse = await sendAudioToOpenAI(file.path);
    
    // Respond with success and the transcription result
    res.status(200).json({
      message: 'File uploaded and transcribed successfully',
      transcription: openaiResponse
    });
  } catch (err) {
    console.error('Error processing file:', err);
    res.status(500).json({ message: 'Failed to process file' });
  }
});

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Function to send audio file to OpenAI API for transcription
const sendAudioToOpenAI = async (filePath) => {
  const file = fs.createReadStream(filePath);
  const transcription = await openai.audio.transcriptions.create({
    file: file,
    model: "whisper-1",
    response_format: "text"
  });

  console.log(transcription); // Assurez-vous que la transcription est correcte
  return transcription; // Retourner la transcription
};




const PORT = process.env.PORT || 3001; // Utilise le port dynamique attribué par le fournisseur d'hébergement ou le port 3000 par défaut en local

app.listen(PORT, () => {
  console.log(`Le serveur écoute sur  http://localhost:${PORT}`);
});
