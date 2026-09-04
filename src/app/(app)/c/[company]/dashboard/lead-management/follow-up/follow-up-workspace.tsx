"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { 
    Clock, 
    MessageSquare, 
    CheckCircle2, 
    AlertCircle, 
    CalendarRange, 
    Plus
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Import modular components
import { 
    FollowUp, 
    AutomationRule, 
    ChatMessage, 
    defaultFollowUps, 
    defaultAutomationRules, 
    defaultChats 
} from "./_follow-up-table/follow-up-data"
import { getColumns } from "./_follow-up-table/follow-up-columns"
import { FollowUpDataTable } from "./_follow-up-table/follow-up-data-table"
import { DoneFollowUpDialog } from "./done-follow-up-dialog"
import { RescheduleFollowUpDialog } from "./reschedule-follow-up-dialog"
import { WhatsAppChatSheet } from "./whatsapp-chat-sheet"
import { AutomationRuleDialog } from "./automation-rule-dialog"

// Mock metadata/activities imports
import { mockTherapists, ActivityLog } from "../leads/_lead-data-table/lead-data"

export default function FollowUpWorkspace() {
    // State Variables
    const [followUps, setFollowUps] = useState<FollowUp[]>([])
    const [automationRules, setAutomationRules] = useState<AutomationRule[]>([])
    const [chats, setChats] = useState<Record<string, ChatMessage[]>>({})
    const [loaded, setLoaded] = useState(false)

    // Filtering/Searching State
    const [activeTab, setActiveTab] = useState<"today" | "overdue" | "upcoming" | "completed" | "all">("today")

    // Modal / Sheet States
    const [doneDialogOpen, setDoneDialogOpen] = useState(false)
    const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false)
    const [chatSheetOpen, setChatSheetOpen] = useState(false)
    const [ruleDialogOpen, setRuleDialogOpen] = useState(false)

    // Current Action Targets
    const [selectedFollowUp, setSelectedFollowUp] = useState<FollowUp | null>(null)
    const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null)

    // Load from localStorage on mount
    useEffect(() => {
        const savedFw = localStorage.getItem("sg-followups")
        const savedRules = localStorage.getItem("sg-automation-rules")
        const savedChats = localStorage.getItem("sg-wa-chats")

        if (savedFw) {
            setFollowUps(JSON.parse(savedFw))
        } else {
            setFollowUps(defaultFollowUps())
        }

        if (savedRules) {
            setAutomationRules(JSON.parse(savedRules))
        } else {
            setAutomationRules(defaultAutomationRules())
        }

        if (savedChats) {
            setChats(JSON.parse(savedChats))
        } else {
            setChats(defaultChats())
        }

        setLoaded(true)
    }, [])

    // Sync back to localStorage
    useEffect(() => {
        if (loaded) {
            localStorage.setItem("sg-followups", JSON.stringify(followUps))
        }
    }, [followUps, loaded])

    useEffect(() => {
        if (loaded) {
            localStorage.setItem("sg-automation-rules", JSON.stringify(automationRules))
        }
    }, [automationRules, loaded])

    useEffect(() => {
        if (loaded) {
            localStorage.setItem("sg-wa-chats", JSON.stringify(chats))
        }
    }, [chats, loaded])

    // Calculate dates & category labels
    const processedFollowUps = useMemo(() => {
        const todayStr = new Date().toDateString()
        const now = new Date()

        return followUps.map(f => {
            const dueDate = new Date(f.due_at)
            const isToday = dueDate.toDateString() === todayStr
            const isOverdue = dueDate < now && !isToday && f.status === "Pending"
            const isUpcoming = dueDate > now && !isToday && f.status === "Pending"
            const isDueToday = isToday && f.status === "Pending"

            return {
                ...f,
                category: f.status === "Completed" ? ("completed" as const) : isOverdue ? ("overdue" as const) : isDueToday ? ("today" as const) : ("upcoming" as const)
            }
        })
    }, [followUps])

    // Metrics calculations
    const metrics = useMemo(() => {
        const todayCount = processedFollowUps.filter(f => f.category === "today").length
        const overdueCount = processedFollowUps.filter(f => f.category === "overdue").length
        const upcomingCount = processedFollowUps.filter(f => f.category === "upcoming").length
        const completedCount = processedFollowUps.filter(f => f.status === "Completed").length

        return {
            today: todayCount,
            overdue: overdueCount,
            upcoming: upcomingCount,
            completed: completedCount,
            pending: todayCount + overdueCount + upcomingCount
        }
    }, [processedFollowUps])

    // Filtered data for active category tab to pass to table
    const tabFollowUps = useMemo(() => {
        return processedFollowUps.filter(f => {
            if (activeTab === "all") return true
            return f.category === activeTab
        })
    }, [processedFollowUps, activeTab])

    // Get therapist name by ID
    const getTherapistName = (id: string) => {
        return mockTherapists.find(t => t.id === id)?.name || "Unassigned"
    }

    // Format relative time helper
    const getFormattedTime = (dateStr: string) => {
        const date = new Date(dateStr)
        const today = new Date()
        const isToday = date.toDateString() === today.toDateString()

        if (isToday) {
            return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        }
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ` ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    }

    // Done Dialog save outcome callback
    const handleSaveDone = (
        outcome: FollowUp["outcome"] & string,
        notes: string,
        scheduleNext: boolean,
        nextDetails?: {
            type: FollowUp["type"]
            assignedId: string
            dueAt: string
        }
    ) => {
        if (!selectedFollowUp) return

        const updated = followUps.map(f => {
            if (f.id === selectedFollowUp.id) {
                return {
                    ...f,
                    status: "Completed" as const,
                    outcome,
                    notes,
                    completed_at: new Date().toISOString()
                }
            }
            return f
        })

        // Log in sg-activities if exists
        const savedActivities = localStorage.getItem("sg-activities")
        const currentActivities = savedActivities ? JSON.parse(savedActivities) : []
        const logId = `act-${Date.now()}`
        const newActivity: ActivityLog = {
            id: logId,
            lead_id: selectedFollowUp.lead_id,
            type: "followup",
            title: `Follow-up Completed (${selectedFollowUp.type})`,
            description: `Outcome: ${outcome}. Notes: ${notes || "None"}`,
            timestamp: new Date().toISOString(),
            operator: "Amit Verma"
        }
        localStorage.setItem("sg-activities", JSON.stringify([newActivity, ...currentActivities]))

        // If next follow up scheduled
        if (scheduleNext && nextDetails) {
            const nextFwId = `fw-${Date.now()}`
            const newFw: FollowUp = {
                id: nextFwId,
                lead_id: selectedFollowUp.lead_id,
                lead_name: selectedFollowUp.lead_name,
                lead_mobile: selectedFollowUp.lead_mobile,
                type: nextDetails.type,
                due_at: new Date(nextDetails.dueAt).toISOString(),
                status: "Pending",
                assigned_to_id: nextDetails.assignedId || selectedFollowUp.assigned_to_id,
                last_activity: `${selectedFollowUp.type} completed today`
            }
            updated.push(newFw)
            toast.success(`Follow-up logged and next ${nextDetails.type} scheduled.`)
        } else {
            toast.success("Follow-up marked as completed.")
        }

        setFollowUps(updated)
        setDoneDialogOpen(false)
        setSelectedFollowUp(null)
    }

    // Reschedule Dialog save callback
    const handleSaveReschedule = (rescheduleDate: string) => {
        if (!selectedFollowUp || !rescheduleDate) return

        const formattedDate = new Date(rescheduleDate).toISOString()
        const updated = followUps.map(f => {
            if (f.id === selectedFollowUp.id) {
                return {
                    ...f,
                    due_at: formattedDate,
                    last_activity: `Rescheduled to ${new Date(rescheduleDate).toLocaleString()}`
                }
            }
            return f
        })

        // Log activity
        const savedActivities = localStorage.getItem("sg-activities")
        const currentActivities = savedActivities ? JSON.parse(savedActivities) : []
        const newActivity: ActivityLog = {
            id: `act-${Date.now()}`,
            lead_id: selectedFollowUp.lead_id,
            type: "followup",
            title: `Follow-up Rescheduled`,
            description: `Rescheduled ${selectedFollowUp.type} follow-up to ${new Date(rescheduleDate).toLocaleString()}`,
            timestamp: new Date().toISOString(),
            operator: "Amit Verma"
        }
        localStorage.setItem("sg-activities", JSON.stringify([newActivity, ...currentActivities]))

        setFollowUps(updated)
        setRescheduleDialogOpen(false)
        setSelectedFollowUp(null)
        toast.success("Follow-up rescheduled successfully.")
    }

    // WhatsApp send message callback
    const handleSendMessage = (messageText: string, isTemplate?: boolean) => {
        if (!selectedFollowUp) return
        const leadId = selectedFollowUp.lead_id
        const timestamp = new Date().toISOString()
        
        const newMsg: ChatMessage = {
            id: `msg-${Date.now()}`,
            sender: "agent",
            text: messageText,
            timestamp,
            isTemplate: !!isTemplate
        }

        const currentChats = chats[leadId] || []
        const updatedChats = [...currentChats, newMsg]
        setChats(prev => ({
            ...prev,
            [leadId]: updatedChats
        }))

        // Log WhatsApp activity
        const savedActivities = localStorage.getItem("sg-activities")
        const currentActivities = savedActivities ? JSON.parse(savedActivities) : []
        const newActivity: ActivityLog = {
            id: `act-${Date.now()}`,
            lead_id: leadId,
            type: "whatsapp",
            title: isTemplate ? "WhatsApp Template Sent" : "WhatsApp Message Sent",
            description: `Message: "${messageText.substring(0, 60)}..."`,
            timestamp,
            operator: "Amit Verma"
        }
        localStorage.setItem("sg-activities", JSON.stringify([newActivity, ...currentActivities]))

        setFollowUps(prev => prev.map(f => {
            if (f.lead_id === leadId) {
                return {
                    ...f,
                    last_activity: "WhatsApp sent just now"
                }
            }
            return f
        }))

        toast.success("Message sent via simulated SDK interface.")

        setTimeout(() => {
            const replyMsg: ChatMessage = {
                id: `msg-${Date.now() + 1}`,
                sender: "lead",
                text: "Thanks doctor! I have received your message. I am reviewing the details and will get back to you shortly.",
                timestamp: new Date().toISOString()
            }
            setChats(prev => ({
                ...prev,
                [leadId]: [...(prev[leadId] || []), replyMsg]
            }))
            toast.info(`New WhatsApp message received from ${selectedFollowUp.lead_name}`)
        }, 1500)
    }

    // Automation Rule Save Callback
    const handleSaveRule = (trigger: string, delay: string, action: string, template: string) => {
        if (selectedRule) {
            const updated = automationRules.map(r => {
                if (r.id === selectedRule.id) {
                    return {
                        ...r,
                        trigger,
                        delay,
                        action,
                        template
                    }
                }
                return r
            })
            setAutomationRules(updated)
            toast.success("Automation rule updated.")
        } else {
            const newRule: AutomationRule = {
                id: `rule-${Date.now()}`,
                trigger,
                delay,
                action,
                template,
                status: "ON"
            }
            setAutomationRules([...automationRules, newRule])
            toast.success("New automation rule added.")
        }
        setRuleDialogOpen(false)
    }

    const handleOpenAddRule = () => {
        setSelectedRule(null)
        setRuleDialogOpen(true)
    }

    const handleToggleRule = (id: string) => {
        const updated = automationRules.map(r => {
            if (r.id === id) {
                const nextStatus = r.status === "ON" ? "OFF" as const : "ON" as const
                toast.success(`Rule "${r.trigger}" turned ${nextStatus}`)
                return { ...r, status: nextStatus }
            }
            return r
        })
        setAutomationRules(updated)
    }

    const handleDeleteRule = (id: string) => {
        setAutomationRules(automationRules.filter(r => r.id !== id))
        setRuleDialogOpen(false)
        toast.error("Automation rule deleted.")
    }

    // Column Definitions hook
    const columns = useMemo(() => getColumns({
        onDone: (fw) => {
            setSelectedFollowUp(fw)
            setDoneDialogOpen(true)
        },
        onChat: (fw) => {
            setSelectedFollowUp(fw)
            setChatSheetOpen(true)
        },
        onReschedule: (fw) => {
            setSelectedFollowUp(fw)
            setRescheduleDialogOpen(true)
        },
        getTherapistName,
        getFormattedTime
    }), [])

    return (
        <div className="flex-1 space-y-6 p-4 md:p-8 bg-background min-h-screen">
            {/* Header Title Card with Gray Gradient Shades */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-4 md:px-6 md:py-4 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                        Lead Follow-up System
                    </h1>
                    <p className="text-muted-foreground text-xs mt-0.5">
                        Manage task queues, logging callbacks, and simulated WhatsApp integrations.
                    </p>
                </div>
            </div>

            {/* Metrics cards grid with Gray Shades */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-gradient-to-br from-slate-50/90 via-white to-slate-100/60 dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-950 border border-slate-200 dark:border-slate-800 shadow-xs rounded-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Follow-ups Due Today</CardTitle>
                        <Clock className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{metrics.today}</div>
                        <p className="text-xs text-primary font-medium mt-1">Actions scheduled for today</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-slate-50/90 via-white to-slate-100/60 dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-950 border border-slate-200 dark:border-slate-800 shadow-xs rounded-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-semibold text-rose-500 uppercase tracking-wider">Overdue Actions</CardTitle>
                        <AlertCircle className="h-4 w-4 text-rose-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">{metrics.overdue}</div>
                        <p className="text-xs text-rose-500 font-medium mt-1">Requires attention</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-slate-50/90 via-white to-slate-100/60 dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-950 border border-slate-200 dark:border-slate-800 shadow-xs rounded-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Completed Follow-ups</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{metrics.completed}</div>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">Successfully handled</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-slate-50/90 via-white to-slate-100/60 dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-950 border border-slate-200 dark:border-slate-800 shadow-xs rounded-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">WhatsApp Status</CardTitle>
                        <MessageSquare className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                            </span>
                            <div className="text-lg font-bold text-slate-900 dark:text-slate-100">Ready</div>
                        </div>
                        <p className="text-xs font-medium mt-1.5 text-muted-foreground">SDK Interface Active</p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs for Follow-up queue & Automation */}
            <Tabs defaultValue="queue" className="w-full space-y-6">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px] bg-muted p-1 rounded-lg">
                    <TabsTrigger value="queue" className="rounded-md">Follow-up Queue</TabsTrigger>
                    <TabsTrigger value="rules" className="rounded-md">Automation Rules</TabsTrigger>
                </TabsList>

                {/* Queue Tab Content */}
                <TabsContent value="queue" className="space-y-4 outline-none">
                    {/* Render extracted TanStack Data Table Component */}
                    <FollowUpDataTable
                        columns={columns}
                        data={tabFollowUps}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        metrics={metrics}
                        getTherapistName={getTherapistName}
                    />
                </TabsContent>

                {/* Automation Rules Tab Content */}
                <TabsContent value="rules" className="space-y-6 outline-none">
                    <Card className="border-border bg-card shadow-xs">
                        <CardHeader className="pb-4 border-b border-border flex flex-row items-center justify-between">
                            <div className="space-y-0.5">
                                <CardTitle className="text-lg font-bold">Automated Follow-up Rules</CardTitle>
                                <CardDescription>Configure auto-triggers to send WhatsApp and SMS messages based on lead milestones.</CardDescription>
                            </div>
                            <Button 
                                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                                onClick={handleOpenAddRule}
                            >
                                <Plus className="h-4 w-4" /> Add Rule
                            </Button>
                        </CardHeader>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-muted/40">
                                    <TableRow className="border-border">
                                        <TableHead className="font-semibold text-foreground h-11">Trigger Milestone</TableHead>
                                        <TableHead className="font-semibold text-foreground h-11">Delay Time</TableHead>
                                        <TableHead className="font-semibold text-foreground h-11">Auto Action</TableHead>
                                        <TableHead className="font-semibold text-foreground h-11">Message Template</TableHead>
                                        <TableHead className="font-semibold text-foreground h-11">Status</TableHead>
                                        <TableHead className="font-semibold text-foreground h-11 text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {automationRules.map((rule) => (
                                        <TableRow key={rule.id} className="border-border">
                                            <TableCell className="font-semibold text-foreground py-3 text-sm">
                                                {rule.trigger}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm py-3">
                                                {rule.delay}
                                            </TableCell>
                                            <TableCell className="py-3">
                                                <Badge variant="outline" className="bg-muted border-border text-foreground font-semibold rounded text-xs px-2 py-0.5">
                                                    {rule.action}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm py-3 font-medium">
                                                {rule.template || "None"}
                                            </TableCell>
                                            <TableCell className="py-3">
                                                {rule.status === "ON" ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground">
                                                        Inactive
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline" 
                                                        className={`h-8 font-semibold text-xs cursor-pointer ${
                                                            rule.status === "ON" ? "text-muted-foreground" : "text-primary hover:text-primary"
                                                        }`}
                                                        onClick={() => handleToggleRule(rule.id)}
                                                    >
                                                        {rule.status === "ON" ? "Disable" : "Enable"}
                                                    </Button>
                                                    <Button 
                                                        size="sm" 
                                                        variant="ghost" 
                                                        className="h-8 text-primary hover:text-primary/80 text-xs font-semibold cursor-pointer"
                                                        onClick={() => {
                                                            setSelectedRule(rule)
                                                            setRuleDialogOpen(true)
                                                        }}
                                                    >
                                                        Edit
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Render Log Done Dialog Component */}
            <DoneFollowUpDialog
                open={doneDialogOpen}
                onOpenChange={setDoneDialogOpen}
                followUp={selectedFollowUp}
                onSave={handleSaveDone}
            />

            {/* Render Reschedule Dialog Component */}
            <RescheduleFollowUpDialog
                open={rescheduleDialogOpen}
                onOpenChange={setRescheduleDialogOpen}
                followUp={selectedFollowUp}
                onSave={handleSaveReschedule}
            />

            {/* Render Slide-out Chat Sheet Component */}
            <WhatsAppChatSheet
                open={chatSheetOpen}
                onOpenChange={setChatSheetOpen}
                followUp={selectedFollowUp}
                chatMessages={selectedFollowUp ? chats[selectedFollowUp.lead_id] || [] : []}
                onSendMessage={handleSendMessage}
            />

            {/* Render Rule Config Dialog Component */}
            <AutomationRuleDialog
                open={ruleDialogOpen}
                onOpenChange={setRuleDialogOpen}
                rule={selectedRule}
                onSave={handleSaveRule}
                onDelete={handleDeleteRule}
            />
        </div>
    )
}
