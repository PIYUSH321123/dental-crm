// DentFlow mock data — single source of truth for all UI hardcoded data

export const DENTFLOW_USER = {
  name: "Anita Pawar",
  role: "Front desk",
  initials: "AP",
  branch: "Station Road branch",
}

export const DENTFLOW_BRANCHES = [
  "Station Road branch",
  "Koregaon Park branch",
  "Aundh branch",
]

export type AppointmentStatus =
  | "Done"
  | "In chair"
  | "Checked in"
  | "Confirmed"
  | "Not confirmed"
  | "Late"

export type PatientFlag = "Anxious" | "Allergy" | "VIP" | "New"

export interface TodayAppointment {
  time: string
  patient: string
  flags: PatientFlag[]
  procedure: string
  doctor: string
  chair: string
  status: AppointmentStatus
  lateMin?: number
}

export const TODAY_APPOINTMENTS: TodayAppointment[] = [
  {
    time: "09:30",
    patient: "Meera Nair",
    flags: [],
    procedure: "Scaling & polishing",
    doctor: "Dr. Sneha K.",
    chair: "C1",
    status: "Done",
  },
  {
    time: "10:00",
    patient: "Priya Deshmukh",
    flags: ["Anxious", "Allergy"],
    procedure: "Root canal 36 · sitting 1",
    doctor: "Dr. Sneha K.",
    chair: "C2",
    status: "In chair",
  },
  {
    time: "10:15",
    patient: "Rahul Verma",
    flags: [],
    procedure: "Composite filling 14",
    doctor: "Dr. Arjun M.",
    chair: "C1",
    status: "Checked in",
  },
  {
    time: "10:30",
    patient: "Aarav Joshi (7y)",
    flags: ["New"],
    procedure: "Sealants + fluoride",
    doctor: "Dr. Arjun M.",
    chair: "C3",
    status: "Late",
    lateMin: 10,
  },
  {
    time: "11:00",
    patient: "Fatima Shaikh",
    flags: [],
    procedure: "Implant review",
    doctor: "Dr. Farhan A.",
    chair: "C4",
    status: "Confirmed",
  },
  {
    time: "11:30",
    patient: "Suresh Patil",
    flags: [],
    procedure: "Denture trial",
    doctor: "Dr. Sneha K.",
    chair: "C2",
    status: "Confirmed",
  },
  {
    time: "12:00",
    patient: "Kavya Reddy",
    flags: ["Anxious"],
    procedure: "Aligner tray 10 check",
    doctor: "Dr. Karan S.",
    chair: "C3",
    status: "Confirmed",
  },
  {
    time: "12:30",
    patient: "Imran Khan",
    flags: [],
    procedure: "Consultation · tooth pain",
    doctor: "Dr. Arjun M.",
    chair: "C1",
    status: "Not confirmed",
  },
  {
    time: "13:00",
    patient: "Neha Gupta",
    flags: [],
    procedure: "Zirconia crown fit 46",
    doctor: "Dr. Sneha K.",
    chair: "C2",
    status: "Confirmed",
  },
  {
    time: "14:30",
    patient: "Vikram Singh",
    flags: [],
    procedure: "Extraction 38",
    doctor: "Dr. Farhan A.",
    chair: "C4",
    status: "Not confirmed",
  },
]

export interface AttentionItem {
  id: string
  color: "red" | "orange" | "blue" | "yellow" | "gray"
  title: string
  body: string
}

export const ATTENTION_ITEMS: AttentionItem[] = [
  {
    id: "a1",
    color: "red",
    title: "Pain rising — Rohan Mehta",
    body: "Day 3 after extraction 48; pain 8/10, swelling reported",
  },
  {
    id: "a2",
    color: "orange",
    title: "3:30 pm slot freed on Chair 2",
    body: "Offered to 3 waitlisted patients · 1 viewed",
  },
  {
    id: "a3",
    color: "blue",
    title: "Crown for Neha Gupta arrives 12:15",
    body: "Precision Dental Lab · fit booked at 1:00 pm",
  },
  {
    id: "a4",
    color: "yellow",
    title: "3 appointments not confirmed",
    body: "Reminder sent 8:00 am · call before 11:00",
  },
  {
    id: "a5",
    color: "gray",
    title: "Autoclave cycle #1424 not logged",
    body: "Started 9:40 am on Autoclave B",
  },
]

