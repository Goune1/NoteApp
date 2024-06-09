import React, { useState, useEffect, useRef } from 'react';
import { Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
//@ts-ignore
import Cookies from 'js-cookie';

interface AudioRecorderProps {
  selectedDate: Date | undefined;
  onNoteAdded: () => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ selectedDate, onNoteAdded }) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isRecordingCompleted, setIsRecordingCompleted] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [mood, setMood] = useState<number | null>(null);
  const [activities, setActivities] = useState<string | null>(null);

  useEffect(() => {
    if (isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
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

      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
        await sendAudioToApi(audioBlob);
        audioChunksRef.current = [];
        setIsRecordingCompleted(true);
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
        const result = await response.json();
        setTranscription(result.transcription);
      } else {
        console.error('Failed to upload audio file');
      }
    } catch (err) {
      console.error('Error occurred while uploading audio file', err);
    }
  };

  const formatDate = (date: Date | undefined): string | undefined => {
    if (!date) return undefined;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = async () => {
    if (transcription) {
      try {
        const userEmail = Cookies.get('email');
        const formattedDate = formatDate(selectedDate);
        const response = await fetch('http://localhost:3001/api/notes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ transcription, email: userEmail, date: formattedDate }),
        });

        if (response.ok) {
          const result = await response.json();

          const note = result.note;

          const mood = note.Mood;
          const activities = note.Activities;

          setMood(mood);
          setActivities(activities);
          onNoteAdded();
        } else {
          console.error('Failed to send transcription');
        }
      } catch (err) {
        console.error('Error occurred while sending transcription', err);
      }
    }
  };

  const handleRestart = () => {
    setIsRecordingCompleted(false);
    setTranscription(null);
    setAudioUrl(null);
    setMood(null);
    setActivities(null);
  };

  return (
    <div>
      {!isRecordingCompleted && (
        <div onClick={toggleRecording} className='h-24 w-24 rounded-full bg-red-600 cursor-pointer'>
          <div className='flex items-center justify-center h-24'>
            <Mic className='h-12 w-12'/>
          </div>
          {isRecording ? <h1 className='text-center'>Arrêter</h1> : <h1 className='text-center'>Démarrer</h1>}
        </div>
      )}
      {transcription && mood === null && activities === null && (
        <div className="mt-4">
          <h2 className='text-xl font-semibold'>Votre note :</h2>
          <p>{transcription}</p>
          <Button className='mt-4' onClick={handleSubmit}>Valider</Button>
          <Button className='ml-4' onClick={handleRestart}>Recommencer</Button>
        </div>
      )}
      {mood !== null && activities !== null && (
        <div className='mt-4'>
          <p><strong>Humeur :</strong> {mood}/10</p>
          <p><strong>Activités :</strong> {activities}</p>

          <Button className='mt-6'>Supprimer</Button>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
