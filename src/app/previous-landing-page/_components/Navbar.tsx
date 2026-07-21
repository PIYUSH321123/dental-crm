import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HeartPulse, Home, LayoutDashboard, Video, BookOpen, LogIn, CalendarCheck } from "lucide-react"

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-8">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-[#00c950]">
            <HeartPulse className="size-5 text-[#f0fdf4]" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            YogaPlus
          </span>
        </div>

        {/* Nav */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/" className="flex items-center gap-1 border-b-2 border-[#00c950] pb-1 text-sm font-semibold">
            <Home className="size-4" /> Home
          </Link>
          <Link href="/c/Phyiso/dashboard" className="flex items-center gap-1 pb-1 text-sm font-medium text-zinc-500 hover:text-zinc-850">
            <LayoutDashboard className="size-4" /> Dashboard
          </Link>
          <Link href="/sessions" className="flex items-center gap-1 pb-1 text-sm font-medium text-zinc-500 hover:text-zinc-850">
            <Video className="size-4" /> Online Sessions
          </Link>
          <Link href="/blogs" className="flex items-center gap-1 pb-1 text-sm font-medium text-zinc-500 hover:text-zinc-850">
            <BookOpen className="size-4" /> Blogs
          </Link>
        </nav>


        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="text-sm cursor-pointer" asChild>
            <Link href="/Sign-inPage">
              <LogIn className="size-4" /> Sign In
            </Link>
          </Button>
          <Button className="rounded-full bg-[#00c950] text-[#f0fdf4] hover:bg-[#00b048] cursor-pointer" asChild>
            <Link href="/Booking">
              <CalendarCheck className="size-4" /> Book Appointment
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
