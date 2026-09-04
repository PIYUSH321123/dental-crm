"use client"

import * as React from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useSidebar } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Sparkles, Video, Upload, Play, RefreshCw, CheckCircle2, AlertCircle, Camera, Check } from "lucide-react"
import { toast } from "sonner"
import { PatientSearchSelect } from "@/components/ui/patient-search-select"

// Interface matching helper
import { getPatientClinicalData, ClinicalData } from "../clinical-data-helper"

const PATIENT_OPTIONS = [
    { value: "Ravi Kumar (P-0142)", label: "Ravi Kumar (P-0142)" },
    { value: "Meera Shah (P-0141)", label: "Meera Shah (P-0141)" },
    { value: "Arjun Singh (P-0139)", label: "Arjun Singh (P-0139)" },
]

export default function AIAssessmentPage() {
    const params = useParams()
    const company = params.company as string
    const router = useRouter()
    const searchParams = useSearchParams()
    
    // Check initial patient from URL
    const urlPatient = searchParams.get("patientId")
    
    const { open, openMobile, isMobile } = useSidebar()
    const isCollapsed = isMobile ? !openMobile : !open

    // Patient state
    const [patientOptions, setPatientOptions] = React.useState(PATIENT_OPTIONS)
    const [activePatient, setActivePatient] = React.useState(urlPatient || "Ravi Kumar (P-0142)")

    // Fetch dynamic patient list
    React.useEffect(() => {
        const loadPatients = async () => {
            try {
                const res = await fetch(`/api/patients?companySlug=${company}`)
                const data = await res.json()
                if (data.success && data.patients && data.patients.length > 0) {
                    const dbOptions = data.patients.map((p: any) => ({
                        value: p.id,
                        label: `${p.name} (${p.id})`
                    }))
                    const combined = [...dbOptions]
                    PATIENT_OPTIONS.forEach(opt => {
                        if (!combined.some(o => o.value === opt.value)) {
                            combined.push(opt)
                        }
                    })
                    setPatientOptions(combined)
                }
            } catch (error) {
                console.error("Error loading patients for AI assessment page:", error)
            }
        }
        loadPatients()
    }, [company])

    // Video states
    const [activeVideoTab, setActiveVideoTab] = React.useState<"camera" | "upload">("camera")
    const [isCameraOn, setIsCameraOn] = React.useState(false)
    const [isRecording, setIsRecording] = React.useState(false)
    const [recordedTime, setRecordedTime] = React.useState(0)
    const [uploadedFile, setUploadedFile] = React.useState<File | null>(null)
    const [uploadedVideoUrl, setUploadedVideoUrl] = React.useState<string | null>(null)
    const [isPlaying, setIsPlaying] = React.useState(false)

    // Analysis states
    const [isAnalyzing, setIsAnalyzing] = React.useState(false)
    const [analysisProgress, setAnalysisProgress] = React.useState(0)
    const [analysisLogs, setAnalysisLogs] = React.useState<string[]>([])
    const [analysisCompleted, setAnalysisCompleted] = React.useState(false)
    const [selectedDemoType, setSelectedDemoType] = React.useState<"knee" | "shoulder" | "acl" | null>(null)

    // Form fields
    const [primaryComplaint, setPrimaryComplaint] = React.useState("")
    const [painScore, setPainScore] = React.useState<number>(0)
    const [painDuration, setPainDuration] = React.useState("1–6 months")
    const [painType, setPainType] = React.useState<"Dull Ache" | "Sharp" | "Burning" | "Throbbing">("Dull Ache")
    
    const [diagnosis, setDiagnosis] = React.useState("")
    const [affectedArea, setAffectedArea] = React.useState("Left Knee")
    const [icdCode, setIcdCode] = React.useState("")
    const [aggravating, setAggravating] = React.useState("")
    const [relieving, setRelieving] = React.useState("")

    const [romFlexion, setRomFlexion] = React.useState("")
    const [romExtension, setRomExtension] = React.useState("")
    const [swelling, setSwelling] = React.useState("Grade 0 – None")
    const [specialTests, setSpecialTests] = React.useState("")
    const [postureAssessment, setPostureAssessment] = React.useState("")

    // Refs
    const videoRef = React.useRef<HTMLVideoElement | null>(null)
    const canvasRef = React.useRef<HTMLCanvasElement | null>(null)
    const mediaRecorderRef = React.useRef<MediaRecorder | null>(null)
    const recordedChunksRef = React.useRef<Blob[]>([])
    const timerRef = React.useRef<NodeJS.Timeout | null>(null)
    const logsEndRef = React.useRef<HTMLDivElement | null>(null)

    // Initialize/Reset clinical data based on selected patient initially
    React.useEffect(() => {
        resetFormWithStaticData(activePatient)
    }, [activePatient])

    const resetFormWithStaticData = (patientKey: string) => {
        const data = getPatientClinicalData(patientKey)
        setPrimaryComplaint(data.primaryComplaint)
        setPainScore(data.painScore)
        setPainDuration(data.painDuration)
        setPainType(data.painType)
        setDiagnosis(data.diagnosis)
        
        let area = "Left Knee"
        if (data.diagnosis.includes("Shoulder") || data.diagnosis.includes("Capsulitis")) {
            area = "Right Shoulder"
        } else if (data.diagnosis.includes("ACL") || data.diagnosis.includes("Sports Knee")) {
            area = "Left Knee"
        }
        setAffectedArea(area)
        setIcdCode(data.icdCode)
        
        // Derive factors
        if (area === "Right Shoulder") {
            setAggravating("Overhead movements, sleeping on affected side")
            setRelieving("Rest, warm compress")
            setRomFlexion("95°")
            setRomExtension("85° (Abduction)")
            setSwelling("Grade 0 – None")
            setSpecialTests("Neer's Test: positive, Hawkins-Kennedy: positive")
            setPostureAssessment("Scapular dyskinesia, rounded shoulder posture")
        } else if (data.diagnosis.includes("ACL")) {
            setAggravating("Pivoting, deep squats, prolonged walking")
            setRelieving("Rest, brace application")
            setRomFlexion("125°")
            setRomExtension("0°")
            setSwelling("Grade 1 – Mild")
            setSpecialTests("Lachman: positive, Anterior Drawer: positive")
            setPostureAssessment("Quadriceps lag present, symmetrical gait with brace")
        } else {
            setAggravating("Stair climbing, prolonged standing")
            setRelieving("Rest, ice application")
            setRomFlexion("110°")
            setRomExtension("-5°")
            setSwelling("Grade 1 – Mild")
            setSpecialTests("Patellar Grinding: positive, Joint line tenderness: medial")
            setPostureAssessment("Mild valgus deformity, antalgic gait")
        }
        setAnalysisCompleted(false)
        setAnalysisLogs([])
    }

    // Scroll logs to bottom
    React.useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [analysisLogs])

    // Webcam stream setup
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false })
            if (videoRef.current) {
                videoRef.current.srcObject = stream
                videoRef.current.play()
                setIsCameraOn(true)
                setIsPlaying(true)
                toast.success("Webcam stream active.")
            }
        } catch (err) {
            console.error("Camera access error:", err)
            toast.error("Could not access webcam. Please check permissions or upload a video.")
        }
    }

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream
            stream.getTracks().forEach((track) => track.stop())
            videoRef.current.srcObject = null
            setIsCameraOn(false)
            setIsPlaying(false)
        }
    }

    // Live Recording Simulation
    const toggleRecording = () => {
        if (isRecording) {
            // Stop recording
            setIsRecording(false)
            if (timerRef.current) clearInterval(timerRef.current)
            toast.success("Live video capture saved. Ready for AI Analysis.")
        } else {
            // Start recording
            setIsRecording(true)
            setRecordedTime(0)
            timerRef.current = setInterval(() => {
                setRecordedTime((prev) => prev + 1)
            }, 1000)
        }
    }

    // Handle File Upload
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setUploadedFile(file)
            const url = URL.createObjectURL(file)
            setUploadedVideoUrl(url)
            setSelectedDemoType(null)
            setAnalysisCompleted(false)
            toast.success(`Video file "${file.name}" loaded successfully.`)
        }
    }

    // Load presets for Demo
    const loadDemoVideo = (type: "knee" | "shoulder" | "acl") => {
        stopCamera()
        setSelectedDemoType(type)
        setUploadedFile(null)
        setUploadedVideoUrl(null)
        setAnalysisCompleted(false)
        
        // Map demographic focus based on demo selected
        if (type === "knee") {
            setActivePatient("Ravi Kumar (P-0142)")
        } else if (type === "shoulder") {
            setActivePatient("Meera Shah (P-0141)")
        } else if (type === "acl") {
            setActivePatient("Arjun Singh (P-0139)")
        }
        
        toast.info(`Loaded demo video parameters for ${type === "knee" ? "Knee" : type === "shoulder" ? "Shoulder" : "ACL"} Biomechanical testing.`)
    }

    // Run AI Analysis Simulation
    const triggerAnalysis = () => {
        setIsAnalyzing(true)
        setAnalysisProgress(0)
        setAnalysisLogs([])
        
        const logs = [
            "Initializing pose estimation pipeline...",
            "Loading MobileNet-Pose Model weights (84.2 MB)...",
            "Allocating WebGL GPU acceleration context...",
            "Model parameters initialized. Running live tracking markers...",
            "Joint landmarks detected (17 anchors: head, shoulder, elbow, wrist, hip, knee, ankle)...",
            "Calculating Range of Motion (ROM) flexion vs extension vectors...",
            "Measuring angle deflection dynamics...",
            "Evaluating biomechanical compensation indices...",
            "Comparing diagnostic vectors against clinical baselines...",
            "Finalizing pose model report...",
            "Analysis complete! Autofilling clinical assessment form."
        ]

        let progress = 0
        let logIndex = 0

        const interval = setInterval(() => {
            progress += 2
            setAnalysisProgress(progress)

            if (progress % 10 === 0 && logIndex < logs.length) {
                setAnalysisLogs((prev) => [...prev, `[${(progress * 0.08).toFixed(1)}s] ${logs[logIndex]}`])
                logIndex++
            }

            if (progress >= 100) {
                clearInterval(interval)
                setIsAnalyzing(false)
                setAnalysisCompleted(true)
                toast.success("AI Biomechanical Analysis complete. Clinical form autofilled!")
                
                // Run final autofill values based on patient type
                const patientKey = activePatient.toLowerCase()
                if (patientKey.includes("meera") || patientKey.includes("p-0141") || selectedDemoType === "shoulder") {
                    setPrimaryComplaint("Stiffness and pain in right shoulder, unable to lift arm above 90 degrees.")
                    setPainScore(6)
                    setPainDuration("1–6 months")
                    setPainType("Sharp")
                    setDiagnosis("Adhesive Capsulitis (Frozen Shoulder) - Freezing Phase")
                    setAffectedArea("Right Shoulder")
                    setIcdCode("M75.01")
                    setAggravating("Overhead movements, sleeping on affected side")
                    setRelieving("Rest, warm compress")
                    setRomFlexion("95°")
                    setRomExtension("85°")
                    setSwelling("Grade 0 – None")
                    setSpecialTests("Neer's Test: positive, Hawkins-Kennedy: positive")
                    setPostureAssessment("Scapular dyskinesia, rounded shoulder posture")
                } else if (patientKey.includes("arjun") || patientKey.includes("p-0139") || selectedDemoType === "acl") {
                    setPrimaryComplaint("Post-op ACL reconstruction stiffness, mild instability on pivoting.")
                    setPainScore(3)
                    setPainDuration("1–4 weeks")
                    setPainType("Throbbing")
                    setDiagnosis("Post-ACL Reconstruction Rehab (Phase II)")
                    setAffectedArea("Left Knee")
                    setIcdCode("M23.2")
                    setAggravating("Pivoting, deep squats, prolonged walking")
                    setRelieving("Rest, brace application")
                    setRomFlexion("125°")
                    setRomExtension("0°")
                    setSwelling("Grade 1 – Mild")
                    setSpecialTests("Lachman Test: positive, Anterior Drawer: positive")
                    setPostureAssessment("Quadriceps lag present, symmetrical gait with brace")
                } else {
                    // Default knee OA (Ravi Kumar)
                    setPrimaryComplaint("Pain in left knee while walking and climbing stairs.")
                    setPainScore(7)
                    setPainDuration("1–6 months")
                    setPainType("Dull Ache")
                    setDiagnosis("Knee OA (Kellgren-Lawrence Grade II)")
                    setAffectedArea("Left Knee")
                    setIcdCode("M17.12")
                    setAggravating("Stair climbing, prolonged standing")
                    setRelieving("Rest, ice application")
                    setRomFlexion("110°")
                    setRomExtension("-5°")
                    setSwelling("Grade 1 – Mild")
                    setSpecialTests("Patellar Grinding: positive, Joint line tenderness: medial")
                    setPostureAssessment("Mild valgus deformity, antalgic gait")
                }
            }
        }, 120)
    }

    // Canvas Joint Overlays rendering loops
    React.useEffect(() => {
        let animationId: number
        const canvas = canvasRef.current
        const ctx = canvas?.getContext("2d")
        
        const drawSkeleton = () => {
            if (!canvas || !ctx) return
            
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            
            // Draw skeleton nodes and angles only when camera is on or demo/uploaded video is analyzing/analyzed
            if (isCameraOn || selectedDemoType || uploadedVideoUrl) {
                const time = Date.now() / 1000
                const isKnee = selectedDemoType === "knee" || selectedDemoType === "acl" || activePatient.includes("Ravi") || activePatient.includes("Arjun")
                
                ctx.lineWidth = 3
                ctx.lineCap = "round"
                
                if (!isKnee) {
                    // Draw Shoulder Movement Skeleton (Head, Shoulders, Elbows, Wrists)
                    const oscY = Math.sin(time * 2.5) * 20
                    const oscX = Math.cos(time * 2.5) * 10
                    
                    const head = { x: 150, y: 70 }
                    const neck = { x: 150, y: 100 }
                    const shoulderL = { x: 100, y: 110 }
                    const shoulderR = { x: 200, y: 110 }
                    
                    // Left shoulder is normal, Right shoulder has restricted ROM (Meera Shah scenario)
                    const elbowL = { x: 70, y: 160 + oscY }
                    const wristL = { x: 50, y: 210 + oscY * 1.5 }
                    
                    // Restricted right arm lifting up to ~85-95 degrees abduction
                    const angleLimit = Math.PI * 0.45 + (Math.sin(time * 2) * 0.1) // hovering around 85-90 degrees
                    const elbowR = { 
                        x: shoulderR.x + Math.cos(angleLimit) * 60, 
                        y: shoulderR.y - Math.sin(angleLimit) * 60 
                    }
                    const wristR = { 
                        x: elbowR.x + Math.cos(angleLimit) * 50, 
                        y: elbowR.y - Math.sin(angleLimit) * 50 
                    }
                    
                    // Draw bones
                    ctx.strokeStyle = "rgba(168, 85, 247, 0.75)" // Purple theme
                    ctx.beginPath()
                    // Spine/Shoulders
                    ctx.moveTo(head.x, head.y); ctx.lineTo(neck.x, neck.y)
                    ctx.moveTo(shoulderL.x, shoulderL.y); ctx.lineTo(shoulderR.x, shoulderR.y)
                    ctx.lineTo(neck.x, neck.y); ctx.lineTo(shoulderL.x, shoulderL.y)
                    
                    // Left Arm (Healthy)
                    ctx.moveTo(shoulderL.x, shoulderL.y); ctx.lineTo(elbowL.x, elbowL.y)
                    ctx.lineTo(wristL.x, wristL.y)
                    
                    // Right Arm (Adhesive Capsulitis)
                    ctx.moveTo(shoulderR.x, shoulderR.y); ctx.lineTo(elbowR.x, elbowR.y)
                    ctx.lineTo(wristR.x, wristR.y)
                    ctx.stroke()
                    
                    // Draw Joint Dots
                    const joints = [head, neck, shoulderL, shoulderR, elbowL, wristL, elbowR, wristR]
                    joints.forEach((joint) => {
                        ctx.fillStyle = "#a855f7"
                        ctx.beginPath()
                        ctx.arc(joint.x, joint.y, 6, 0, 2 * Math.PI)
                        ctx.fill()
                        ctx.strokeStyle = "#ffffff"
                        ctx.lineWidth = 1.5
                        ctx.stroke()
                    })

                    // Draw angle text at Right Shoulder
                    if (analysisCompleted || isAnalyzing) {
                        ctx.fillStyle = "#e11d48" // Red marker
                        ctx.font = "bold 11px sans-serif"
                        ctx.fillText("R Abduction: 92° (Deficit)", shoulderR.x + 10, shoulderR.y - 10)
                        
                        ctx.strokeStyle = "#e11d48"
                        ctx.beginPath()
                        ctx.arc(shoulderR.x, shoulderR.y, 25, Math.PI, Math.PI * 1.5)
                        ctx.stroke()
                    }
                } else {
                    // Draw Knee Movement Skeleton (Hip, Knee, Ankle)
                    const oscKnee = Math.sin(time * 3)
                    const flexionAngle = selectedDemoType === "acl" 
                        ? 125 + oscKnee * 5 
                        : 110 + oscKnee * 10 // Ravi Knee OA flexes less
                        
                    const hip = { x: 150, y: 90 }
                    const knee = { x: 150 + Math.sin(time * 2.5) * 20, y: 190 }
                    // Ankle moves dynamically reflecting knee ROM flex/ext
                    const ankleAngle = Math.PI / 2 + (oscKnee * 0.4)
                    const ankle = {
                        x: knee.x + Math.sin(ankleAngle) * 90,
                        y: knee.y + Math.cos(ankleAngle) * 90
                    }
                    
                    // Draw bones
                    ctx.strokeStyle = "rgba(16, 185, 129, 0.75)" // Emerald green theme
                    ctx.beginPath()
                    ctx.moveTo(hip.x, hip.y)
                    ctx.lineTo(knee.x, knee.y)
                    ctx.lineTo(ankle.x, ankle.y)
                    ctx.stroke()
                    
                    // Joint dots
                    const joints = [hip, knee, ankle]
                    joints.forEach((joint) => {
                        ctx.fillStyle = "#10b981"
                        ctx.beginPath()
                        ctx.arc(joint.x, joint.y, 6, 0, 2 * Math.PI)
                        ctx.fill()
                        ctx.strokeStyle = "#ffffff"
                        ctx.lineWidth = 1.5
                        ctx.stroke()
                    })

                    // Angle label
                    if (analysisCompleted || isAnalyzing) {
                        ctx.fillStyle = "#10b981"
                        ctx.font = "bold 11px sans-serif"
                        ctx.fillText(`Flexion: ${Math.round(flexionAngle)}°`, knee.x + 15, knee.y)
                        
                        ctx.strokeStyle = "#10b981"
                        ctx.beginPath()
                        ctx.arc(knee.x, knee.y, 20, 0, Math.PI * 0.5)
                        ctx.stroke()
                    }
                }
            }
            
            animationId = requestAnimationFrame(drawSkeleton)
        }
        
        drawSkeleton()
        
        return () => {
            cancelAnimationFrame(animationId)
        }
    }, [isCameraOn, selectedDemoType, uploadedVideoUrl, analysisCompleted, isAnalyzing, activePatient])

    const handleSaveAssessment = () => {
        toast.success("AI Assessment Saved successfully!")
        setTimeout(() => {
            router.push(`/c/${company}/dashboard/activity-management/assessments`)
        }, 800)
    }

    return (
        <div className="flex-1 flex flex-col p-4 md:p-6 space-y-6 bg-background/50 font-sans">
            
            {/* Navigation back and header */}
            <div className={`flex items-center justify-between ${isCollapsed ? "pl-12 md:pl-14 transition-[padding] duration-200" : "transition-[padding] duration-200"}`}>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs gap-1 cursor-pointer pl-1 hover:bg-accent/40 text-slate-500"
                    onClick={() => router.push(`/c/${company}/dashboard/activity-management/assessments`)}
                >
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to Assessments
                </Button>

                {/* Patient Profile Selection */}
                <div className="flex items-center gap-2 bg-white/60 dark:bg-slate-900/60 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-550 pl-1.5">
                        Selected Patient:
                    </span>
                    <PatientSearchSelect
                        options={patientOptions}
                        value={activePatient}
                        onValueChange={(val) => {
                            setActivePatient(val)
                            resetFormWithStaticData(val)
                        }}
                    />
                </div>
            </div>

            {/* Header Title Banner with Gray Gradient Shades */}
            <div className="relative overflow-hidden border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all duration-300 hover:shadow-sm">
                <div className={`relative flex items-center gap-4 ${isCollapsed ? "pl-12 md:pl-14 transition-[padding] duration-200" : "transition-[padding] duration-200"}`}>
                    <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-xl text-primary shadow-xs border border-primary/20">
                        <Sparkles className="h-5 w-5 animate-pulse" />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                            AI-Assisted Assessment Workspace
                        </h1>
                        <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                            Record live movement or upload a rehabilitation video. Our pose-estimation model automatically measures range of motion (ROM) and loads diagnostic data.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main grid workspace */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
                
                {/* LEFT COLUMN: Video Feeds & Pose Analysis */}
                <div className="xl:col-span-5 flex flex-col space-y-4">
                    <Card className="border-border bg-card shadow-sm flex-1 flex flex-col">
                        <CardHeader className="pb-3 border-b border-border">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Video className="h-4 w-4 text-purple-600" /> Biomechanical Capture Engine
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Record camera feed or load custom clinic video tests.
                            </CardDescription>
                        </CardHeader>
                        
                        <CardContent className="p-4 flex-1 flex flex-col space-y-4">
                            
                            {/* Navigation Tab lists for Webcam or Upload */}
                            <Tabs value={activeVideoTab} onValueChange={(val) => {
                                setActiveVideoTab(val as any)
                                stopCamera()
                            }} className="w-full">
                                <TabsList className="grid w-full grid-cols-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                                    <TabsTrigger value="camera" className="text-xs py-1.5 flex items-center gap-1.5 cursor-pointer">
                                        <Camera className="h-3.5 w-3.5" /> Webcam Live Feed
                                    </TabsTrigger>
                                    <TabsTrigger value="upload" className="text-xs py-1.5 flex items-center gap-1.5 cursor-pointer">
                                        <Upload className="h-3.5 w-3.5" /> Upload Video File
                                    </TabsTrigger>
                                </TabsList>

                                {/* Live Webcam capture tab */}
                                <TabsContent value="camera" className="mt-4 space-y-4">
                                    <div className="relative aspect-video rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center shadow-inner group">
                                        
                                        <video
                                            ref={videoRef}
                                            className="absolute inset-0 w-full h-full object-cover"
                                            playsInline
                                            muted
                                        />
                                        
                                        {/* Canvas skeleton overlay */}
                                        <canvas
                                            ref={canvasRef}
                                            width={300}
                                            height={225}
                                            className="absolute inset-0 w-full h-full pointer-events-none z-10"
                                        />

                                        {!isCameraOn && (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-4 text-center space-y-3 bg-slate-950/80 z-20">
                                                <div className="p-4 rounded-full bg-slate-900 border border-slate-800">
                                                    <Camera className="h-8 w-8 text-slate-500" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-300">Live Camera Off</p>
                                                    <p className="text-[10px] text-slate-500 mt-1">Activate the webcam stream to track joint flexion live</p>
                                                </div>
                                                <Button size="sm" onClick={startCamera} className="text-xs bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-700 h-8 cursor-pointer">
                                                    Start Webcam
                                                </Button>
                                            </div>
                                        )}

                                        {isCameraOn && (
                                            <div className="absolute top-2 left-2 z-20 bg-slate-950/60 backdrop-blur-xs text-[10px] text-white px-2 py-0.5 rounded-full flex items-center gap-1.5 font-bold">
                                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                                                WEBCAM ACTIVE
                                            </div>
                                        )}

                                        {isRecording && (
                                            <div className="absolute top-2 right-2 z-20 bg-rose-600 text-[10px] text-white px-2 py-0.5 rounded-full flex items-center gap-1.5 font-bold animate-pulse">
                                                <span>REC</span>
                                                <span className="font-mono">{recordedTime}s</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Capture buttons */}
                                    <div className="flex gap-2">
                                        {isCameraOn ? (
                                            <>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={stopCamera}
                                                    className="flex-1 text-xs border-rose-250 hover:bg-rose-50 text-rose-600 h-8.5 cursor-pointer"
                                                >
                                                    Turn Off Camera
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={toggleRecording}
                                                    className={`flex-1 text-xs h-8.5 font-bold cursor-pointer ${
                                                        isRecording
                                                            ? "bg-rose-600 hover:bg-rose-700 text-white"
                                                            : "bg-purple-600 hover:bg-purple-700 text-white"
                                                    }`}
                                                >
                                                    {isRecording ? "⏹ Stop Capture" : "⏺ Record movement"}
                                                </Button>
                                            </>
                                        ) : (
                                            <Button size="sm" onClick={startCamera} className="w-full text-xs bg-purple-600 hover:bg-purple-700 text-white h-8.5 font-semibold cursor-pointer">
                                                🎥 Activate Clinic Camera
                                            </Button>
                                        )}
                                    </div>
                                </TabsContent>

                                {/* Upload Video file tab */}
                                <TabsContent value="upload" className="mt-4 space-y-4">
                                    <div className="relative aspect-video rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center shadow-inner group">
                                        {uploadedVideoUrl ? (
                                            <>
                                                <video
                                                    src={uploadedVideoUrl}
                                                    className="absolute inset-0 w-full h-full object-cover"
                                                    controls
                                                    playsInline
                                                />
                                                <canvas
                                                    ref={canvasRef}
                                                    width={300}
                                                    height={225}
                                                    className="absolute inset-0 w-full h-full pointer-events-none z-10"
                                                />
                                            </>
                                        ) : (
                                            <label className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-4 text-center space-y-3 cursor-pointer bg-slate-950/80 hover:bg-slate-950/70 transition-colors z-20">
                                                <div className="p-4 rounded-full bg-slate-900 border border-slate-800">
                                                    <Upload className="h-8 w-8 text-slate-500" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-300">Drag & Drop Movement Video</p>
                                                    <p className="text-[10px] text-slate-500 mt-1">Accepts MP4, MOV or AVI files (Max 100MB)</p>
                                                </div>
                                                <input
                                                    type="file"
                                                    accept="video/*"
                                                    className="hidden"
                                                    onChange={handleFileChange}
                                                />
                                                <Button size="sm" variant="outline" className="text-xs border-slate-700 text-slate-300 bg-slate-900 hover:bg-slate-850 h-8 pointer-events-none">
                                                    Browse Files
                                                </Button>
                                            </label>
                                        )}
                                    </div>

                                    {uploadedVideoUrl && (
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    setUploadedFile(null)
                                                    setUploadedVideoUrl(null)
                                                    setAnalysisCompleted(false)
                                                }}
                                                className="w-full text-xs h-8.5 border-slate-300 hover:bg-slate-50 text-slate-600 cursor-pointer"
                                            >
                                                <RefreshCw className="h-3 w-3 mr-1" /> Reset File
                                            </Button>
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>

                            <div className="border-t border-dashed my-2" />

                            {/* Preset Demo Clinical Movement Videos (Zero-friction testing) */}
                            <div>
                                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                    Quick Start Testing Clips (No File Required)
                                </Label>
                                <div className="grid grid-cols-3 gap-2 mt-2">
                                    <button
                                        type="button"
                                        onClick={() => loadDemoVideo("knee")}
                                        className={`px-2 py-1.5 rounded-lg border text-left text-[11px] font-semibold transition-all ${
                                            selectedDemoType === "knee"
                                                ? "bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-950/20"
                                                : "bg-slate-50 dark:bg-slate-850 border-slate-200 hover:bg-slate-100 text-slate-700"
                                        }`}
                                    >
                                        🦵 Knee OA Gait
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => loadDemoVideo("shoulder")}
                                        className={`px-2 py-1.5 rounded-lg border text-left text-[11px] font-semibold transition-all ${
                                            selectedDemoType === "shoulder"
                                                ? "bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-950/20"
                                                : "bg-slate-50 dark:bg-slate-850 border-slate-200 hover:bg-slate-100 text-slate-700"
                                        }`}
                                    >
                                        💪 Frozen Shoulder
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => loadDemoVideo("acl")}
                                        className={`px-2 py-1.5 rounded-lg border text-left text-[11px] font-semibold transition-all ${
                                            selectedDemoType === "acl"
                                                ? "bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-950/20"
                                                : "bg-slate-50 dark:bg-slate-850 border-slate-200 hover:bg-slate-100 text-slate-700"
                                        }`}
                                    >
                                        🏃 ACL post-op ROM
                                    </button>
                                </div>
                            </div>

                            {/* Trigger Analysis Button */}
                            <Button
                                disabled={isAnalyzing || (!isCameraOn && !uploadedVideoUrl && !selectedDemoType)}
                                onClick={triggerAnalysis}
                                className="w-full text-xs h-10 font-bold bg-purple-650 hover:bg-purple-750 text-white shadow-md disabled:bg-slate-200 disabled:text-slate-400 cursor-pointer"
                            >
                                <Sparkles className="h-4 w-4 mr-1.5" />
                                {isAnalyzing ? "Processing Biomechanical Skeletal Modeling..." : "Analyze Video with AI Engine"}
                            </Button>

                            {/* Loading & Terminal Log Engine */}
                            {(isAnalyzing || analysisCompleted) && (
                                <div className="space-y-2 bg-slate-900 text-slate-200 p-3 rounded-lg border border-slate-850 shadow-inner font-mono text-[10px]">
                                    <div className="flex justify-between items-center text-slate-400 pb-1.5 border-b border-slate-800">
                                        <span>AI Biomechanical Diagnostics</span>
                                        <span className="font-bold text-purple-450">{analysisProgress}%</span>
                                    </div>
                                    
                                    {/* Progress indicator */}
                                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-purple-500 transition-all duration-150"
                                            style={{ width: `${analysisProgress}%` }}
                                        />
                                    </div>

                                    {/* Terminal logger */}
                                    <div className="max-h-24 overflow-y-auto space-y-1 pr-1.5 scrollbar-thin scrollbar-thumb-slate-800">
                                        {analysisLogs.map((log, index) => (
                                            <div key={index} className="leading-relaxed">
                                                {log}
                                            </div>
                                        ))}
                                        <div ref={logsEndRef} />
                                    </div>
                                </div>
                            )}

                        </CardContent>
                    </Card>
                </div>

                {/* RIGHT COLUMN: Interactive Form with Autofill */}
                <div className="xl:col-span-7 flex flex-col space-y-4">
                    <Card className="border-border bg-card shadow-sm flex-1 flex flex-col">
                        <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    🩺 Clinical Assessment Form
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Biomechanical diagnostics and physical range of motion markers.
                                </CardDescription>
                            </div>
                            
                            {/* Autofill confidence status badge */}
                            <Badge 
                                className={`text-[10px] font-bold tracking-wider px-2 py-0.5 border ${
                                    analysisCompleted
                                        ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 border-emerald-300 dark:border-emerald-900"
                                        : "bg-slate-50 dark:bg-slate-850 text-slate-500 border-slate-200"
                                }`}
                            >
                                {analysisCompleted 
                                    ? "🟢 AUTO-FILLED BY AI (98% CONF)" 
                                    : "🔴 PENDING VIDEO ANALYSIS"}
                            </Badge>
                        </CardHeader>
                        
                        <CardContent className="p-4 flex-1 flex flex-col space-y-4">
                            
                            {/* Form container */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                
                                {/* Section 1: Chief Complaint */}
                                <div className="md:col-span-2 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-800 rounded-xl p-3.5 space-y-3">
                                    <div className="text-[10px] font-bold text-purple-650 dark:text-purple-400 tracking-wider uppercase">
                                        Chief Complaint
                                    </div>
                                    
                                    <div className="flex flex-col gap-1.5">
                                        <Label className="text-[10px] text-slate-400 font-semibold uppercase">
                                            Primary Complaint
                                        </Label>
                                        <textarea
                                            value={primaryComplaint}
                                            onChange={(e) => setPrimaryComplaint(e.target.value)}
                                            placeholder="Describe primary complaints (e.g. stiffness, flexion pain)..."
                                            className="w-full text-xs px-2.5 py-1.5 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-250 bg-white dark:bg-slate-900 focus:outline-none focus:border-purple-500 h-14 resize-none transition-all duration-300"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                        
                                        {/* Pain Score */}
                                        <div className="flex flex-col gap-1.5">
                                            <Label className="text-[10px] text-slate-400 font-semibold uppercase">
                                                Pain Score (0–10)
                                            </Label>
                                            <div className="flex gap-1 flex-wrap mt-0.5">
                                                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => {
                                                    const isActive = score === painScore
                                                    return (
                                                        <div
                                                            key={score}
                                                            onClick={() => setPainScore(score)}
                                                            className={`w-[22px] h-[22px] rounded-full flex items-center justify-center text-[9px] cursor-pointer transition-all ${
                                                                isActive
                                                                    ? "bg-amber-600 text-white font-bold shadow-xs shadow-orange-500/20"
                                                                    : "bg-slate-200 dark:bg-slate-850 text-slate-600 dark:text-slate-400 font-semibold hover:bg-slate-300 dark:hover:bg-slate-800"
                                                            }`}
                                                        >
                                                            {score}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>

                                        {/* Pain Duration & Type */}
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="flex flex-col gap-1">
                                                <Label className="text-[10px] text-slate-400 font-semibold uppercase">
                                                    Duration
                                                </Label>
                                                <select
                                                    value={painDuration}
                                                    onChange={(e) => setPainDuration(e.target.value)}
                                                    className="w-full text-xs px-2 py-1.5 border border-slate-350 dark:border-slate-800 rounded-lg text-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:border-purple-500"
                                                >
                                                    <option value="< 1 week">&lt; 1 week</option>
                                                    <option value="1–4 weeks">1–4 weeks</option>
                                                    <option value="1–6 months">1–6 months</option>
                                                    <option value="> 6 months">&gt; 6 months</option>
                                                </select>
                                            </div>

                                            <div className="flex flex-col gap-1">
                                                <Label className="text-[10px] text-slate-400 font-semibold uppercase">
                                                    Type
                                                </Label>
                                                <select
                                                    value={painType}
                                                    onChange={(e) => setPainType(e.target.value as any)}
                                                    className="w-full text-xs px-2 py-1.5 border border-slate-350 dark:border-slate-800 rounded-lg text-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:border-purple-500"
                                                >
                                                    <option value="Dull Ache">Dull Ache</option>
                                                    <option value="Sharp">Sharp</option>
                                                    <option value="Burning">Burning</option>
                                                    <option value="Throbbing">Throbbing</option>
                                                </select>
                                            </div>
                                        </div>

                                    </div>
                                </div>

                                {/* Section 2: Diagnosis and Aggravating/Relieving */}
                                <div className="bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-800 rounded-xl p-3.5 space-y-3">
                                    <div className="text-[10px] font-bold text-purple-650 dark:text-purple-400 tracking-wider uppercase">
                                        Diagnosis & Area
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <Label className="text-[10px] text-slate-400 font-semibold uppercase">
                                            Diagnosis Description
                                        </Label>
                                        <Input
                                            type="text"
                                            value={diagnosis}
                                            onChange={(e) => setDiagnosis(e.target.value)}
                                            placeholder="Diagnosis (e.g. Knee Osteoarthritis)"
                                            className="h-8 text-xs focus-visible:ring-purple-500 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="flex flex-col gap-1">
                                            <Label className="text-[10px] text-slate-400 font-semibold uppercase">
                                                Affected Area
                                            </Label>
                                            <select
                                                value={affectedArea}
                                                onChange={(e) => setAffectedArea(e.target.value)}
                                                className="w-full text-xs px-2 py-1.5 border border-slate-350 dark:border-slate-800 rounded-lg text-slate-700 bg-white dark:bg-slate-900 focus:outline-none"
                                            >
                                                <option value="Left Knee">Left Knee</option>
                                                <option value="Right Knee">Right Knee</option>
                                                <option value="Left Shoulder">Left Shoulder</option>
                                                <option value="Right Shoulder">Right Shoulder</option>
                                                <option value="Bilateral Knee">Bilateral Knee</option>
                                            </select>
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <Label className="text-[10px] text-slate-400 font-semibold uppercase">
                                                ICD-10 Code
                                            </Label>
                                            <Input
                                                type="text"
                                                value={icdCode}
                                                onChange={(e) => setIcdCode(e.target.value)}
                                                placeholder="e.g. M17.12"
                                                className="h-8 text-xs focus-visible:ring-purple-500 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <Label className="text-[10px] text-slate-400 font-semibold uppercase">
                                            Aggravating Factors
                                        </Label>
                                        <textarea
                                            value={aggravating}
                                            onChange={(e) => setAggravating(e.target.value)}
                                            className="w-full text-xs px-2 py-1 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-700 bg-white dark:bg-slate-900 h-9 resize-none focus:outline-none focus:border-purple-500"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <Label className="text-[10px] text-slate-400 font-semibold uppercase">
                                            Relieving Factors
                                        </Label>
                                        <textarea
                                            value={relieving}
                                            onChange={(e) => setRelieving(e.target.value)}
                                            className="w-full text-xs px-2 py-1 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-700 bg-white dark:bg-slate-900 h-9 resize-none focus:outline-none focus:border-purple-500"
                                        />
                                    </div>
                                </div>

                                {/* Section 3: Biomechanical / Physical Testing */}
                                <div className="bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-800 rounded-xl p-3.5 space-y-3">
                                    <div className="text-[10px] font-bold text-purple-650 dark:text-purple-400 tracking-wider uppercase">
                                        Physical / ROM Testing
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="flex flex-col gap-1">
                                            <Label className="text-[10px] text-slate-400 font-semibold uppercase">
                                                ROM — Flexion
                                            </Label>
                                            <Input
                                                type="text"
                                                value={romFlexion}
                                                onChange={(e) => setRomFlexion(e.target.value)}
                                                className="h-8 text-xs focus-visible:ring-purple-500 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800"
                                            />
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <Label className="text-[10px] text-slate-400 font-semibold uppercase">
                                                ROM — Extension
                                            </Label>
                                            <Input
                                                type="text"
                                                value={romExtension}
                                                onChange={(e) => setRomExtension(e.target.value)}
                                                className="h-8 text-xs focus-visible:ring-purple-500 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <Label className="text-[10px] text-slate-400 font-semibold uppercase">
                                            Swelling Status
                                        </Label>
                                        <select
                                            value={swelling}
                                            onChange={(e) => setSwelling(e.target.value)}
                                            className="w-full text-xs px-2 py-1.5 border border-slate-350 dark:border-slate-800 rounded-lg text-slate-700 bg-white dark:bg-slate-900 focus:outline-none"
                                        >
                                            <option value="Grade 0 – None">Grade 0 – None</option>
                                            <option value="Grade 1 – Mild">Grade 1 – Mild</option>
                                            <option value="Grade 2 – Moderate">Grade 2 – Moderate</option>
                                        </select>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <Label className="text-[10px] text-slate-400 font-semibold uppercase">
                                            Specialized Tests
                                        </Label>
                                        <Input
                                            type="text"
                                            value={specialTests}
                                            onChange={(e) => setSpecialTests(e.target.value)}
                                            className="h-8 text-xs focus-visible:ring-purple-500 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <Label className="text-[10px] text-slate-400 font-semibold uppercase">
                                            Posture Assessment
                                        </Label>
                                        <textarea
                                            value={postureAssessment}
                                            onChange={(e) => setPostureAssessment(e.target.value)}
                                            className="w-full text-xs px-2 py-1 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-700 bg-white dark:bg-slate-900 h-9 resize-none focus:outline-none focus:border-purple-500"
                                        />
                                    </div>
                                </div>

                            </div>

                            <div className="border-t border-dashed my-1" />

                            {/* Action Buttons styled like ActionButtons.tsx */}
                            <div className="flex gap-2 flex-wrap pt-2">
                                <Button
                                    onClick={handleSaveAssessment}
                                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs h-9 px-4 cursor-pointer"
                                >
                                    💾 Save Assessment
                                </Button>
                                <Button
                                    onClick={handleSaveAssessment}
                                    className="bg-emerald-650 hover:bg-emerald-750 text-white font-semibold text-xs h-9 px-4 cursor-pointer"
                                >
                                    💾 Save & Create Treatment Plan
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        toast.info("Opening system print dialog...")
                                        window.print()
                                    }}
                                    className="border-purple-500 text-purple-650 hover:bg-slate-50 font-semibold text-xs h-9 px-4 cursor-pointer"
                                >
                                    🖨 Print Assessment
                                </Button>
                            </div>

                        </CardContent>
                    </Card>
                </div>

            </div>

        </div>
    )
}
