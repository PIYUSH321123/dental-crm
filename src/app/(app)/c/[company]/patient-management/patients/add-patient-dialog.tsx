import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Patient, mockTherapists } from "./_patient-table/patient-data"

interface AddPatientDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSave: (patient: Omit<Patient, "id" | "created_at" | "timeline" | "documents" | "invoices" | "sessions_attended" | "last_visit">) => void
}

export function AddPatientDialog({ open, onOpenChange, onSave }: AddPatientDialogProps) {
    // Form fields
    const [name, setName] = useState("")
    const [dob, setDob] = useState("")
    const [gender, setGender] = useState("Male")
    const [bloodGroup, setBloodGroup] = useState("O+")
    const [mobile, setMobile] = useState("")
    const [altMobile, setAltMobile] = useState("")
    const [email, setEmail] = useState("")
    const [occupation, setOccupation] = useState("")
    const [address, setAddress] = useState("")
    const [height, setHeight] = useState("170")
    const [weight, setWeight] = useState("70")
    const [bp, setBp] = useState("120/80")
    const [condition, setCondition] = useState("Knee OA")
    const [assignedTherapistId, setAssignedTherapistId] = useState(mockTherapists[0].id)
    const [sessionsTotal, setSessionsTotal] = useState("10")
    const [status, setStatus] = useState<"Active" | "Completed" | "On Hold">("Active")
    const [balance, setBalance] = useState("0")

    // Medical history fields
    const [medConditions, setMedConditions] = useState("")
    const [surgeries, setSurgeries] = useState("")
    const [allergies, setAllergies] = useState("")
    const [medications, setMedications] = useState("")

    // Emergency contact fields
    const [emergencyName, setEmergencyName] = useState("")
    const [emergencyRelation, setEmergencyRelation] = useState("")
    const [emergencyPhone, setEmergencyPhone] = useState("")

    // Computed BMI
    const [bmi, setBmi] = useState("24.2 (Normal)")
    const [bmiColor, setBmiColor] = useState("bg-emerald-50 text-emerald-700 border-emerald-200")

    useEffect(() => {
        const h = parseFloat(height)
        const w = parseFloat(weight)
        if (h > 0 && w > 0) {
            const heightM = h / 100
            const bmiValue = w / (heightM * heightM)
            const roundedBmi = bmiValue.toFixed(1)
            let category = "Normal"
            let color = "bg-emerald-50 text-emerald-700 border-emerald-200"

            if (bmiValue < 18.5) {
                category = "Underweight"
                color = "bg-sky-50 text-sky-700 border-sky-200"
            } else if (bmiValue >= 25 && bmiValue < 30) {
                category = "Overweight"
                color = "bg-amber-50 text-amber-700 border-amber-200"
            } else if (bmiValue >= 30) {
                category = "Obese"
                color = "bg-destructive/10 text-destructive border-destructive/20"
            }
            setBmi(`${roundedBmi} (${category})`)
            setBmiColor(color)
        } else {
            setBmi("N/A")
            setBmiColor("bg-muted text-muted-foreground border-border")
        }
    }, [height, weight])

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!name || !mobile || !dob) {
            alert("Name, Mobile number, and Date of Birth are required.")
            return
        }

        onSave({
            name,
            dob,
            gender,
            blood_group: bloodGroup,
            mobile,
            alt_mobile: altMobile,
            email,
            occupation,
            address,
            height: parseFloat(height) || 0,
            weight: parseFloat(weight) || 0,
            bmi,
            bp,
            condition,
            assigned_therapist_id: assignedTherapistId,
            sessions_total: parseInt(sessionsTotal) || 0,
            status,
            balance: parseFloat(balance) || 0,
            medical_history: {
                conditions: medConditions,
                surgeries,
                allergies,
                medications
            },
            emergency_contact: {
                name: emergencyName,
                relation: emergencyRelation,
                phone: emergencyPhone
            }
        })

        // Reset fields
        setName("")
        setDob("")
        setGender("Male")
        setBloodGroup("O+")
        setMobile("")
        setAltMobile("")
        setEmail("")
        setOccupation("")
        setAddress("")
        setHeight("170")
        setWeight("70")
        setBp("120/80")
        setCondition("Knee OA")
        setAssignedTherapistId(mockTherapists[0].id)
        setSessionsTotal("10")
        setStatus("Active")
        setBalance("0")
        setMedConditions("")
        setSurgeries("")
        setAllergies("")
        setMedications("")
        setEmergencyName("")
        setEmergencyRelation("")
        setEmergencyPhone("")
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl lg:max-w-[70vw] max-h-[85vh] overflow-y-auto border border-border p-6 rounded-lg bg-card">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold text-foreground">Register New Patient</DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        Fill in basic demographics, physical readings, medical histories, and emergency contacts.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleFormSubmit} className="space-y-6 mt-4">
                    {/* Section 1: Demographics */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-primary border-b pb-1">Basic Demographics</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="name" className="text-xs">Full Name *</Label>
                                <Input id="name" value={name} onChange={e => setName(e.target.value)} required className="h-9 text-xs" placeholder="e.g. John Doe" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="dob" className="text-xs">Date of Birth *</Label>
                                <Input id="dob" type="date" value={dob} onChange={e => setDob(e.target.value)} required className="h-9 text-xs" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="gender" className="text-xs">Gender</Label>
                                <Select value={gender} onValueChange={setGender}>
                                    <SelectTrigger id="gender" className="h-9 text-xs cursor-pointer">
                                        <SelectValue placeholder="Select Gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Male" className="text-xs cursor-pointer">Male</SelectItem>
                                        <SelectItem value="Female" className="text-xs cursor-pointer">Female</SelectItem>
                                        <SelectItem value="Other" className="text-xs cursor-pointer">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="blood" className="text-xs">Blood Group</Label>
                                <Select value={bloodGroup} onValueChange={setBloodGroup}>
                                    <SelectTrigger id="blood" className="h-9 text-xs cursor-pointer">
                                        <SelectValue placeholder="Select Blood Group" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {["A+", "B+", "AB+", "O+", "A-", "B-", "AB-", "O-"].map(bg => (
                                            <SelectItem key={bg} value={bg} className="text-xs cursor-pointer">{bg}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="mobile" className="text-xs">Mobile Phone *</Label>
                                <Input id="mobile" value={mobile} onChange={e => setMobile(e.target.value)} required className="h-9 text-xs" placeholder="e.g. +91 98765 43210" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="altMobile" className="text-xs">Alt. Mobile</Label>
                                <Input id="altMobile" value={altMobile} onChange={e => setAltMobile(e.target.value)} className="h-9 text-xs" placeholder="e.g. +91 99887 65432" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="email" className="text-xs">Email Address</Label>
                                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="h-9 text-xs" placeholder="e.g. user@email.com" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="occupation" className="text-xs">Occupation</Label>
                                <Input id="occupation" value={occupation} onChange={e => setOccupation(e.target.value)} className="h-9 text-xs" placeholder="e.g. Software Engineer" />
                            </div>
                            <div className="space-y-1 md:col-span-2 lg:col-span-4">
                                <Label htmlFor="address" className="text-xs">Residential Address</Label>
                                <Input id="address" value={address} onChange={e => setAddress(e.target.value)} className="h-9 text-xs" placeholder="Full residential details..." />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Physical Readings & Clinical Assignment */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-primary border-b pb-1">Vitals, Clinical Condition & Billing</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="height" className="text-xs">Height (cm)</Label>
                                <Input id="height" type="number" value={height} onChange={e => setHeight(e.target.value)} className="h-9 text-xs" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="weight" className="text-xs">Weight (kg)</Label>
                                <Input id="weight" type="number" value={weight} onChange={e => setWeight(e.target.value)} className="h-9 text-xs" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="bmi" className="text-xs">BMI (Calculated, Read-only)</Label>
                                <div className={`h-9 px-3 border rounded-md flex items-center text-xs font-semibold ${bmiColor}`}>
                                    {bmi}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="bp" className="text-xs">Blood Pressure (BP)</Label>
                                <Input id="bp" value={bp} onChange={e => setBp(e.target.value)} className="h-9 text-xs" placeholder="e.g. 120/80" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="condition" className="text-xs">Condition / Diagnosis</Label>
                                <Select value={condition} onValueChange={setCondition}>
                                    <SelectTrigger id="condition" className="h-9 text-xs cursor-pointer">
                                        <SelectValue placeholder="Select Condition" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {["Knee OA", "Frozen Shoulder", "Sports Knee", "Back Pain", "Cervical Spondylosis", "Sciatica", "Ankle Sprain"].map(c => (
                                            <SelectItem key={c} value={c} className="text-xs cursor-pointer">{c}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="therapist" className="text-xs">Assigned Therapist</Label>
                                <Select value={assignedTherapistId} onValueChange={setAssignedTherapistId}>
                                    <SelectTrigger id="therapist" className="h-9 text-xs cursor-pointer">
                                        <SelectValue placeholder="Select Therapist" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-60 overflow-y-auto">
                                        {mockTherapists.map(t => (
                                            <SelectItem key={t.id} value={t.id} className="text-xs cursor-pointer">{t.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="sessions" className="text-xs">Total Sessions Package</Label>
                                <Input id="sessions" type="number" value={sessionsTotal} onChange={e => setSessionsTotal(e.target.value)} className="h-9 text-xs" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="balance" className="text-xs">Initial Due Balance (₹)</Label>
                                <Input id="balance" type="number" value={balance} onChange={e => setBalance(e.target.value)} className="h-9 text-xs" placeholder="e.g. 2500" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="status" className="text-xs">Initial Status</Label>
                                <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                                    <SelectTrigger id="status" className="h-9 text-xs cursor-pointer">
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Active" className="text-xs cursor-pointer">Active</SelectItem>
                                        <SelectItem value="Completed" className="text-xs cursor-pointer">Completed</SelectItem>
                                        <SelectItem value="On Hold" className="text-xs cursor-pointer">On Hold</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Medical History */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-primary border-b pb-1">Medical History</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="medConditions" className="text-xs">Existing Conditions / Diseases</Label>
                                <Input id="medConditions" value={medConditions} onChange={e => setMedConditions(e.target.value)} className="h-9 text-xs" placeholder="e.g. Diabetes, Hypertension" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="surgeries" className="text-xs">Past Surgeries</Label>
                                <Input id="surgeries" value={surgeries} onChange={e => setSurgeries(e.target.value)} className="h-9 text-xs" placeholder="e.g. Appendectomy - 2021" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="allergies" className="text-xs">Allergies</Label>
                                <Input id="allergies" value={allergies} onChange={e => setAllergies(e.target.value)} className="h-9 text-xs" placeholder="e.g. Penicillin, Peanuts" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="medications" className="text-xs">Current Medications</Label>
                                <Input id="medications" value={medications} onChange={e => setMedications(e.target.value)} className="h-9 text-xs" placeholder="e.g. Metformin 500mg, Advil" />
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Emergency Contact */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-primary border-b pb-1">Emergency Contact</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="emergencyName" className="text-xs">Contact Name</Label>
                                <Input id="emergencyName" value={emergencyName} onChange={e => setEmergencyName(e.target.value)} className="h-9 text-xs" placeholder="Name" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="emergencyRelation" className="text-xs">Relation</Label>
                                <Input id="emergencyRelation" value={emergencyRelation} onChange={e => setEmergencyRelation(e.target.value)} className="h-9 text-xs" placeholder="Relation (Wife, Husband, Father...)" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="emergencyPhone" className="text-xs">Contact Phone</Label>
                                <Input id="emergencyPhone" value={emergencyPhone} onChange={e => setEmergencyPhone(e.target.value)} className="h-9 text-xs" placeholder="Phone" />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="pt-4 border-t gap-2">
                        <Button type="button" variant="outline" className="h-9 text-xs cursor-pointer" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" className="h-9 text-xs bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer">
                            Register Patient
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
