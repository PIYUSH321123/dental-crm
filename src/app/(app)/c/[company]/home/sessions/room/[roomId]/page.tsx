"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { 
    ArrowLeft, Video, VideoOff, Mic, MicOff, Send, Play, Pause,
    CheckCircle, MessageSquare, Activity, User, Sparkles, Clock, 
    Settings, LogOut, ShieldAlert, Monitor, Volume2, VolumeX
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface Message {
    id: string
    sender: "You" | "Instructor" | "System"
    text: string
    time: string
}

interface Exercise {
    id: string
    name: string
    instructions: string
    status: "Completed" | "Active" | "Pending"
    durationOrReps: string
}

export default function SessionRoomPage() {
    const { company: companySlug, roomId } = useParams()
    const router = useRouter()
    const companyStr = (Array.isArray(companySlug) ? companySlug[0] : companySlug) || ""
    const roomIdStr = (Array.isArray(roomId) ? roomId[0] : roomId) || ""

    // Format room ID for display
    const roomTitle = roomIdStr
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")

    // State for controls
    const [micActive, setMicActive] = React.useState(true)
    const [cameraActive, setCameraActive] = React.useState(true)
    const [screenShareActive, setScreenShareActive] = React.useState(false)
    const [instructorMuted, setInstructorMuted] = React.useState(false)
    
    // Video elements refs
    const userVideoRef = React.useRef<HTMLVideoElement>(null)
    const [webcamAvailable, setWebcamAvailable] = React.useState(false)

    // Chat and exercise lists
    const [messages, setMessages] = React.useState<Message[]>([
        { id: "1", sender: "System", text: "Welcome to the secure virtual consultation room.", time: "Just now" },
        { id: "2", sender: "Instructor", text: "Hi! I will join in just a minute. Please warm up and get your mat ready.", time: "Just now" }
    ])
    const [newMessage, setNewMessage] = React.useState("")
    const [activeTab, setActiveTab] = React.useState<"exercises" | "chat">("exercises")

    const [exercises, setExercises] = React.useState<Exercise[]>([
        { id: "1", name: "Cat-Cow Stretch", instructions: "Inhale to arch your back, exhale to round your spine.", status: "Completed", durationOrReps: "5 reps" },
        { id: "2", name: "Downward-Facing Dog", instructions: "Press hips high, lengthening spine and stretching calves.", status: "Active", durationOrReps: "45 seconds" },
        { id: "3", name: "Warrior I Pose", instructions: "Lunge forward, back foot at 45 degrees, reach arms up.", status: "Pending", durationOrReps: "10 reps each side" },
        { id: "4", name: "Child's Pose Recovery", instructions: "Hips to heels, arms extended forward, breathe deeply.", status: "Pending", durationOrReps: "2 minutes" }
    ])

    // Handle webcam activation
    React.useEffect(() => {
        let stream: MediaStream | null = null

        if (cameraActive) {
            navigator.mediaDevices.getUserMedia({ video: true, audio: false })
                .then(s => {
                    stream = s
                    setWebcamAvailable(true)
                    if (userVideoRef.current) {
                        userVideoRef.current.srcObject = s
                    }
                })
                .catch(err => {
                    console.warn("Webcam access denied or unavailable:", err)
                    setWebcamAvailable(false)
                })
        } else {
            if (userVideoRef.current && userVideoRef.current.srcObject) {
                const activeStream = userVideoRef.current.srcObject as MediaStream
                activeStream.getTracks().forEach(track => track.stop())
                userVideoRef.current.srcObject = null
            }
            setWebcamAvailable(false)
        }

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop())
            }
        }
    }, [cameraActive])

    // Chat auto-responses for realism
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim()) return

        const userMsg: Message = {
            id: Date.now().toString(),
            sender: "You",
            text: newMessage,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }

        setMessages(prev => [...prev, userMsg])
        setNewMessage("")

        // Simulated Instructor response after 3 seconds
        setTimeout(() => {
            const replies = [
                "Excellent alignment! Focus on keeping your shoulders relaxed.",
                "Make sure to breathe continuously through the posture.",
                "Yes, we will cover that hamstring stretches right after this flow.",
                "Great job. Let's move to the next pose on the list."
            ]
            const randomReply = replies[Math.floor(Math.random() * replies.length)]
            
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                sender: "Instructor",
                text: randomReply,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }])
            toast.info("New message from Instructor")
        }, 3000)
    }

    // Toggle exercise status
    const toggleExerciseStatus = (id: string) => {
        setExercises(prev => prev.map(ex => {
            if (ex.id === id) {
                const nextStatus = ex.status === "Pending" ? "Active" : ex.status === "Active" ? "Completed" : "Pending"
                return { ...ex, status: nextStatus }
            }
            return ex
        }))
        toast.success("Exercise progress updated")
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
            {/* Header */}
            <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => router.push(`/c/${companyStr}/home/sessions`)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-lg font-bold tracking-tight text-white">{roomTitle}</h1>
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            <span className="text-[10px] uppercase tracking-wider font-extrabold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                                Live
                            </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium">Virtual Consultation Room • Secure Peer-to-Peer Stream</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-750 text-xs">
                        <Clock className="h-3.5 w-3.5 text-brand-primary" />
                        <span className="font-mono text-slate-300">00:14:52</span>
                    </div>
                    <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-xl border border-emerald-500/20 text-xs font-semibold">
                        <Activity className="h-3.5 w-3.5 text-emerald-450 animate-pulse" />
                        <span>Latency: 28ms</span>
                    </div>
                </div>
            </header>

            {/* Main Content Grid */}
            <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 min-h-0 overflow-hidden">
                {/* Left Side: Video Screens */}
                <div className="lg:col-span-8 flex flex-col gap-4 justify-between">
                    {/* Instructor Stream (Large Screen) */}
                    <div className="relative flex-1 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-center min-h-[350px]">
                        {/* Instructor Video Overlay/Static Placeholder */}
                        <div className="absolute inset-0 z-0">
                            <img 
                                src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1200" 
                                alt="Instructor Stream"
                                className="w-full h-full object-cover opacity-75"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                        </div>

                        {/* Stream Watermark Info */}
                        <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold text-white border border-slate-800 flex items-center gap-2">
                            <User className="h-3.5 w-3.5 text-brand-primary" />
                            <span>Elena Rostova (Instructor)</span>
                        </div>

                        {instructorMuted && (
                            <div className="absolute top-4 right-4 z-10 bg-red-500/90 text-white px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-red-400">
                                <VolumeX className="h-3.5 w-3.5" />
                                <span>MUTED BY YOU</span>
                            </div>
                        )}

                        {/* Interactive overlays: visual cues */}
                        <div className="absolute bottom-6 left-6 z-10 max-w-sm bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl p-4 shadow-2xl flex items-start gap-3">
                            <Sparkles className="h-5 w-5 text-brand-primary shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Active Pose Tip</h4>
                                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                                    Align your knees directly above your ankles in Warrior Pose. Keep the core engaged to protect the spine.
                                </p>
                            </div>
                        </div>

                        {/* Visualizer effect in center */}
                        <div className="flex flex-col items-center gap-2 relative z-10 text-center select-none bg-slate-950/40 p-6 rounded-2xl border border-white/5 backdrop-blur-xs max-w-xs">
                            <Activity className="h-10 w-10 text-brand-primary animate-pulse" />
                            <span className="text-xs font-bold text-white">Interactive Session Active</span>
                            <span className="text-[10px] text-slate-400">Pose alignment diagnostics are streaming to the trainer.</span>
                        </div>
                    </div>

                    {/* Controls & Mini View Bar */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                        {/* Stream Controls */}
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => {
                                    setMicActive(!micActive)
                                    toast.success(micActive ? "Microphone muted" : "Microphone active")
                                }}
                                className={`p-3 rounded-xl border transition-all ${
                                    micActive 
                                        ? "bg-slate-800 border-slate-700 hover:bg-slate-750 text-slate-200" 
                                        : "bg-red-650 border-red-500 hover:bg-red-700 text-white"
                                } cursor-pointer`}
                                title={micActive ? "Mute Microphone" : "Unmute Microphone"}
                            >
                                {micActive ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                            </button>
                            
                            <button 
                                onClick={() => {
                                    setCameraActive(!cameraActive)
                                    toast.success(cameraActive ? "Camera stopped" : "Camera started")
                                }}
                                className={`p-3 rounded-xl border transition-all ${
                                    cameraActive 
                                        ? "bg-slate-800 border-slate-700 hover:bg-slate-750 text-slate-200" 
                                        : "bg-red-650 border-red-500 hover:bg-red-700 text-white"
                                } cursor-pointer`}
                                title={cameraActive ? "Stop Camera" : "Start Camera"}
                            >
                                {cameraActive ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                            </button>

                            <button 
                                onClick={() => {
                                    setScreenShareActive(!screenShareActive)
                                    toast.success(screenShareActive ? "Screen share stopped" : "Screen sharing requested")
                                }}
                                className={`p-3 rounded-xl border transition-all ${
                                    screenShareActive 
                                        ? "bg-brand-primary border-brand-primary hover:bg-brand-primary-hover text-white" 
                                        : "bg-slate-800 border-slate-700 hover:bg-slate-750 text-slate-200"
                                } cursor-pointer`}
                                title="Share Screen"
                            >
                                <Monitor className="h-5 w-5" />
                            </button>

                            <button 
                                onClick={() => {
                                    setInstructorMuted(!instructorMuted)
                                    toast.success(instructorMuted ? "Instructor unmuted" : "Instructor muted")
                                }}
                                className={`p-3 rounded-xl border transition-all ${
                                    !instructorMuted 
                                        ? "bg-slate-800 border-slate-700 hover:bg-slate-750 text-slate-200" 
                                        : "bg-red-650 border-red-500 hover:bg-red-700 text-white"
                                } cursor-pointer`}
                                title={instructorMuted ? "Unmute Instructor" : "Mute Instructor"}
                            >
                                {instructorMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                            </button>
                        </div>

                        {/* Danger Leaving Button */}
                        <button 
                            onClick={() => {
                                const leavePromise = new Promise<void>((resolve) => {
                                    setTimeout(() => {
                                        resolve()
                                        router.push(`/c/${companyStr}/home/sessions`)
                                    }, 800)
                                })
                                toast.promise(
                                    leavePromise,
                                    {
                                        loading: 'Leaving consultation room...',
                                        success: 'Successfully disconnected.',
                                        error: 'Failed to disconnect.',
                                    }
                                )
                            }}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-red-650 hover:bg-red-700 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-red-950/20 active:scale-95 transition-all cursor-pointer"
                        >
                            <LogOut className="h-4 w-4" />
                            Leave Room
                        </button>
                    </div>
                </div>

                {/* Right Side: Tab Panel (Webcam, Exercises, Chat) */}
                <div className="lg:col-span-4 flex flex-col gap-4">
                    {/* User Local Stream (Camera feed) */}
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-center">
                        {cameraActive && webcamAvailable ? (
                            <video 
                                ref={userVideoRef}
                                autoPlay
                                playsInline
                                className="w-full h-full object-cover scale-x-[-1]"
                            />
                        ) : (
                            <div className="text-center p-4">
                                <VideoOff className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                                <span className="text-xs text-slate-400 font-semibold block">Camera Feed Off</span>
                                <span className="text-[10px] text-slate-550 block mt-0.5">Toggle webcam to join stream</span>
                            </div>
                        )}
                        <div className="absolute bottom-3 left-3 z-10 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] font-bold text-white border border-slate-800">
                            You (Patient)
                        </div>
                    </div>

                    {/* Panel Container (Exercises & Chat Tabs) */}
                    <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-xl min-h-[300px]">
                        {/* Tab Headers */}
                        <div className="flex border-b border-slate-800 bg-slate-950/40">
                            <button 
                                onClick={() => setActiveTab("exercises")}
                                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 text-center transition-all ${
                                    activeTab === "exercises"
                                        ? "border-brand-primary text-brand-primary bg-slate-900/20"
                                        : "border-transparent text-slate-400 hover:text-slate-200"
                                } cursor-pointer`}
                            >
                                Exercises
                            </button>
                            <button 
                                onClick={() => setActiveTab("chat")}
                                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 text-center transition-all ${
                                    activeTab === "chat"
                                        ? "border-brand-primary text-brand-primary bg-slate-900/20"
                                        : "border-transparent text-slate-400 hover:text-slate-200"
                                } cursor-pointer`}
                            >
                                Live Chat
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="flex-1 overflow-y-auto p-4 min-h-0">
                            {activeTab === "exercises" && (
                                <div className="space-y-3">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                                        Session Workout Checklist
                                    </h3>
                                    
                                    {exercises.map((ex) => (
                                        <div 
                                            key={ex.id}
                                            onClick={() => toggleExerciseStatus(ex.id)}
                                            className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                                                ex.status === "Completed"
                                                    ? "bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10"
                                                    : ex.status === "Active"
                                                    ? "bg-brand-primary/5 border-brand-primary/20 hover:bg-brand-primary/10 shadow-xs"
                                                    : "bg-slate-950/40 border-slate-800 hover:border-slate-700"
                                            }`}
                                        >
                                            <div className="flex items-start gap-2.5 justify-between">
                                                <div className="flex items-start gap-2">
                                                    <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                                                        ex.status === "Completed" ? "bg-emerald-500" : ex.status === "Active" ? "bg-brand-primary animate-pulse" : "bg-slate-650"
                                                    }`} />
                                                    <div>
                                                        <h4 className="text-xs font-bold text-slate-200 leading-tight">{ex.name}</h4>
                                                        <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{ex.instructions}</p>
                                                    </div>
                                                </div>
                                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                                    ex.status === "Completed" 
                                                        ? "bg-emerald-500/10 text-emerald-400" 
                                                        : ex.status === "Active" 
                                                        ? "bg-brand-primary/10 text-brand-primary" 
                                                        : "bg-slate-850 text-slate-500"
                                                }`}>
                                                    {ex.durationOrReps}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    <div className="p-3 bg-slate-950/20 border border-slate-805 rounded-xl text-[10px] text-slate-500 leading-relaxed text-center">
                                        💡 Click an exercise card to toggle progress status.
                                    </div>
                                </div>
                            )}

                            {activeTab === "chat" && (
                                <div className="flex flex-col h-full justify-between gap-4">
                                    {/* Chat list */}
                                    <div className="space-y-3 overflow-y-auto max-h-[320px] flex-1 pr-1">
                                        {messages.map((msg) => (
                                            <div 
                                                key={msg.id}
                                                className={`flex flex-col max-w-[85%] ${
                                                    msg.sender === "You" 
                                                        ? "ml-auto items-end" 
                                                        : msg.sender === "System"
                                                        ? "mx-auto items-center"
                                                        : "items-start"
                                                }`}
                                            >
                                                <span className="text-[9px] font-semibold text-slate-500 mb-0.5">{msg.sender} • {msg.time}</span>
                                                <div className={`p-2.5 rounded-2xl text-xs ${
                                                    msg.sender === "You"
                                                        ? "bg-brand-primary text-white rounded-tr-none font-medium shadow-xs"
                                                        : msg.sender === "System"
                                                        ? "bg-slate-950/60 border border-slate-850 text-slate-400 text-[10px] rounded-lg text-center"
                                                        : "bg-slate-800 text-slate-200 rounded-tl-none font-medium"
                                                }`}>
                                                    {msg.text}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Chat input form */}
                                    <form onSubmit={handleSendMessage} className="flex gap-1.5 mt-auto pt-2 border-t border-slate-800 bg-slate-900">
                                        <input 
                                            type="text" 
                                            placeholder="Send message..."
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            className="flex-1 h-8 px-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20"
                                        />
                                        <button 
                                            type="submit"
                                            className="h-8 w-8 rounded-lg bg-brand-primary hover:bg-brand-primary-hover text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                                        >
                                            <Send className="h-3.5 w-3.5" />
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
