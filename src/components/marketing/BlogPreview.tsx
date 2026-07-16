"use client"

import * as React from "react"
import Link from "next/link"
import { Blog, ALL_BLOGS } from "@/lib/blogs"
import { useCompany } from "@/components/marketing/CompanyContext"

const MOCK_PREVIEWS = ALL_BLOGS.slice(0, 3)

export default function BlogPreview() {
    const { company, getLinkWithCompany } = useCompany()
    const [blogs, setBlogs] = React.useState<Blog[]>(MOCK_PREVIEWS)

    React.useEffect(() => {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL
        if (apiBase) {
            fetch(`${apiBase}/blogs?limit=3`)
                .then(res => res.json())
                .then(data => {
                    if (data && data.length > 0) setBlogs(data)
                })
                .catch(() => {})
        }
    }, [])

    return (
        <section className="py-12 px-6 bg-gray-50">
            <h2 className="text-lg font-medium text-center text-[#2c3e50] mb-6">From the blog</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
                {blogs.map((blog) => (
                    <Link
                        key={blog.id}
                        href={getLinkWithCompany(`/blogs/${blog.id}`)}
                        className="bg-white border border-gray-200 rounded-xl overflow-hidden block hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                    >
                        {blog.coverImage && (
                            <img src={blog.coverImage} alt={blog.title} className="h-24 w-full object-cover" />
                        )}
                        <div className="p-3.5">
                            <p className="text-[10px] text-brand-primary font-bold uppercase mb-1">{blog.category}</p>
                            <p className="text-sm font-medium text-[#2c3e50] leading-snug group-hover:text-brand-primary transition-colors">{blog.title}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    )
}
