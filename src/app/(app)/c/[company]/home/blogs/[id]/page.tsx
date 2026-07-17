import * as React from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Clock, Calendar, User, ChevronRight } from "lucide-react"
import { Blog, ALL_BLOGS } from "@/lib/blogs"

interface BlogDetailPageProps {
    params: Promise<{ id: string }>
}

async function getBlog(id: string): Promise<Blog | null> {
    if (!process.env.API_BASE_URL) {
        const localBlog = ALL_BLOGS.find((b) => b.id === id)
        return localBlog || null
    }
    try {
        const res = await fetch(`${process.env.API_BASE_URL}/blogs/${id}`, {
            next: { revalidate: 3600 },
        })
        if (!res.ok) {
            // Fallback to local data if not found in database or API is temporarily down
            return ALL_BLOGS.find((b) => b.id === id) || null
        }
        return await res.json()
    } catch (e) {
        // Fallback to local data on connection error
        return ALL_BLOGS.find((b) => b.id === id) || null
    }
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
    const { id } = await params
    const blog = await getBlog(id)

    // Handle missing/invalid blog IDs gracefully - triggers Next.js 404
    if (!blog) {
        notFound()
    }

    return (
        <div className="bg-slate-50 min-h-screen pb-20">
            {/* Breadcrumbs & Back Nav */}
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-8">
                <Link
                    href="/blogs"
                    className="inline-flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-[#f97316] transition-colors mb-6"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to Articles
                </Link>

                {/* Article Header Card */}
                <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xs mb-10">
                    <div className="relative h-64 sm:h-96 w-full overflow-hidden bg-gray-100">
                        <img
                            src={blog.coverImage}
                            alt={blog.title}
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <div className="p-8 sm:p-10">
                        <div className="inline-block rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-[#f97316] uppercase tracking-wider mb-4">
                            {blog.category}
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-6">
                            {blog.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 border-t border-b border-gray-100 py-4 mb-8">
                            <div className="flex items-center gap-1.5">
                                <User className="h-4 w-4 text-gray-400" />
                                <span className="font-medium text-gray-900">{blog.author}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span>{blog.date}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span>{blog.readTime}</span>
                            </div>
                        </div>

                        {/* Article Content */}
                        <div className="prose max-w-none text-gray-600 space-y-6 leading-relaxed text-justify">
                            {blog.content.map((paragraph, index) => (
                                <p key={index} className="text-base sm:text-lg">
                                    {paragraph}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom CTA Card */}
                <div className="bg-gradient-to-br from-gray-900 to-slate-800 rounded-3xl p-8 sm:p-12 text-white shadow-xl text-center">
                    <h2 className="text-2xl sm:text-3xl font-extrabold mb-4">
                        Ready to start your recovery?
                    </h2>
                    <p className="text-sm sm:text-base text-gray-400 max-w-lg mx-auto mb-8 leading-relaxed">
                        Book a personalized session today and work with our certified physiotherapists and yoga therapists.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link
                            href="/onboarding"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-semibold bg-[#f97316] text-white rounded-full hover:bg-[#ea580c] transition-all hover:scale-105 active:scale-95 duration-200"
                        >
                            Schedule Consultation
                            <ChevronRight className="h-4 w-4" />
                        </Link>
                        <Link
                            href="/blogs"
                            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 text-sm font-semibold bg-white/10 text-white border border-white/20 rounded-full hover:bg-white/20 transition-all hover:scale-105 active:scale-95 duration-200"
                        >
                            Browse more articles
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