export const TODAY_KPIS = {
  appointmentsToday: 34,
  appointmentsDone: 9,
  appointmentsNotConfirmed: 3,
  chairsInUse: 3,
  chairsTotal: 4,
  chairsFreeNote: "Chair 4 free till 11:00",
  collectedToday: 48200,
  collectedUpi: 71,
  collectedCard: 18,
  collectedCash: 11,
  unfinishedTreatment: "6.84 L",
  unfinishedPlans: 57,
  postOpAlerts: 2,
  postOpNote: "Pain rising after extraction",
}

export const AI_RECEPTIONIST = {
  since: "8:00 am",
  callsHandled: 23,
  booked: 6,
  summary: "4 calls handed to you (implant swelling, insurance query…)",
}

// C04 Dental Chart mock data
export interface OdontogramTooth {
  number: number
  status: "healthy" | "caries" | "filled" | "crown" | "root_canal" | "missing" | "planned"
  badge?: string
  name: string
  conditionText?: string
  finding?: string
  surfaces?: {
    B: boolean
    M: boolean
    O: boolean
    D: boolean
    L: boolean
  }
  planned?: { name: string; price: string }[]
}

export const DENTAL_CHART_PATIENT = {
  name: "Priya Deshmukh",
  fdiNote: "FDI numbering · last charted 12 Sep by Dr. Sneha",
  doctor: "Dr. Sneha Kulkarni",
  doctorRole: "Dentist — owner",
  doctorInitials: "SK",
  branch: "Station Road branch",
}

export const ODONTOGRAM_TEETH: Record<number, OdontogramTooth> = {
  // Upper arch: 18..11 and 21..28
  18: { number: 18, status: "missing", name: "Upper right third molar" },
  17: { number: 17, status: "healthy", name: "Upper right second molar" },
  16: { number: 16, status: "filled", badge: "F", name: "Upper right first molar" },
  15: { number: 15, status: "healthy", name: "Upper right second premolar" },
  14: { number: 14, status: "planned", badge: "P", name: "Upper right first premolar" },
  13: { number: 13, status: "healthy", name: "Upper right canine" },
  12: { number: 12, status: "healthy", name: "Upper right lateral incisor" },
  11: { number: 11, status: "healthy", name: "Upper right central incisor" },
  21: { number: 21, status: "healthy", name: "Upper left central incisor" },
  22: { number: 22, status: "healthy", name: "Upper left lateral incisor" },
  23: { number: 23, status: "healthy", name: "Upper left canine" },
  24: { number: 24, status: "healthy", name: "Upper left first premolar" },
  25: { number: 25, status: "root_canal", badge: "RCT", name: "Upper left second premolar" },
  26: { number: 26, status: "filled", badge: "F", name: "Upper left first molar" },
  27: { number: 27, status: "healthy", name: "Upper left second molar" },
  28: { number: 28, status: "missing", name: "Upper left third molar" },

  // Lower arch: 48..41 and 31..38
  48: { number: 48, status: "missing", name: "Lower right third molar" },
  47: { number: 47, status: "healthy", name: "Lower right second molar" },
  46: { number: 46, status: "crown", badge: "Cr", name: "Lower right first molar" },
  45: { number: 45, status: "healthy", name: "Lower right second premolar" },
  44: { number: 44, status: "healthy", name: "Lower right first premolar" },
  43: { number: 43, status: "healthy", name: "Lower right canine" },
  42: { number: 42, status: "healthy", name: "Lower right lateral incisor" },
  41: { number: 41, status: "healthy", name: "Lower right central incisor" },
  31: { number: 31, status: "healthy", name: "Lower left central incisor" },
  32: { number: 32, status: "healthy", name: "Lower left lateral incisor" },
  33: { number: 33, status: "healthy", name: "Lower left canine" },
  34: { number: 34, status: "healthy", name: "Lower left first premolar" },
  35: { number: 35, status: "healthy", name: "Lower left second premolar" },
  36: {
    number: 36,
    status: "caries",
    badge: "C",
    name: "Lower left first molar",
    conditionText: "Deep caries (O, D) — near pulp",
    surfaces: { B: false, M: false, O: true, D: true, L: false },
    finding: "Deep disto-occlusal caries, tender on percussion. IOPA shows radiolucency close to pulp.",
    planned: [
      { name: "Root canal treatment", price: "₹8,000" },
      { name: "Zirconia crown", price: "₹14,500" },
    ],
  },
  37: { number: 37, status: "filled", badge: "F", name: "Lower left second molar" },
  38: { number: 38, status: "missing", name: "Lower left third molar" },
}

