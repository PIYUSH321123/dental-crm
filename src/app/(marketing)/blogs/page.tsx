import * as React from "react"
import { Blog, ALL_BLOGS } from "@/lib/blogs"
import BlogsListClient from "./BlogsListClient"

// ISR: Cache/Revalidate blogs every 1 hour (3600 seconds)
async function getBlogs(): Promise<Blog[]> {
    if (!process.env.API_BASE_URL) {
        return ALL_BLOGS
    }
    try {
        const res = await fetch(`${process.env.API_BASE_URL}/blogs`, {
            next: { revalidate: 3600 },
        })
        if (!res.ok) return ALL_BLOGS
        const data = await res.json()
        return data && data.length > 0 ? data : ALL_BLOGS
    } catch (e) {
        console.error("Failed to fetch blogs from API on server, using fallback data:", e)
        return ALL_BLOGS
    }
}

export default async function BlogsPage() {
    const blogs = await getBlogs()
    return <BlogsListClient initialBlogs={blogs} />
}
