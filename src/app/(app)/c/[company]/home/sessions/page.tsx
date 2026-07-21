import * as React from "react"
import { Calendar, Clock, Video, User, Sparkles } from "lucide-react"

interface Session {
    id: string
    title: string
    instructor: string
    time: string
    date: string
    category: "Yoga" | "Physiotherapy" | "Wellness"
    duration: string
    capacity: string
    image: string
}

const UPCOMING_SESSIONS: Session[] = [
    {
        id: "morning-flow",
        title: "Live: Morning Flow",
        instructor: "Elena Rostova",
        time: "07:30 AM - 08:30 AM",
        date: "Every Monday, Wednesday, Friday",
        category: "Yoga",
        duration: "60 mins",
        capacity: "15 spots left",
        image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=600&auto=format&fit=crop"
    },
    {
        id: "posture-alignment",
        title: "Posture Correction Workshop",
        instructor: "Dr. Anil (Chief Physio)",
        time: "11:00 AM - 12:00 PM",
        date: "Every Tuesday, Thursday",
        category: "Physiotherapy",
        duration: "60 mins",
        capacity: "8 spots left",
        image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=600&auto=format&fit=crop"
    },
    {
        id: "pranayama-calm",
        title: "Breathwork for Nervous System Calm",
        instructor: "Dr. Ankita (Yoga Therapist)",
        time: "06:00 PM - 06:45 PM",
        date: "Every Wednesday",
        category: "Wellness",
        duration: "45 mins",
        capacity: "20 spots left",
        image: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?q=80&w=600&auto=format&fit=crop"
    },
    {
        id: "back-care-physio-yoga",
        title: "Therapeutic Yoga for Spine Recovery",
        instructor: "Dr. Ankita & Dr. Anil",
        time: "05:00 PM - 06:00 PM",
        date: "Every Saturday",
        category: "Yoga",
        duration: "60 mins",
        capacity: "5 spots left",
        image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600&auto=format&fit=crop"
    }
]

export default function SessionsPage() {
    return (
        <div className="bg-slate-50 pb-20">
                {/* Page Header */}
                <div className="bg-white border-b border-gray-200 py-16 text-center">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-bg-light text-brand-primary mb-5">
                            <Video className="h-7 w-7" />
                        </div>
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
                            Online Sessions Studio
                        </h1>
                        <p className="text-base text-gray-500 max-w-xl mx-auto leading-relaxed">
                            Book and join live interactive video consultation rooms and group therapy sessions directly in your portal.
                        </p>
                    </div>
                </div>

                {/* Grid Content */}
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-brand-primary" />
                        This Week's Live Schedule
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {UPCOMING_SESSIONS.map((session) => (
                            <div 
                                key={session.id} 
                                className="bg-white rounded-3xl border border-gray-100 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col sm:flex-row"
                            >
                                {/* Thumbnail */}
                                <div className="relative h-48 sm:h-auto sm:w-48 shrink-0 bg-gray-900 flex items-center justify-center">
                                    <img 
                                        src={session.image} 
                                        alt={session.title} 
                                        className="h-full w-full object-cover opacity-85" 
                                    />
                                    <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-xs text-xs font-bold text-brand-primary border border-gray-100 rounded-full px-3 py-1 shadow-xs uppercase tracking-wider">
                                        {session.category}
                                    </span>
                                </div>

                                {/* Body */}
                                <div className="flex-1 p-6 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                                            {session.title}
                                        </h3>
                                        
                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <User className="h-4 w-4 text-gray-400 shrink-0" />
                                                <span className="font-semibold text-gray-700">{session.instructor}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                                                <span>{session.date}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <Clock className="h-4 w-4 text-gray-400 shrink-0" />
                                                <span>{session.time} ({session.duration})</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action row */}
                                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
                                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 rounded-full px-2.5 py-1">
                                            {session.capacity}
                                        </span>
                                        <button className="rounded-xl bg-brand-primary px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-primary-hover transition-all hover:scale-105 active:scale-95 duration-200 cursor-pointer">
                                            Book Spot
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
        </div>
    )
}
