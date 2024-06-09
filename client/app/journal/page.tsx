"use client"

import React, { useEffect, useState } from 'react';
import Nav from '@/components/nav';
import { Calendar } from "@/components/ui/calendar";
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardTitle,
} from "@/components/ui/card";
import AudioRecorder from '@/components/audioRecorder';
//@ts-ignore
import Cookies from 'js-cookie';

export default function Journal() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [notes, setNotes] = useState<any>(null);
    const [noteAdded, setNoteAdded] = useState(false); // New state to track if a note has been added

    const formatDate = (date: Date | undefined): string | undefined => {
        if (!date) return undefined;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Mois de 0 à 11
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const fetchNotes = async (selectedDate: Date | undefined) => {
        try {
            const email = Cookies.get('email');
            if (!email) {
                console.error('Email not found in cookies');
                return;
            }

            const formattedDate = formatDate(selectedDate); // Formater la date en YYYY-MM-DD
            const response = await fetch('https://api-notes.gounevps.com/api/fetchNotes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, date: formattedDate }),
            });

            if (response.ok) {
                const data = await response.json();

                if (data.message === 'No notes found for this date') {
                    setNotes(null);
                } else {
                    setNotes(data);
                }
            } else {
                console.error('Failed to fetch notes');
            }
        } catch (err) {
            console.error('Error occurred while fetching notes:', err);
        }
    };

    const handleDelete = async () => {
        try {
            const email = Cookies.get('email');
            if (!email) {
                console.error('Email not found in cookies');
                return;
            }

            const formattedDate = formatDate(date);
            if (!formattedDate) {
                console.error('Date is not selected');
                return;
            }

            const response = await fetch('https://api-notes.gounevps.com/api/deleteNotes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, date: formattedDate }),
            });

            if (response.ok) {
                console.log('Note deleted successfully');
                setNotes(null); // Clear the notes after deletion
                fetchNotes(date); // Re-fetch the notes to update the component
            } else {
                console.error('Failed to delete note');
            }
        } catch (err) {
            console.error('Error occurred while deleting note:', err);
        }
    };

    useEffect(() => {
        fetchNotes(date);
    }, [date, noteAdded]); // Add noteAdded to dependencies

    const handleNoteAdded = () => {
        setNoteAdded(true); // Update state when note is added
        setTimeout(() => setNoteAdded(false), 0); // Reset state immediately to allow for future updates
    };

    return (
        <div className="min-h-screen bg-gray-900">
            <Nav />

            <h1 className="text-4xl lg:text-6xl text-white text-center font-bold mt-20">Votre journal</h1>

            <div className='flex flex-col gap-y-24 md:flex-row mt-24 gap-x-24 lg:gap-x-72 items-center md:items-start pb-48 sm:ml-8 lg:ml-36'>
                

                <div className='bg-gray-950 max-w-72 max-h-96 rounded-md '>
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md border dark text-white w-72 mx-auto md:mx-0"
                    />
                </div>

                <div className='flex items-center'>
                    <Card className='dark bg-gray-950 w-72 mid2:w-customCard3 mid:w-customCard2 big:w-customCard h-customCard mx-auto md:mx-0'>
                        <CardTitle className='py-4 px-8'>Votre note du jour</CardTitle>
                        <CardContent className=''>
                            <div className='ml-2'>
                                {notes ? (
                                    <div className='mt-4'>
                                        <p><strong>Humeur :</strong> {notes.notes[0].mood}/10</p>
                                        <p><strong>Activités :</strong> {notes.notes[0].activities}</p>

                                        <Button className='mt-6' onClick={handleDelete}>Supprimer</Button>
                                    </div>
                                ) : (
                                    <div className='p-4 ml-4'>
                                        <AudioRecorder selectedDate={date} onNoteAdded={handleNoteAdded} />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
