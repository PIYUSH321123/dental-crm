"use client"

import * as React from "react"
import Link from "next/link"
import { BookOpen, Clock, ArrowRight } from "lucide-react"
import { Blog } from "@/lib/blogs"
import { useCompany } from "@/components/marketing/CompanyContext"

interface BlogsListClientProps {
    initialBlogs: Blog[]
}

export default function BlogsListClient({ initialBlogs }: BlogsListClientProps) {
    const [selectedCategory, setSelectedCategory] = React.useState<string>("All Articles")
    const { company } = useCompany()
    const categories = ["All Articles", "Physiotherapy", "Yoga & Recovery", "Wellness"]

    const filteredBlogs = React.useMemo(() => {
        if (selectedCategory === "All Articles") return initialBlogs
        return initialBlogs.filter(blog => blog.category === selectedCategory)
    }, [selectedCategory, initialBlogs])

    return (
        <div className="bg-slate-50 min-h-screen pb-20">
            {/* Page Header */}
            <div className="bg-white border-b border-gray-200 py-16 text-center">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-bg-light text-brand-primary mb-5">
                        <BookOpen className="h-7 w-7" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
                        Wellness Insights
                    </h1>
                    <p className="text-base text-gray-500 max-w-xl mx-auto leading-relaxed">
                        Expert articles on physiotherapy, yoga, and holistic health from the {company.name} team.
                    </p>
                </div>
            </div>

            {/* Content Section */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
                {/* Category Filter Tabs */}
                <div className="flex flex-wrap gap-2 mb-10 justify-center">
                    {categories.map((category) => {
                        const isActive = selectedCategory === category
                        return (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                                    isActive
                                        ? "bg-brand-primary text-white border border-brand-primary shadow-md shadow-brand-primary/20"
                                        : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                                }`}
                            >
                                {category}
                            </button>
                        )
                    })}
                </div>

                {/* Articles Grid */}
                {filteredBlogs.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredBlogs.map((blog) => (
                            <Link
                                key={blog.id}
                                href={`/c/${company.slug}/home/blogs/${blog.id}`}
                                className="group flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xs hover:-translate-y-1.5 hover:shadow-md transition-all duration-300"
                            >
                                <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                                    <img
                                        src={blog.coverImage}
                                        alt={blog.title}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                                <div className="flex-1 p-6 flex flex-col text-left">
                                    <div className="flex items-center justify-between text-xs font-semibold text-brand-primary mb-3 uppercase tracking-wider">
                                        <span>{blog.category}</span>
                                        <span className="flex items-center gap-1 text-gray-400 font-normal normal-case">
                                            <Clock className="h-3.5 w-3.5" />
                                            {blog.readTime}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 leading-snug mb-2 group-hover:text-brand-primary transition-colors">
                                        {blog.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 mb-4">
                                        {blog.excerpt}
                                    </p>
                                    <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
                                        <span>{blog.date}</span>
                                        <span className="font-semibold text-gray-900 group-hover:text-brand-primary flex items-center gap-1 transition-colors">
                                            Read Article
                                            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white border border-gray-100 rounded-2xl">
                        <p className="text-gray-500 text-sm">No articles found in this category.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
