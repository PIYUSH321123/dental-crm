"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
    User, 
    Mail, 
    Lock, 
    Eye, 
    EyeOff, 
    CheckCircle2, 
    ArrowRight, 
    ShieldCheck, 
    Sparkles 
} from "lucide-react"
import { useCompany } from "@/components/marketing/CompanyContext"

export default function SignInPage() {
    const { company, getLinkWithCompany } = useCompany()
    const router = useRouter()
    
    const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    
    // Sign In form state
    const [signInEmail, setSignInEmail] = useState("")
    const [signInPassword, setSignInPassword] = useState("")
    
    // Sign Up form state
    const [signUpName, setSignUpName] = useState("")
    const [signUpEmail, setSignUpEmail] = useState("")
    const [signUpPassword, setSignUpPassword] = useState("")
    const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("")
    const [agreeToTerms, setAgreeToTerms] = useState(false)
    
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const tab = params.get("tab")
        if (tab === "signup" || tab === "signin") {
            setActiveTab(tab)
        }
    }, [])

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        try {
            console.log("Signing in...", { email: signInEmail, password: signInPassword })
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            // Save mock user session in localStorage
            localStorage.setItem("sg-user", JSON.stringify({ email: signInEmail }))

            const params = new URLSearchParams(window.location.search)
            const redirect = params.get("redirect")
            if (redirect) {
                router.push(redirect)
            } else {
                // Redirect to company dashboard
                const dashboardSlug = company.slug === "yogaplus" ? "Phyiso" : company.slug
                router.push(`/c/${dashboardSlug}/dashboard`)
            }
        } catch (err) {
            setError("Invalid credentials. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        
        if (signUpPassword !== signUpConfirmPassword) {
            setError("Passwords do not match.")
            return
        }
        
        if (!agreeToTerms) {
            setError("You must agree to the Terms of Service.")
            return
        }

        setIsLoading(true)

        try {
            console.log("Signing up...", { 
                name: signUpName, 
                email: signUpEmail, 
                password: signUpPassword 
            })
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1200))
            
            // Save mock user session in localStorage
            localStorage.setItem("sg-user", JSON.stringify({ email: signUpEmail, name: signUpName }))

            const params = new URLSearchParams(window.location.search)
            const redirect = params.get("redirect")
            if (redirect) {
                router.push(redirect)
            } else {
                // Successfully signed up, switch to sign-in
                setActiveTab("signin")
                setSignInEmail(signUpEmail)
                setSignInPassword("")
                setError("")
            }
        } catch (err) {
            setError("Failed to create account. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-4 sm:p-8">
            <div className="flex flex-col md:flex-row max-w-[960px] w-full rounded-[24px] overflow-hidden shadow-xl border border-gray-100 bg-white">
                
                {/* Left branding panel */}
                <div className="md:w-[42%] bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden">
                    {/* Background glow decoration */}
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                    
                    <div className="relative z-10">
                        {/* Company Logo Section */}
                        <div className="flex items-center gap-2.5 mb-12 sm:mb-16">
                            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-xl shadow-inner backdrop-blur-md">
                                🧘
                            </div>
                            <span className="text-xl font-bold tracking-tight">{company.logoText}</span>
                        </div>

                        {/* Branding Heading */}
                        <h1 className="text-2xl sm:text-3xl font-extrabold mb-4 leading-tight tracking-tight">
                            {activeTab === "signin" ? "Welcome Back" : "Start Your Journey"}
                        </h1>
                        <p className="text-sm leading-relaxed text-white/85 max-w-xs mb-8 sm:mb-12 font-medium">
                            {activeTab === "signin"
                                ? `Sign in to access your personalized ${company.name} dashboard, sessions, and recovery tracking.`
                                : `Register to get personalized care, book appointments, and connect with certified practitioners.`}
                        </p>

                        {/* Dynamic Checkmarks */}
                        <div className="flex flex-col gap-4">
                            {[
                                "Track your recovery progress", 
                                "Book sessions with experts", 
                                "Access wellness insights"
                            ].map((text, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 shadow-xs">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <span className="text-xs sm:text-sm font-semibold text-white/90">{text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bottom assurance note */}
                    <div className="mt-12 sm:mt-16 relative z-10 pt-6 border-t border-white/10 flex items-center gap-2 text-xs text-white/80">
                        <ShieldCheck className="w-4 h-4 text-white/90" />
                        <span>HIPAA Compliant & Secure</span>
                    </div>
                </div>

                {/* Right form panel */}
                <div className="flex-1 p-8 sm:p-12 flex flex-col justify-center">
                    
                    {/* Tabs switcher */}
                    <div className="flex bg-gray-100/80 rounded-2xl p-1 mb-8 max-w-sm w-full mx-auto md:mx-0">
                        <button
                            onClick={() => {
                                setActiveTab("signin")
                                setError("")
                            }}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                                activeTab === "signin" 
                                    ? "bg-white text-brand-primary shadow-sm hover:scale-[1.02]" 
                                    : "text-gray-500 hover:text-gray-800"
                            }`}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab("signup")
                                setError("")
                            }}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                                activeTab === "signup" 
                                    ? "bg-white text-brand-primary shadow-sm hover:scale-[1.02]" 
                                    : "text-gray-500 hover:text-gray-800"
                            }`}
                        >
                            Sign Up
                        </button>
                    </div>

                    {/* Error display */}
                    {error && (
                        <div className="mb-6 p-3.5 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-semibold flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Forms */}
                    {activeTab === "signin" ? (
                        <form onSubmit={handleSignIn} className="space-y-5">
                            <div>
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="email"
                                        placeholder="name@company.com"
                                        value={signInEmail}
                                        onChange={(e) => setSignInEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all font-medium text-gray-800 bg-slate-50/30"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                                        Password
                                    </label>
                                    <Link 
                                        href={getLinkWithCompany("/forgot-password")} 
                                        className="text-xs font-bold text-brand-primary hover:text-brand-primary-hover transition-colors"
                                    >
                                        Forgot Password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={signInPassword}
                                        onChange={(e) => setSignInPassword(e.target.value)}
                                        className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all font-medium text-gray-800 bg-slate-50/30"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3.5 bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-brand-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer disabled:opacity-75 disabled:pointer-events-none"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span>Sign In to Portal</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleSignUp} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="John Doe"
                                        value={signUpName}
                                        onChange={(e) => setSignUpName(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all font-medium text-gray-800 bg-slate-50/30"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="email"
                                        placeholder="name@company.com"
                                        value={signUpEmail}
                                        onChange={(e) => setSignUpEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all font-medium text-gray-800 bg-slate-50/30"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={signUpPassword}
                                        onChange={(e) => setSignUpPassword(e.target.value)}
                                        className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all font-medium text-gray-800 bg-slate-50/30"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={signUpConfirmPassword}
                                        onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                                        className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all font-medium text-gray-800 bg-slate-50/30"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-start gap-2 pt-1 pb-2">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    checked={agreeToTerms}
                                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                                    className="mt-1 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                                />
                                <label htmlFor="terms" className="text-xs text-gray-500 leading-normal select-none">
                                    I agree to the{" "}
                                    <Link href={getLinkWithCompany("/terms")} className="font-semibold text-brand-primary hover:underline">
                                        Terms of Service
                                    </Link>{" "}
                                    and{" "}
                                    <Link href={getLinkWithCompany("/privacy")} className="font-semibold text-brand-primary hover:underline">
                                        Privacy Policy
                                    </Link>.
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-brand-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer disabled:opacity-75 disabled:pointer-events-none"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4" />
                                        <span>Create Account</span>
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {/* Bottom secure badge */}
                    <p className="text-center text-xs text-gray-400 mt-6 flex items-center justify-center gap-1.5">
                        🛡️ Your data is encrypted and secure
                    </p>
                </div>
            </div>
        </div>
    )
}