export const PERIODONTAL_LOWER_LEFT = [
  { tooth: 38, pocket: null, bleeding: false, mobility: null },
  { tooth: 37, pocket: 3, bleeding: false, mobility: 0 },
  { tooth: 36, pocket: 5, bleeding: true, mobility: 0, alert: true },
  { tooth: 35, pocket: 2, bleeding: false, mobility: 0 },
  { tooth: 34, pocket: 3, bleeding: true, mobility: 0 },
  { tooth: 33, pocket: 2, bleeding: false, mobility: 0 },
  { tooth: 32, pocket: 4, bleeding: false, mobility: 0 },
  { tooth: 31, pocket: 2, bleeding: true, mobility: 0 },
]

export const DENTAL_IMAGING_ITEMS = [
  { id: "iopa-36", title: "IOPA · 36", date: "12 Sep 2026", hasAnnotation: true },
  { id: "opg", title: "OPG", date: "12 Sep 2026", hasAnnotation: false },
  { id: "bitewing-l", title: "Bitewing L", date: "14 Mar 2026", hasAnnotation: false },
]

// C06 Treatment Explainer mock data
export interface ExplainerLanguageData {
  code: string
  label: string
  what: string
  wait: string
  recovery: string
  options: {
    a: { title: string; price: string; note: string }
    b: { title: string; price: string; note: string }
    c: { title: string; price: string; note: string }
  }
  whatsappPreview: {
    text: string
    bestOption: string
  }
}

