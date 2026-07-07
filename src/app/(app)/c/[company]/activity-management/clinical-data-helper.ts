export interface ClinicalData {
    primaryComplaint: string
    painScore: number
    painDuration: string // e.g. "1–6 months", "< 1 week", etc.
    painType: "Dull Ache" | "Sharp" | "Burning" | "Throbbing"
    diagnosis: string
    icdCode: string
    clinicalNotes: string
    rom: string
    strength: string
    specialTests: string
    therapyType: string
    expectedRecovery: string
    frequency: string
    goals: string
    phases: { name: string; duration: string }[]
    exercises: {
        id: number
        exerciseName: string
        sets: number
        repsOrDuration: string
        frequency: string
        instructions: string
        videoUrl?: string
    }[]
}

export const getPatientClinicalData = (patientIdOrName: string): ClinicalData => {
    // Standardize key (extract ID or check name)
    const key = patientIdOrName || ""
    
    if (key.includes("P-0141") || key.includes("Meera") || key === "P-0141") {
        return {
            primaryComplaint: "Stiffness and pain in right shoulder, unable to lift arm above 90 degrees.",
            painScore: 6,
            painDuration: "1–6 months",
            painType: "Sharp",
            diagnosis: "Adhesive Capsulitis (Frozen Shoulder) - Freezing Phase",
            icdCode: "M75.01",
            clinicalNotes: "Severe restriction in passive external rotation and abduction. Night pain is significant.",
            rom: "Abduction: 85°, Flexion: 95°, External Rotation: 20°",
            strength: "Deltoid: 4/5, Rotator Cuff: 3+/5",
            specialTests: "Neer's Test: positive, Hawkins-Kennedy Test: positive",
            therapyType: "Shoulder Mobilization",
            expectedRecovery: "4-6 Months",
            frequency: "3x weekly",
            goals: "Restore shoulder ROM, reduce night pain, restore function",
            phases: [
                { name: "Phase 1: Pain Relief & Gentle Mobilization", duration: "4 weeks" },
                { name: "Phase 2: Active ROM & Stretching", duration: "8 weeks" },
                { name: "Phase 3: Strengthening & Functional Recovery", duration: "8 weeks" }
            ],
            exercises: [
                { id: 1, exerciseName: "Shoulder Pendulum", sets: 3, repsOrDuration: "2 minutes", frequency: "Daily", instructions: "Lean forward, swing arm gently" },
                { id: 2, exerciseName: "Wall Climbs (Flexion)", sets: 3, repsOrDuration: "10 reps", frequency: "2x daily", instructions: "Walk fingers up wall to tolerance" },
                { id: 3, exerciseName: "Towel Stretch (Internal Rotation)", sets: 3, repsOrDuration: "30 seconds", frequency: "Daily", instructions: "Gently pull arm behind back" }
            ]
        }
    }
    
    if (key.includes("P-0139") || key.includes("Arjun") || key === "P-0139") {
        return {
            primaryComplaint: "Post-op ACL reconstruction stiffness, mild instability on pivoting.",
            painScore: 3,
            painDuration: "1–4 weeks",
            painType: "Throbbing",
            diagnosis: "Post-ACL Reconstruction Rehab (Phase II)",
            icdCode: "M23.2",
            clinicalNotes: "Graft is stable. Quadriceps lag present. Working on terminal knee extension.",
            rom: "Knee Extension: 0°, Knee Flexion: 125°",
            strength: "Quads: 4-/5, Hamstrings: 4/5",
            specialTests: "Lachman Test: Grade 1 (Firm Endpoint), Anterior Drawer: Mild laxity",
            therapyType: "ACL Post-op Rehab",
            expectedRecovery: "6-9 Months",
            frequency: "4x weekly",
            goals: "Full terminal extension, hypertrophy of quadriceps, neuromuscular control",
            phases: [
                { name: "Phase 1: ROM & Swelling Control (Completed)", duration: "2 weeks" },
                { name: "Phase 2: Strength & Neuromuscular Control", duration: "6 weeks" },
                { name: "Phase 3: Sports-Specific Agility & Plyometrics", duration: "12 weeks" }
            ],
            exercises: [
                { id: 1, exerciseName: "Single Leg Squats", sets: 3, repsOrDuration: "12 reps", frequency: "Daily", instructions: "Ensure knee aligns over toes" },
                { id: 2, exerciseName: "Agility Ladder Drills", sets: 3, repsOrDuration: "5 minutes", frequency: "3x weekly", instructions: "Focus on quick, stable foot placement" },
                { id: 3, exerciseName: "Balance Board Isometrics", sets: 3, repsOrDuration: "1 minute", frequency: "Daily", instructions: "Hold single leg balance on wobble board" }
            ]
        }
    }
    
    // Default to Ravi Kumar (Knee OA, P-0142)
    return {
        primaryComplaint: "Pain in left knee while walking and climbing stairs.",
        painScore: 7,
        painDuration: "1–6 months",
        painType: "Dull Ache",
        diagnosis: "Knee OA (Kellgren-Lawrence Grade II)",
        icdCode: "M17.12",
        clinicalNotes: "Mild joint effusion, medial joint line tenderness. Crepitus present during active flexion.",
        rom: "Knee Flexion: 110°, Knee Extension: -5°",
        strength: "Quads: 3+/5, Hamstrings: 4/5",
        specialTests: "Patellar Grinding: positive, Joint line tenderness: medial",
        therapyType: "Knee Joint Mobilization",
        expectedRecovery: "8-12 Weeks",
        frequency: "2x weekly",
        goals: "Reduce pain, increase quad strength, improve knee flexion ROM",
        phases: [
            { name: "Phase 1: Pain Modulation & Soft Tissue Mobilization", duration: "2 weeks" },
            { name: "Phase 2: Quadriceps & Gluteal Strengthening", duration: "6 weeks" },
            { name: "Phase 3: Proprioceptive & Functional Retraining", duration: "4 weeks" }
        ],
        exercises: [
            { id: 1, exerciseName: "Quad Sets", sets: 3, repsOrDuration: "15 reps", frequency: "Daily", instructions: "Contract quads, hold 5s" },
            { id: 2, exerciseName: "Straight Leg Raise", sets: 3, repsOrDuration: "12 reps", frequency: "Daily", instructions: "Keep knee straight" },
            { id: 3, exerciseName: "Hamstring Stretch", sets: 3, repsOrDuration: "30 seconds", frequency: "2x daily", instructions: "Gentle stretch, no pain" }
        ]
    }
}
