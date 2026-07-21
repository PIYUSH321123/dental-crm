import Link from "next/link"
import { HeartPulse, MapPin } from "lucide-react"

// Inline SVG components for brand social icons since lucide-react deprecated brand icons in newer versions
const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
)

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
)

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
)

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-50/40">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-8 py-10">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-[#00c950]">
              <HeartPulse className="size-5 text-[#f0fdf4]" />
            </div>
            <span className="text-lg font-bold">
              YogaPlus
            </span>
          </div>

          <div className="flex items-center gap-6 text-sm text-zinc-500">
            <Link href="/Booking" className="hover:text-zinc-800">Book Appointment</Link>
            <Link href="/sessions" className="hover:text-zinc-800">Online Sessions</Link>
            <Link href="/blogs" className="hover:text-zinc-800">Blogs</Link>
          </div>

          <div className="flex items-center gap-3 text-zinc-500">
            <InstagramIcon className="size-5 cursor-pointer hover:text-zinc-800" />
            <FacebookIcon className="size-5 cursor-pointer hover:text-zinc-800" />
            <TwitterIcon className="size-5 cursor-pointer hover:text-zinc-800" />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-zinc-200 pt-6 text-sm text-zinc-500">
          <span>© 2026 YogaPlus. All rights reserved.</span>
          <div className="flex items-center gap-2">
            <MapPin className="size-4" />
            <span>123 Wellness Avenue, Mumbai</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
