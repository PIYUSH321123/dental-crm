import React, { useState, useEffect } from "react"
import { Phone, MessageSquare, Send, X, Zap, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Sheet,
    SheetContent,
} from "@/components/ui/sheet"
import { FollowUp, ChatMessage } from "./_follow-up-table/follow-up-data"

interface WhatsAppChatSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    followUp: FollowUp | null
    chatMessages: ChatMessage[]
    onSendMessage: (text: string, isTemplate?: boolean) => void
}

export function WhatsAppChatSheet({
    open,
    onOpenChange,
    followUp,
    chatMessages,
    onSendMessage
}: WhatsAppChatSheetProps) {
    const [chatInput, setChatInput] = useState("")
    const [selectedTemplate, setSelectedTemplate] = useState("")

    useEffect(() => {
        if (open) {
            setChatInput("")
            setSelectedTemplate("")
        }
    }, [open])

    const handleApplyTemplate = (val: string) => {
        setSelectedTemplate(val)
        if (val === "welcome") {
            setChatInput(`Hello ${followUp?.lead_name}, thank you for reaching out to PhysioYoga. We have received your inquiry. Would you like to schedule a free 10-minute callback with our expert therapist today?`)
        } else if (val === "checkin") {
            setChatInput(`Hi ${followUp?.lead_name}, checking in from PhysioYoga. Hope you are feeling better. Let us know if you would like to book your next session to continue your rehabilitation.`)
        } else if (val === "reminder") {
            setChatInput(`Hi ${followUp?.lead_name}, this is a reminder for your follow-up appointment scheduled at PhysioYoga. Please let us know if you need to reschedule.`)
        } else if (val === "exercise") {
            setChatInput(`Hi ${followUp?.lead_name}, have you performed your home exercises today? Staying consistent will speed up your recovery. Reply if you have any questions!`)
        }
    }

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault()
        if (!chatInput.trim() && !selectedTemplate) return

        onSendMessage(selectedTemplate || chatInput, !!selectedTemplate)
        setChatInput("")
        setSelectedTemplate("")
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-[460px] p-0 flex flex-col h-full bg-card text-card-foreground border-l border-border outline-none">
                {/* Header */}
                <div className="p-4 bg-muted/40 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-white relative">
                            {followUp?.lead_name ? followUp.lead_name.split(' ').map(n => n[0]).join('') : "U"}
                            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 border border-background"></span>
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground text-sm leading-tight">{followUp?.lead_name}</h3>
                            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                                <Phone className="h-2.5 w-2.5" /> {followUp?.lead_mobile} (WhatsApp Active)
                            </p>
                        </div>
                    </div>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-full cursor-pointer"
                        onClick={() => onOpenChange(false)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Developer Info Notice */}
                <div className="px-4 py-2.5 bg-gradient-to-r from-emerald-500/10 to-primary/10 border-b border-border text-[11px] text-muted-foreground flex items-start gap-2">
                    <Zap className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
                    <div>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">WhatsApp Chat SDK Slot:</span> This window is a placeholder. You can plug in your WhatsApp Business API & SDK interface here by updating this module.
                    </div>
                </div>

                {/* Message Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50">
                    {chatMessages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-2 p-6">
                            <MessageSquare className="h-10 w-10 text-muted-foreground/60" />
                            <h4 className="font-semibold text-muted-foreground text-sm">No messages yet</h4>
                            <p className="text-xs text-muted-foreground/60 max-w-[220px]">Send a quick-text template or customized message below to start.</p>
                        </div>
                    ) : (
                        chatMessages.map((msg) => {
                            const isAgent = msg.sender === "agent"
                            return (
                                <div 
                                    key={msg.id} 
                                    className={`flex flex-col max-w-[80%] ${isAgent ? "ml-auto items-end" : "mr-auto items-start"}`}
                                >
                                    <div 
                                        className={`rounded-lg px-3 py-2 text-sm shadow-xs ${
                                            isAgent 
                                                ? "bg-primary text-primary-foreground rounded-tr-none" 
                                                : "bg-muted text-foreground rounded-tl-none"
                                        }`}
                                    >
                                        {msg.text}
                                        {msg.isTemplate && (
                                            <span className={`block mt-1 text-[9px] font-semibold uppercase tracking-wider ${isAgent ? "text-primary-foreground/75" : "text-muted-foreground"}`}>
                                                📄 Template Send
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-[9px] text-muted-foreground mt-1 px-1">
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            )
                        })
                    )}
                </div>

                {/* Quick templates dropdown inside chat */}
                <div className="px-4 py-2 border-t border-border bg-muted/40 flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="text-[11px] font-semibold text-muted-foreground">Quick Templates:</span>
                    <select 
                        className="bg-background border border-input text-foreground text-xs rounded px-2 py-1 outline-none flex-1 max-w-[200px]"
                        value={selectedTemplate}
                        onChange={(e) => handleApplyTemplate(e.target.value)}
                    >
                        <option value="">Select template...</option>
                        <option value="welcome">👋 Welcome Greeting</option>
                        <option value="checkin">🏥 Check-in Checkup</option>
                        <option value="reminder">📅 Session Reminder</option>
                        <option value="exercise">🏋️ Home Exercises</option>
                    </select>
                </div>

                {/* Text input area */}
                <form onSubmit={handleSend} className="p-4 bg-muted/40 border-t border-border flex gap-2">
                    <Input 
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-background border-input text-foreground h-10 text-sm focus-visible:ring-primary"
                    />
                    <Button 
                        type="submit" 
                        size="icon" 
                        className="h-10 w-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md shrink-0 transition-colors cursor-pointer"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </SheetContent>
        </Sheet>
    )
}
