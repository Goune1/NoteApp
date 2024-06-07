import React, { useState, useEffect, useRef } from 'react';
import { Mic } from 'lucide-react';

const AudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
    // Cleanup function to stop recording if component unmounts while recording
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
        await sendAudioToApi(audioBlob);
        audioChunksRef.current = [];
      };

      mediaRecorder.start();
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const toggleRecording = () => {
    setIsRecording((prev) => !prev);
  };

  const sendAudioToApi = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.wav');
    
    try {
      const response = await fetch('http://localhost:3001/api/sound-upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json(); // Lire la réponse JSON
        console.log('Audio file uploaded successfully');
        console.log('Transcription:', result.transcription); // Afficher la transcription
        setTranscription(result.transcription); // Mettre à jour l'état de transcription
      } else {
        console.error('Failed to upload audio file');
      }
    } catch (err) {
      console.error('Error occurred while uploading audio file', err);
    }
  };

  return (
    <div>
      <div onClick={toggleRecording} className='h-24 w-24 rounded-full bg-red-600 cursor-pointer'>
        <div className='flex items-center justify-center h-24'>
          <Mic className='h-12 w-12'/>
        </div>
        {isRecording ? <h1 className='text-center'>Arrêter</h1> : <h1 className='text-center'>Démarrer</h1>}
      </div>
      {audioUrl && (
        <div className="mt-12">
          <audio controls src={audioUrl} className="w-full"></audio>
        </div>
      )}
      {transcription && (
        <div className="mt-12">
          <h2>Transcription:</h2>
          <p>{transcription}</p>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
