const express = require('express')
const cors = require('cors')
const axios = require('axios')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const bodyParser = require('body-parser');
const multer = require('multer');
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const OpenAI = require ("openai");
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const openai = new OpenAI({ apiKey: process.env.OPENAI_SECRET });

const app = express();
app.use(bodyParser.json());
app.use(cors());


const loginCollection = require("./schemas/loginSchema")
const notesCollection = require('./schemas/noteSchema')

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

/*const storage = multer.diskStorage({
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
app.post('/api/soundupload', upload.single('file'), async (req, res) => {
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
};*/

app.post('/api/sound-upload', async (req, res) => {
  const { file } = req.body;

  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Extraction du buffer depuis la chaîne Base64
  const buffer = Buffer.from(file.split(',')[1], 'base64');

  // Création d'un fichier temporaire pour l'envoi à l'API OpenAI
  const tempFilePath = './temp_audio.wav';
  fs.writeFileSync(tempFilePath, buffer);

  try {
    const response = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: 'whisper-1',
      response_format: 'text',
    });

    console.log(response)
    res.status(200).json({ response });
  } catch (error) {
    console.error('Error uploading audio to OpenAI:', error);
    res.status(500).json({ error: 'Failed to upload audio to OpenAI' });
  } finally {
    fs.unlinkSync(tempFilePath); // Suppression du fichier temporaire
  }
});


app.post('/api/notes', async (req, res) => {
  console.log(req.body)
  console.log(req.body.email)

  const prompt = req.body.transcription

  const tools_functions = [
    {
      'type': 'function',
      'function': {
        'name': 'analyzeUserDay',
        'description': 'you have to analyze the day of the user, and if he feels good or not',
        'parameters': {
          'type': 'object',
          'properties': {
            "Mood": {
              'type': 'number',
              'description': 'extracts a number between 0 and 10 that represents the user\'s happiness level'
            },
            "Activities": {
              'type': 'string',
              'descriptions': 'extracts the activities that the user did during the day'
            }
          }
        }
      }
    }
  ]

  
  const completion = await openai.chat.completions.create({
    messages: [{"role": 'user', 'content': prompt}],
    tools: tools_functions,
    tool_choice: 'auto',
    model: 'gpt-3.5-turbo-16k',
    max_tokens: 256,
  })

  // Assuming the response structure
  const note = JSON.parse(completion.choices[0].message.tool_calls[0].function.arguments);
  const mood = note.Mood;
  const activities = note.Activities;

  console.log('Mood:', mood);
  console.log('Activities:', activities);

  const email = req.body.email
  const currentDate = new Date();

  const date = req.body.date

  
  // Créer un nouvel utilisateur si l'utilisateur n'existe pas
  const newUser = new notesCollection({
    email,
    date,
    notes: [{
      mood,
      activities,
      prompt
    }]
  });
  await newUser.save();
  
  res.status(200).json({
    message: 'successfully send to open ai',
    note: note
  })
})


app.post('/api/fetchNotes', async (req, res) => {
  const { date, email } = req.body;

  if (!date || !email) {
      return res.status(400).json({ error: 'Date and email are required' });
  }

  try {
      const notes = await notesCollection.find({
          email,
          date
      });

      if (notes.length === 0) {
          return res.status(200).json({ message: 'No notes found for this date' });
      }

      res.status(200).json(notes[0]);
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch notes' });
  }
});


app.post('/api/deleteNotes', async(req, res) => {
  const { email, date } = req.body;

  if (!email || !date) {
      return res.status(400).json({ message: 'Email and date are required' });
  }

  try {
      const result = await notesCollection.findOneAndDelete({ email, date });

      if (result) {
          res.status(200).json({ message: 'Note deleted successfully' });
      } else {
          res.status(404).json({ message: 'Note not found' });
      }
  } catch (error) {
      console.error('Error deleting note:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});


app.post('/api/send-message', async (req, res) => {
  const message = req.body.message
  const email = req.body.email

  const completion = await openai.chat.completions.create({
    messages: [
      {"role": 'system', 'content': 'l\'utilisateur va t\'indiquer une date, tu devras me la renvoyer sans aucun autre texte (uniquement la date) sous la forme année-mois-jour par exemple 2024-06-14 = 14 juin 2024. si l\'utilisateur n\'a par défaut pas fourni d\année alors indique qu\'il s\'agit de 2024. si tu nous trouves pas de date dans le message alors renvoie "Il semble que vous n\'ayez pas inclus de date dans votre message, veuillez réessayer."'},
      {"role": 'user', 'content': message}
    ],
    model: 'gpt-3.5-turbo-16k',
    max_tokens: 256,
  })

  console.log(completion.choices[0].message.content)
  const date = completion.choices[0].message.content

  try {
    const notes = await notesCollection.find({
        email,
        date
    });

    if (notes.length === 0) {
        return res.status(200).json({ message: 'Il n\'existe pas de note pour cette date ou vous n\'avez pas bien indiqué la date.' });
    }

    console.log(notes)
    res.status(200).json(notes[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }


  //res.status(200).json({ message: 'Chat successfuly sent'})
})





const PORT = process.env.PORT || 3001; // Utilise le port dynamique attribué par le fournisseur d'hébergement ou le port 3000 par défaut en local

app.listen(PORT, () => {
  console.log(`Le serveur écoute sur  http://localhost:${PORT}`);
});
