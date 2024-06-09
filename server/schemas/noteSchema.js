const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const noteSchema = new Schema({
  mood: {
    type: Number,
    required: true
  },
  activities: {
    type: String,
    required: true
  },
  prompt: {
    type: String,
    required: true
  } 
});

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  notes: [noteSchema]
});

const User = mongoose.model('Notes', userSchema);

module.exports = User;