export const EXPLAINER_LANGUAGES: ExplainerLanguageData[] = [
  {
    code: "en",
    label: "English",
    what: "There is deep decay in your lower left molar (36) that has reached very close to the nerve. This causes the sharp sensitivity and ache with hot and cold.",
    wait: "If left untreated, infection can reach the nerve and spread to the bone causing severe swelling. Saving the tooth then becomes harder and more expensive.",
    recovery: "Mild tenderness for 1-2 days following root canal is normal. Avoid hard foods on that side until the protective crown is fitted.",
    options: {
      a: { title: "A · Root canal + crown", price: "₹22,500", note: "Saves natural tooth" },
      b: { title: "B · Extraction + implant", price: "₹42,000", note: "3-4 months duration" },
      c: { title: "C · Extraction only", price: "₹2,500", note: "Leaves missing gap" },
    },
    whatsappPreview: {
      text: "Priya ji, regarding your tooth (36): deep caries near pulp. Treating now preserves your natural tooth.",
      bestOption: "3 options · Best: A - ₹22,500 (EMI 3 × ₹7,500)",
    },
  },
  {
    code: "hi",
    label: "हिन्दी",
    what: "आपके निचले बायें दाँत (36) में गहरी सड़न है जो नस के बहुत पास पहुँच गई है। इसी वजह से ठंडा-गरम लगने पर दर्द होता है।",
    wait: "सड़न नस तक पहुँचकर इन्फेक्शन और सूजन कर सकती है। तब दाँत बचाना मुश्किल और महंगा हो जाता है।",
    recovery: "रूट कैनाल के बाद 1–2 दिन हल्का दर्द सामान्य है। क्राउन लगने तक उस तरफ से सख्त चीज़ न चबाएँ।",
    options: {
      a: { title: "A · रूट कैनाल + क्राउन", price: "₹22,500", note: "दाँत बचता है" },
      b: { title: "B · दाँत निकालकर इम्प्लांट", price: "₹42,000", note: "3-4 महीने" },
      c: { title: "C · सिर्फ दाँत निकालना", price: "₹2,500", note: "खाली जगह रहेगी" },
    },
    whatsappPreview: {
      text: "प्रिया जी, आपके दाँत (36) की जानकारी: गहरी सड़न नस के पास है। अभी इलाज करने से दाँत बच सकता है।",
      bestOption: "3 विकल्प · सबसे अच्छा: A - ₹22,500 (EMI 3 × ₹7,500)",
    },
  },
  {
    code: "mr",
    label: "मराठी",
    what: "तुमच्या खालच्या डाव्या दाढेत (36) खोल कीड लागली असून ती नसेच्या खूप जवळ पोहोचली आहे. त्यामुळेच गार-गरम लागल्यावर तीव्र वेदना होतात.",
    wait: "कीड नसेमध्ये पसरल्यास जंतुसंसर्ग व गालाला सूज येऊ शकते. त्यानंतर दात वाचवणे अवघड व अधिक खर्चिक ठरते.",
    recovery: "रूट कॅनालनंतर 1-2 दिवस हलकी ठसठस होणे सामान्य आहे. कायमचा क्राउन बसेपर्यंत त्या बाजूने कडक पदार्थ चावू नका.",
    options: {
      a: { title: "A · रूट कॅनाल + क्राउन", price: "₹22,500", note: "नैसर्गिक दात वाचतो" },
      b: { title: "B · दात काढून इम्प्लांट", price: "₹42,000", note: "3-4 महिने" },
      c: { title: "C · फक्त दात काढणे", price: "₹2,500", note: "जागा रिकामी राहील" },
    },
    whatsappPreview: {
      text: "प्रिया जी, तुमच्या दाताविषयी (36): खोल कीड नसेजवळ आहे. वेळेत उपचार केल्यास दात नक्की वाचू शकतो.",
      bestOption: "3 पर्याय · सर्वोत्तम: A - ₹22,500 (EMI 3 × ₹7,500)",
    },
  },
  {
    code: "gu",
    label: "ગુજરાતી",
    what: "તમારા નીચેના ડાબા દાઢ (36) માં ઊંડો સડો છે જે નસની ખૂબ નજીક પહોંચી ગયો છે. તેના લીધે જ ઠંડુ-ગરમ ખાવાથી દુખાવો થાય છે.",
    wait: "જો સડો નસ સુધી પહોંચી જાય તો ઇન્ફેક્શન અને સોજો આવી શકે છે. ત્યાર પછી દાંત બચાવવો મુશ્કેલ અને મોંઘો થાય છે.",
    recovery: "રૂટ કેનાલ પછી 1-2 દિવસ થોડો દુખાવો સામાન્ય છે. કેપ ન બેસે ત્યાં સુધી તે બાજુથી કડક વસ્તુ ન ચાવો.",
    options: {
      a: { title: "A · રૂટ કેનાલ + ક્રાઉન", price: "₹22,500", note: "દાંત બચી જશે" },
      b: { title: "B · દાંત કાઢીને ઇમ્પ્લાન્ટ", price: "₹42,000", note: "3-4 મહિના" },
      c: { title: "C · ફક્ત દાંત કઢાવવો", price: "₹2,500", note: "ખાલી જગ્યા રહેશે" },
    },
    whatsappPreview: {
      text: "પ્રિયા જી, તમારા દાંત (36) ની વિગત: ઊંડો સડો નસની નજીક છે. અત્યારે સારવાર કરવાથી દાંત બચી જશે.",
      bestOption: "3 વિકલ્પો · શ્રેષ્ઠ: A - ₹22,500 (EMI 3 × ₹7,500)",
    },
  },
  {
    code: "ta",
    label: "தமிழ்",
    what: "உங்கள் கீழ் இடது கடவாய்ப் பல்லில் (36) நரம்புக்கு மிக அருகில் ஆழமான சொத்தை ஏற்பட்டுள்ளது. அதனால் தான் சூடு அல்லது குளிர்ந்த உணவில் வலி ஏற்படுகிறது.",
    wait: "தாமதித்தால் தொற்று நரம்பில் பரவி கடுமையான வீக்கத்தை உண்டாக்கும். பிறகு பல்லை காப்பாற்றுவது கடினம் மற்றும் செலவாகும்.",
    recovery: "ரூட் கெனால் சிகிச்சைக்குப் பின் 1-2 நாட்கள் லேசான வலி சாதாரணமானது. கிரவுன் போடும் வரை கடினமான உணவு வேண்டாம்.",
    options: {
      a: { title: "A · ரூட் கெனால் + கிரவுன்", price: "₹22,500", note: "இயற்கை பல் காப்பாற்றப்படும்" },
      b: { title: "B · பல் எடுத்து இம்ப்ளான்ட்", price: "₹42,000", note: "3-4 மாதங்கள்" },
      c: { title: "C · பல் பிடுங்குதல் மட்டும்", price: "₹2,500", note: "வெற்றிடம் இருக்கும்" },
    },
    whatsappPreview: {
      text: "பிரியா ஜி, உங்கள் பல் (36) தகவல்: ஆழ்ந்த சொத்தை நரம்பின் அருகில் உள்ளது. உடனே சிகிச்சை செய்தால் பல் காக்கப்படும்.",
      bestOption: "3 வழிகள் · சிறந்தது: A - ₹22,500 (EMI 3 × ₹7,500)",
    },
  },
  {
    code: "te",
    label: "తెలుగు",
    what: "మీ క్రింది ఎడమ దవడ పంటిలో (36) లోతైన పుప్పి నరానికి చాలా దగ్గరగా చేరింది. అందుకే చల్లని, వేడి వస్తువులతో నొప్పి వస్తుంది.",
    wait: "ఆలస్యం చేస్తే ఇన్ఫెక్షన్ నరంలోకి వెళ్లి వాపు వస్తుంది. అప్పుడు పన్ను కాపాడటం కష్టమవుతుంది, ఖర్చు కూడా పెరుగుతుంది.",
    recovery: "రూట్ కెనాల్ తర్వాత 1-2 రోజులు స్వల్ప నొప్పి సాధారణం. క్రౌన్ వేసేవరకు ఆ వైపు గట్టి ఆహారాన్ని నమలవద్దు.",
    options: {
      a: { title: "A · రూట్ కెనాల్ + క్రౌన్", price: "₹22,500", note: "పన్ను కాపాడబడుతుంది" },
      b: { title: "B · పన్ను తీసి ఇంప్లాంట్", price: "₹42,000", note: "3-4 నెలలు" },
      c: { title: "C · కేవలం పన్ను తీసివేత", price: "₹2,500", note: "ఖాళీ స్థలం ఉంటుంది" },
    },
    whatsappPreview: {
      text: "ప్రియా గారు, మీ పంటి (36) సమాచారం: లోతైన పుప్పి నరం వద్ద ఉంది. ఇప్పుడే చికిత్స చేస్తే పన్ను కాపాడవచ్చు.",
      bestOption: "3 ఎంపికలు · ఉత్తమం: A - ₹22,500 (EMI 3 × ₹7,500)",
    },
  },
  {
    code: "kn",
    label: "ಕನ್ನಡ",
    what: "ನಿಮ್ಮ ಕೆಳಗಿನ ಎಡ ದವಡೆ ಹಲ್ಲಿನಲ್ಲಿ (36) ಆಳವಾದ ಹುಳುಕು ನರಕ್ಕೆ ತಲುಪಿದೆ. ಇದರಿಂದಲೇ ಬಿಸಿ ಅಥವಾ ತಣ್ಣನೆಯ ಪದಾರ್ಥ ತಾಗಿದಾಗ ನೋವಾಗುತ್ತದೆ.",
    wait: "ತಡಮಾಡಿದರೆ ಇನ್‌ಫೆಕ್ಷನ್ ನರಕ್ಕೆ ಹರಡಿ ಊತ ಬರುತ್ತದೆ. ನಂತರ ಹಲ್ಲನ್ನು ಉಳಿಸುವುದು ಕಷ್ಟ ಮತ್ತು ದುಬಾರಿಯಾಗುತ್ತದೆ.",
    recovery: "ರೂಟ್ ಕೆನಾಲ್ ನಂತರ 1-2 ದಿನ ಸ್ವಲ್ಪ ನೋವು ಇರುವುದು ಸಾಮಾನ್ಯ. ಕ್ಯಾಪ್ ಹಾಕುವವರೆಗೆ ಆ ಭಾಗದಲ್ಲಿ ಗಟ್ಟಿ ಪದಾರ್ಥ ಕಡಿಯಬೇಡಿ.",
    options: {
      a: { title: "A · ರೂಟ್ ಕೆನಾಲ್ + ಕ್ರೌನ್", price: "₹22,500", note: "ನೈಸರ್ಗಿಕ ಹಲ್ಲು ಉಳಿಯುತ್ತದೆ" },
      b: { title: "B · ಹಲ್ಲು ತೆಗೆದು ಇಂಪ್ಲಾಂಟ್", price: "₹42,000", note: "3-4 ತಿಂಗಳು" },
      c: { title: "C · ಕೇವಲ ಹಲ್ಲು ಕೀಳುವುದು", price: "₹2,500", note: "ಖಾಲಿ ಜಾಗ ಉಳಿಯುತ್ತದೆ" },
    },
    whatsappPreview: {
      text: "ಪ್ರಿಯಾ ಅವರೇ, ನಿಮ್ಮ ಹಲ್ಲಿನ (36) ಮಾಹಿತಿ: ಆಳವಾದ ಹುಳುಕು ನರದ ಬಳಿ ಇದೆ. ಈಗ ಚಿಕಿತ್ಸೆ ಮಾಡಿದರೆ ಹಲ್ಲನ್ನು ಉಳಿಸಬಹುದು.",
      bestOption: "3 ಆಯ್ಕೆಗಳು · ಉತ್ತಮ: A - ₹22,500 (EMI 3 × ₹7,500)",
    },
  },
  {
    code: "bn",
    label: "বাংলা",
    what: "আপনার নিচের বাঁদিকের দাঁতে (36) গভীর ক্ষয় রয়েছে যা স্নায়ুর খুব কাছাকাছি পৌঁছে গেছে। এর কারণেই ঠান্ডা বা গরম লাগলে ব্যথা হচ্ছে।",
    wait: "দেরি করলে ইনফেকশন স্নায়ুতে পৌঁছে ফোলা ভাব তৈরি করবে। তখন দাঁত বাঁচানো অত্যন্ত কঠিন এবং ব্যয়বহুল হয়ে পড়বে।",
    recovery: "রুট ক্যানালের পর ১–২ দিন হালকা ব্যথা থাকা স্বাভাবিক। ক্রাউন না বসানো পর্যন্ত শক্ত খাবার চিবোবেন না।",
    options: {
      a: { title: "A · রুট ক্যানাল + ক্রাউন", price: "₹22,500", note: "আসল দাঁত বেঁচে থাকবে" },
      b: { title: "B · দাঁত তুলে ইমপ্ল্যান্ট", price: "₹42,000", note: "৩-৪ মাস" },
      c: { title: "C · শুধু দাঁত তোলা", price: "₹2,500", note: "ফাঁকা জায়গা থাকবে" },
    },
    whatsappPreview: {
      text: "প্রিয়া জী, আপনার দাঁতের (36) তথ্য: গভীর ক্ষয় স্নায়ুর কাছে আছে। এখনই চিকিৎসা করলে দাঁত বাঁচানো সম্ভব।",
      bestOption: "3 বিকল্প · সেরা: A - ₹22,500 (EMI 3 × ₹7,500)",
    },
  },
]
