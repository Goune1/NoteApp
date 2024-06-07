"use client"

import React from 'react'
import Nav from '@/components/nav'
import { Calendar } from "@/components/ui/calendar"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Mic } from 'lucide-react';
import AudioRecorder from '@/components/audioRecorder'
  


export default function journal() {
    const [date, setDate] = React.useState<Date | undefined>(new Date())

    return (
        <div className="min-h-screen bg-black">
            <Nav/>

            <h1 className="text-3xl lg:text-6xl text-white text-center font-bold mt-20">Votre journal</h1>
            
            <div className='flex flex-col gap-y-24 md:flex-row ml-2 lg:ml-36 mt-24 gap-x-72'>
                <div className='bg-slate-950'>
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md border dark text-white w-72"
                    />
                </div>

                <div>
                    <Card className='dark w-customCard h-customCard'>
                        <CardTitle className='p-4'>Votre note du jour</CardTitle>
                        <CardContent className=''>
                            <div className='ml-4'>
                                <AudioRecorder/>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}