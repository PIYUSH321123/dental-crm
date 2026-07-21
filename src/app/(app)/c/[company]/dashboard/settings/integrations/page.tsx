"use client"

import * as React from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { 
    CheckCircle2, 
    AlertCircle, 
    ExternalLink, 
    RefreshCw, 
    Settings, 
    Plus, 
    Trash2, 
    HelpCircle, 
    Sliders,
    Search,
    ToggleLeft,
    ToggleRight,
    Loader2,
    Calendar,
    ArrowRight,
    Shield,
    Database,
    LineChart
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { toast } from "sonner"
import {
    getIntegrationsAction,
    disconnectIntegrationAction,
    toggleIntegrationSyncAction,
    saveMockIntegrationAction
} from "@/lib/actions/integrations"

interface AdProvider {
    id: "meta" | "google" | "youtube"
    name: string
    logoColor: string
    bgLight: string
    description: string
    scopes: string[]
    features: string[]
    docUrl: string
}

const AD_PROVIDERS: AdProvider[] = [
    {
        id: "meta",
        name: "Meta Ads (Facebook & Instagram)",
        logoColor: "#1877F2",
        bgLight: "rgba(24, 119, 242, 0.08)",
        description: "Sync Meta Lead Ads forms directly to Sales Guru pipelines. Automate WhatsApp outreach for new Instagram/Facebook leads.",
        scopes: ["ads_management", "leads_retrieval", "pages_manage_metadata", "pages_show_list", "pages_read_engagement"],
        features: ["Real-time Lead Form Syncing", "Instagram Direct Messaging Automation", "Web Conversion Pixel Tracking"],
        docUrl: "https://developers.facebook.com/docs/marketing-apis"
    },
    {
        id: "google",
        name: "Google Ads",
        logoColor: "#EA4335",
        bgLight: "rgba(234, 67, 53, 0.08)",
        description: "Track Google Search & Display ad conversions. Push offline patient conversions back to Google Ads for smarter bidding.",
        scopes: ["google_ads_management", "conversions_upload", "analytics_readonly"],
        features: ["Offline Patient Conversion Uploads", "Search Ads CPC & ROI Dashboard", "Smart Bidding Optimization Feed"],
        docUrl: "https://developers.google.com/google-ads/api/docs/start"
    },
    {
        id: "youtube",
        name: "YouTube Ads",
        logoColor: "#FF0000",
        bgLight: "rgba(255, 0, 0, 0.08)",
        description: "Monitor video campaign performance, viewer engagement, and call-to-action clicks in real time.",
        scopes: ["youtube_readonly", "youtube_analytics"],
        features: ["In-video CTA Click Tracking", "Video Retention & Engagement Charts", "Audience Demographics Synced Reports"],
        docUrl: "https://developers.google.com/youtube/v3/docs"
    }
]

interface ConnectedAccount {
    id: string
    accountId: string
    accountName: string
    connectedAt: string
    syncEnabled: boolean
    leadsSyncedCount: number
    spendTracked: string
}

interface IntegrationLog {
    timestamp: string
    provider: "meta" | "google" | "youtube"
    event: string
    status: "success" | "warning" | "error"
}

export default function IntegrationsPage() {
    const params = useParams()
    const router = useRouter()
    const searchParams = useSearchParams()
    
    const companySlug = (Array.isArray(params.company) ? params.company[0] : params.company) || "clinic"
    
    // Connection State
    const [connections, setConnections] = React.useState<Record<string, ConnectedAccount>>({})
    const [isLoading, setIsLoading] = React.useState(true)

    // Active OAuth simulation modal
    const [oauthProvider, setOauthProvider] = React.useState<AdProvider | null>(null)
    const [linkingStep, setLinkingStep] = React.useState<"consent" | "authenticating" | "select-account">("consent")
    const [selectedOauthAccount, setSelectedOauthAccount] = React.useState<string>("")
    const [isRefreshing, setIsRefreshing] = React.useState(false)

    // Log tracking
    const [logs, setLogs] = React.useState<IntegrationLog[]>([
        { timestamp: "2 mins ago", provider: "meta", event: "Webhook lead Ravi Kumar (P-0142) synced successfully", status: "success" },
        { timestamp: "45 mins ago", provider: "google", event: "Uploaded offline conversion for Meera Shah (P-0141)", status: "success" },
        { timestamp: "3 hours ago", provider: "meta", event: "Instagram Direct Ad form hook registered successfully", status: "success" },
        { timestamp: "5 hours ago", provider: "youtube", event: "Video campaign performance metrics synced (124 clicks)", status: "success" }
    ])

    // Load active connections from database on mount
    React.useEffect(() => {
        let isMounted = true
        setIsLoading(true)
        getIntegrationsAction(companySlug)
            .then((res) => {
                if (isMounted) {
                    if (res.success) {
                        const mapped: Record<string, ConnectedAccount> = {}
                        res.data.forEach((item) => {
                            mapped[item.id] = item
                        })
                        setConnections(mapped)
                    } else {
                        toast.error(res.error || "Failed to load integrations from database.")
                    }
                }
            })
            .catch((err) => {
                if (isMounted) {
                    toast.error("An error occurred while loading integrations.")
                }
            })
            .finally(() => {
                if (isMounted) {
                    setIsLoading(false)
                }
            })

        return () => {
            isMounted = false
        }
    }, [companySlug])

    // Check URL parameters for OAuth status toast
    React.useEffect(() => {
        const success = searchParams.get("success")
        const error = searchParams.get("error")

        if (success === "meta") {
            toast.success("Meta Ads (Facebook & Instagram) connected successfully!")
            // Remove parameters from URL bar cleanly
            router.replace(`/c/${companySlug}/dashboard/settings/integrations`)
        } else if (error) {
            toast.error(`Meta Ads connection failed: ${error.replace(/_/g, " ")}`)
            router.replace(`/c/${companySlug}/dashboard/settings/integrations`)
        }
    }, [searchParams, companySlug, router])

    // Trigger OAuth Flow or redirection
    const handleConnectClick = (provider: AdProvider) => {
        if (provider.id === "meta") {
            // Redirect to backend OAuth route
            window.location.href = `/api/integrations/meta/auth?company=${companySlug}`
        } else {
            // Simulated local flow for google / youtube
            setOauthProvider(provider)
            setLinkingStep("consent")
            setSelectedOauthAccount("")
        }
    }

    // Grant simulated credentials
    const handleConfirmConsent = () => {
        setLinkingStep("authenticating")
        setTimeout(() => {
            setLinkingStep("select-account")
            // Prefill standard mock accounts depending on provider
            if (oauthProvider?.id === "google") {
                setSelectedOauthAccount("YogaPlus Main Ads Account (CID: 481-923-1029)")
            } else {
                setSelectedOauthAccount("Wayne Rehab Channel Ads (CH-ID: YT-9201384)")
            }
        }, 1200)
    }

    // Complete connection for simulated providers, saving them in DB
    const handleFinalizeConnection = async () => {
        if (!oauthProvider) return
        
        setIsRefreshing(true)
        const res = await saveMockIntegrationAction(
            companySlug,
            oauthProvider.id,
            selectedOauthAccount,
            oauthProvider.id === "google" ? "CID-481-923-1029" : "YT-9201384"
        )
        setIsRefreshing(false)

        if (res.success) {
            setConnections(prev => ({ ...prev, [oauthProvider.id]: res.data }))
            toast.success(`${oauthProvider.name} connected successfully!`)
            
            // Add connection log
            setLogs(prev => [
                {
                    timestamp: "Just now",
                    provider: oauthProvider.id,
                    event: `Authorized connection to ${oauthProvider.name} (${res.data.accountId})`,
                    status: "success"
                },
                ...prev
            ])
        } else {
            toast.error(res.error || "Failed to link provider to database.")
        }
        setOauthProvider(null)
    }

    // Disconnect Integration from Database
    const handleDisconnect = async (id: string) => {
        const res = await disconnectIntegrationAction(companySlug, id)
        
        if (res.success) {
            setConnections(prev => {
                const updated = { ...prev }
                delete updated[id]
                return updated
            })

            setLogs(prev => [
                {
                    timestamp: "Just now",
                    provider: id as any,
                    event: `Disconnected integration for ${id.toUpperCase()} Ads`,
                    status: "warning"
                },
                ...prev
            ])

            toast.info(`Disconnected integration. Credentials revoked.`)
        } else {
            toast.error(res.error || "Failed to disconnect integration.")
        }
    }

    // Toggle Sync in Database
    const handleToggleSync = async (id: string) => {
        const conn = connections[id]
        if (!conn) return

        const nextSyncState = !conn.syncEnabled
        const res = await toggleIntegrationSyncAction(companySlug, id, nextSyncState)

        if (res.success) {
            setConnections(prev => {
                if (!prev[id]) return prev
                return {
                    ...prev,
                    [id]: { ...prev[id], syncEnabled: nextSyncState }
                }
            })
            toast.info(`Real-time sync ${nextSyncState ? 'enabled' : 'paused'} for ${id.toUpperCase()}`)
        } else {
            toast.error(res.error || "Failed to toggle sync state.")
        }
    }

    // Refresh simulation
    const handleRefreshAll = () => {
        setIsRefreshing(true)
        setTimeout(() => {
            setIsRefreshing(false)
            toast.success("Synchronized advertising metrics and lead forms successfully!")
            
            // Add refresh sync log
            setLogs(prev => [
                {
                    timestamp: "Just now",
                    provider: "meta",
                    event: "Manually refreshed webhook sync. Zero unresolved errors.",
                    status: "success"
                },
                ...prev
            ])
        }, 1000)
    }

    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col justify-center items-center h-[50vh] gap-3">
                <Loader2 className="h-8 w-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
                <span className="text-sm font-semibold text-slate-500">Loading active integrations...</span>
            </div>
        )
    }

    return (
        <div className="flex-1 p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Integrations & Linked Apps</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Connect your advertising accounts to sync lead forms, track campaign spending, and map patient conversions.
                    </p>
                </div>
                <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleRefreshAll}
                    disabled={isRefreshing}
                    className="gap-2 border-slate-300 dark:border-slate-700 font-semibold text-xs"
                >
                    <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                    Sync Active Channels
                </Button>
            </div>

            {/* Layout Grid: 3 Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {AD_PROVIDERS.map((provider) => {
                    const conn = connections[provider.id]
                    const isConnected = !!conn

                    return (
                        <Card 
                            key={provider.id} 
                            className={`flex flex-col justify-between border shadow-xs relative overflow-hidden transition-all duration-200 hover:shadow-md ${
                                isConnected 
                                    ? "border-emerald-500/30 dark:border-emerald-500/20 bg-emerald-50/10 dark:bg-emerald-950/5" 
                                    : "border-slate-200 dark:border-slate-800"
                            }`}
                        >
                            {/* Decorative Brand Light Circle */}
                            <div 
                                className="absolute top-0 right-0 w-24 h-24 rounded-full blur-[40px] pointer-events-none transition-all duration-500" 
                                style={{ backgroundColor: provider.logoColor, opacity: isConnected ? 0.08 : 0.03 }}
                            />

                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    {/* Icon Box */}
                                    <div 
                                        className="h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-200"
                                        style={{ backgroundColor: provider.bgLight }}
                                    >
                                        {/* Custom high-res SVG brand logos for ultimate premium feel */}
                                        {provider.id === "meta" && (
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M16.5 6C14.73 6 13.2 7.02 12 8.44C10.8 7.02 9.27 6 7.5 6C4.46 6 2 8.46 2 11.5C2 14.54 4.46 17 7.5 17C9.27 17 10.8 15.98 12 14.56C13.2 15.98 14.73 17 16.5 17C19.54 17 22 14.54 22 11.5C22 8.46 19.54 6 16.5 6ZM7.5 15.2C5.46 15.2 3.8 13.54 3.8 11.5C3.8 9.46 5.46 7.8 7.5 7.8C8.92 7.8 10.15 8.78 10.95 9.87C10.15 10.96 8.92 11.94 7.5 11.94C7.5 11.94 7.5 15.2 7.5 15.2ZM16.5 15.2C15.08 15.2 13.85 14.22 13.05 13.13C13.85 12.04 15.08 11.06 16.5 11.06C18.54 11.06 20.2 12.72 20.2 14.76C20.2 16.8 18.54 15.2 16.5 15.2Z" fill={provider.logoColor}/>
                                            </svg>
                                        )}
                                        {provider.id === "google" && (
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
                                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                            </svg>
                                        )}
                                        {provider.id === "youtube" && (
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.507a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.507 9.388.507 9.388.507s7.517 0 9.388-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill={provider.logoColor}/>
                                            </svg>
                                        )}
                                    </div>

                                    {/* Connection Status Badge */}
                                    {isConnected ? (
                                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 dark:text-emerald-450 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full">
                                            <CheckCircle2 className="h-3 w-3" /> Connected
                                        </span>
                                    ) : (
                                        <span className="text-[11px] font-bold text-slate-500 bg-slate-100 dark:text-slate-400 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                                            Not Connected
                                        </span>
                                    )}
                                </div>

                                <CardTitle className="text-sm font-bold mt-4 text-slate-850 dark:text-slate-100">
                                    {provider.name}
                                </CardTitle>
                                <CardDescription className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1.5 h-12">
                                    {provider.description}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="py-2 border-t border-slate-100 dark:border-slate-800/80">
                                {isConnected ? (
                                    /* Active Connection Metrics & Config */
                                    <div className="space-y-3.5 my-2">
                                        <div className="bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-850 p-2.5 rounded-lg text-xs space-y-1.5 shadow-2xs">
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Account:</span>
                                                <strong className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                                                    {conn.accountName}
                                                </strong>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Spend Sync:</span>
                                                <strong className="font-semibold text-slate-800 dark:text-slate-200">
                                                    {conn.spendTracked}
                                                </strong>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Connected on:</span>
                                                <span className="text-slate-600 dark:text-slate-350">{conn.connectedAt}</span>
                                            </div>
                                        </div>

                                        {/* Toggle Sync Feature */}
                                        <div className="flex items-center justify-between py-1.5">
                                            <div className="flex items-center gap-1.5">
                                                <Sliders className="h-3.5 w-3.5 text-slate-400" />
                                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Sync Active Campaigns</span>
                                            </div>
                                            <button 
                                                onClick={() => handleToggleSync(provider.id)}
                                                className="focus:outline-none"
                                            >
                                                {conn.syncEnabled ? (
                                                    <ToggleRight className="h-6 w-6 text-emerald-600 cursor-pointer" />
                                                ) : (
                                                    <ToggleLeft className="h-6 w-6 text-slate-400 cursor-pointer" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    /* Key Integrations Features list */
                                    <div className="space-y-2 my-3">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Available Features</span>
                                        <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-450 font-medium">
                                            {provider.features.map((feat, idx) => (
                                                <li key={idx} className="flex items-center gap-2">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                                    {feat}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </CardContent>

                            <CardFooter className="bg-slate-50/50 dark:bg-slate-900/10 p-4 border-t border-slate-100 dark:border-slate-800/80 flex gap-2">
                                {isConnected ? (
                                    <>
                                        <Button 
                                            variant="destructive" 
                                            size="sm"
                                            onClick={() => handleDisconnect(provider.id)}
                                            className="flex-1 font-bold h-8 text-xs cursor-pointer rounded-lg"
                                        >
                                            <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Revoke
                                        </Button>
                                        <a 
                                            href={provider.docUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="flex items-center justify-center p-2 rounded-lg border border-slate-300 dark:border-slate-750 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-450 transition-colors h-8"
                                        >
                                            <HelpCircle className="h-4 w-4" />
                                        </a>
                                    </>
                                ) : (
                                    <Button 
                                        onClick={() => handleConnectClick(provider)}
                                        className="w-full font-bold h-8 text-xs bg-slate-900 dark:bg-slate-100 hover:bg-slate-850 dark:hover:bg-slate-200 text-white dark:text-slate-950 cursor-pointer rounded-lg gap-1.5"
                                    >
                                        <Plus className="h-3.5 w-3.5" /> Connect Provider
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    )
                })}
            </div>

            {/* Bottom section: Audit logs & Help Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
                {/* System Activity / Audit Log */}
                <Card className="lg:col-span-2 border border-slate-200 dark:border-slate-800 shadow-xs">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800 p-4 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Database className="h-4 w-4 text-primary" /> Sync Activity Logs
                            </CardTitle>
                            <CardDescription className="text-xs text-slate-500">
                                Real-time webhooks, conversions uploads, and data fetching logs.
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-100 dark:divide-slate-850 max-h-60 overflow-y-auto">
                            {logs.map((log, idx) => (
                                <div key={idx} className="flex justify-between items-center p-3 text-xs">
                                    <div className="flex items-center gap-2.5">
                                        <span className={`h-2.5 w-2.5 rounded-full ${
                                            log.status === "success" ? "bg-emerald-500" : log.status === "warning" ? "bg-amber-500" : "bg-red-500"
                                        }`} />
                                        <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-400 w-16">
                                            {log.provider}
                                        </span>
                                        <span className="text-slate-650 dark:text-slate-350">{log.event}</span>
                                    </div>
                                    <span className="text-slate-450 dark:text-slate-500 text-[10px] shrink-0 font-medium">
                                        {log.timestamp}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* API & Developer Info Box */}
                <Card className="border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                    <CardHeader className="p-4">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <Shield className="h-4 w-4 text-primary" /> API Security & Consent
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-500 mt-1 leading-relaxed">
                            Sales Guru uses secure OAuth2 protocols to access advertising data. We never store password credentials; token storage is encrypted and tokens can be revoked at any time.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-3 rounded-lg text-xs space-y-2">
                            <div className="flex gap-2 items-center">
                                <LineChart className="h-4 w-4 text-indigo-500 shrink-0" />
                                <span className="font-semibold text-slate-800 dark:text-slate-200">Webhook Status:</span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold ml-auto">Active</span>
                            </div>
                            <p className="text-[10px] text-slate-500 leading-normal">
                                Real-time webhooks receive FB lead details within 12 seconds of form completion.
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-slate-50/50 dark:bg-slate-900/10 p-3 border-t border-slate-100 dark:border-slate-850 flex justify-between">
                        <span className="text-[10px] text-slate-500">Need direct token support?</span>
                        <a 
                            href="#" 
                            onClick={(e) => { e.preventDefault(); toast.info("Opening Developer API settings...") }}
                            className="text-[10px] font-bold text-indigo-650 hover:underline flex items-center gap-0.5"
                        >
                            Developer API <ArrowRight className="h-3 w-3" />
                        </a>
                    </CardFooter>
                </Card>
            </div>

            {/* MOCK OAUTH CONSENT OVERLAY MODAL */}
            {oauthProvider && (
                <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        {/* Modal Header */}
                        <div className="p-5 border-b border-slate-100 dark:border-slate-850 flex items-center gap-3">
                            <div 
                                className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
                                style={{ backgroundColor: oauthProvider.bgLight }}
                            >
                                {oauthProvider.id === "meta" && (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M16.5 6C14.73 6 13.2 7.02 12 8.44C10.8 7.02 9.27 6 7.5 6C4.46 6 2 8.46 2 11.5C2 14.54 4.46 17 7.5 17C9.27 17 10.8 15.98 12 14.56C13.2 15.98 14.73 17 16.5 17C19.54 17 22 14.54 22 11.5C22 8.46 19.54 6 16.5 6ZM7.5 15.2C5.46 15.2 3.8 13.54 3.8 11.5C3.8 9.46 5.46 7.8 7.5 7.8C8.92 7.8 10.15 8.78 10.95 9.87C10.15 10.96 8.92 11.94 7.5 11.94C7.5 11.94 7.5 15.2 7.5 15.2ZM16.5 15.2C15.08 15.2 13.85 14.22 13.05 13.13C13.85 12.04 15.08 11.06 16.5 11.06C18.54 11.06 20.2 12.72 20.2 14.76C20.2 16.8 18.54 15.2 16.5 15.2Z" fill={oauthProvider.logoColor}/>
                                    </svg>
                                )}
                                {oauthProvider.id === "google" && (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                    </svg>
                                )}
                                {oauthProvider.id === "youtube" && (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.507a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.507 9.388.507 9.388.507s7.517 0 9.388-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill={oauthProvider.logoColor}/>
                                    </svg>
                                )}
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                                    Simulating OAuth Integration
                                </h3>
                                <p className="text-[10px] text-slate-500">
                                    Connecting to {oauthProvider.name}
                                </p>
                            </div>
                        </div>

                        {/* Modal Body depending on step */}
                        <div className="p-5 space-y-4">
                            {linkingStep === "consent" && (
                                <>
                                    <div className="space-y-2 text-xs">
                                        <span className="font-bold text-slate-450 uppercase tracking-widest text-[10px] block">
                                            Permissions requested
                                        </span>
                                        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg space-y-2">
                                            {oauthProvider.scopes.map((scope) => (
                                                <div key={scope} className="flex items-start gap-2">
                                                    <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500 mt-0.5 shrink-0" />
                                                    <div>
                                                        <span className="font-semibold block font-mono text-[10px] text-slate-800 dark:text-slate-250">
                                                            {scope}
                                                        </span>
                                                        <span className="text-[10px] text-slate-550 leading-normal block">
                                                            Allows Sales Guru to query and manage {scope.replace("_", " ")} endpoints.
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="text-[10px] text-slate-500 leading-normal border-t border-slate-100 dark:border-slate-850 pt-3">
                                        Clicking "Agree & Continue" redirects to the secure OAuth login callback. Sales Guru encrypts connection tokens in your clinic config database.
                                    </div>
                                </>
                            )}

                            {linkingStep === "authenticating" && (
                                <div className="h-44 flex flex-col justify-center items-center gap-3">
                                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                                    <span className="text-xs font-semibold text-slate-650 dark:text-slate-350">
                                        Verifying OAuth secure callback...
                                    </span>
                                </div>
                            )}

                            {linkingStep === "select-account" && (
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500">
                                            Select Associated Advertising Account
                                        </label>
                                        <select 
                                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-800 rounded-lg text-xs bg-slate-50 dark:bg-slate-950 font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
                                            value={selectedOauthAccount}
                                            onChange={(e) => setSelectedOauthAccount(e.target.value)}
                                        >
                                            <option value={selectedOauthAccount}>{selectedOauthAccount}</option>
                                            <option value="Alternate Sandbox Account (ID: Sandbox-2938)">Alternate Sandbox Account (ID: Sandbox-2938)</option>
                                        </select>
                                    </div>
                                    <div className="text-[10px] text-slate-500 leading-normal">
                                        Select the corporate ad account that contains the lead forms and campaigns for this clinic.
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-850 flex justify-end gap-2.5">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setOauthProvider(null)}
                                className="h-8 text-xs font-semibold"
                            >
                                Cancel
                            </Button>
                            {linkingStep === "consent" && (
                                <Button 
                                    onClick={handleConfirmConsent}
                                    className="h-8 text-xs font-bold bg-slate-900 hover:bg-slate-850 text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-950"
                                >
                                    Agree & Continue
                                </Button>
                            )}
                            {linkingStep === "select-account" && (
                                <Button 
                                    onClick={handleFinalizeConnection}
                                    className="h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-600"
                                >
                                    Confirm & Link
                                </Button>
                            )}
                        </div>
                    </Card>
                </div>
            )}
        </div>
    )
}
