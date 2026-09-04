"use client"

import * as React from "react"
import { useSearchParams, useParams, useRouter } from "next/navigation"
import {
    MessageSquare,
    Mail,
    Phone,
    FileText,
    Search,
    Star,
    StarOff,
    Archive,
    ArchiveRestore,
    Check,
    CheckCheck,
    AlertCircle,
    Send,
    UserCheck,
    Calendar,
    ChevronRight,
    Filter,
    Paperclip,
    Sparkles,
    User,
    Lock,
    ExternalLink,
    MoreVertical,
    CheckCircle2,
    Clock,
    Plus,
    Tag,
    Trash2,
    RefreshCw,
    X,
    Flame
} from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    InboxThread,
    InboxMessage,
    InboxChannel,
    CannedTemplate,
    CANNED_TEMPLATES,
    CLINIC_STAFF,
    getInboxThreads,
    saveInboxThreads
} from "@/lib/inbox-data"

type FilterFolder = "all" | "unread" | "assigned" | "starred" | "archived"

export function InboxWorkspace() {
    const params = useParams()
    const router = useRouter()
    const searchParams = useSearchParams()
    const company = (params?.company as string) || "clinic"

    const [threads, setThreads] = React.useState<InboxThread[]>([])
    const [selectedThreadId, setSelectedThreadId] = React.useState<string | null>(null)
    const [folder, setFolder] = React.useState<FilterFolder>("all")
    const [channelFilter, setChannelFilter] = React.useState<"all" | InboxChannel>("all")
    const [staffFilter, setStaffFilter] = React.useState<string>("all")
    const [searchQuery, setSearchQuery] = React.useState("")
    
    // Reply box states
    const [replyMode, setReplyMode] = React.useState<"reply" | "internal">("reply")
    const [replyText, setReplyText] = React.useState("")
    const [isSending, setIsSending] = React.useState(false)

    // Current logged in mock user for "Assigned to me"
    const currentUser = "Dr. Priya Sharma"

    // Load initial threads
    const refreshData = React.useCallback(() => {
        const data = getInboxThreads(company)
        setThreads(data)
    }, [company])

    React.useEffect(() => {
        refreshData()

        const handleUpdate = () => refreshData()
        window.addEventListener("sg-inbox-updated", handleUpdate)
        return () => window.removeEventListener("sg-inbox-updated", handleUpdate)
    }, [refreshData])

    // Set initial selected thread from URL query or first item
    React.useEffect(() => {
        const queryThreadId = searchParams.get("threadId")
        if (queryThreadId && threads.some(t => t.id === queryThreadId)) {
            setSelectedThreadId(queryThreadId)
        } else if (!selectedThreadId && threads.length > 0) {
            setSelectedThreadId(threads[0].id)
        }
    }, [searchParams, threads, selectedThreadId])

    // Filter threads
    const filteredThreads = React.useMemo(() => {
        return threads.filter(thread => {
            // Folder filtering
            if (folder === "all" && thread.isArchived) return false
            if (folder === "unread" && (thread.unreadCount === 0 || thread.isArchived)) return false
            if (folder === "starred" && (!thread.isStarred || thread.isArchived)) return false
            if (folder === "assigned" && (thread.assignedStaff !== currentUser || thread.isArchived)) return false
            if (folder === "archived" && !thread.isArchived) return false

            // Channel filtering
            if (channelFilter !== "all" && thread.channel !== channelFilter) return false

            // Staff filtering
            if (staffFilter !== "all" && thread.assignedStaff !== staffFilter) return false

            // Search query
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase()
                const matchName = thread.patientContext.name.toLowerCase().includes(q)
                const matchPhone = thread.patientContext.phone.toLowerCase().includes(q)
                const matchEmail = thread.patientContext.email.toLowerCase().includes(q)
                const matchSnippet = thread.snippet.toLowerCase().includes(q)
                const matchSubject = thread.subject?.toLowerCase().includes(q) || false
                const matchMessages = thread.messages.some(m => m.content.toLowerCase().includes(q))
                if (!matchName && !matchPhone && !matchEmail && !matchSnippet && !matchSubject && !matchMessages) {
                    return false
                }
            }

            return true
        })
    }, [threads, folder, channelFilter, staffFilter, searchQuery, currentUser])

    const selectedThread = React.useMemo(() => {
        return threads.find(t => t.id === selectedThreadId) || filteredThreads[0] || null
    }, [threads, selectedThreadId, filteredThreads])

    // Thread Actions
    const handleSelectThread = (thread: InboxThread) => {
        setSelectedThreadId(thread.id)
        if (thread.unreadCount > 0) {
            const updated = threads.map(t => t.id === thread.id ? { ...t, unreadCount: 0 } : t)
            setThreads(updated)
            saveInboxThreads(updated, company)
        }
    }

    const handleToggleStar = (threadId: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation()
        const updated = threads.map(t => {
            if (t.id === threadId) {
                const next = !t.isStarred
                toast.success(next ? "Conversation starred" : "Conversation unstarred")
                return { ...t, isStarred: next }
            }
            return t
        })
        setThreads(updated)
        saveInboxThreads(updated, company)
    }

    const handleToggleArchive = (threadId: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation()
        const updated = threads.map(t => {
            if (t.id === threadId) {
                const next = !t.isArchived
                toast.success(next ? "Thread moved to Archive" : "Thread restored to Inbox")
                return { ...t, isArchived: next }
            }
            return t
        })
        setThreads(updated)
        saveInboxThreads(updated, company)
    }

    const handleAssignStaff = (threadId: string, staffName: string) => {
        const updated = threads.map(t => {
            if (t.id === threadId) {
                toast.success(`Conversation assigned to ${staffName}`)
                return { ...t, assignedStaff: staffName }
            }
            return t
        })
        setThreads(updated)
        saveInboxThreads(updated, company)
    }

    const handleMarkAllRead = () => {
        const updated = threads.map(t => ({ ...t, unreadCount: 0 }))
        setThreads(updated)
        saveInboxThreads(updated, company)
        toast.success("All messages marked as read")
    }

    const handleSendReply = (e: React.FormEvent) => {
        e.preventDefault()
        if (!replyText.trim() || !selectedThread) return

        setIsSending(true)

        const newMessage: InboxMessage = {
            id: `msg-${Date.now()}`,
            senderName: replyMode === "internal" ? currentUser : currentUser,
            senderRole: "doctor",
            channel: replyMode === "internal" ? "internal" : selectedThread.channel,
            content: replyText.trim(),
            timestamp: "Just now",
            isOutgoing: replyMode !== "internal",
            status: "delivered"
        }

        const updated = threads.map(t => {
            if (t.id === selectedThread.id) {
                return {
                    ...t,
                    snippet: replyMode === "internal" ? `Internal Note: ${replyText.trim()}` : replyText.trim(),
                    updatedAt: "Just now",
                    messages: [...t.messages, newMessage]
                }
            }
            return t
        })

        setTimeout(() => {
            setThreads(updated)
            saveInboxThreads(updated, company)
            setReplyText("")
            setIsSending(false)
            toast.success(replyMode === "internal" ? "Internal clinical note added" : "Reply sent to patient")
        }, 250)
    }

    const handleInsertCanned = (template: CannedTemplate) => {
        if (!selectedThread) return
        let processed = template.content
        processed = processed.replace(/\[Patient Name\]/g, selectedThread.patientContext.name.split(" ")[0])
        processed = processed.replace(/\[Time\]/g, selectedThread.patientContext.nextAppointment || "your scheduled slot")
        setReplyText(prev => prev ? `${prev}\n\n${processed}` : processed)
        toast.info(`Inserted template: ${template.title}`)
    }

    const getChannelIcon = (channel: InboxChannel, size = "h-3.5 w-3.5") => {
        switch (channel) {
            case "whatsapp":
                return <MessageSquare className={`${size} text-emerald-500`} />
            case "email":
                return <Mail className={`${size} text-blue-500`} />
            case "internal":
                return <FileText className={`${size} text-amber-500`} />
            case "sms":
                return <Phone className={`${size} text-purple-500`} />
        }
    }

    const getChannelBadge = (channel: InboxChannel) => {
        switch (channel) {
            case "whatsapp":
                return <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">WhatsApp</span>
            case "email":
                return <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">Email</span>
            case "internal":
                return <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">Internal Note</span>
            case "sms":
                return <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">SMS</span>
        }
    }

    // Counts for folders
    const counts = {
        all: threads.filter(t => !t.isArchived).length,
        unread: threads.filter(t => !t.isArchived && t.unreadCount > 0).length,
        assigned: threads.filter(t => !t.isArchived && t.assignedStaff === currentUser).length,
        starred: threads.filter(t => !t.isArchived && t.isStarred).length,
        archived: threads.filter(t => t.isArchived).length
    }

    return (
        <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] min-h-[600px] overflow-hidden bg-background">
            {/* Top Toolbar / Action Header with Gray Gradient Shades */}
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 flex items-center justify-between gap-3 shrink-0 shadow-xs">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold shadow-2xs border border-primary/20">
                        <MessageSquare className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-sm md:text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            Unified Clinical Inbox
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300/60 dark:border-slate-700">
                                {counts.all} Conversations
                            </span>
                        </h1>
                        <p className="text-[11px] text-muted-foreground">
                            Omnichannel patient inquiries, WhatsApp messages, emails, & internal clinic handoffs.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleMarkAllRead}
                        className="h-8 text-xs font-semibold gap-1.5 cursor-pointer rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-xs"
                    >
                        <CheckCheck className="h-3.5 w-3.5 text-primary" />
                        <span className="hidden sm:inline">Mark All Read</span>
                    </Button>
                </div>
            </div>

            {/* Main 3-Column Layout */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
                {/* 1. Left Folders & Channel Filters */}
                <div className="hidden md:flex md:col-span-3 lg:col-span-2 border-r border-slate-200 dark:border-slate-800 bg-slate-100/40 dark:bg-slate-900/40 flex-col justify-between p-3 overflow-y-auto">
                    <div className="space-y-4">
                        {/* Folders List */}
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2">
                                Inboxes
                            </span>
                            <div className="mt-1.5 space-y-0.5">
                                <button
                                    onClick={() => setFolder("all")}
                                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                        folder === "all"
                                            ? "bg-primary text-primary-foreground shadow-2xs"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="h-3.5 w-3.5" />
                                        <span>All Messages</span>
                                    </div>
                                    <span className="text-[10px] opacity-80">{counts.all}</span>
                                </button>

                                <button
                                    onClick={() => setFolder("unread")}
                                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                        folder === "unread"
                                            ? "bg-primary text-primary-foreground shadow-2xs"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                                        <span>Unread</span>
                                    </div>
                                    {counts.unread > 0 && (
                                        <span className={`text-[10px] px-1.5 rounded-full font-bold ${folder === "unread" ? "bg-white/20 text-white" : "bg-primary/15 text-primary"}`}>
                                            {counts.unread}
                                        </span>
                                    )}
                                </button>

                                <button
                                    onClick={() => setFolder("assigned")}
                                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                        folder === "assigned"
                                            ? "bg-primary text-primary-foreground shadow-2xs"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <UserCheck className="h-3.5 w-3.5" />
                                        <span>Assigned to Me</span>
                                    </div>
                                    <span className="text-[10px] opacity-80">{counts.assigned}</span>
                                </button>

                                <button
                                    onClick={() => setFolder("starred")}
                                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                        folder === "starred"
                                            ? "bg-primary text-primary-foreground shadow-2xs"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <Star className="h-3.5 w-3.5 text-amber-500" />
                                        <span>Starred / Flagged</span>
                                    </div>
                                    <span className="text-[10px] opacity-80">{counts.starred}</span>
                                </button>

                                <button
                                    onClick={() => setFolder("archived")}
                                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                        folder === "archived"
                                            ? "bg-primary text-primary-foreground shadow-2xs"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <Archive className="h-3.5 w-3.5" />
                                        <span>Archived</span>
                                    </div>
                                    <span className="text-[10px] opacity-80">{counts.archived}</span>
                                </button>
                            </div>
                        </div>

                        {/* Channels Filter */}
                        <div className="pt-2 border-t border-border/60">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2">
                                Channels
                            </span>
                            <div className="mt-1.5 space-y-1">
                                {[
                                    { id: "all", label: "All Channels", icon: Filter, color: "text-muted-foreground" },
                                    { id: "whatsapp", label: "WhatsApp", icon: MessageSquare, color: "text-emerald-500" },
                                    { id: "email", label: "Email", icon: Mail, color: "text-blue-500" },
                                    { id: "sms", label: "SMS", icon: Phone, color: "text-purple-500" },
                                    { id: "internal", label: "Internal Notes", icon: FileText, color: "text-amber-500" },
                                ].map(ch => {
                                    const IconComponent = ch.icon
                                    const isCurrent = channelFilter === ch.id
                                    return (
                                        <button
                                            key={ch.id}
                                            onClick={() => setChannelFilter(ch.id as any)}
                                            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                                                isCurrent
                                                    ? "bg-card text-foreground font-bold shadow-2xs border border-border"
                                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                            }`}
                                        >
                                            <IconComponent className={`h-3.5 w-3.5 ${ch.color}`} />
                                            <span>{ch.label}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Staff Assignee Filter */}
                        <div className="pt-2 border-t border-border/60">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2">
                                Staff Member
                            </span>
                            <div className="mt-1.5 space-y-1">
                                <button
                                    onClick={() => setStaffFilter("all")}
                                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                                        staffFilter === "all" ? "bg-card font-bold border border-border text-foreground" : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    All Staff
                                </button>
                                {CLINIC_STAFF.map(staff => (
                                    <button
                                        key={staff.id}
                                        onClick={() => setStaffFilter(staff.name)}
                                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer truncate ${
                                            staffFilter === staff.name ? "bg-card font-bold border border-border text-primary" : "text-muted-foreground hover:text-foreground"
                                        }`}
                                    >
                                        {staff.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Quick Profile Summary Footer */}
                    <div className="p-2 rounded-xl bg-card border border-border/80 flex items-center gap-2 shadow-2xs mt-4">
                        <div className="h-7 w-7 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                            PS
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-bold truncate">{currentUser}</p>
                            <p className="text-[9px] text-muted-foreground truncate">Lead Physiotherapist</p>
                        </div>
                    </div>
                </div>

                {/* 2. Middle Thread List (4 cols on lg, 4 on md) */}
                <div className="col-span-1 md:col-span-4 lg:col-span-4 border-r border-slate-200 dark:border-slate-800 bg-card flex flex-col overflow-hidden">
                    {/* Search & Mini Filters Bar with Gray Tone */}
                    <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/70 space-y-2">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                                placeholder="Search by patient, phone, or message..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-8.5 pl-8 text-xs bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-lg shadow-xs"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Mobile Folder Selector */}
                        <div className="flex md:hidden items-center gap-1 overflow-x-auto no-scrollbar py-1">
                            {(["all", "unread", "assigned", "starred", "archived"] as FilterFolder[]).map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFolder(f)}
                                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold capitalize whitespace-nowrap cursor-pointer ${
                                        folder === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                    }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Thread Cards List */}
                    <div className="flex-1 overflow-y-auto divide-y divide-border/40">
                        {filteredThreads.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground space-y-2">
                                <MessageSquare className="h-8 w-8 mx-auto opacity-30" />
                                <p className="text-xs font-semibold">No conversations match your filter</p>
                                <p className="text-[11px] text-muted-foreground">Try clearing search or switching folder tabs.</p>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => { setFolder("all"); setChannelFilter("all"); setSearchQuery(""); }}
                                    className="h-7 text-xs rounded-lg mt-2"
                                >
                                    Reset Filters
                                </Button>
                            </div>
                        ) : (
                            filteredThreads.map(thread => {
                                const isSelected = selectedThread?.id === thread.id
                                const isUnread = thread.unreadCount > 0

                                return (
                                    <div
                                        key={thread.id}
                                        onClick={() => handleSelectThread(thread)}
                                        className={`p-3.5 transition-all cursor-pointer flex flex-col gap-1.5 relative border-l-[3px] hover:bg-muted/50 ${
                                            isSelected
                                                ? "bg-primary/10 dark:bg-primary/15 border-l-primary"
                                                : isUnread
                                                ? "bg-card border-l-blue-500 font-semibold"
                                                : "border-l-transparent"
                                        }`}
                                    >
                                        {/* Card Header */}
                                        <div className="flex items-center justify-between gap-1">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center font-bold text-[11px] text-foreground border border-border/80 shrink-0">
                                                    {thread.patientContext.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                                                </div>
                                                <div className="min-w-0">
                                                    <span className={`text-xs truncate block ${isUnread ? "font-bold text-foreground" : "font-medium text-foreground"}`}>
                                                        {thread.patientContext.name}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1 shrink-0">
                                                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                    {thread.updatedAt}
                                                </span>
                                                <button
                                                    onClick={(e) => handleToggleStar(thread.id, e)}
                                                    className="text-muted-foreground hover:text-amber-500 cursor-pointer p-0.5"
                                                    title={thread.isStarred ? "Unstar" : "Star"}
                                                >
                                                    <Star className={`h-3 w-3 ${thread.isStarred ? "fill-amber-400 text-amber-500" : "opacity-40"}`} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Subject / Snippet */}
                                        <div className="pl-9 space-y-1">
                                            {thread.subject && (
                                                <p className="text-[11px] font-semibold text-foreground truncate">
                                                    {thread.subject}
                                                </p>
                                            )}
                                            <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                                                {thread.snippet}
                                            </p>
                                        </div>

                                        {/* Badges & Assignment Pill */}
                                        <div className="pl-9 pt-1 flex items-center justify-between gap-1">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                {getChannelBadge(thread.channel)}
                                                {thread.isUrgent && (
                                                    <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 border border-rose-200 dark:border-rose-900">
                                                        <AlertCircle className="h-2.5 w-2.5" /> Urgent
                                                    </span>
                                                )}
                                                <span className="text-[10px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded-md truncate max-w-[120px]">
                                                    👤 {thread.assignedStaff.replace("Dr. ", "")}
                                                </span>
                                            </div>

                                            {isUnread && (
                                                <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                                            )}
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>

                {/* 3. Right Conversation & Clinical Context Detail Pane (6 cols on lg, 5 on md) */}
                <div className="col-span-1 md:col-span-5 lg:col-span-6 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col overflow-hidden">
                    {selectedThread ? (
                        <>
                            {/* Patient Clinical Context Banner Header with Gray Tone */}
                            <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-100/90 via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 shadow-xs space-y-3 shrink-0">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 text-primary flex items-center justify-center font-bold text-sm border border-primary/20 shadow-2xs shrink-0">
                                            {selectedThread.patientContext.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                                                    {selectedThread.patientContext.name}
                                                </h3>
                                                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300/60 dark:border-slate-700 font-semibold">
                                                    {selectedThread.patientContext.patientId}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                                                <span>{selectedThread.patientContext.age}y • {selectedThread.patientContext.gender}</span>
                                                <span>•</span>
                                                <span>{selectedThread.patientContext.phone}</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Buttons Header */}
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleToggleStar(selectedThread.id)}
                                            className="h-8 w-8 rounded-lg cursor-pointer text-muted-foreground hover:text-amber-500"
                                            title={selectedThread.isStarred ? "Unstar" : "Star message"}
                                        >
                                            <Star className={`h-4 w-4 ${selectedThread.isStarred ? "fill-amber-400 text-amber-500" : ""}`} />
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleToggleArchive(selectedThread.id)}
                                            className="h-8 w-8 rounded-lg cursor-pointer text-muted-foreground hover:text-foreground"
                                            title={selectedThread.isArchived ? "Restore to Inbox" : "Archive Conversation"}
                                        >
                                            {selectedThread.isArchived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                                        </Button>

                                        {/* Assign Staff Dropdown */}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 text-xs font-semibold gap-1.5 rounded-lg border-border cursor-pointer"
                                                >
                                                    <UserCheck className="h-3.5 w-3.5 text-primary" />
                                                    <span className="hidden sm:inline">{selectedThread.assignedStaff}</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-56 rounded-xl p-1.5">
                                                <DropdownMenuLabel className="text-xs font-bold text-muted-foreground uppercase px-2 py-1">
                                                    Assign Conversation
                                                </DropdownMenuLabel>
                                                <DropdownMenuSeparator className="my-1" />
                                                {CLINIC_STAFF.map(staff => (
                                                    <DropdownMenuItem
                                                        key={staff.id}
                                                        onClick={() => handleAssignStaff(selectedThread.id, staff.name)}
                                                        className={`text-xs font-medium rounded-lg cursor-pointer flex items-center justify-between ${
                                                            selectedThread.assignedStaff === staff.name ? "bg-primary/10 text-primary font-bold" : ""
                                                        }`}
                                                    >
                                                        <span>{staff.name}</span>
                                                        {selectedThread.assignedStaff === staff.name && <Check className="h-3.5 w-3.5 text-primary" />}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>

                                {/* Clinical Quick Context Alert Bar */}
                                <div className="p-2.5 rounded-xl bg-slate-200/60 dark:bg-slate-800/60 border border-slate-300/70 dark:border-slate-700/70 flex items-center justify-between gap-3 text-xs shadow-2xs">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className="h-6 w-6 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold">
                                            🩺
                                        </div>
                                        <div className="min-w-0">
                                            <span className="text-slate-900 dark:text-slate-100 font-bold truncate block">
                                                {selectedThread.patientContext.condition}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground">
                                                Next Slot: <strong className="text-slate-800 dark:text-slate-200">{selectedThread.patientContext.nextAppointment}</strong> • Therapist: {selectedThread.patientContext.assignedDoctor}
                                            </span>
                                        </div>
                                    </div>

                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => router.push(`/c/${company}/dashboard/patient-management/patients`)}
                                        className="h-7 px-2.5 text-[11px] font-semibold gap-1 rounded-lg cursor-pointer border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-xs shrink-0"
                                    >
                                        <span>Patient Dossier</span>
                                        <ExternalLink className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>

                            {/* Message History Feed */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {selectedThread.messages.map(msg => {
                                    const isInternal = msg.channel === "internal"

                                    if (isInternal) {
                                        return (
                                            <div
                                                key={msg.id}
                                                className="p-3.5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 shadow-2xs space-y-1.5"
                                            >
                                                <div className="flex items-center justify-between text-xs">
                                                    <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400">
                                                        <Lock className="h-3.5 w-3.5" />
                                                        <span>Internal Clinical Staff Note • {msg.senderName}</span>
                                                    </div>
                                                    <span className="text-[10px] text-amber-600/80 dark:text-amber-400/70">
                                                        {msg.timestamp}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-amber-950 dark:text-amber-200 whitespace-pre-wrap leading-relaxed">
                                                    {msg.content}
                                                </p>
                                            </div>
                                        )
                                    }

                                    return (
                                        <div
                                            key={msg.id}
                                            className={`flex flex-col ${msg.isOutgoing ? "items-end" : "items-start"}`}
                                        >
                                            <div
                                                className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl shadow-2xs space-y-1.5 ${
                                                    msg.isOutgoing
                                                        ? "bg-primary text-primary-foreground rounded-br-xs"
                                                        : "bg-card border border-border text-foreground rounded-bl-xs"
                                                }`}
                                            >
                                                {/* Header in bubble */}
                                                <div className="flex items-center justify-between gap-2 text-[10px] opacity-80 mb-0.5">
                                                    <span className="font-semibold">{msg.senderName}</span>
                                                    <span>{msg.timestamp}</span>
                                                </div>

                                                {/* Bubble Content */}
                                                <p className="text-xs whitespace-pre-wrap leading-relaxed">
                                                    {msg.content}
                                                </p>

                                                {/* Attachments if any */}
                                                {msg.attachments && msg.attachments.length > 0 && (
                                                    <div className="pt-1.5 space-y-1">
                                                        {msg.attachments.map((att, i) => (
                                                            <div
                                                                key={i}
                                                                className={`p-2 rounded-xl flex items-center gap-2 text-xs border ${
                                                                    msg.isOutgoing
                                                                        ? "bg-white/10 border-white/20 text-white"
                                                                        : "bg-muted/80 border-border text-foreground"
                                                                }`}
                                                            >
                                                                <Paperclip className="h-3.5 w-3.5 shrink-0" />
                                                                <span className="truncate flex-1 font-medium">{att.name}</span>
                                                                <span className="text-[10px] opacity-80">{att.size}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Status checks for outgoing */}
                                                {msg.isOutgoing && msg.status && (
                                                    <div className="flex justify-end pt-0.5">
                                                        {msg.status === "read" && <CheckCheck className="h-3 w-3 text-sky-200" />}
                                                        {msg.status === "delivered" && <CheckCheck className="h-3 w-3 opacity-70" />}
                                                        {msg.status === "sent" && <Check className="h-3 w-3 opacity-70" />}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Reply & Quick Composer Box */}
                            <div className="p-3.5 border-t border-border bg-card shadow-xs space-y-2.5 shrink-0">
                                {/* Mode Toggle & Canned Template Pill Selector */}
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                    <div className="flex items-center p-0.5 rounded-lg bg-muted border border-border">
                                        <button
                                            type="button"
                                            onClick={() => setReplyMode("reply")}
                                            className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                                                replyMode === "reply"
                                                    ? "bg-card text-foreground shadow-2xs font-bold"
                                                    : "text-muted-foreground hover:text-foreground"
                                            }`}
                                        >
                                            {getChannelIcon(selectedThread.channel, "h-3 w-3")}
                                            <span>Reply via {selectedThread.channel.toUpperCase()}</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setReplyMode("internal")}
                                            className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                                                replyMode === "internal"
                                                    ? "bg-amber-500 text-white shadow-2xs font-bold"
                                                    : "text-muted-foreground hover:text-foreground"
                                            }`}
                                        >
                                            <Lock className="h-3 w-3" />
                                            <span>Internal Staff Note</span>
                                        </button>
                                    </div>

                                    {/* Canned Templates Dropdown */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-7 px-2 text-[11px] font-semibold gap-1 rounded-lg border-border cursor-pointer hover:bg-muted"
                                            >
                                                <Sparkles className="h-3 w-3 text-amber-500" />
                                                <span>Quick Templates</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-64 rounded-xl p-1.5">
                                            <DropdownMenuLabel className="text-xs font-bold text-muted-foreground uppercase px-2 py-1">
                                                Canned Clinical Responses
                                            </DropdownMenuLabel>
                                            <DropdownMenuSeparator className="my-1" />
                                            {CANNED_TEMPLATES.map(tpl => (
                                                <DropdownMenuItem
                                                    key={tpl.id}
                                                    onClick={() => handleInsertCanned(tpl)}
                                                    className="text-xs font-medium rounded-lg cursor-pointer flex flex-col items-start gap-0.5 p-2"
                                                >
                                                    <span className="font-bold text-foreground">{tpl.title}</span>
                                                    <span className="text-[10px] text-muted-foreground line-clamp-1">{tpl.content}</span>
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                {/* Text Form */}
                                <form onSubmit={handleSendReply} className="space-y-2">
                                    <div className="relative">
                                        <textarea
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            placeholder={
                                                replyMode === "internal"
                                                    ? "Add a private clinical handoff note (type @ to mention a doctor)..."
                                                    : `Type your reply to ${selectedThread.patientContext.name} via ${selectedThread.channel}...`
                                            }
                                            rows={3}
                                            className={`w-full text-xs p-3 rounded-xl border bg-muted/20 focus:bg-background focus:outline-none focus:ring-1 transition-all resize-none ${
                                                replyMode === "internal"
                                                    ? "border-amber-300 focus:ring-amber-500 bg-amber-50/20"
                                                    : "border-border focus:ring-primary"
                                            }`}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-muted border text-[9px] font-mono">Send</kbd> to dispatch</span>
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={!replyText.trim() || isSending}
                                            className={`h-8 px-4 text-xs font-semibold gap-1.5 rounded-xl cursor-pointer ${
                                                replyMode === "internal"
                                                    ? "bg-amber-600 hover:bg-amber-700 text-white"
                                                    : "bg-primary hover:bg-primary/90 text-primary-foreground"
                                            }`}
                                        >
                                            {isSending ? (
                                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                                <Send className="h-3.5 w-3.5" />
                                            )}
                                            <span>{replyMode === "internal" ? "Add Note" : "Send Reply"}</span>
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                            <MessageSquare className="h-12 w-12 opacity-20 mb-3" />
                            <h4 className="text-sm font-bold text-foreground">No Conversation Selected</h4>
                            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                                Select a thread from the left list to view message history, patient context, or send a reply.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
