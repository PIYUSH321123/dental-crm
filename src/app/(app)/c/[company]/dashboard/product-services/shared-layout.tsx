"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { 
    Search, 
    Plus, 
    LayoutGrid, 
    List, 
    Edit, 
    Trash2, 
    MoreVertical, 
    SlidersHorizontal, 
    ChevronLeft, 
    ChevronRight, 
    Sparkles, 
    Package, 
    Layers, 
    Activity, 
    DollarSign,
    Clock,
    ClipboardList,
    AlertCircle,
    CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

// Type Definitions
export interface Product {
    id: string
    name: string
    price: number
    category: string
    stock: number
    status: "Active" | "Inactive"
    description: string
}

export interface ClinicService {
    id: string
    name: string
    price: number
    category: string
    duration: number // in minutes
    status: "Active" | "Inactive"
    description: string
}

export interface TherapyPackage {
    id: string
    name: string
    price: number
    category: string
    sessions: number // number of sessions
    status: "Active" | "Inactive"
    description: string
}

// Seed Data
const defaultProducts: Product[] = [
    { id: "PROD-001", name: "Ortho Support Brace", price: 1200, category: "Orthotics", stock: 45, status: "Active", description: "Medical-grade knee compression sleeve providing premium patellar tracking support." },
    { id: "PROD-002", name: "Pain Relief Gel", price: 850, category: "Topical", stock: 3, status: "Active", description: "Fast-acting topical gel for cooling relief from muscular aches and joint stiffness." },
    { id: "PROD-003", name: "Post-Surgery Recovery Kit", price: 2500, category: "Bundle", stock: 0, status: "Active", description: "Comprehensive home recovery package with cold packs, resistance bands, and instructions." },
    { id: "PROD-004", name: "Vitamin D3 Capsules", price: 600, category: "Supplements", stock: 120, status: "Active", description: "High-potency Vitamin D3 capsules essential for bone density and calcium absorption." },
    { id: "PROD-005", name: "Premium Therapy Yoga Mat", price: 1800, category: "Devices", stock: 15, status: "Active", description: "Eco-friendly, non-slip high density rubber mat customized for clinical rehab." },
    { id: "PROD-006", name: "Skin Recovery Lotion", price: 1100, category: "Skincare", stock: 8, status: "Active", description: "Soothing dermatologist-tested lotion designed for post-treatment skin rejuvenation." }
]

const defaultServices: ClinicService[] = [
    { id: "SERV-001", name: "Initial Assessment Consultation", price: 1200, category: "Consultation", duration: 60, status: "Active", description: "Comprehensive physical diagnostic consultation and custom recovery plan mapping." },
    { id: "SERV-002", name: "Spine Alignment Therapy", price: 2000, category: "Chiropractic", duration: 45, status: "Active", description: "Targeted spinal adjustments and posture corrections for chronic lower-back relief." },
    { id: "SERV-003", name: "Core Strengthening Session", price: 1500, category: "Yoga Therapy", duration: 60, status: "Active", description: "Therapist-supervised clinical yoga focused on stability muscle groups." },
    { id: "SERV-004", name: "Deep Tissue Laser Therapy", price: 2500, category: "Physiotherapy", duration: 30, status: "Active", description: "Non-invasive laser therapy targeting cellular repair in deep tissue injuries." }
]

const defaultPackages: TherapyPackage[] = [
    { id: "PKG-001", name: "ACL Post-Op Recovery Bundle", price: 15000, category: "Post-Op Recovery", sessions: 10, status: "Active", description: "Full rehabilitation package including 10 post-surgical physiotherapy sessions." },
    { id: "PKG-002", name: "8-Session Knee Mobilization Package", price: 10500, category: "Chronic Care", sessions: 8, status: "Active", description: "Clinical manipulation package targeting osteoarthritis knee joints." },
    { id: "PKG-003", name: "Spine & Back Strengthening Course", price: 7500, category: "Wellness", sessions: 5, status: "Active", description: "5 mixed therapy sessions for chronic back support and flexibility improvement." }
]

interface SharedLayoutProps {
    activeTab: "products" | "services" | "packages"
}

