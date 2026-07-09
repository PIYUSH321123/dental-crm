"use client"

import * as React from "react"
import { Star } from "lucide-react"
import { useCompany } from "@/components/marketing/CompanyContext"

export default function Testimonials() {
    const { company } = useCompany()

    const testimonials = [
        {
            quote: "YogaPlus has completely changed how I manage my back pain. The combination of targeted physical therapy and gentle yoga exercises was exactly what I needed.",
            author: "Sarah Jenkins",
            role: "Yoga Practitioner",
            rating: 5,
            image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop"
        },
        {
            quote: "After my knee surgery, I was worried I wouldn't run again. The team's guided recovery plan was thorough, professional, and incredibly supportive.",
            author: "David Miller",
            role: "Athlete",
            rating: 5,
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop"
        },
        {
            quote: "The convenience of online sessions combined with the depth of the therapists' expertise made my rehabilitation journey smooth and stress-free.",
            author: "Priya Sharma",
            role: "Software Engineer",
            rating: 5,
            image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop"
        }
    ]

    const processedTestimonials = React.useMemo(() => {
        return testimonials.map(t => ({
            ...t,
            quote: t.quote.replace(/YogaPlus/g, company.name)
        }))
    }, [company.name])

    return (
        <section className="py-24 bg-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-4">
                        Client Success Stories
                    </h2>
                    <p className="text-lg text-gray-500">
                        Read how our integrated approach to recovery has helped individuals regain mobility and strength.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {processedTestimonials.map((t) => (
                        <div 
                            key={t.author} 
                            className="flex flex-col bg-slate-50 border border-gray-100 rounded-2xl p-8 shadow-xs"
                        >
                            <div className="flex gap-1 mb-6 text-amber-500">
                                {[...Array(t.rating)].map((_, i) => (
                                    <Star key={i} className="h-5 w-5 fill-amber-500 stroke-amber-500" />
                                ))}
                            </div>
                            <blockquote className="text-gray-600 italic leading-relaxed mb-8 flex-1">
                                "{t.quote}"
                            </blockquote>
                            <div className="flex items-center gap-4 border-t border-gray-200/50 pt-6">
                                <img 
                                    src={t.image} 
                                    alt={t.author} 
                                    className="h-12 w-12 rounded-full object-cover bg-gray-100" 
                                />
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900">
                                        {t.author}
                                    </h4>
                                    <p className="text-xs text-gray-500">
                                        {t.role}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
