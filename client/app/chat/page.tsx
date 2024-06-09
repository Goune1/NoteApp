"use client"

import React, { useState, KeyboardEvent } from 'react';
import Nav from '@/components/nav';
//@ts-ignore
import Cookies from 'js-cookie';
import { UserRound } from 'lucide-react';

type MessageType = 'user' | 'api';

interface ApiMessageContent {
    mood?: string;
    activities?: string;
    message?: string;
}

interface Message {
    type: MessageType;
    content: string | ApiMessageContent;
}

export default function Chat() {
    const [message, setMessage] = useState<string>('');
    const [messages, setMessages] = useState<Message[]>([]);

    const handleKeyPress = async (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();

            const newMessages: Message[] = [...messages, { type: 'user', content: message }];
            setMessages(newMessages);
            setMessage('');

            try {
                const email = Cookies.get('email');
                const response = await fetch('http://localhost:3001/api/send-message', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ message, email }),
                });

                if (!response.ok) {
                    console.error('Erreur lors de l\'envoi du message');
                } else {
                    const result = await response.json();
                    console.log(result);
                    
                    let newResponseMessages: Message[];
                    if (Array.isArray(result)) {
                        newResponseMessages = result.map(item => ({ type: 'api', content: item }));
                    } else if (result.notes) {
                        newResponseMessages = [{ type: 'api', content: { mood: result.notes[0].mood, activities: result.notes[0].activities || '' } }];
                    } else {
                        newResponseMessages = [{ type: 'api', content: { message: result.message } }];
                    }
                    setMessages(prevMessages => [...prevMessages, ...newResponseMessages]);
                }
            } catch (error) {
                console.error('Erreur:', error);
            }
        }
    };

    const renderMessageContent = (content: string | ApiMessageContent): React.ReactNode => {
        if (typeof content === 'string') {
            return content;
        }
        if ('mood' in content && 'activities' in content) {
            return (
                <div>
                    <p>Mood : {content.mood}</p>
                    <p>Activités : {content.activities?.split(',').map(activity => activity.trim()).join(', ')}</p>
                </div>
            );
        }
        return content.message;
    };

    return (
        <div className="min-h-screen bg-gray-900">
            <Nav />

            <div className='flex items-center justify-center mt-24 p-4'>
                <div className='w-[1000px] h-[600px] border-1.5 border-black bg-gray-900 rounded-lg flex flex-col justify-between'>
                    <h1 className='text-white text-3xl p-4 font-bold'>Discutez avec vos notes !</h1>
                    <div className='flex-grow overflow-y-auto p-4'>
                        {messages.map((msg, index) => (
                            <div key={index} className={`text-white flex flex-col ml-4 lg:ml-8 mt-4 rounded mb-2 ${msg.type === 'api' ? '' : ''}`}>
                                <div className='flex'>
                                    <UserRound />
                                    <p className='text-xl'>{msg.type === 'user' ? 'Vous' : 'Assistant'}</p>
                                </div>
                                <div className='ml-1 mt-1'>
                                    {renderMessageContent(msg.content)}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className='flex items-center justify-center'>
                        <input 
                            type="text" 
                            placeholder='Envoyer un message...' 
                            className='w-3/4 h-10 border-2 rounded-md border-gray-600 bg-gray-900 text-white placeholder-gray-500 p-4 mb-4' 
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
