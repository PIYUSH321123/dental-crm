"use client"

import * as React from "react"
import { useState, useEffect, useRef } from "react"
import { toast } from "sonner"
import {
    Send,
    Sparkles,
    Smartphone,
    Search,
    Image as ImageIcon,
    Check,
    Loader2,
    Plus,
    Undo,
    Edit,
    MessageSquare,
    Megaphone,
    DollarSign,
    Link as LinkIcon,
    ArrowRight,
    Volume2
} from "lucide-react"
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Campaign } from "./data"

// Inline SVG Icon components for reliable compilation across environments
const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
)

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
)

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="4" />
        <line x1="21.17" y1="8" x2="12" y2="8" />
        <line x1="3.95" y1="6.06" x2="8.54" y2="14" />
        <line x1="10.88" y1="21.94" x2="15.46" y2="14" />
    </svg>
)

interface Message {
    id: string
    role: "user" | "assistant"
    content: string
    timestamp: Date
}

interface AdFormState {
    platform: "facebook" | "instagram" | "google"
    campaignName: string
    headline: string
    primaryText: string
    cta: string
    imageUrl: string
    destinationUrl: string
    budget: string
    targetCondition: string
}

interface AiAdStudioProps {
    onCampaignCreated: (newCampaign: Campaign) => void
}