export default function SharedLayout({ activeTab }: SharedLayoutProps) {
    const params = useParams()
    const router = useRouter()
    const companySlug = params.company as string

    // Main States
    const [products, setProducts] = React.useState<Product[]>([])
    const [services, setServices] = React.useState<ClinicService[]>([])
    const [packages, setPackages] = React.useState<TherapyPackage[]>([])

    // Search and Filters
    const [searchQuery, setSearchQuery] = React.useState("")
    const [selectedCategory, setSelectedCategory] = React.useState("All")
    const [selectedStockStatus, setSelectedStockStatus] = React.useState("All") // Products only
    const [sortOption, setSortOption] = React.useState("name-asc")
    const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid")
    const [currentPage, setCurrentPage] = React.useState(1)
    const itemsPerPage = 6

    // Dialog Modals States
    const [isAddOpen, setIsAddOpen] = React.useState(false)
    const [editingItem, setEditingItem] = React.useState<any | null>(null) // Holds Item when editing

    // Form fields
    const [formName, setFormName] = React.useState("")
    const [formPrice, setFormPrice] = React.useState("")
    const [formCategory, setFormCategory] = React.useState("")
    const [formDescription, setFormDescription] = React.useState("")
    const [formStock, setFormStock] = React.useState("10") // Products only
    const [formDuration, setFormDuration] = React.useState("45") // Services only
    const [formSessions, setFormSessions] = React.useState("5") // Packages only
    const [formStatus, setFormStatus] = React.useState<"Active" | "Inactive">("Active")

    // Load and seed data from localStorage
    React.useEffect(() => {
        // Products
        const savedProds = localStorage.getItem("sg-products")
        if (savedProds) {
            setProducts(JSON.parse(savedProds))
        } else {
            localStorage.setItem("sg-products", JSON.stringify(defaultProducts))
            setProducts(defaultProducts)
        }

        // Services
        const savedServs = localStorage.getItem("sg-services")
        if (savedServs) {
            setServices(JSON.parse(savedServs))
        } else {
            localStorage.setItem("sg-services", JSON.stringify(defaultServices))
            setServices(defaultServices)
        }

        // Packages
        const savedPkgs = localStorage.getItem("sg-packages")
        if (savedPkgs) {
            setPackages(JSON.parse(savedPkgs))
        } else {
            localStorage.setItem("sg-packages", JSON.stringify(defaultPackages))
            setPackages(defaultPackages)
        }
    }, [])

    // Reset filters on tab switch
    React.useEffect(() => {
        setSearchQuery("")
        setSelectedCategory("All")
        setSelectedStockStatus("All")
        setSortOption("name-asc")
        setCurrentPage(1)
    }, [activeTab])

    const handleTabClick = (tab: "products" | "services" | "packages") => {
        router.push(`/c/${companySlug}/dashboard/product-services/${tab}`)
    }

    // Categories List per tab
    const categories = React.useMemo(() => {
        if (activeTab === "products") {
            return ["All", "Orthotics", "Topical", "Bundle", "Supplements", "Devices", "Skincare"]
        } else if (activeTab === "services") {
            return ["All", "Consultation", "Chiropractic", "Yoga Therapy", "Physiotherapy"]
        } else {
            return ["All", "Post-Op Recovery", "Chronic Care", "Wellness", "Fitness Bundle"]
        }
    }, [activeTab])

    // Dynamic stats computation
    const stats = React.useMemo(() => {
        if (activeTab === "products") {
            const total = products.length
            const active = products.filter(p => p.status === "Active").length
            const lowStock = products.filter(p => p.stock > 0 && p.stock <= 10).length
            const outOfStock = products.filter(p => p.stock === 0).length
            return { total, active, lowStock, outOfStock }
        } else if (activeTab === "services") {
            const total = services.length
            const active = services.filter(s => s.status === "Active").length
            const popular = services.filter(s => s.price >= 2000).length // arbitrary metric
            const inactive = services.filter(s => s.status === "Inactive").length
            return { total, active, popular, inactive }
        } else {
            const total = packages.length
            const active = packages.filter(p => p.status === "Active").length
            const premium = packages.filter(p => p.price >= 10000).length // arbitrary metric
            const inactive = packages.filter(p => p.status === "Inactive").length
            return { total, active, premium, inactive }
        }
    }, [activeTab, products, services, packages])

    // Filter & Sort Implementation
    const filteredItems = React.useMemo(() => {
        if (activeTab === "products") {
            let result = products.filter(p => {
                const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                     p.description.toLowerCase().includes(searchQuery.toLowerCase())
                const matchesCategory = selectedCategory === "All" || p.category === selectedCategory
                
                let matchesStock = true
                if (selectedStockStatus === "In Stock") matchesStock = p.stock > 10
                else if (selectedStockStatus === "Low Stock") matchesStock = p.stock > 0 && p.stock <= 10
                else if (selectedStockStatus === "Out of Stock") matchesStock = p.stock === 0

                return matchesSearch && matchesCategory && matchesStock
            })

            // Sort
            result.sort((a, b) => {
                if (sortOption === "name-asc") return a.name.localeCompare(b.name)
                if (sortOption === "name-desc") return b.name.localeCompare(a.name)
                if (sortOption === "price-asc") return a.price - b.price
                if (sortOption === "price-desc") return b.price - a.price
                if (sortOption === "stock-asc") return a.stock - b.stock
                if (sortOption === "stock-desc") return b.stock - a.stock
                return 0
            })
            return result
        } else if (activeTab === "services") {
            let result = services.filter(s => {
                const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                     s.description.toLowerCase().includes(searchQuery.toLowerCase())
                const matchesCategory = selectedCategory === "All" || s.category === selectedCategory
                return matchesSearch && matchesCategory
            })

            // Sort
            result.sort((a, b) => {
                if (sortOption === "name-asc") return a.name.localeCompare(b.name)
                if (sortOption === "name-desc") return b.name.localeCompare(a.name)
                if (sortOption === "price-asc") return a.price - b.price
                if (sortOption === "price-desc") return b.price - a.price
                if (sortOption === "duration-asc") return a.duration - b.duration
                if (sortOption === "duration-desc") return b.duration - a.duration
                return 0
            })
            return result
        } else {
            let result = packages.filter(p => {
                const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                     p.description.toLowerCase().includes(searchQuery.toLowerCase())
                const matchesCategory = selectedCategory === "All" || p.category === selectedCategory
                return matchesSearch && matchesCategory
            })

            // Sort
            result.sort((a, b) => {
                if (sortOption === "name-asc") return a.name.localeCompare(b.name)
                if (sortOption === "name-desc") return b.name.localeCompare(a.name)
                if (sortOption === "price-asc") return a.price - b.price
                if (sortOption === "price-desc") return b.price - a.price
                if (sortOption === "sessions-asc") return a.sessions - b.sessions
                if (sortOption === "sessions-desc") return b.sessions - a.sessions
                return 0
            })
            return result
        }
    }, [activeTab, products, services, packages, searchQuery, selectedCategory, selectedStockStatus, sortOption])

    // Paginated Items
    const paginatedItems = React.useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage
        return filteredItems.slice(startIndex, startIndex + itemsPerPage)
    }, [filteredItems, currentPage])

    const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage))

    // Form Handlers
    const resetForm = () => {
        setFormName("")
        setFormPrice("")
        setFormCategory(categories[1] || "")
        setFormDescription("")
        setFormStock("10")
        setFormDuration("45")
        setFormSessions("5")
        setFormStatus("Active")
        setEditingItem(null)
    }

    const openAddDialog = () => {
        resetForm()
        setIsAddOpen(true)
    }

    const openEditDialog = (item: any) => {
        setEditingItem(item)
        setFormName(item.name)
        setFormPrice(item.price.toString())
        setFormCategory(item.category)
        setFormDescription(item.description)
        setFormStatus(item.status)
        if (activeTab === "products") {
            setFormStock(item.stock.toString())
        } else if (activeTab === "services") {
            setFormDuration(item.duration.toString())
        } else {
            setFormSessions(item.sessions.toString())
        }
        setIsAddOpen(true)
    }

    const handleSaveItem = (e: React.FormEvent) => {
        e.preventDefault()

        const priceNum = parseFloat(formPrice)
        if (!formName.trim() || isNaN(priceNum) || priceNum < 0) {
            toast.error("Please provide a valid name and price.")
            return
        }

        if (activeTab === "products") {
            const stockNum = parseInt(formStock)
            if (isNaN(stockNum) || stockNum < 0) {
                toast.error("Please enter a valid stock amount.")
                return
            }

            let updatedList: Product[] = []
            if (editingItem) {
                updatedList = products.map(p => 
                    p.id === editingItem.id 
                        ? { ...p, name: formName, price: priceNum, category: formCategory, stock: stockNum, status: formStatus, description: formDescription }
                        : p
                )
                toast.success("Product updated successfully.")
            } else {
                const newId = `PROD-${Math.floor(100 + Math.random() * 900)}`
                const newItem: Product = {
                    id: newId,
                    name: formName,
                    price: priceNum,
                    category: formCategory,
                    stock: stockNum,
                    status: formStatus,
                    description: formDescription
                }
                updatedList = [newItem, ...products]
                toast.success("New product created.")
            }
            setProducts(updatedList)
            localStorage.setItem("sg-products", JSON.stringify(updatedList))
        } else if (activeTab === "services") {
            const durNum = parseInt(formDuration)
            if (isNaN(durNum) || durNum <= 0) {
                toast.error("Please enter a valid session duration.")
                return
            }

            let updatedList: ClinicService[] = []
            if (editingItem) {
                updatedList = services.map(s => 
                    s.id === editingItem.id 
                        ? { ...s, name: formName, price: priceNum, category: formCategory, duration: durNum, status: formStatus, description: formDescription }
                        : s
                )
                toast.success("Service updated successfully.")
            } else {
                const newId = `SERV-${Math.floor(100 + Math.random() * 900)}`
                const newItem: ClinicService = {
                    id: newId,
                    name: formName,
                    price: priceNum,
                    category: formCategory,
                    duration: durNum,
                    status: formStatus,
                    description: formDescription
                }
                updatedList = [newItem, ...services]
                toast.success("New service created.")
            }
            setServices(updatedList)
            localStorage.setItem("sg-services", JSON.stringify(updatedList))
        } else {
            const sessNum = parseInt(formSessions)
            if (isNaN(sessNum) || sessNum <= 0) {
                toast.error("Please enter a valid number of sessions.")
                return
            }

            let updatedList: TherapyPackage[] = []
            if (editingItem) {
                updatedList = packages.map(p => 
                    p.id === editingItem.id 
                        ? { ...p, name: formName, price: priceNum, category: formCategory, sessions: sessNum, status: formStatus, description: formDescription }
                        : p
                )
                toast.success("Package updated successfully.")
            } else {
                const newId = `PKG-${Math.floor(100 + Math.random() * 900)}`
                const newItem: TherapyPackage = {
                    id: newId,
                    name: formName,
                    price: priceNum,
                    category: formCategory,
                    sessions: sessNum,
                    status: formStatus,
                    description: formDescription
                }
                updatedList = [newItem, ...packages]
                toast.success("New package created.")
            }
            setPackages(updatedList)
            localStorage.setItem("sg-packages", JSON.stringify(updatedList))
        }

        setIsAddOpen(false)
        resetForm()
    }

    const handleDeleteItem = (id: string) => {
        if (!confirm("Are you sure you want to delete this item?")) return

        if (activeTab === "products") {
            const updated = products.filter(p => p.id !== id)
            setProducts(updated)
            localStorage.setItem("sg-products", JSON.stringify(updated))
            toast.success("Product deleted successfully.")
        } else if (activeTab === "services") {
            const updated = services.filter(s => s.id !== id)
            setServices(updated)
            localStorage.setItem("sg-services", JSON.stringify(updated))
            toast.success("Service deleted successfully.")
        } else {
            const updated = packages.filter(p => p.id !== id)
            setPackages(updated)
            localStorage.setItem("sg-packages", JSON.stringify(updated))
            toast.success("Package deleted successfully.")
        }
    }

    // Dynamic gradients for grid items
    const getCardGradient = (category: string) => {
        const cat = category.toLowerCase()
        if (cat.includes("ortho") || cat.includes("care") || cat.includes("rehab")) {
            return "from-sky-500/20 to-indigo-500/10 dark:from-sky-500/15 dark:to-indigo-500/5 text-sky-500"
        }
        if (cat.includes("supp") || cat.includes("well") || cat.includes("yoga")) {
            return "from-emerald-500/20 to-teal-500/10 dark:from-emerald-500/15 dark:to-teal-500/5 text-emerald-500"
        }
        if (cat.includes("skin") || cat.includes("topical")) {
            return "from-rose-500/20 to-amber-500/10 dark:from-rose-500/15 dark:to-amber-500/5 text-rose-500"
        }
        return "from-amber-500/20 to-orange-500/10 dark:from-amber-500/15 dark:to-orange-500/5 text-amber-500"
    }

    return (
        <div className="flex-1 space-y-6 p-6 lg:p-8 bg-background text-foreground font-sans">
            {/* Top Navigation Navigation Tabs */}
            <div className="flex border-b border-border space-x-6 pb-px">
                {(["products", "services", "packages"] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => handleTabClick(tab)}
                        className={`pb-3 text-sm font-semibold transition-all border-b-2 hover:text-foreground cursor-pointer ${
                            activeTab === tab 
                                ? "border-primary text-foreground" 
                                : "border-transparent text-muted-foreground"
                        }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* Header Layout */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-1">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        {activeTab === "products" && <Package className="h-6 w-6 text-primary" />}
                        {activeTab === "services" && <Activity className="h-6 w-6 text-primary" />}
                        {activeTab === "packages" && <Layers className="h-6 w-6 text-primary" />}
                        {activeTab === "products" && "Products Register"}
                        {activeTab === "services" && "Clinic Services"}
                        {activeTab === "packages" && "Treatment Packages"}
                    </h1>
                    <p className="text-xs text-muted-foreground">
                        {activeTab === "products" && "Inventory management for physical items: supplements, devices, orthotics, skincare."}
                        {activeTab === "services" && "Create clinic services, consultation formats, and special therapy categories."}
                        {activeTab === "packages" && "Manage bundled treatment courses, multi-session plans, and subscription offerings."}
                    </p>
                </div>
                <div>
                    <Button 
                        onClick={openAddDialog}
                        className="h-8.5 text-xs font-semibold bg-[#1a6eb5] hover:bg-[#1d7ccb] text-white rounded-lg shadow-sm cursor-pointer gap-1.5 px-4"
                    >
                        <Plus className="h-4 w-4" /> 
                        {activeTab === "products" && "Add Product"}
                        {activeTab === "services" && "Add Service"}
                        {activeTab === "packages" && "Add Package"}
                    </Button>
                </div>
            </div>

            {/* Stats Metric Cards (Dynamic per tab) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {activeTab === "products" && (
                    <>
                        <Card className="bg-card border-border shadow-xs rounded-xl">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 px-5 pt-4">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Inventory Items</span>
                                <Package className="h-4 w-4 text-sky-500" />
                            </CardHeader>
                            <CardContent className="px-5 pb-4">
                                <div className="text-2xl font-extrabold text-foreground">{stats.total}</div>
                                <p className="text-[10px] text-muted-foreground mt-0.5">Physical items catalogued</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-card border-border shadow-xs rounded-xl">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 px-5 pt-4">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active Catalog</span>
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            </CardHeader>
                            <CardContent className="px-5 pb-4">
                                <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{stats.active}</div>
                                <p className="text-[10px] text-muted-foreground mt-0.5">Available for retail billing</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-card border-amber-500/35 dark:border-amber-500/25 bg-amber-500/5 text-amber-600 dark:text-amber-400 shadow-xs rounded-xl border">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 px-5 pt-4">
                                <span className="text-[10px] font-bold text-amber-600/70 dark:text-amber-400/70 uppercase tracking-wider">Low Stock warning</span>
                                <AlertCircle className="h-4 w-4 text-amber-500" />
                            </CardHeader>
                            <CardContent className="px-5 pb-4">
                                <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{stats.lowStock}</div>
                                <p className="text-[10px] text-amber-600/70 dark:text-amber-400/60 mt-0.5">Items with &le; 10 units left</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-card border-rose-500/35 dark:border-rose-500/25 bg-rose-500/5 text-rose-600 dark:text-rose-400 shadow-xs rounded-xl border">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 px-5 pt-4">
                                <span className="text-[10px] font-bold text-rose-600/70 dark:text-rose-400/70 uppercase tracking-wider">Out of Stock Alert</span>
                                <AlertCircle className="h-4 w-4 text-rose-500" />
                            </CardHeader>
                            <CardContent className="px-5 pb-4">
                                <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">{stats.outOfStock}</div>
                                <p className="text-[10px] text-rose-600/70 dark:text-rose-400/60 mt-0.5">Require replenishment</p>
                            </CardContent>
                        </Card>
                    </>
                )}

                {activeTab === "services" && (
                    <>
                        <Card className="bg-card border-border shadow-xs rounded-xl">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 px-5 pt-4">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Services</span>
                                <Activity className="h-4 w-4 text-sky-500" />
                            </CardHeader>
                            <CardContent className="px-5 pb-4">
                                <div className="text-2xl font-extrabold text-foreground">{stats.total}</div>
                                <p className="text-[10px] text-muted-foreground mt-0.5">Clinical consultation formats</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-card border-border shadow-xs rounded-xl">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 px-5 pt-4">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active Services</span>
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            </CardHeader>
                            <CardContent className="px-5 pb-4">
                                <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{stats.active}</div>
                                <p className="text-[10px] text-muted-foreground mt-0.5">Available for session booking</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-card border-border shadow-xs rounded-xl">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 px-5 pt-4">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Premium Services</span>
                                <Sparkles className="h-4 w-4 text-amber-500" />
                            </CardHeader>
                            <CardContent className="px-5 pb-4">
                                <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">{stats.popular}</div>
                                <p className="text-[10px] text-muted-foreground mt-0.5">Priced &ge; ₹2,000</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-card border-border shadow-xs rounded-xl">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 px-5 pt-4">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Inactive catalog</span>
                                <AlertCircle className="h-4 w-4 text-slate-400" />
                            </CardHeader>
                            <CardContent className="px-5 pb-4">
                                <div className="text-2xl font-extrabold text-slate-500">{stats.inactive}</div>
                                <p className="text-[10px] text-muted-foreground mt-0.5">Suspended clinic offerings</p>
                            </CardContent>
                        </Card>
                    </>
                )}

                {activeTab === "packages" && (
                    <>
                        <Card className="bg-card border-border shadow-xs rounded-xl">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 px-5 pt-4">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Packages</span>
                                <Layers className="h-4 w-4 text-sky-500" />
                            </CardHeader>
                            <CardContent className="px-5 pb-4">
                                <div className="text-2xl font-extrabold text-foreground">{stats.total}</div>
                                <p className="text-[10px] text-muted-foreground mt-0.5">Multi-session treatment packages</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-card border-border shadow-xs rounded-xl">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 px-5 pt-4">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active Plans</span>
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            </CardHeader>
                            <CardContent className="px-5 pb-4">
                                <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{stats.active}</div>
                                <p className="text-[10px] text-muted-foreground mt-0.5">Available for patient enrollment</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-card border-border shadow-xs rounded-xl">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 px-5 pt-4">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Premium Bundles</span>
                                <DollarSign className="h-4 w-4 text-emerald-500" />
                            </CardHeader>
                            <CardContent className="px-5 pb-4">
                                <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">{stats.premium}</div>
                                <p className="text-[10px] text-muted-foreground mt-0.5">Priced &ge; ₹10,000</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-card border-border shadow-xs rounded-xl">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 px-5 pt-4">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Inactive plans</span>
                                <AlertCircle className="h-4 w-4 text-slate-400" />
                            </CardHeader>
                            <CardContent className="px-5 pb-4">
                                <div className="text-2xl font-extrabold text-slate-500">{stats.inactive}</div>
                                <p className="text-[10px] text-muted-foreground mt-0.5">Draft or legacy plans</p>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            {/* Filter Toolbar Section */}
            <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-1 items-center gap-2 max-w-sm w-full">
                    <div className="relative w-full">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={`Search by name, description...`}
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value)
                                setCurrentPage(1)
                            }}
                            className="h-9 pl-9 bg-background border-border text-foreground text-xs rounded-lg"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground font-semibold">
                    {/* Category Filter */}
                    <div className="flex items-center gap-1.5">
                        <span>Category:</span>
                        <select
                            value={selectedCategory}
                            onChange={(e) => {
                                setSelectedCategory(e.target.value)
                                setCurrentPage(1)
                            }}
                            className="h-8.5 px-2 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none cursor-pointer font-medium"
                        >
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Stock status filter (Products only) */}
                    {activeTab === "products" && (
                        <div className="flex items-center gap-1.5">
                            <span>Availability:</span>
                            <select
                                value={selectedStockStatus}
                                onChange={(e) => {
                                    setSelectedStockStatus(e.target.value)
                                    setCurrentPage(1)
                                }}
                                className="h-8.5 px-2 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none cursor-pointer font-medium"
                            >
                                <option value="All">All Stocks</option>
                                <option value="In Stock">In Stock (&gt;10)</option>
                                <option value="Low Stock">Low Stock (&le;10)</option>
                                <option value="Out of Stock">Out of Stock (=0)</option>
                            </select>
                        </div>
                    )}

                    {/* Sorting Filter */}
                    <div className="flex items-center gap-1.5">
                        <span>Sort By:</span>
                        <select
                            value={sortOption}
                            onChange={(e) => {
                                setSortOption(e.target.value)
                                setCurrentPage(1)
                            }}
                            className="h-8.5 px-2 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none cursor-pointer font-medium"
                        >
                            <option value="name-asc">Name (A - Z)</option>
                            <option value="name-desc">Name (Z - A)</option>
                            <option value="price-asc">Price (Low to High)</option>
                            <option value="price-desc">Price (High to Low)</option>
                            
                            {activeTab === "products" && (
                                <>
                                    <option value="stock-asc">Stock (Low to High)</option>
                                    <option value="stock-desc">Stock (High to Low)</option>
                                </>
                            )}
                            {activeTab === "services" && (
                                <>
                                    <option value="duration-asc">Duration (Short to Long)</option>
                                    <option value="duration-desc">Duration (Long to Short)</option>
                                </>
                            )}
                            {activeTab === "packages" && (
                                <>
                                    <option value="sessions-asc">Sessions (Few to Many)</option>
                                    <option value="sessions-desc">Sessions (Many to Few)</option>
                                </>
                            )}
                        </select>
                    </div>

                    <div className="border-l border-border h-6 mx-1 hidden sm:block" />

                    {/* Grid/List View Toggles */}
                    <div className="flex items-center border border-border rounded-lg p-0.5 bg-background">
                        <Button
                            variant={viewMode === "grid" ? "secondary" : "ghost"}
                            size="icon"
                            onClick={() => setViewMode("grid")}
                            className="h-7 w-7 rounded-md cursor-pointer"
                        >
                            <LayoutGrid className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                            variant={viewMode === "list" ? "secondary" : "ghost"}
                            size="icon"
                            onClick={() => setViewMode("list")}
                            className="h-7 w-7 rounded-md cursor-pointer"
                        >
                            <List className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* List / Grid Display Body */}
            {filteredItems.length === 0 ? (
                <Card className="border border-border bg-card rounded-xl p-16 text-center shadow-sm">
                    <div className="flex flex-col items-center justify-center space-y-3 max-w-sm mx-auto">
                        <div className="p-3 bg-muted rounded-full">
                            <AlertCircle className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-bold text-foreground text-sm">No items found</h3>
                        <p className="text-xs text-muted-foreground">
                            Try adjusting your filters, search term, or create a new item to get started.
                        </p>
                    </div>
                </Card>
            ) : viewMode === "grid" ? (
                /* Grid view styling matching modern mockup cards */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedItems.map((item) => {
                        const gradient = getCardGradient(item.category)
                        return (
                            <Card key={item.id} className="bg-card border border-border rounded-xl shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-150 group">
                                <div>
                                    {/* Image placeholder container */}
                                    <div className={`h-40 bg-gradient-to-br ${gradient} flex items-center justify-center relative border-b border-border`}>
                                        {activeTab === "products" && <Package className="h-10 w-10 opacity-70 group-hover:scale-110 transition-transform duration-250" />}
                                        {activeTab === "services" && <Activity className="h-10 w-10 opacity-70 group-hover:scale-110 transition-transform duration-250" />}
                                        {activeTab === "packages" && <Layers className="h-10 w-10 opacity-70 group-hover:scale-110 transition-transform duration-250" />}
                                        
                                        <Badge className="absolute top-3 left-3 bg-background/90 dark:bg-background/80 text-foreground border border-border shadow-xs hover:bg-background/90 text-[10px] font-bold rounded-full py-0.5 px-2.5">
                                            {item.category}
                                        </Badge>
                                        
                                        {/* Status Badge */}
                                        <Badge className={`absolute top-3 right-3 text-[9px] font-extrabold rounded-md uppercase border ${
                                            item.status === "Active" 
                                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" 
                                                : "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20"
                                        }`}>
                                            {item.status}
                                        </Badge>
                                    </div>
                                    
                                    <div className="p-5 space-y-2">
                                        <h3 className="font-bold text-foreground text-sm leading-snug tracking-tight hover:text-primary transition-colors cursor-pointer">
                                            {item.name}
                                        </h3>
                                        <p className="text-xs text-muted-foreground line-clamp-2 h-8 font-medium">
                                            {item.description || "No description provided."}
                                        </p>
                                    </div>
                                </div>

                                <div className="px-5 pb-5 pt-1 space-y-4">
                                    <div className="flex items-center justify-between border-t border-border/60 pt-4">
                                        <div className="space-y-0.5">
                                            <span className="text-[10px] text-muted-foreground font-semibold uppercase">Pricing</span>
                                            <div className="text-base font-extrabold text-foreground">₹{item.price.toLocaleString("en-IN")}</div>
                                        </div>

                                        {/* Dynamic details for other tags */}
                                        {activeTab === "products" && (
                                            <div className="text-right space-y-0.5">
                                                <span className="text-[10px] text-muted-foreground font-semibold uppercase block">Stock Status</span>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${
                                                    (item as Product).stock > 10 
                                                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" 
                                                        : (item as Product).stock > 0 
                                                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                                                }`}>
                                                    stock: {(item as Product).stock}
                                                </span>
                                            </div>
                                        )}

                                        {activeTab === "services" && (
                                            <div className="text-right space-y-0.5">
                                                <span className="text-[10px] text-muted-foreground font-semibold uppercase block">Duration</span>
                                                <span className="inline-flex items-center gap-1 text-xs font-bold text-foreground">
                                                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                                    {(item as ClinicService).duration}m
                                                </span>
                                            </div>
                                        )}

                                        {activeTab === "packages" && (
                                            <div className="text-right space-y-0.5">
                                                <span className="text-[10px] text-muted-foreground font-semibold uppercase block">Sessions</span>
                                                <span className="inline-flex items-center gap-1 text-xs font-bold text-foreground">
                                                    <ClipboardList className="h-3.5 w-3.5 text-muted-foreground" />
                                                    {(item as TherapyPackage).sessions} sessions
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => openEditDialog(item)}
                                            className="h-8 text-[11px] font-semibold flex-1 border-border bg-background hover:bg-muted text-foreground rounded-lg cursor-pointer gap-1.5"
                                        >
                                            <Edit className="h-3.5 w-3.5 text-muted-foreground" /> Edit
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button 
                                                    variant="outline" 
                                                    size="icon"
                                                    className="h-8 w-8 border-border bg-background hover:bg-muted rounded-lg cursor-pointer"
                                                >
                                                    <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="rounded-xl border border-border p-1 bg-card">
                                                <DropdownMenuItem 
                                                    onClick={() => openEditDialog(item)}
                                                    className="text-xs font-semibold rounded-lg cursor-pointer gap-2 p-2 focus:bg-muted focus:text-foreground"
                                                >
                                                    <Edit className="h-3.5 w-3.5 text-muted-foreground" /> Modify Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    onClick={() => handleDeleteItem(item.id)}
                                                    className="text-xs font-semibold rounded-lg cursor-pointer gap-2 p-2 text-rose-600 focus:bg-rose-50/50 dark:focus:bg-rose-950/20 focus:text-rose-600 dark:text-rose-400"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" /> Delete Item
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </Card>
                        )
                    })}
                </div>
            ) : (
                /* List tabular layout */
                <Card className="border border-border bg-card rounded-xl overflow-hidden shadow-xs">
                    <Table>
                        <TableHeader className="bg-muted/50 border-b border-border">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="font-bold text-foreground h-11 text-xs pl-5">Code</TableHead>
                                <TableHead className="font-bold text-foreground h-11 text-xs">Name</TableHead>
                                <TableHead className="font-bold text-foreground h-11 text-xs">Category</TableHead>
                                <TableHead className="font-bold text-foreground h-11 text-xs">Price</TableHead>
                                
                                {activeTab === "products" && <TableHead className="font-bold text-foreground h-11 text-xs">Stock Level</TableHead>}
                                {activeTab === "services" && <TableHead className="font-bold text-foreground h-11 text-xs">Duration</TableHead>}
                                {activeTab === "packages" && <TableHead className="font-bold text-foreground h-11 text-xs">Sessions</TableHead>}
                                
                                <TableHead className="font-bold text-foreground h-11 text-xs">Status</TableHead>
                                <TableHead className="font-bold text-foreground h-11 text-xs text-right pr-5">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedItems.map((item) => (
                                <TableRow key={item.id} className="hover:bg-muted/30 border-b border-border/60 text-xs text-foreground font-medium">
                                    <TableCell className="font-bold font-mono text-muted-foreground pl-5">{item.id}</TableCell>
                                    <TableCell className="font-bold text-foreground">{item.name}</TableCell>
                                    <TableCell className="text-muted-foreground font-semibold">{item.category}</TableCell>
                                    <TableCell className="font-bold text-foreground">₹{item.price.toLocaleString("en-IN")}</TableCell>
                                    
                                    {activeTab === "products" && (
                                        <TableCell>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${
                                                (item as Product).stock > 10 
                                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" 
                                                    : (item as Product).stock > 0 
                                                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                                            }`}>
                                                {(item as Product).stock} units
                                            </span>
                                        </TableCell>
                                    )}

                                    {activeTab === "services" && (
                                        <TableCell className="text-foreground font-semibold">{(item as ClinicService).duration} mins</TableCell>
                                    )}

                                    {activeTab === "packages" && (
                                        <TableCell className="text-foreground font-semibold">{(item as TherapyPackage).sessions} sessions</TableCell>
                                    )}

                                    <TableCell>
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                                            item.status === "Active" 
                                                ? "bg-emerald-50/50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800" 
                                                : "bg-slate-50/50 text-slate-700 border-slate-200 dark:bg-slate-950/30 dark:text-slate-400 dark:border-slate-800"
                                        }`}>
                                            <span className={`h-1.5 w-1.5 rounded-full ${item.status === "Active" ? "bg-emerald-500" : "bg-slate-400"}`} />
                                            {item.status}
                                        </span>
                                    </TableCell>
                                    
                                    <TableCell className="text-right space-x-1 pr-5">
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => openEditDialog(item)}
                                            className="h-7 text-[10px] font-semibold border-border bg-background hover:bg-muted text-foreground rounded-lg cursor-pointer gap-1 px-2.5"
                                        >
                                            <Edit className="h-3 w-3" /> Edit
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => handleDeleteItem(item.id)}
                                            className="h-7 text-[10px] font-semibold border-border bg-background hover:bg-rose-50/50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:text-rose-600 rounded-lg cursor-pointer gap-1 px-2.5"
                                        >
                                            <Trash2 className="h-3 w-3" /> Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            )}

            {/* Pagination Row */}
            <div className="flex items-center justify-between border-t border-border pt-4 text-xs font-semibold text-muted-foreground">
                <span>
                    Showing {filteredItems.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length} items
                </span>
                
                <div className="flex items-center space-x-1">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="h-8 w-8 border-border bg-background hover:bg-muted rounded-lg cursor-pointer"
                    >
                        <ChevronLeft className="h-4 w-4 text-foreground" />
                    </Button>
                    
                    {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
                        <Button
                            key={page}
                            variant={currentPage === page ? "secondary" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="h-8 w-8 border-border bg-background hover:bg-muted rounded-lg cursor-pointer text-xs"
                        >
                            {page}
                        </Button>
                    ))}

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 border-border bg-background hover:bg-muted rounded-lg cursor-pointer"
                    >
                        <ChevronRight className="h-4 w-4 text-foreground" />
                    </Button>
                </div>
            </div>

            {/* Add & Edit Modal Dialog */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="max-w-md w-full rounded-xl border border-border p-6 bg-card font-sans">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-foreground">
                            {editingItem ? "Edit Item Details" : `Add New ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1, -1)}`}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Provide the details for your catalog item below.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSaveItem} className="space-y-4 pt-2 text-xs">
                        {/* Title/Name */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Item Name</label>
                            <Input
                                placeholder={`e.g. Ortho Support Brace`}
                                value={formName}
                                onChange={(e) => setFormName(e.target.value)}
                                className="h-9 bg-background border-border text-foreground text-xs rounded-lg"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Price */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Price (₹)</label>
                                <Input
                                    type="number"
                                    placeholder="Price"
                                    value={formPrice}
                                    onChange={(e) => setFormPrice(e.target.value)}
                                    className="h-9 bg-background border-border text-foreground text-xs rounded-lg"
                                    required
                                    min="0"
                                />
                            </div>

                            {/* Category */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Category</label>
                                <select
                                    value={formCategory}
                                    onChange={(e) => setFormCategory(e.target.value)}
                                    className="h-9 px-2 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none cursor-pointer font-medium"
                                >
                                    {categories.filter(c => c !== "All").map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Dynamic attributes based on tab */}
                            {activeTab === "products" && (
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Stock Count</label>
                                    <Input
                                        type="number"
                                        placeholder="Quantity"
                                        value={formStock}
                                        onChange={(e) => setFormStock(e.target.value)}
                                        className="h-9 bg-background border-border text-foreground text-xs rounded-lg"
                                        required
                                        min="0"
                                    />
                                </div>
                            )}

                            {activeTab === "services" && (
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Duration (Mins)</label>
                                    <Input
                                        type="number"
                                        placeholder="Duration in mins"
                                        value={formDuration}
                                        onChange={(e) => setFormDuration(e.target.value)}
                                        className="h-9 bg-background border-border text-foreground text-xs rounded-lg"
                                        required
                                        min="1"
                                    />
                                </div>
                            )}

                            {activeTab === "packages" && (
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Sessions Count</label>
                                    <Input
                                        type="number"
                                        placeholder="Number of sessions"
                                        value={formSessions}
                                        onChange={(e) => setFormSessions(e.target.value)}
                                        className="h-9 bg-background border-border text-foreground text-xs rounded-lg"
                                        required
                                        min="1"
                                    />
                                </div>
                            )}

                            {/* Status */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Status</label>
                                <select
                                    value={formStatus}
                                    onChange={(e) => setFormStatus(e.target.value as any)}
                                    className="h-9 px-2 bg-background border border-[#dde3ed] dark:border-border rounded-lg text-xs text-foreground focus:outline-none cursor-pointer font-medium"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Description</label>
                            <textarea
                                placeholder="Describe the item..."
                                value={formDescription}
                                onChange={(e) => setFormDescription(e.target.value)}
                                rows={3}
                                className="w-full p-2 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none resize-none"
                            />
                        </div>

                        {/* Dialog Actions */}
                        <DialogFooter className="pt-2 gap-2 flex justify-end">
                            <DialogClose asChild>
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    className="h-8.5 text-xs font-semibold border-border bg-background hover:bg-muted text-foreground rounded-lg cursor-pointer"
                                    onClick={resetForm}
                                >
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button 
                                type="submit" 
                                className="h-8.5 text-xs font-semibold bg-[#1a6eb5] hover:bg-[#1d7ccb] text-white rounded-lg cursor-pointer px-4"
                            >
                                {editingItem ? "Save Changes" : "Create Item"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
