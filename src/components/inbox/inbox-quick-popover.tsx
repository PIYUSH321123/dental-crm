"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import {
    MessageSquare,
    Mail,
    Phone,
    FileText,
    CheckCheck,
    Check,
    Star,
    AlertCircle,
    ArrowRight,
    Search,
    ExternalLink,
    Sparkles
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    InboxThread,
    getInboxThreads,
    saveInboxThreads,
    InboxChannel
} from "@/lib/inbox-data"

export function InboxQuickPopover() {
    const router = useRouter()
    const params = useParams()
    const company = (params?.company as string) || "clinic"

    const [threads, setThreads] = React.useState<InboxThread[]>([])
    const [isOpen, setIsOpen] = React.useState(false)

    const loadThreads = React.useCallback(() => {
        setThreads(getInboxThreads(company))
    }, [company])

    React.useEffect(() => {
        loadThreads()

        const handleUpdate = () => loadThreads()
        window.addEventListener("sg-inbox-updated", handleUpdate)
        window.addEventListener("storage", handleUpdate)
        return () => {
            window.removeEventListener("sg-inbox-updated", handleUpdate)
            window.removeEventListener("storage", handleUpdate)
        }
    }, [loadThreads])

    const unreadCount = threads.filter(t => !t.isArchived && t.unreadCount > 0).length
    const recentThreads = threads.filter(t => !t.isArchived).slice(0, 5) // Show top 5-6 messages/emails

    const handleMarkAllRead = (e: React.MouseEvent) => {
        e.stopPropagation()
        const updated = threads.map(t => ({ ...t, unreadCount: 0 }))
        setThreads(updated)
        saveInboxThreads(updated, company)
    }

    const handleOpenThread = (threadId: string) => {
        // Mark selected as read
        const updated = threads.map(t => t.id === threadId ? { ...t, unreadCount: 0 } : t)
        setThreads(updated)
        saveInboxThreads(updated, company)
        setIsOpen(false)
        router.push(`/c/${company}/dashboard/inbox?threadId=${threadId}`)
    }

    const handleViewAll = () => {
        setIsOpen(false)
        router.push(`/c/${company}/dashboard/inbox`)
    }

    const getChannelIcon = (channel: InboxChannel) => {
        switch (channel) {
            case "whatsapp":
                return <MessageSquare className="h-3 w-3 text-emerald-500" />
            case "email":
                return <Mail className="h-3 w-3 text-blue-500" />
            case "internal":
                return <FileText className="h-3 w-3 text-amber-500" />
            case "sms":
                return <Phone className="h-3 w-3 text-purple-500" />
        }
    }

    const getChannelLabel = (channel: InboxChannel) => {
        switch (channel) {
            case "whatsapp":
                return "WhatsApp"
            case "email":
                return "Email"
            case "internal":
                return "Internal Note"
            case "sms":
                return "SMS"
        }
    }

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <button
                    className="group relative h-7.5 px-2.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-200/80 dark:hover:bg-slate-700 cursor-pointer border border-slate-300 dark:border-slate-700 shadow-xs hover:text-primary active:scale-95"
                    title="Unified Message Inbox"
                >
                    <MessageSquare className="h-3.5 w-3.5 text-primary group-hover:scale-110 transition-transform" />
                    <span className="hidden sm:inline font-bold">Inbox</span>
                    {unreadCount > 0 && (
                        <span className="h-4 min-w-4 px-1 rounded-full bg-primary text-primary-foreground text-[9px] font-extrabold flex items-center justify-center animate-pulse shadow-xs">
                            {unreadCount}
                        </span>
                    )}
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="w-[360px] sm:w-[400px] p-0 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-50 animate-in fade-in-0 zoom-in-95 duration-150"
            >
                {/* Header with Gray Gradient Shades */}
                <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 dark:from-slate-800 dark:via-slate-800/90 dark:to-slate-900 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                            <MessageSquare className="h-4 w-4" />
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                Unified Inbox
                                {unreadCount > 0 && (
                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-primary/15 text-primary border-transparent">
                                        {unreadCount} new
                                    </Badge>
                                )}
                            </h4>
                            <p className="text-[10px] text-muted-foreground">WhatsApp, Email, SMS & Notes</p>
                        </div>
                    </div>

                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className="text-[11px] font-medium text-primary hover:underline cursor-pointer flex items-center gap-1"
                        >
                            <CheckCheck className="h-3 w-3" />
                            Mark all read
                        </button>
                    )}
                </div>

                {/* Recent Messages List (Shows 5-6 recent messages) */}
                <div className="max-h-[340px] overflow-y-auto divide-y divide-border/40">
                    {recentThreads.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
                            <p className="text-xs">No active messages in your inbox.</p>
                        </div>
                    ) : (
                        recentThreads.map((thread) => {
                            const isUnread = thread.unreadCount > 0
                            return (
                                <div
                                    key={thread.id}
                                    onClick={() => handleOpenThread(thread.id)}
                                    className={`p-3 transition-colors cursor-pointer flex items-start gap-3 hover:bg-muted/60 relative ${
                                        isUnread ? "bg-primary/5 dark:bg-primary/10" : ""
                                    }`}
                                >
                                    {/* Unread Accent Pill */}
                                    {isUnread && (
                                        <div className="absolute left-0 top-3 bottom-3 w-[3px] bg-primary rounded-r-full" />
                                    )}

                                    {/* Avatar with Channel Badge */}
                                    <div className="relative shrink-0 mt-0.5">
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center font-bold text-xs text-foreground border border-border/60 shadow-2xs">
                                            {thread.patientContext.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 h-4.5 w-4.5 rounded-full bg-card border border-border/80 flex items-center justify-center shadow-xs">
                                            {getChannelIcon(thread.channel)}
                                        </div>
                                    </div>

                                    {/* Message Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-1 mb-0.5">
                                            <span className={`text-xs truncate ${isUnread ? "font-bold text-foreground" : "font-medium text-foreground/90"}`}>
                                                {thread.patientContext.name}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground shrink-0 whitespace-nowrap">
                                                {thread.updatedAt}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1.5 mb-1">
                                            <span className="text-[10px] text-muted-foreground/90 font-medium px-1.5 py-0.2 bg-muted rounded border border-border/40">
                                                {getChannelLabel(thread.channel)}
                                            </span>
                                            {thread.isUrgent && (
                                                <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-1 rounded flex items-center gap-0.5">
                                                    <AlertCircle className="h-2.5 w-2.5" /> Urgent
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                                            {thread.subject ? <strong className="text-foreground/80">{thread.subject} - </strong> : null}
                                            {thread.snippet}
                                        </p>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>

                {/* Footer: View All Button */}
                <div className="p-2.5 bg-muted/30 border-t border-border/60 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-muted-foreground pl-1">
                        Showing recent {recentThreads.length} of {threads.length} threads
                    </span>
                    <Button
                        size="sm"
                        onClick={handleViewAll}
                        className="h-8 px-3 text-xs font-semibold gap-1.5 rounded-xl cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
                    >
                        <span>View All in Inbox</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