export function AiAdStudio({ onCampaignCreated }: AiAdStudioProps) {
    const [isMobile, setIsMobile] = useState(false)
    const [isMounted, setIsMounted] = useState(false)
    const [activeMobileTab, setActiveMobileTab] = useState<"chat" | "edit" | "preview">("chat")

    // Form State
    const [adForm, setAdForm] = useState<AdFormState>({
        platform: "facebook",
        campaignName: "AI Back Pain Recovery Special",
        headline: "Say Goodbye to Back Pain for Good",
        primaryText: "Struggling with chronic back or neck pain? Our expert physiotherapists at Mumbai - Andheri West are here to help you recover. Book your personalized assessment today and take your first step toward pain-free movement.",
        cta: "Book Appointment",
        imageUrl: "/physio-ad-1.png",
        destinationUrl: "https://elitephysio.in/back-pain-recovery",
        budget: "35000",
        targetCondition: "Back pain, Spine alignment"
    })

    // Chat State
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "msg-1",
            role: "assistant",
            content: "Hi! I'm your AI Marketing Assistant. I can help you draft high-converting ad copy and creatives tailored for your clinic. What kind of ad campaign would you like to build today?",
            timestamp: new Date()
        }
    ])
    const [chatInput, setChatInput] = useState("")
    const [isTyping, setIsTyping] = useState(false)
    const [isGeneratingImage, setIsGeneratingImage] = useState(false)
    const [isExporting, setIsExporting] = useState(false)

    const chatEndRef = useRef<HTMLDivElement>(null)

    // Handle screen resizing to switch to mobile layout if needed
    useEffect(() => {
        setIsMounted(true)
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024)
        }
        handleResize()
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    // Scroll chat to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages, isTyping])

    const handleInputChange = (field: keyof AdFormState, value: string) => {
        setAdForm(prev => ({
            ...prev,
            [field]: value
        }))
    }

    // Trigger AI suggestion response
    const handleSendPrompt = (promptText: string) => {
        if (!promptText.trim()) return

        const userMessage: Message = {
            id: `msg-${Date.now()}`,
            role: "user",
            content: promptText,
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setChatInput("")
        setIsTyping(true)

        // Process AI response based on keywords
        setTimeout(() => {
            const lowerPrompt = promptText.toLowerCase()
            let responseContent = ""
            let suggestedAd: Partial<AdFormState> = {}

            if (lowerPrompt.includes("knee") || lowerPrompt.includes("joint")) {
                suggestedAd = {
                    platform: "facebook",
                    campaignName: "AI Knee Rehabilitation Campaign",
                    headline: "Relieve Knee Pain Without Surgery",
                    primaryText: "Stuck with stiff, aching knees? Our advanced physiotherapy treatments help restore joint mobility, rebuild strength, and get you back to active living. Schedule your diagnostic session today at Mumbai branch.",
                    cta: "Book Appointment",
                    imageUrl: "/physio-ad-1.png",
                    targetCondition: "Knee pain, Arthritis",
                    destinationUrl: "https://elitephysio.in/knee-rehab-special"
                }
                responseContent = "I've drafted a high-converting Facebook ad campaign targeted at knee pain sufferers. I've updated the headline to appeal to non-surgical treatment interest, and loaded a professional clinical rehab image in the preview."
            } else if (lowerPrompt.includes("posture") || lowerPrompt.includes("spine") || lowerPrompt.includes("google")) {
                suggestedAd = {
                    platform: "google",
                    campaignName: "Google Search - Posture Clinic",
                    headline: "Professional Posture Correction Clinic",
                    primaryText: "Experiencing neck strain or slouching? Get a comprehensive posture analysis and personalized alignment plan from our top-rated therapists. Open in Indiranagar & Bandra.",
                    cta: "Learn More",
                    imageUrl: "/physio-ad-2.png",
                    targetCondition: "Posture correction, Kyphosis",
                    destinationUrl: "https://elitephysio.in/posture-rehab"
                }
                responseContent = "Done! I've created a search-optimized ad configuration for Google Search. The headline focuses on professional clinic presence and local branches. You can preview the Google SERP layout on the right."
            } else if (lowerPrompt.includes("senior") || lowerPrompt.includes("elderly") || lowerPrompt.includes("instagram")) {
                suggestedAd = {
                    platform: "instagram",
                    campaignName: "Active Aging Instagram Reels",
                    headline: "Stay Active & Pain-Free at 50+",
                    primaryText: "Age is just a number! Our specialized, gentle physiotherapy programs help seniors maintain balance, joint health, and daily independence. Try a trial session today at Bandra East.",
                    cta: "Sign Up",
                    imageUrl: "/physio-ad-2.png",
                    targetCondition: "Core strength, Balance training",
                    destinationUrl: "https://elitephysio.in/active-aging"
                }
                responseContent = "I have drafted an Instagram ad focusing on active aging and independence. The description is tailored to modern visual layout standards. Click on the Instagram preview tab to see how it looks."
            } else {
                suggestedAd = {
                    platform: "facebook",
                    campaignName: `AI Custom Campaign - ${promptText.substring(0, 20)}...`,
                    headline: "Expert Physiotherapy & Pain Recovery",
                    primaryText: `Recover faster from injuries and chronic pain. Our experienced clinic team designs custom therapy programs to get you back to 100%. Contact us to book your consultation today.`,
                    cta: "Book Appointment",
                    imageUrl: "/physio-ad-1.png",
                    targetCondition: "General physio, Pain recovery"
                }
                responseContent = `I have drafted a custom campaign for you based on: "${promptText}". I have updated the ad form fields. You can refine the text directly in the editor or ask me to write a different hook!`
            }

            // Update form
            setAdForm(prev => ({
                ...prev,
                ...suggestedAd
            }))

            const assistantMessage: Message = {
                id: `msg-${Date.now() + 1}`,
                role: "assistant",
                content: responseContent,
                timestamp: new Date()
            }

            setMessages(prev => [...prev, assistantMessage])
            setIsTyping(false)
            toast.success("Ad preview updated from AI prompt!")
        }, 1500)
    }

    // Mock Image Generation
    const handleGenerateImage = () => {
        setIsGeneratingImage(true)
        setTimeout(() => {
            // Swap between the two generated images
            const newImage = adForm.imageUrl === "/physio-ad-1.png" ? "/physio-ad-2.png" : "/physio-ad-1.png"
            handleInputChange("imageUrl", newImage)
            setIsGeneratingImage(false)
            toast.success("AI generated a new high-quality ad image!")
        }, 2000)
    }

    // Save ad into main list
    const handleExportCampaign = async () => {
        setIsExporting(true)
        try {
            await new Promise(resolve => setTimeout(resolve, 1000))

            const newCamp: Campaign = {
                id: `camp-${Date.now()}`,
                campaign_name: adForm.campaignName,
                source: adForm.platform === "facebook" ? "Facebook" : adForm.platform === "instagram" ? "Instagram" : "Google",
                budget: parseFloat(adForm.budget) || 10000,
                leads: 0,
                converted: 0,
                revenue: 0,
                status: "Active",
                start_date: new Date().toISOString().split('T')[0],
                end_date: null,
                target_condition: adForm.targetCondition,
                landing_page_url: adForm.destinationUrl,
                branch_id: "br-1", // Andheri West
                created_by: "usr-2",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                notes: "Generated using AI Ad Studio."
            }

            onCampaignCreated(newCamp)
            toast.success("Ad exported and added to active campaigns list!")
        } catch (error) {
            toast.error("Failed to export campaign.")
        } finally {
            setIsExporting(false)
        }
    }

    // Suggested prompts chips
    const promptChips = [
        "Knee Rehab ad for Facebook",
        "Google ad for back pain clinic",
        "Active aging program for Instagram"
    ]

    // Render Platform Preview Mockups
    const renderPreview = () => {
        const { platform, headline, primaryText, cta, imageUrl, destinationUrl } = adForm
        const displayDomain = "elitephysio.in"

        if (platform === "facebook") {
            return (
                <div className="w-full bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden text-zinc-900 dark:text-zinc-100 max-w-md mx-auto transition-all duration-300">
                    {/* Header */}
                    <div className="flex items-center px-4 py-3 gap-2.5">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                            EP
                        </div>
                        <div>
                            <div className="font-semibold text-sm hover:underline cursor-pointer flex items-center gap-1">
                                Elite Physio Center
                                <Check className="h-3 w-3 fill-blue-500 text-white rounded-full bg-blue-500 p-[1px]" />
                            </div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                                Sponsored · <span>Public</span>
                            </div>
                        </div>
                    </div>

                    {/* Primary Text */}
                    <div className="px-4 pb-3 text-sm leading-relaxed whitespace-pre-line text-zinc-800 dark:text-zinc-200">
                        {primaryText}
                    </div>

                    {/* Ad Image */}
                    <div className="relative aspect-video w-full bg-zinc-100 dark:bg-zinc-900 border-y border-zinc-100 dark:border-zinc-800 overflow-hidden">
                        <img
                            src={imageUrl}
                            alt="Ad Creative"
                            className="w-full h-full object-cover transition-all duration-300"
                        />
                    </div>

                    {/* Bottom Action Area */}
                    <div className="bg-zinc-50 dark:bg-zinc-900/60 px-4 py-3 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800">
                        <div className="flex-1 min-w-0 mr-3">
                            <div className="text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 truncate">
                                {displayDomain}
                            </div>
                            <div className="font-semibold text-base text-zinc-900 dark:text-zinc-100 truncate mt-0.5">
                                {headline}
                            </div>
                        </div>
                        <Button
                            variant="secondary"
                            size="sm"
                            className="bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-semibold px-4 cursor-pointer"
                        >
                            {cta}
                        </Button>
                    </div>
                </div>
            )
        }

        if (platform === "instagram") {
            return (
                <div className="w-full bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden text-zinc-900 dark:text-zinc-100 max-w-sm mx-auto transition-all duration-300">
                    {/* Header */}
                    <div className="flex items-center justify-between px-3 py-2.5">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-yellow-500 to-purple-600 p-[2px]">
                                <div className="h-full w-full rounded-full bg-white dark:bg-zinc-950 flex items-center justify-center font-bold text-xs text-primary">
                                    EP
                                </div>
                            </div>
                            <div>
                                <div className="font-semibold text-xs hover:underline cursor-pointer">
                                    elite_physio_center
                                </div>
                                <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                                    Sponsored
                                </div>
                            </div>
                        </div>
                        <div className="text-zinc-500 dark:text-zinc-400 font-bold tracking-widest text-xs px-2 cursor-pointer">•••</div>
                    </div>

                    {/* Creative */}
                    <div className="relative aspect-square w-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                        <img
                            src={imageUrl}
                            alt="Instagram Ad"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Action Bar */}
                    <div className="bg-primary/5 dark:bg-primary/10 px-3.5 py-2.5 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800">
                        <span className="text-xs font-semibold text-primary">{headline}</span>
                        <span className="text-xs font-bold text-primary hover:underline cursor-pointer flex items-center gap-0.5">
                            {cta} <ArrowRight className="h-3 w-3" />
                        </span>
                    </div>

                    {/* Caption & Comments */}
                    <div className="p-3 text-xs leading-normal">
                        <div className="flex items-start gap-1">
                            <span className="font-bold hover:underline cursor-pointer">elite_physio_center</span>
                            <span className="text-zinc-800 dark:text-zinc-200 whitespace-pre-line flex-1">
                                {primaryText}
                            </span>
                        </div>
                        <div className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase mt-2.5 font-medium">
                            1 day ago
                        </div>
                    </div>
                </div>
            )
        }

        if (platform === "google") {
            return (
                <div className="w-full bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm text-zinc-900 dark:text-zinc-100 max-w-xl mx-auto transition-all duration-300">
                    <div className="flex items-center gap-2 mb-1.5">
                        <div className="h-6 w-6 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                            <GoogleIcon className="h-3.5 w-3.5 text-zinc-500" />
                        </div>
                        <div className="flex flex-col text-xs leading-tight">
                            <span className="text-zinc-800 dark:text-zinc-300 font-medium">Sponsored</span>
                            <span className="text-zinc-400 dark:text-zinc-500 truncate">{destinationUrl}</span>
                        </div>
                    </div>

                    {/* Headline */}
                    <h3 className="text-blue-700 dark:text-blue-400 hover:underline text-lg font-medium cursor-pointer leading-tight mb-1">
                        {headline} | {cta}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                        {primaryText}
                    </p>

                    {/* Quick Links Mock */}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-900 text-xs">
                        <div>
                            <span className="text-blue-700 dark:text-blue-400 hover:underline cursor-pointer font-medium block">
                                Book Assessment Online
                            </span>
                            <span className="text-zinc-400 dark:text-zinc-500 block">Schedule a slot in under 2 minutes.</span>
                        </div>
                        <div>
                            <span className="text-blue-700 dark:text-blue-400 hover:underline cursor-pointer font-medium block">
                                Meet Our Specialists
                            </span>
                            <span className="text-zinc-400 dark:text-zinc-500 block">Over 15+ years expert clinical experience.</span>
                        </div>
                    </div>
                </div>
            )
        }

        return null
    }

    const renderChatPanel = () => (
        <div className="flex flex-col h-full bg-zinc-50/50 dark:bg-zinc-900/30">
            {/* Chat Header */}
            <div className="px-4 py-3 border-b border-border bg-card flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm">SalesGuru Copilot</h3>
                        <p className="text-[10px] text-muted-foreground">AI Copywriter Assistant</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase">Online</span>
                </div>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex flex-col max-w-[85%] ${msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                            }`}
                    >
                        <div
                            className={`p-3 rounded-2xl text-sm leading-relaxed ${msg.role === "user"
                                ? "bg-primary text-primary-foreground rounded-br-none"
                                : "bg-card border border-border text-foreground rounded-bl-none shadow-xs"
                                }`}
                        >
                            {msg.content}
                        </div>
                        <span className="text-[10px] text-muted-foreground mt-1 px-1">
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                ))}

                {isTyping && (
                    <div className="mr-auto items-start max-w-[85%] flex flex-col">
                        <div className="bg-card border border-border p-3 rounded-2xl rounded-bl-none flex items-center gap-1.5 shadow-xs">
                            <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce"></span>
                            <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0.2s]"></span>
                            <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0.4s]"></span>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Prompt Chips */}
            <div className="px-4 py-2 bg-zinc-100/50 dark:bg-zinc-900/60 border-t border-border overflow-x-auto flex gap-2 no-scrollbar">
                {promptChips.map((chip, index) => (
                    <button
                        key={index}
                        onClick={() => handleSendPrompt(chip)}
                        disabled={isTyping}
                        className="shrink-0 text-xs bg-card border hover:border-primary hover:text-primary transition-all rounded-full px-3 py-1 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                    >
                        {chip}
                    </button>
                ))}
            </div>

            {/* Chat Input */}
            <div className="p-3 border-t border-border bg-card">
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        handleSendPrompt(chatInput)
                    }}
                    className="flex gap-2"
                >
                    <Input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Ask AI to create or rewrite an ad..."
                        disabled={isTyping}
                        className="flex-1 h-9 rounded-full px-4"
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={isTyping || !chatInput.trim()}
                        className="rounded-full h-9 w-9 shrink-0 cursor-pointer"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </div>
    )

    const renderEditPanel = () => (
        <div className="flex flex-col h-full bg-card">
            {/* Edit Header */}
            <div className="px-4 py-3 border-b border-border bg-card/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Edit className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-sm">Edit Ad Details</h3>
                </div>
                <div className="text-[10px] text-muted-foreground font-medium">Real-time Sync</div>
            </div>

            {/* Edit Form */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Platform */}
                <div className="space-y-1.5">
                    <Label htmlFor="editor-platform" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Ad Platform
                    </Label>
                    <Select
                        value={adForm.platform}
                        onValueChange={(val: any) => handleInputChange("platform", val)}
                    >
                        <SelectTrigger id="editor-platform" className="h-9 w-full flex">
                            <SelectValue placeholder="Select Platform" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="facebook">Facebook Feed</SelectItem>
                            <SelectItem value="instagram">Instagram Grid</SelectItem>
                            <SelectItem value="google">Google Search Ad</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Campaign Name */}
                <div className="space-y-1.5">
                    <Label htmlFor="editor-name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Campaign Name
                    </Label>
                    <Input
                        id="editor-name"
                        value={adForm.campaignName}
                        onChange={(e) => handleInputChange("campaignName", e.target.value)}
                        placeholder="e.g. Summer Knee Recovery Special"
                        className="h-9"
                    />
                </div>

                {/* Headline */}
                <div className="space-y-1.5">
                    <Label htmlFor="editor-headline" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Ad Headline
                    </Label>
                    <Input
                        id="editor-headline"
                        value={adForm.headline}
                        onChange={(e) => handleInputChange("headline", e.target.value)}
                        placeholder="e.g. Free Posture Consultation"
                        className="h-9 font-medium"
                    />
                </div>

                {/* Primary Text / Description */}
                <div className="space-y-1.5">
                    <Label htmlFor="editor-primary" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Primary Text / Body Copy
                    </Label>
                    <textarea
                        id="editor-primary"
                        value={adForm.primaryText}
                        onChange={(e) => handleInputChange("primaryText", e.target.value)}
                        placeholder="Write details of your clinic offer..."
                        rows={5}
                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 text-foreground"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Call to Action */}
                    <div className="space-y-1.5">
                        <Label htmlFor="editor-cta" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Call to Action
                        </Label>
                        <Select
                            value={adForm.cta}
                            onValueChange={(val) => handleInputChange("cta", val)}
                        >
                            <SelectTrigger id="editor-cta" className="h-9 w-full flex">
                                <SelectValue placeholder="CTA Button" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Book Appointment">Book Appointment</SelectItem>
                                <SelectItem value="Learn More">Learn More</SelectItem>
                                <SelectItem value="Sign Up">Sign Up</SelectItem>
                                <SelectItem value="Apply Now">Apply Now</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Budget */}
                    <div className="space-y-1.5">
                        <Label htmlFor="editor-budget" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Daily Budget (INR)
                        </Label>
                        <div className="relative">
                            <span className="absolute left-2.5 top-2.5 text-xs text-muted-foreground">₹</span>
                            <Input
                                id="editor-budget"
                                type="number"
                                value={adForm.budget}
                                onChange={(e) => handleInputChange("budget", e.target.value)}
                                className="h-9 pl-6 text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Target Condition */}
                <div className="space-y-1.5">
                    <Label htmlFor="editor-condition" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Target Condition
                    </Label>
                    <Input
                        id="editor-condition"
                        value={adForm.targetCondition}
                        onChange={(e) => handleInputChange("targetCondition", e.target.value)}
                        placeholder="e.g. Knee pain, Back rehab"
                        className="h-9"
                    />
                </div>

                {/* Destination URL */}
                <div className="space-y-1.5">
                    <Label htmlFor="editor-url" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Destination URL
                    </Label>
                    <div className="relative">
                        <LinkIcon className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            id="editor-url"
                            value={adForm.destinationUrl}
                            onChange={(e) => handleInputChange("destinationUrl", e.target.value)}
                            placeholder="https://elitephysio.in"
                            className="h-9 pl-8 text-xs text-muted-foreground"
                        />
                    </div>
                </div>

                {/* Ad Image Option */}
                {adForm.platform !== "google" && (
                    <div className="space-y-2 pt-2">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Ad Image Creative
                        </Label>
                        <div className="flex gap-3 items-center">
                            <div className="h-14 w-20 rounded border bg-muted overflow-hidden flex-shrink-0">
                                <img src={adForm.imageUrl} className="w-full h-full object-cover" alt="Selected Preview" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="text-[10px] text-muted-foreground truncate">{adForm.imageUrl.split('/').pop()}</p>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleGenerateImage}
                                    disabled={isGeneratingImage}
                                    className="h-7 w-full flex items-center justify-center gap-1.5 text-xs cursor-pointer border-dashed border-primary/40 hover:border-primary"
                                >
                                    {isGeneratingImage ? (
                                        <>
                                            <Loader2 className="h-3 w-3 animate-spin text-primary" />
                                            <span>Regenerating...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="h-3 w-3 text-primary" />
                                            <span>Generate Alt Creative</span>
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Action Bar */}
            <div className="p-3 border-t border-border bg-muted/30">
                <Button
                    onClick={handleExportCampaign}
                    disabled={isExporting || !adForm.campaignName.trim() || !adForm.headline.trim()}
                    className="w-full h-10 font-semibold cursor-pointer shadow-sm"
                >
                    {isExporting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Exporting to CRM...
                        </>
                    ) : (
                        <>
                            <Plus className="mr-2 h-4 w-4" />
                            Export Ad to Campaigns
                        </>
                    )}
                </Button>
            </div>
        </div>
    )

    const renderPreviewPanel = () => (
        <div className="flex flex-col h-full bg-zinc-50/50 dark:bg-zinc-950/20">
            {/* Preview Header */}
            <div className="px-4 py-3 border-b border-border bg-card flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-sm">Live Preview</h3>
                </div>
                {/* Platform Sync Indicator */}
                <div className="flex gap-1 bg-muted p-1 rounded-md">
                    <button
                        onClick={() => handleInputChange("platform", "facebook")}
                        className={`p-1 rounded-sm cursor-pointer ${adForm.platform === 'facebook' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'}`}
                    >
                        <FacebookIcon className="h-3.5 w-3.5" />
                    </button>
                    <button
                        onClick={() => handleInputChange("platform", "instagram")}
                        className={`p-1 rounded-sm cursor-pointer ${adForm.platform === 'instagram' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'}`}
                    >
                        <InstagramIcon className="h-3.5 w-3.5" />
                    </button>
                    <button
                        onClick={() => handleInputChange("platform", "google")}
                        className={`p-1 rounded-sm cursor-pointer ${adForm.platform === 'google' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'}`}
                    >
                        <GoogleIcon className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            {/* Mockup Container */}
            <div className="flex-1 overflow-y-auto p-4 flex items-start justify-center">
                <div className="w-full py-2">
                    {renderPreview()}
                </div>
            </div>
        </div>
    )

    if (!isMounted) {
        return <div className="h-[750px] w-full border border-border rounded-xl bg-card animate-pulse" />
    }

    if (isMobile) {
        return (
            <div className="flex flex-col h-[calc(100vh-210px)] border rounded-xl overflow-hidden bg-card shadow-xs">
                {/* Mobile Tab Swapper */}
                <div className="grid grid-cols-3 bg-muted/30 border-b border-border h-11">
                    <button
                        onClick={() => setActiveMobileTab("chat")}
                        className={`flex items-center justify-center gap-1 text-xs font-semibold border-b-2 cursor-pointer ${activeMobileTab === "chat"
                            ? "border-primary text-primary bg-card"
                            : "border-transparent text-muted-foreground"
                            }`}
                    >
                        <MessageSquare className="h-3.5 w-3.5" />
                        AI Copilot
                    </button>
                    <button
                        onClick={() => setActiveMobileTab("edit")}
                        className={`flex items-center justify-center gap-1 text-xs font-semibold border-b-2 cursor-pointer ${activeMobileTab === "edit"
                            ? "border-primary text-primary bg-card"
                            : "border-transparent text-muted-foreground"
                            }`}
                    >
                        <Edit className="h-3.5 w-3.5" />
                        Edit Form
                    </button>
                    <button
                        onClick={() => setActiveMobileTab("preview")}
                        className={`flex items-center justify-center gap-1 text-xs font-semibold border-b-2 cursor-pointer ${activeMobileTab === "preview"
                            ? "border-primary text-primary bg-card"
                            : "border-transparent text-muted-foreground"
                            }`}
                    >
                        <Smartphone className="h-3.5 w-3.5" />
                        Preview
                    </button>
                </div>

                <div className="flex-1 overflow-hidden">
                    {activeMobileTab === "chat" && renderChatPanel()}
                    {activeMobileTab === "edit" && renderEditPanel()}
                    {activeMobileTab === "preview" && renderPreviewPanel()}
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-[calc(100vh-12rem)] min-h-[650px] w-full">
            <ResizablePanelGroup direction="horizontal" className="h-full w-full" id="ad-studio-outer-group">
                {/* Panel One: AI Assistant Chat Panel */}
                <ResizablePanel id="ad-studio-chat-panel" defaultSize={35} className="min-w-0">
                    <div className="h-full w-full min-w-0 overflow-hidden p-2">
                        <div className="h-full border border-border rounded-xl overflow-hidden bg-card flex flex-col shadow-xs">
                            {renderChatPanel()}
                        </div>
                    </div>
                </ResizablePanel>

                <ResizableHandle withHandle />

                {/* Right side container */}
                <ResizablePanel id="ad-studio-right-panel" defaultSize={65} className="min-w-0">
                    <div className="h-full w-full min-w-0">
                        <ResizablePanelGroup direction="vertical" className="h-full" id="ad-studio-inner-group">
                            {/* Panel Two: Live Preview Panel */}
                            <ResizablePanel id="ad-studio-preview-panel" defaultSize={60} className="min-w-0">
                                <div className="h-full w-full min-w-0 overflow-hidden p-2">
                                    <div className="h-full border border-border rounded-xl overflow-hidden bg-card flex flex-col shadow-xs">
                                        {renderPreviewPanel()}
                                    </div>
                                </div>
                            </ResizablePanel>

                            <ResizableHandle withHandle />

                            {/* Panel Three: Edit Form Panel */}
                            <ResizablePanel id="ad-studio-edit-panel" defaultSize={40} className="min-w-0">
                                <div className="h-full w-full min-w-0 overflow-hidden p-2">
                                    <div className="h-full border border-border rounded-xl overflow-hidden bg-card flex flex-col shadow-xs">
                                        {renderEditPanel()}
                                    </div>
                                </div>
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    )
}
