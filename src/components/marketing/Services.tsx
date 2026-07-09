import * as React from "react"
import { 
    LayoutDashboard, 
    TrendingUp, 
    FileText, 
    Calendar, 
    BookOpen, 
    Video, 
    MapPin 
} from "lucide-react"

export default function Services() {
    const services = [
        {
            title: "Personalized Dashboards",
            description: "Tailored dashboard experiences designed specifically for your individual progress and recovery goals.",
            icon: LayoutDashboard
        },
        {
            title: "Session Tracking",
            description: "Keep detailed logs of every session and monitor your recovery journey with precise visual data tracking.",
            icon: TrendingUp
        },
        {
            title: "Report Management",
            description: "Easily access, manage, and securely share your medical reports, test results, and physiotherapy assessments.",
            icon: FileText
        },
        {
            title: "Appointment Booking",
            description: "Seamlessly schedule, reschedule, or cancel your clinic visits and appointments through our intelligent platform.",
            icon: Calendar
        },
        {
            title: "Expert Wellness Blogs",
            description: "Explore a wealth of curated articles, guides, and expert advice on holistic wellness and rehabilitation practices.",
            icon: BookOpen
        },
        {
            title: "Online Sessions",
            description: "Connect with our certified therapists for live, interactive video consultations from the comfort of your home.",
            icon: Video
        },
        {
            title: "App & Center Personalization",
            description: "Enjoy a unified, deeply personalized experience whether you interact via the app or visit our offline centers.",
            icon: MapPin
        }
    ]

    return (
        <section id="services" className="py-24 bg-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl tracking-tight mb-4">
                        Comprehensive Care Platform
                    </h2>
                    <p className="text-lg text-gray-500">
                        Everything you need to manage your physical therapy and yoga journey in one seamless portal.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service, index) => {
                        const IconComponent = service.icon
                        const isLast = index === services.length - 1
                        return (
                            <div 
                                key={service.title} 
                                className={`group rounded-2xl border border-gray-100 bg-white p-8 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md ${
                                    isLast ? "lg:col-start-2" : ""
                                }`}
                            >
                                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-brand-bg-light text-brand-primary transition-transform duration-300 group-hover:scale-110">
                                    <IconComponent className="h-7 w-7" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-3">
                                    {service.title}
                                </h3>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    {service.description}
                                </p>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
