"use client";

import React, { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  Calendar as CalendarIcon,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  GripVertical,
  MessageSquare,
  Mic,
  MicOff,
  MoreVertical,
  Phone,
  PhoneOff,
  Plus,
  Search,
  Share2,
  Sparkles,
  User,
  Users,
  Video,
  VideoOff,
  X,
} from "lucide-react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { toast } from "sonner";
import {
  DentflowDrawer,
  DentflowKpiCard,
  DentflowPageHeader,
  DentflowStatusPill,
} from "@/components/dental/dentflow-primitives";
import { getRelativeIsoDate } from "@/lib/date-helpers";
import { useDentflow } from "@/lib/dentflow-store";
import { StatusTone } from "@/lib/dentflow-theme";
import {
  ClinicTimeFormat,
  formatClinicTime,
  minutesToDecimalHour,
  parseTimeToMinutes,
  sortByTime,
} from "@/lib/time-utils";
import { ClinicAppointment } from "@/types/dentflow";

interface AppointmentBlock {
  id: string;
  chair: "C1" | "C2" | "C3" | "C4";
  startHour: number; // e.g. 9.5 for 9:30
  durationHours: number;
  timeLabel: string;
  endTimeLabel: string;
  patientId: string;
  patientName: string;
  procedure: string;
  doctor: string;
  status: ClinicAppointment["status"];
  anxietyBufferMin: number;
  flags: string[];
}

const INITIAL_BLOCKS: AppointmentBlock[] = [
  { id: "cb-1", chair: "C1", startHour: 9.5, durationHours: 0.6, timeLabel: "9:30", endTimeLabel: "10:05", patientId: "pat-meera", patientName: "Meera Nair", procedure: "Scaling & polish", doctor: "Dr. Sneha K.", status: "Done", anxietyBufferMin: 0, flags: ["VIP"] },
  { id: "cb-2", chair: "C1", startHour: 10.25, durationHours: 0.75, timeLabel: "10:15", endTimeLabel: "11:00", patientId: "pat-rahul", patientName: "Rahul Verma", procedure: "Composite filling 14", doctor: "Dr. Arjun M.", status: "Checked in", anxietyBufferMin: 0, flags: [] },
  { id: "cb-3", chair: "C1", startHour: 12.5, durationHours: 0.75, timeLabel: "12:30", endTimeLabel: "1:15", patientId: "pat-imran", patientName: "Imran Khan", procedure: "Consultation & X-ray", doctor: "Dr. Arjun M.", status: "Confirmed", anxietyBufferMin: 0, flags: [] },
  { id: "cb-4", chair: "C1", startHour: 15.0, durationHours: 0.9, timeLabel: "3:00", endTimeLabel: "3:55", patientId: "pat-pooja", patientName: "Pooja Jain", procedure: "RCT 26 sitting 1", doctor: "Dr. Arjun M.", status: "Confirmed", anxietyBufferMin: 0, flags: [] },
  { id: "cb-5", chair: "C1", startHour: 16.5, durationHours: 0.75, timeLabel: "4:30", endTimeLabel: "5:15", patientId: "pat-ajay", patientName: "Ajay Rao", procedure: "Post-op review", doctor: "Dr. Arjun M.", status: "Confirmed", anxietyBufferMin: 0, flags: [] },

  { id: "cb-6", chair: "C2", startHour: 10.0, durationHours: 1.25, timeLabel: "10:00", endTimeLabel: "11:15", patientId: "pat-priya", patientName: "Priya Deshmukh", procedure: "Root canal 36 · sitting 2", doctor: "Dr. Sneha K.", status: "In chair", anxietyBufferMin: 15, flags: ["Anxious", "Allergy"] },
  { id: "cb-7", chair: "C2", startHour: 11.5, durationHours: 0.75, timeLabel: "11:30", endTimeLabel: "12:15", patientId: "pat-suresh", patientName: "Suresh Patil", procedure: "Denture trial", doctor: "Dr. Sneha K.", status: "Confirmed", anxietyBufferMin: 0, flags: [] },
  { id: "cb-8", chair: "C2", startHour: 13.0, durationHours: 0.75, timeLabel: "1:00", endTimeLabel: "1:45", patientId: "pat-neha", patientName: "Neha Gupta", procedure: "Crown fit 46", doctor: "Dr. Sneha K.", status: "Confirmed", anxietyBufferMin: 0, flags: [] },
  { id: "cb-9", chair: "C2", startHour: 16.5, durationHours: 0.75, timeLabel: "4:30", endTimeLabel: "5:15", patientId: "pat-deepak", patientName: "Deepak More", procedure: "RCT 11", doctor: "Dr. Sneha K.", status: "Confirmed", anxietyBufferMin: 0, flags: [] },

  { id: "cb-10", chair: "C3", startHour: 10.5, durationHours: 0.75, timeLabel: "10:30", endTimeLabel: "11:15", patientId: "pat-aarav", patientName: "Aarav Joshi", procedure: "Sealants + fluoride", doctor: "Dr. Karan S.", status: "Late 10 min", anxietyBufferMin: 0, flags: ["New"] },
  { id: "cb-11", chair: "C3", startHour: 12.0, durationHours: 0.58, timeLabel: "12:00", endTimeLabel: "12:35", patientId: "pat-kavya", patientName: "Kavya Reddy", procedure: "Aligner check 10", doctor: "Dr. Karan S.", status: "Confirmed", anxietyBufferMin: 15, flags: ["Anxious"] },
  { id: "cb-12", chair: "C3", startHour: 12.5833, durationHours: 0.58, timeLabel: "12:35", endTimeLabel: "1:10", patientId: "pat-tanvi", patientName: "Tanvi Shah", procedure: "Braces adjustment", doctor: "Dr. Karan S.", status: "Confirmed", anxietyBufferMin: 0, flags: [] },
  { id: "cb-13", chair: "C3", startHour: 14.5, durationHours: 0.75, timeLabel: "2:30", endTimeLabel: "3:15", patientId: "pat-riya", patientName: "Riya Das", procedure: "Aligner 3D scan", doctor: "Dr. Karan S.", status: "Confirmed", anxietyBufferMin: 0, flags: [] },

  { id: "cb-14", chair: "C4", startHour: 11.0, durationHours: 0.8, timeLabel: "11:00", endTimeLabel: "11:50", patientId: "pat-fatima", patientName: "Fatima Shaikh", procedure: "Implant review", doctor: "Dr. Farhan A.", status: "Confirmed", anxietyBufferMin: 0, flags: [] },
  { id: "cb-15", chair: "C4", startHour: 14.5, durationHours: 0.8, timeLabel: "2:30", endTimeLabel: "3:20", patientId: "pat-vikram", patientName: "Vikram Singh", procedure: "Surgical extraction 38", doctor: "Dr. Farhan A.", status: "Confirmed", anxietyBufferMin: 0, flags: [] },
  { id: "cb-16", chair: "C4", startHour: 15.5, durationHours: 0.85, timeLabel: "3:30", endTimeLabel: "4:20", patientId: "pat-anil", patientName: "Anil Bhosale", procedure: "Implant placement 46", doctor: "Dr. Farhan A.", status: "Confirmed", anxietyBufferMin: 0, flags: [] },
];

const OCT_2_BLOCKS: AppointmentBlock[] = [
  { id: "cb-201", chair: "C1", startHour: 9.5, durationHours: 0.65, timeLabel: "9:30", endTimeLabel: "10:10", patientId: "pat-amit", patientName: "Amit Deshpande", procedure: "Scaling & root planing", doctor: "Dr. Arjun M.", status: "Done", anxietyBufferMin: 0, flags: [] },
  { id: "cb-202", chair: "C1", startHour: 10.5, durationHours: 0.75, timeLabel: "10:30", endTimeLabel: "11:15", patientId: "pat-sneha-p", patientName: "Sneha Patel", procedure: "Composite restoration 24", doctor: "Dr. Arjun M.", status: "Checked in", anxietyBufferMin: 0, flags: [] },
  { id: "cb-203", chair: "C1", startHour: 12.0, durationHours: 0.75, timeLabel: "12:00", endTimeLabel: "12:45", patientId: "pat-rajiv", patientName: "Rajiv Kapoor", procedure: "Crown cementation 16", doctor: "Dr. Arjun M.", status: "Confirmed", anxietyBufferMin: 0, flags: [] },
  { id: "cb-204", chair: "C1", startHour: 14.5, durationHours: 0.75, timeLabel: "2:30", endTimeLabel: "3:15", patientId: "pat-priya-s", patientName: "Priya Sharma", procedure: "OPG & consult", doctor: "Dr. Arjun M.", status: "Confirmed", anxietyBufferMin: 0, flags: [] },
  { id: "cb-205", chair: "C1", startHour: 16.0, durationHours: 0.6, timeLabel: "4:00", endTimeLabel: "4:35", patientId: "pat-anand", patientName: "Anand Verma", procedure: "Post-op review", doctor: "Dr. Arjun M.", status: "Confirmed", anxietyBufferMin: 0, flags: [] },

  { id: "cb-206", chair: "C2", startHour: 10.0, durationHours: 1.25, timeLabel: "10:00", endTimeLabel: "11:15", patientId: "pat-rohan", patientName: "Rohan Mehta", procedure: "Re-RCT 46 sitting 1", doctor: "Dr. Sneha K.", status: "In chair", anxietyBufferMin: 15, flags: ["Anxious"] },
  { id: "cb-207", chair: "C2", startHour: 11.5, durationHours: 0.85, timeLabel: "11:30", endTimeLabel: "12:20", patientId: "pat-sunita", patientName: "Sunita Rao", procedure: "Porcelain veneer prep", doctor: "Dr. Sneha K.", status: "Confirmed", anxietyBufferMin: 0, flags: [] },
  { id: "cb-208", chair: "C2", startHour: 13.5, durationHours: 0.75, timeLabel: "1:30", endTimeLabel: "2:15", patientId: "pat-rajesh", patientName: "Rajesh Shinde", procedure: "Complete denture bite trial", doctor: "Dr. Sneha K.", status: "Confirmed", anxietyBufferMin: 0, flags: [] },
  { id: "cb-209", chair: "C2", startHour: 15.5, durationHours: 0.75, timeLabel: "3:30", endTimeLabel: "4:15", patientId: "pat-manisha", patientName: "Manisha Kadam", procedure: "Aesthetic bonding 11, 21", doctor: "Dr. Sneha K.", status: "Confirmed", anxietyBufferMin: 0, flags: [] },

  { id: "cb-210", chair: "C3", startHour: 10.5, durationHours: 0.75, timeLabel: "10:30", endTimeLabel: "11:15", patientId: "pat-aarav", patientName: "Aarav Joshi", procedure: "Aligner check stage 4", doctor: "Dr. Karan S.", status: "Confirmed", anxietyBufferMin: 0, flags: [] },
  { id: "cb-211", chair: "C3", startHour: 12.0, durationHours: 0.75, timeLabel: "12:00", endTimeLabel: "12:45", patientId: "pat-devika", patientName: "Devika Nair", procedure: "Fixed appliance archwire change", doctor: "Dr. Karan S.", status: "Late 10 min", anxietyBufferMin: 0, flags: [] },
  { id: "cb-212", chair: "C3", startHour: 15.0, durationHours: 0.75, timeLabel: "3:00", endTimeLabel: "3:45", patientId: "pat-yash", patientName: "Yash Singhal", procedure: "Retainer delivery", doctor: "Dr. Karan S.", status: "Confirmed", anxietyBufferMin: 0, flags: [] },

  { id: "cb-213", chair: "C4", startHour: 11.0, durationHours: 0.8, timeLabel: "11:00", endTimeLabel: "11:50", patientId: "pat-vikram", patientName: "Vikram Singh", procedure: "Implant stage 2 uncovery 36", doctor: "Dr. Farhan A.", status: "Confirmed", anxietyBufferMin: 0, flags: [] },
  { id: "cb-214", chair: "C4", startHour: 14.5, durationHours: 1.0, timeLabel: "2:30", endTimeLabel: "3:30", patientId: "pat-rekha", patientName: "Rekha Bansal", procedure: "Sinus lift & implant placement 26", doctor: "Dr. Farhan A.", status: "Confirmed", anxietyBufferMin: 0, flags: [] },
  { id: "cb-215", chair: "C4", startHour: 15.75, durationHours: 0.75, timeLabel: "3:45", endTimeLabel: "4:30", patientId: "pat-suresh", patientName: "Suresh Patil", procedure: "Implant prosthesis review", doctor: "Dr. Farhan A.", status: "Confirmed", anxietyBufferMin: 0, flags: [] },
];

const OCT_3_BLOCKS: AppointmentBlock[] = [
  { id: "cb-301", chair: "C1", startHour: 9.5, durationHours: 0.6, timeLabel: "9:30", endTimeLabel: "10:05", patientId: "pat-meera", patientName: "Meera Nair", procedure: "Polish & sensitivity coating", doctor: "Dr. Arjun M.", status: "Done", anxietyBufferMin: 0, flags: [] },
  { id: "cb-302", chair: "C1", startHour: 10.5, durationHours: 0.75, timeLabel: "10:30", endTimeLabel: "11:15", patientId: "pat-varun", patientName: "Varun Dhawan", procedure: "Composite filling 36", doctor: "Dr. Arjun M.", status: "Confirmed", anxietyBufferMin: 0, flags: [] },
  { id: "cb-303", chair: "C1", startHour: 12.0, durationHours: 0.75, timeLabel: "12:00", endTimeLabel: "12:45", patientId: "pat-alok", patientName: "Alok Nath", procedure: "Intraoral scan & consult", doctor: "Dr. Arjun M.", status: "Confirmed", anxietyBufferMin: 0, flags: [] },
  { id: "cb-304", chair: "C1", startHour: 15.0, durationHours: 0.75, timeLabel: "3:00", endTimeLabel: "3:45", patientId: "pat-shweta", patientName: "Shweta Tiwari", procedure: "Teeth whitening sitting 1", doctor: "Dr. Arjun M.", status: "Confirmed", anxietyBufferMin: 0, flags: [] },

  { id: "cb-305", chair: "C2", startHour: 10.0, durationHours: 1.0, timeLabel: "10:00", endTimeLabel: "11:00", patientId: "pat-suresh", patientName: "Suresh Patil", procedure: "Final denture insertion", doctor: "Dr. Sneha K.", status: "In chair", anxietyBufferMin: 0, flags: [] },
  { id: "cb-306", chair: "C2", startHour: 11.5, durationHours: 0.75, timeLabel: "11:30", endTimeLabel: "12:15", patientId: "pat-neha", patientName: "Neha Gupta", procedure: "Crown finish 46", doctor: "Dr. Sneha K.", status: "Confirmed", anxietyBufferMin: 0, flags: [] },
  { id: "cb-307", chair: "C2", startHour: 13.0, durationHours: 0.75, timeLabel: "1:00", endTimeLabel: "1:45", patientId: "pat-fatima", patientName: "Fatima Shaikh", procedure: "Crown prep 14", doctor: "Dr. Sneha K.", status: "Confirmed", anxietyBufferMin: 0, flags: [] },
  { id: "cb-308", chair: "C2", startHour: 14.5, durationHours: 0.75, timeLabel: "2:30", endTimeLabel: "3:15", patientId: "pat-nitin", patientName: "Nitin Gadgil", procedure: "Endodontic emergency 21", doctor: "Dr. Sneha K.", status: "Checked in", anxietyBufferMin: 0, flags: [] },
  { id: "cb-309", chair: "C2", startHour: 16.0, durationHours: 0.75, timeLabel: "4:00", endTimeLabel: "4:45", patientId: "pat-priya", patientName: "Priya Deshmukh", procedure: "Obturation 36", doctor: "Dr. Sneha K.", status: "Confirmed", anxietyBufferMin: 15, flags: ["Anxious"] },

  { id: "cb-310", chair: "C3", startHour: 10.0, durationHours: 0.75, timeLabel: "10:00", endTimeLabel: "10:45", patientId: "pat-tanvi", patientName: "Tanvi Shah", procedure: "Bracket bonding lower arch", doctor: "Dr. Karan S.", status: "Confirmed", anxietyBufferMin: 0, flags: [] },
  { id: "cb-311", chair: "C3", startHour: 11.5, durationHours: 0.75, timeLabel: "11:30", endTimeLabel: "12:15", patientId: "pat-riya", patientName: "Riya Das", procedure: "Clear aligner attachment placement", doctor: "Dr. Karan S.", status: "Confirmed", anxietyBufferMin: 0, flags: [] },
  { id: "cb-312", chair: "C3", startHour: 14.0, durationHours: 0.75, timeLabel: "2:00", endTimeLabel: "2:45", patientId: "pat-siddharth", patientName: "Siddharth Roy", procedure: "Expansion appliance check", doctor: "Dr. Karan S.", status: "Confirmed", anxietyBufferMin: 0, flags: [] },
  { id: "cb-313", chair: "C3", startHour: 15.5, durationHours: 0.75, timeLabel: "3:30", endTimeLabel: "4:15", patientId: "pat-rohit", patientName: "Rohit Deshmukh", procedure: "Lingual retainer fit", doctor: "Dr. Karan S.", status: "Confirmed", anxietyBufferMin: 0, flags: [] },

  { id: "cb-314", chair: "C4", startHour: 10.5, durationHours: 0.75, timeLabel: "10:30", endTimeLabel: "11:15", patientId: "pat-anil", patientName: "Anil Bhosale", procedure: "Implant suture removal 46", doctor: "Dr. Farhan A.", status: "Done", anxietyBufferMin: 0, flags: [] },
  { id: "cb-315", chair: "C4", startHour: 12.0, durationHours: 0.75, timeLabel: "12:00", endTimeLabel: "12:45", patientId: "pat-geeta", patientName: "Geeta Menon", procedure: "Immediate implant consult 11", doctor: "Dr. Farhan A.", status: "Confirmed", anxietyBufferMin: 0, flags: [] },
  { id: "cb-316", chair: "C4", startHour: 14.5, durationHours: 0.8, timeLabel: "2:30", endTimeLabel: "3:20", patientId: "pat-imran", patientName: "Imran Khan", procedure: "Surgical extraction 48", doctor: "Dr. Farhan A.", status: "Confirmed", anxietyBufferMin: 0, flags: [] },
];

const OCT_4_BLOCKS: AppointmentBlock[] = [
  { id: "cb-401", chair: "C1", startHour: 10.0, durationHours: 0.75, timeLabel: "10:00", endTimeLabel: "10:45", patientId: "pat-alok", patientName: "Alok Nath", procedure: "Anterior trauma emergency", doctor: "Dr. Arjun M.", status: "Done", anxietyBufferMin: 0, flags: ["Trauma"] },
  { id: "cb-402", chair: "C2", startHour: 11.0, durationHours: 0.75, timeLabel: "11:00", endTimeLabel: "11:45", patientId: "pat-seema", patientName: "Seema Trivedi", procedure: "Acute pulpitis flare-up", doctor: "Dr. Sneha K.", status: "In chair", anxietyBufferMin: 15, flags: ["Severe pain"] },
  { id: "cb-403", chair: "C2", startHour: 12.5, durationHours: 0.5, timeLabel: "12:30", endTimeLabel: "1:00", patientId: "pat-rahul", patientName: "Rahul Verma", procedure: "Suture check & dry socket dressing", doctor: "Dr. Sneha K.", status: "Confirmed", anxietyBufferMin: 0, flags: [] },
];

function getDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getBaseScheduleForDate(date: Date): AppointmentBlock[] {
  const key = getDateKey(date);
  if (key === getRelativeIsoDate(0)) return INITIAL_BLOCKS;
  if (key === getRelativeIsoDate(1)) return OCT_2_BLOCKS;
  if (key === getRelativeIsoDate(2)) return OCT_3_BLOCKS;
  if (key === getRelativeIsoDate(3)) return OCT_4_BLOCKS;

  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0) {
    return [
      { id: `gen-${key}-1`, chair: "C1", startHour: 10.0, durationHours: 0.75, timeLabel: "10:00", endTimeLabel: "10:45", patientId: "pat-alok", patientName: "Alok Nath", procedure: "Emergency trauma review", doctor: "Dr. Arjun M.", status: "Done", anxietyBufferMin: 0, flags: [] },
      { id: `gen-${key}-2`, chair: "C2", startHour: 11.5, durationHours: 0.75, timeLabel: "11:30", endTimeLabel: "12:15", patientId: "pat-seema", patientName: "Seema Trivedi", procedure: "Acute pulpitis access opening", doctor: "Dr. Sneha K.", status: "Confirmed", anxietyBufferMin: 15, flags: ["Urgent"] },
      { id: `gen-${key}-3`, chair: "C2", startHour: 13.0, durationHours: 0.5, timeLabel: "1:00", endTimeLabel: "1:30", patientId: "pat-rahul", patientName: "Rahul Verma", procedure: "Emergency dressing change", doctor: "Dr. Sneha K.", status: "Confirmed", anxietyBufferMin: 0, flags: [] },
    ];
  }

  const isWeekend = dayOfWeek === 6;
  return [
    { id: `gen-${key}-1`, chair: "C1", startHour: 9.5, durationHours: 0.6, timeLabel: "9:30", endTimeLabel: "10:05", patientId: "pat-meera", patientName: "Meera Nair", procedure: "Scaling & polish", doctor: "Dr. Arjun M.", status: "Done", anxietyBufferMin: 0, flags: [] },
    { id: `gen-${key}-2`, chair: "C1", startHour: 10.5, durationHours: 0.75, timeLabel: "10:30", endTimeLabel: "11:15", patientId: "pat-rahul", patientName: "Rahul Verma", procedure: "Composite restoration", doctor: "Dr. Arjun M.", status: "Checked in", anxietyBufferMin: 0, flags: [] },
    { id: `gen-${key}-3`, chair: "C1", startHour: 12.0, durationHours: 0.75, timeLabel: "12:00", endTimeLabel: "12:45", patientId: "pat-imran", patientName: "Imran Khan", procedure: "Consultation & X-ray", doctor: "Dr. Arjun M.", status: "Confirmed", anxietyBufferMin: 0, flags: [] },
    { id: `gen-${key}-4`, chair: "C1", startHour: 14.5, durationHours: 0.75, timeLabel: "2:30", endTimeLabel: "3:15", patientId: "pat-pooja", patientName: "Pooja Jain", procedure: "Crown preparation", doctor: "Dr. Arjun M.", status: "Confirmed", anxietyBufferMin: 0, flags: [] },
    { id: `gen-${key}-5`, chair: "C1", startHour: 16.0, durationHours: 0.6, timeLabel: "4:00", endTimeLabel: "4:35", patientId: "pat-ajay", patientName: "Ajay Rao", procedure: "Post-op review", doctor: "Dr. Arjun M.", status: "Confirmed", anxietyBufferMin: 0, flags: [] },

    { id: `gen-${key}-6`, chair: "C2", startHour: 10.0, durationHours: 1.0, timeLabel: "10:00", endTimeLabel: "11:00", patientId: "pat-priya", patientName: "Priya Deshmukh", procedure: "Endodontic therapy", doctor: "Dr. Sneha K.", status: "In chair", anxietyBufferMin: 15, flags: ["Anxious"] },
    { id: `gen-${key}-7`, chair: "C2", startHour: 11.5, durationHours: 0.75, timeLabel: "11:30", endTimeLabel: "12:15", patientId: "pat-suresh", patientName: "Suresh Patil", procedure: "Denture check & bite adjustment", doctor: "Dr. Sneha K.", status: "Confirmed", anxietyBufferMin: 0, flags: [] },
    { id: `gen-${key}-8`, chair: "C2", startHour: 13.0, durationHours: 0.75, timeLabel: "1:00", endTimeLabel: "1:45", patientId: "pat-neha", patientName: "Neha Gupta", procedure: "Porcelain crown seating", doctor: "Dr. Sneha K.", status: "Confirmed", anxietyBufferMin: 0, flags: [] },
    { id: `gen-${key}-9`, chair: "C2", startHour: 15.0, durationHours: 0.75, timeLabel: "3:00", endTimeLabel: "3:45", patientId: "pat-deepak", patientName: "Deepak More", procedure: "RCT sitting", doctor: "Dr. Sneha K.", status: "Confirmed", anxietyBufferMin: 0, flags: [] },

    { id: `gen-${key}-10`, chair: "C3", startHour: 10.5, durationHours: 0.75, timeLabel: "10:30", endTimeLabel: "11:15", patientId: "pat-aarav", patientName: "Aarav Joshi", procedure: "Paediatric check & fluoride", doctor: "Dr. Karan S.", status: "Confirmed", anxietyBufferMin: 0, flags: [] },
    { id: `gen-${key}-11`, chair: "C3", startHour: 12.0, durationHours: 0.6, timeLabel: "12:00", endTimeLabel: "12:35", patientId: "pat-kavya", patientName: "Kavya Reddy", procedure: "Aligner scan & progress check", doctor: "Dr. Karan S.", status: "Confirmed", anxietyBufferMin: 0, flags: [] },
    { id: `gen-${key}-12`, chair: "C3", startHour: 14.5, durationHours: 0.75, timeLabel: "2:30", endTimeLabel: "3:15", patientId: "pat-tanvi", patientName: "Tanvi Shah", procedure: "Orthodontic archwire adjustment", doctor: "Dr. Karan S.", status: "Confirmed", anxietyBufferMin: 0, flags: [] },

    { id: `gen-${key}-13`, chair: "C4", startHour: 11.0, durationHours: 0.8, timeLabel: "11:00", endTimeLabel: "11:50", patientId: "pat-fatima", patientName: "Fatima Shaikh", procedure: "Implant review & radiograph", doctor: "Dr. Farhan A.", status: "Confirmed", anxietyBufferMin: 0, flags: [] },
    { id: `gen-${key}-14`, chair: "C4", startHour: 14.5, durationHours: 0.8, timeLabel: "2:30", endTimeLabel: "3:20", patientId: "pat-vikram", patientName: "Vikram Singh", procedure: "Surgical extraction", doctor: "Dr. Farhan A.", status: "Confirmed", anxietyBufferMin: 0, flags: [] },
    { id: `gen-${key}-15`, chair: "C4", startHour: 15.5, durationHours: 0.85, timeLabel: "3:30", endTimeLabel: "4:20", patientId: "pat-anil", patientName: "Anil Bhosale", procedure: isWeekend ? "Implant surgery 46" : "Post-op review", doctor: "Dr. Farhan A.", status: "Confirmed", anxietyBufferMin: 0, flags: [] },
  ];
}

const SUGGESTED_SLOTS = [
  "9:30 AM",
  "11:00 AM",
  "12:30 PM",
  "2:30 PM",
  "4:00 PM",
  "5:15 PM",
];

const STATUS_TONES: Record<ClinicAppointment["status"], StatusTone> = {
  Done: "green",
  "In chair": "blue",
  "Checked in": "teal",
  "Late 10 min": "amber",
  Confirmed: "green",
  "Not confirmed": "grey",
  Cancelled: "red",
};

interface VideoConsultationItem {
  id: string;
  patientName: string;
  doctorName: string;
  time: string;
  status: "Scheduled" | "Live" | "Completed";
  reason: string;
}

const INITIAL_VIDEO_CONSULTS: VideoConsultationItem[] = [
  { id: "vc-1", patientName: "Priya Deshmukh", doctorName: "Dr. Sneha Kulkarni", time: "11:30 AM", status: "Scheduled", reason: "Crown color preview & shade verification" },
  { id: "vc-2", patientName: "Rohan Mehta", doctorName: "Dr. Arjun Mehta", time: "1:00 PM", status: "Live", reason: "Day 3 post-op extraction pain check" },
  { id: "vc-3", patientName: "Ananya Iyer", doctorName: "Dr. Karan Shah", time: "9:00 AM", status: "Completed", reason: "Aligner tray 12 fitting assessment" },
];

interface WaitlistItem {
  id: string;
  patientId: string;
  name: string;
  phone: string;
  type: "Walk-in" | "Priority Waitlist";
  arrivedTime: string;
  waitingInfo: string;
  procedure: string;
  preferredDoctor: string;
  preferredChair: string;
}

const WAITLIST_QUEUE: WaitlistItem[] = [
  {
    id: "wl-1",
    patientId: "pat-amit",
    name: "Amit Deshpande",
    phone: "+91 98220 98112",
    type: "Walk-in",
    arrivedTime: "10:15 AM",
    waitingInfo: "In lounge · 20m",
    procedure: "Scaling & polish",
    preferredDoctor: "Dr. Arjun M.",
    preferredChair: "Chair 1 or 2",
  },
  {
    id: "wl-2",
    patientId: "pat-sunita",
    name: "Sunita Rao",
    phone: "+91 98220 67890",
    type: "Priority Waitlist",
    arrivedTime: "11:00 AM",
    waitingInfo: "On call · 10m away",
    procedure: "Crown consult",
    preferredDoctor: "Dr. Sneha K.",
    preferredChair: "Chair 2",
  },
];

function ChairHourDropSlot({
  chairId,
  hour,
  timeFormat,
}: {
  chairId: "C1" | "C2" | "C3" | "C4";
  hour: number;
  timeFormat: ClinicTimeFormat;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `${chairId}::${hour}`,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ height: "80px" }}
      className={`border-b border-[var(--df-border)]/50 transition-colors relative ${
        isOver
          ? "bg-[var(--df-teal-soft)] ring-2 ring-inset ring-[var(--df-teal)] z-10"
          : "hover:bg-[var(--df-surface-muted)]/30"
      }`}
    >
      {isOver && (
        <span className="absolute top-1 right-1.5 text-[10px] font-bold text-[var(--df-teal)] bg-white/95 px-1.5 py-0.5 rounded border border-[var(--df-teal-border)] shadow-xs">
          Drop · {chairId} {formatClinicTime(hour, timeFormat)}
        </span>
      )}
    </div>
  );
}

function DraggableAppointmentBlock({
  block,
  topOffset,
  height,
  timeFormat,
  onOpen,
}: {
  block: AppointmentBlock;
  topOffset: number;
  height: number;
  timeFormat: ClinicTimeFormat;
  onOpen: (b: AppointmentBlock) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: block.id,
  });

  const style: React.CSSProperties = {
    top: `${topOffset}px`,
    height: `${height}px`,
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.35 : 1,
    zIndex: isDragging ? 40 : 20,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => onOpen(block)}
      title="Click for details or drag to reschedule chair/time"
      className="absolute left-1.5 right-1.5 p-0.5 touch-none"
    >
      <div
        className={`h-full w-full rounded-xl border p-2 text-xs flex flex-col justify-between shadow-xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${
          block.status === "Done"
            ? "bg-[#E6F4EA] border-[#B7E1CD] text-[#137333]"
            : block.status === "In chair"
            ? "bg-[#E3F3EE] border-[var(--df-teal-border)] text-[var(--df-teal)] ring-1 ring-[var(--df-teal)]"
            : block.status === "Late 10 min"
            ? "bg-[#FEF3DC] border-[#F8DFAA] text-[#9A5B00]"
            : "bg-white border-[var(--df-border)] text-[var(--df-text)] hover:border-[var(--df-teal)]"
        }`}
      >
        <div className="flex items-center justify-between gap-1 leading-none">
          <span className="inline-flex items-center gap-1 min-w-0 font-bold text-xs text-[var(--df-text)]">
            <GripVertical className="h-3 w-3 shrink-0 text-[var(--df-text-muted)]" />
            <span className="truncate">{block.patientName}</span>
          </span>
          <span className="text-[10px] font-mono font-semibold text-[var(--df-text-secondary)] bg-[var(--df-surface-muted)] px-1.5 py-0.5 rounded border border-[var(--df-border)]/80 shrink-0">
            {formatClinicTime(block.startHour, timeFormat)}
          </span>
        </div>

        <p className="text-[11px] font-medium text-[var(--df-text-secondary)] truncate my-0.5 leading-snug">
          {block.procedure}
        </p>

        <div className="flex items-center justify-between gap-1 text-[10px] text-[var(--df-text-muted)] leading-none pt-0.5 border-t border-[var(--df-border)]/40">
          <span className="truncate font-medium">{block.doctor}</span>
          {block.anxietyBufferMin > 0 ? (
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[#FEF3DC] text-[#9A5B00] border border-[#F8DFAA] shrink-0">
              +{block.anxietyBufferMin}m
            </span>
          ) : (
            <span className="text-[9px] font-semibold text-[var(--df-text-secondary)] uppercase tracking-wider shrink-0">
              {block.status}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function CalendarPageInner() {
  const searchParams = useSearchParams();
  const { state, updateState } = useDentflow();
  const timeFormat: ClinicTimeFormat = state.clinicSetup.timeFormat || "12h";

  // Calendar View Controls - defaults to chair-wise "Day" calendar on today's date
  const [viewMode, setViewMode] = useState<"Day" | "List" | "Week">("Day");
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [doctorFilter, setDoctorFilter] = useState("All Doctors");
  const [chairFilter, setChairFilter] = useState("All Chairs");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  // Date shifting handlers
  const handlePrevDate = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      if (viewMode === "Week") {
        next.setDate(next.getDate() - 7);
      } else {
        next.setDate(next.getDate() - 1);
      }
      return next;
    });
  };

  const handleNextDate = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      if (viewMode === "Week") {
        next.setDate(next.getDate() + 7);
      } else {
        next.setDate(next.getDate() + 1);
      }
      return next;
    });
  };

  const formattedSelectedDate = useMemo(() => {
    if (viewMode === "Week") {
      const start = new Date(currentDate);
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(start.setDate(diff));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return `Week: ${monday.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – ${sunday.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`;
    }
    return currentDate.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }, [currentDate, viewMode]);

  const weekDays = useMemo(() => {
    const start = new Date(currentDate);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(start.setDate(diff));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  }, [currentDate]);

  // Dynamic Date-Based Appointments State
  const [customAppointments, setCustomAppointments] = useState<Record<string, AppointmentBlock[]>>({});
  const activeDateKey = useMemo(() => getDateKey(currentDate), [currentDate]);

  const activeDayBlocks = useMemo(() => {
    return customAppointments[activeDateKey] || getBaseScheduleForDate(currentDate);
  }, [customAppointments, activeDateKey, currentDate]);

  const [selectedBlock, setSelectedBlock] = useState<AppointmentBlock | null>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);

  // New Appointment Drawer State
  const [newApptOpen, setNewApptOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState("pat-priya");
  const [selectedProcedure, setSelectedProcedure] = useState("Root canal 36 · sitting 2 — 60 min");
  const [selectedDoctor, setSelectedDoctor] = useState("Dr. Sneha Kulkarni");
  const [selectedChair, setSelectedChair] = useState<"C1" | "C2" | "C3" | "C4">("C2");
  const [selectedSlot, setSelectedSlot] = useState("10:00 AM");
  const [apptNotes, setApptNotes] = useState("");
  const [sendWhatsApp, setSendWhatsApp] = useState(true);
  const [askDeposit, setAskDeposit] = useState(false);

  // Video Consultation Modal & Call Overlay
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [videoTab, setVideoTab] = useState<"Schedule" | "Start now" | "Today">("Today");
  const [videoConsults, setVideoConsults] = useState<VideoConsultationItem[]>(INITIAL_VIDEO_CONSULTS);
  const [videoPatientId, setVideoPatientId] = useState("pat-priya");
  const [videoDoctor, setVideoDoctor] = useState("Dr. Sneha Kulkarni");
  const [videoDate, setVideoDate] = useState(() => getRelativeIsoDate(0));
  const [videoTime, setVideoTime] = useState("11:30 AM");
  const [videoReason, setVideoReason] = useState("Aligner tracking check & post-op sensitivity");
  const [activeCall, setActiveCall] = useState<VideoConsultationItem | null>(null);
  const [callMuted, setCallMuted] = useState(false);
  const [callVideoOff, setCallVideoOff] = useState(false);
  const [callChatMessages, setCallChatMessages] = useState<{ sender: string; text: string }[]>([
    { sender: "System", text: "Encrypted HD tele-dentistry session started." },
  ]);
  const [callInputChat, setCallInputChat] = useState("");

  // Check URL query for booking trigger
  React.useEffect(() => {
    const bookId = searchParams?.get("bookPatientId");
    if (bookId) {
      setSelectedPatientId(bookId);
      setNewApptOpen(true);
    }
  }, [searchParams]);

  const selectedPatient = useMemo(() => {
    return state.patients.find((p) => p.id === selectedPatientId) || state.patients[0];
  }, [state.patients, selectedPatientId]);

  const anxietyBuffer = selectedPatient?.comfortProfile?.autoBufferMin || 0;

  // Filtered & chronologically sorted blocks for Day Calendar & List View
  const filteredBlocks = useMemo(() => {
    const filtered = activeDayBlocks.filter((b) => {
      if (doctorFilter !== "All Doctors" && !b.doctor.includes(doctorFilter.split(" ")[1] || "")) return false;
      if (chairFilter !== "All Chairs" && b.chair !== chairFilter) return false;
      if (statusFilter !== "All Status" && b.status !== statusFilter) return false;
      return true;
    });
    return sortByTime(filtered, (b) => b.startHour);
  }, [activeDayBlocks, doctorFilter, chairFilter, statusFilter]);

  const activeDragBlock = useMemo(
    () => (activeDragId ? activeDayBlocks.find((b) => b.id === activeDragId) || null : null),
    [activeDragId, activeDayBlocks],
  );

  // Dynamic KPI counts for active date
  const totalDayAppointments = activeDayBlocks.length;
  const confirmedCount = activeDayBlocks.filter((b) => b.status === "Confirmed").length;
  const doneCount = activeDayBlocks.filter((b) => b.status === "Done").length;
  const inChairOrWaitingCount = activeDayBlocks.filter(
    (b) => b.status === "In chair" || b.status === "Checked in" || b.status === "Late 10 min",
  ).length;

  // Chair column setup
  const chairs = [
    { id: "C1", label: "Chair 1 · General", doc: "Dr. Arjun M." },
    { id: "C2", label: "Chair 2 · Surgery/Endo", doc: "Dr. Sneha K." },
    { id: "C3", label: "Chair 3 · Ortho", doc: "Dr. Karan S." },
    { id: "C4", label: "Chair 4 · Implant", doc: "Dr. Farhan A." },
  ];

  const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17];

  // Actions on appointment block
  const handleOpenBlock = (block: AppointmentBlock) => {
    setSelectedBlock(block);
    setDetailDrawerOpen(true);
  };

  const handleUpdateStatus = (newStatus: ClinicAppointment["status"]) => {
    if (!selectedBlock) return;
    setCustomAppointments((prev) => {
      const currentList = prev[activeDateKey] || getBaseScheduleForDate(currentDate);
      return {
        ...prev,
        [activeDateKey]: currentList.map((b) =>
          b.id === selectedBlock.id ? { ...b, status: newStatus } : b,
        ),
      };
    });
    setSelectedBlock((prev) => (prev ? { ...prev, status: newStatus } : null));
    toast.success(`Appointment updated: ${newStatus}`);
  };

  // Reschedule block to a new chair and/or start hour (used by drag-and-drop & drawer controls)
  const handleRescheduleBlock = (
    blockId: string,
    newChair: "C1" | "C2" | "C3" | "C4",
    newStartHour: number,
  ) => {
    const clampedStart = Math.max(9, Math.min(17.5, newStartHour));
    let movedBlock: AppointmentBlock | null = null;

    setCustomAppointments((prev) => {
      const currentList = prev[activeDateKey] || getBaseScheduleForDate(currentDate);
      const updated = currentList.map((b) => {
        if (b.id !== blockId) return b;
        const nextBlock: AppointmentBlock = {
          ...b,
          chair: newChair,
          startHour: clampedStart,
          timeLabel: formatClinicTime(clampedStart, timeFormat),
          endTimeLabel: formatClinicTime(clampedStart + b.durationHours, timeFormat),
        };
        movedBlock = nextBlock;
        return nextBlock;
      });
      return { ...prev, [activeDateKey]: updated };
    });

    if (selectedBlock?.id === blockId) {
      setSelectedBlock((prev) =>
        prev
          ? {
              ...prev,
              chair: newChair,
              startHour: clampedStart,
              timeLabel: formatClinicTime(clampedStart, timeFormat),
              endTimeLabel: formatClinicTime(clampedStart + prev.durationHours, timeFormat),
            }
          : null,
      );
    }

    const blockRef = movedBlock || activeDayBlocks.find((b) => b.id === blockId);
    if (blockRef) {
      toast.success(
        `Rescheduled ${blockRef.patientName} to ${newChair} · ${formatClinicTime(clampedStart, timeFormat)}`,
      );
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = event;
    if (!over) return;
    const overId = String(over.id);
    const [targetChair, targetHourStr] = overId.split("::");
    const targetHour = Number(targetHourStr);
    if (
      !targetChair ||
      !["C1", "C2", "C3", "C4"].includes(targetChair) ||
      !Number.isFinite(targetHour)
    ) {
      return;
    }
    const dragged = activeDayBlocks.find((b) => b.id === String(active.id));
    if (!dragged) return;
    if (dragged.chair === targetChair && Math.floor(dragged.startHour) === targetHour) {
      return;
    }
    handleRescheduleBlock(
      dragged.id,
      targetChair as "C1" | "C2" | "C3" | "C4",
      targetHour,
    );
  };

  // Book appointment handler
  const handleBookAppointment = () => {
    const startMinutes = parseTimeToMinutes(selectedSlot);
    const startH = minutesToDecimalHour(startMinutes);
    const durationHours = 0.75;

    const newBlock: AppointmentBlock = {
      id: `cb-${Date.now()}`,
      chair: selectedChair,
      startHour: startH,
      durationHours,
      timeLabel: formatClinicTime(startH, timeFormat),
      endTimeLabel: formatClinicTime(startH + durationHours, timeFormat),
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      procedure: selectedProcedure.split("—")[0].trim(),
      doctor: selectedDoctor,
      status: "Confirmed",
      anxietyBufferMin: anxietyBuffer,
      flags: selectedPatient.flags,
    };

    setCustomAppointments((prev) => {
      const currentList = prev[activeDateKey] || getBaseScheduleForDate(currentDate);
      return {
        ...prev,
        [activeDateKey]: [...currentList, newBlock],
      };
    });

    // Write to persistent global state, increment patient visit count, and create audit log
    const now = new Date();
    const auditEntry = {
      id: `dl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: now.toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
      isoTimestamp: now.toISOString(),
      actor: state.activeRole,
      role: state.activeRole,
      patientName: selectedPatient.name,
      screenName: "Calendar",
      action: "BOOK_APPOINTMENT",
      entityType: "patient" as const,
      entityId: selectedPatient.id,
      details: `Booked appointment for ${newBlock.procedure} with ${selectedDoctor} on ${formattedSelectedDate} at ${newBlock.timeLabel}`,
    };

    const newClinicAppt: ClinicAppointment = {
      id: newBlock.id,
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      doctor: selectedDoctor,
      chair: selectedChair,
      branch: state.activeBranch === "All 3 branches" ? "Station Road branch" : state.activeBranch,
      procedure: newBlock.procedure,
      time: newBlock.timeLabel,
      endTime: newBlock.timeLabel,
      durationMin: 30,
      flags: (selectedPatient.flags || []) as ("Anxious" | "Allergy" | "VIP" | "New")[],
      status: "Confirmed" as const,
      anxietyBufferMin: anxietyBuffer,
    };

    updateState((prev) => ({
      ...prev,
      appointments: [newClinicAppt, ...(prev.appointments || [])],
      patients: prev.patients.map((p) =>
        p.id === selectedPatient.id
          ? {
              ...p,
              visitsCount: (p.visitsCount || 0) + 1,
              recentActivity: [
                {
                  date: "Today",
                  text: `Appointment booked: ${newBlock.procedure} on ${formattedSelectedDate} (${newBlock.timeLabel})`,
                },
                ...(p.recentActivity || []),
              ],
            }
          : p
      ),
      dpdpAccessLogs: [auditEntry, ...prev.dpdpAccessLogs].slice(0, 500),
    }));

    setNewApptOpen(false);
    toast.success(
      `Appointment booked for ${selectedPatient.name} on ${formattedSelectedDate} at ${formatClinicTime(startH, timeFormat)}!`,
    );
  };

  // Schedule Video Consultation handler
  const handleScheduleVideoConsult = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const pat = state.patients.find((p) => p.id === videoPatientId) || state.patients[0];
    const newConsult: VideoConsultationItem = {
      id: `vc-${Date.now()}`,
      patientName: pat ? pat.name : "Patient",
      doctorName: videoDoctor,
      time: videoTime,
      status: "Scheduled",
      reason: videoReason || "Clinical tele-dentistry review",
    };
    setVideoConsults((prev) => [newConsult, ...prev]);
    setVideoTab("Today");
    toast.success(`Video consultation scheduled for ${newConsult.patientName} at ${newConsult.time}! Link sent via WhatsApp.`);
  };

  // Video call controls
  const handleStartCall = (consult: VideoConsultationItem) => {
    setActiveCall(consult);
    setVideoModalOpen(false);
    toast.success(`Connected to tele-consult with ${consult.patientName}`);
  };

  const handleEndCall = () => {
    setActiveCall(null);
    toast.info("Tele-consultation ended.");
  };

  return (
    <div className="space-y-4">
      {/* Header Pattern */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--df-border)]">
        <div>
          <h1 className="df-serif text-2xl font-semibold text-[var(--df-text)] tracking-tight">
            Appointments
          </h1>
          <p className="text-xs text-[var(--df-text-muted)] mt-0.5">
            Schedule and manage patient visits · Station Road branch
          </p>
        </div>

        {/* Right Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setVideoTab("Today");
              setVideoModalOpen(true);
            }}
            className="df-btn-secondary px-3.5 py-1.5 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Video className="h-4 w-4 text-[var(--df-teal)]" />
            <span>Video Consultation</span>
          </button>

          <button
            type="button"
            onClick={() => setNewApptOpen(true)}
            className="df-btn-primary px-4 py-1.5 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>+ New Appointment</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Card Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <DentflowKpiCard
          label="Total on date"
          value={String(totalDayAppointments)}
          subtext={currentDate.getDay() === 0 ? "Emergency duty roster" : "Full operatory active"}
          subtextTone="green"
        />
        <DentflowKpiCard
          label="Confirmed"
          value={String(confirmedCount)}
          subtext={
            totalDayAppointments > 0
              ? `${Math.round((confirmedCount / totalDayAppointments) * 100)}% confirmation rate`
              : "0% arrival"
          }
          subtextTone="teal"
          highlighted
        />
        <DentflowKpiCard
          label="Completed"
          value={String(doneCount)}
          subtext={`₹${(doneCount * 14500).toLocaleString("en-IN")} est. billed`}
          subtextTone="green"
        />
        <DentflowKpiCard
          label="In chair / Waiting"
          value={String(inChairOrWaitingCount)}
          subtext={
            inChairOrWaitingCount > 0
              ? `${inChairOrWaitingCount} chair${inChairOrWaitingCount > 1 ? "s" : ""} active`
              : "Chairs available"
          }
          subtextTone="amber"
        />
      </div>

      {/* Controls Bar: View Toggle + Date Navigator + Filters */}
      <div className="df-card p-3 flex flex-wrap items-center justify-between gap-3">
        {/* Left: View Mode Toggle */}
        <div className="flex items-center gap-1 bg-[var(--df-surface-muted)] p-1 rounded-xl border border-[var(--df-border)]">
          <button
            type="button"
            onClick={() => setViewMode("Day")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              viewMode === "Day"
                ? "bg-[var(--df-surface)] text-[var(--df-teal)] font-bold shadow-xs border border-[var(--df-border)]"
                : "text-[var(--df-text-muted)] hover:text-[var(--df-text)]"
            }`}
          >
            Day calendar
          </button>
          <button
            type="button"
            onClick={() => setViewMode("List")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              viewMode === "List"
                ? "bg-[var(--df-surface)] text-[var(--df-teal)] font-bold shadow-xs border border-[var(--df-border)]"
                : "text-[var(--df-text-muted)] hover:text-[var(--df-text)]"
            }`}
          >
            Booked list
          </button>
          <button
            type="button"
            onClick={() => setViewMode("Week")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              viewMode === "Week"
                ? "bg-[var(--df-surface)] text-[var(--df-teal)] font-bold shadow-xs border border-[var(--df-border)]"
                : "text-[var(--df-text-muted)] hover:text-[var(--df-text)]"
            }`}
          >
            Week calendar
          </button>
        </div>

        {/* Center: Date Navigator with working arrow buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrevDate}
            aria-label="Previous date"
            className="p-1.5 rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] hover:bg-[var(--df-surface-hover)] hover:text-[var(--df-text)] cursor-pointer text-[var(--df-text-muted)] transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs font-bold text-[var(--df-text)] px-1 select-none">
            {formattedSelectedDate}
          </span>
          <button
            type="button"
            onClick={handleNextDate}
            aria-label="Next date"
            className="p-1.5 rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] hover:bg-[var(--df-surface-hover)] hover:text-[var(--df-text)] cursor-pointer text-[var(--df-text-muted)] transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Right: Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            aria-label="Filter doctor"
            value={doctorFilter}
            onChange={(e) => setDoctorFilter(e.target.value)}
            className="bg-[var(--df-surface)] border border-[var(--df-border)] rounded-xl px-2.5 py-1.5 text-xs font-medium cursor-pointer"
          >
            <option value="All Doctors">All Doctors</option>
            <option value="Dr. Sneha K.">Dr. Sneha K.</option>
            <option value="Dr. Arjun M.">Dr. Arjun M.</option>
            <option value="Dr. Farhan A.">Dr. Farhan A.</option>
            <option value="Dr. Karan S.">Dr. Karan S.</option>
          </select>

          <select
            aria-label="Filter chair"
            value={chairFilter}
            onChange={(e) => setChairFilter(e.target.value)}
            className="bg-[var(--df-surface)] border border-[var(--df-border)] rounded-xl px-2.5 py-1.5 text-xs font-medium cursor-pointer"
          >
            <option value="All Chairs">All Chairs</option>
            <option value="C1">Chair 1</option>
            <option value="C2">Chair 2</option>
            <option value="C3">Chair 3</option>
            <option value="C4">Chair 4</option>
          </select>

          <select
            aria-label="Filter status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[var(--df-surface)] border border-[var(--df-border)] rounded-xl px-2.5 py-1.5 text-xs font-medium cursor-pointer"
          >
            <option value="All Status">All Status</option>
            <option value="Confirmed">Confirmed</option>
            <option value="In chair">In chair</option>
            <option value="Checked in">Checked in</option>
            <option value="Done">Done</option>
          </select>

          <button
            type="button"
            onClick={() => {
              const next: ClinicTimeFormat = timeFormat === "12h" ? "24h" : "12h";
              updateState((prev) => ({
                ...prev,
                clinicSetup: { ...prev.clinicSetup, timeFormat: next },
              }));
              toast.success(
                `Time display set to ${next === "12h" ? "12-hour (AM/PM)" : "24-hour"}`,
              );
            }}
            aria-label="Toggle 12-hour or 24-hour time format"
            title="Switch between 12-hour AM/PM and 24-hour clock"
            className="inline-flex items-center gap-1 bg-[var(--df-surface)] border border-[var(--df-border)] rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[var(--df-text-secondary)] hover:border-[var(--df-teal)] hover:text-[var(--df-teal)] cursor-pointer transition-colors"
          >
            <Clock className="h-3.5 w-3.5" />
            <span>{timeFormat === "12h" ? "12h AM/PM" : "24h"}</span>
          </button>
        </div>
      </div>

      {/* Main View Area: Day Calendar (Default) OR List View OR Week View */}
      {viewMode === "Day" && (
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="df-card overflow-hidden">
            {/* Drag hint strip */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-[var(--df-surface-muted)]/70 border-b border-[var(--df-border)] text-[11px] text-[var(--df-text-secondary)]">
              <span className="inline-flex items-center gap-1.5">
                <GripVertical className="h-3.5 w-3.5 text-[var(--df-teal)]" />
                <span>
                  Drag any appointment card to another chair or time slot to reschedule · Click a card to open details
                </span>
              </span>
              <span className="font-mono text-[11px] text-[var(--df-text-muted)]">
                Sorted chronologically · {timeFormat === "12h" ? "12-hour AM/PM" : "24-hour"}
              </span>
            </div>

            {/* Chair Headers */}
            <div className="grid grid-cols-12 border-b border-[var(--df-border)] bg-[var(--df-surface-muted)] text-xs font-bold divide-x divide-[var(--df-border)]">
              <div className="col-span-1 p-3 text-center text-[11px] text-[var(--df-text-muted)] font-semibold flex items-center justify-center">
                Time
              </div>
              {chairs.map((c) => (
                <div key={c.id} className="col-span-2 p-3">
                  <p className="text-[var(--df-text)] font-semibold text-xs">{c.label}</p>
                  <p className="text-[11px] text-[var(--df-text-muted)] font-normal mt-0.5">{c.doc}</p>
                </div>
              ))}
              <div className="col-span-3 p-3 text-[11px] text-[var(--df-text-muted)] flex items-center justify-between">
                <span className="font-bold text-[var(--df-text)] text-xs">Waitlist & Walk-in queue</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--df-teal-soft)] text-[var(--df-teal)] border border-[var(--df-teal-border)]">
                  {WAITLIST_QUEUE.length} active
                </span>
              </div>
            </div>

            {/* Time Rows Grid: 12-Column Matching Layout */}
            <div className="grid grid-cols-12 divide-x divide-[var(--df-border)] bg-[var(--df-surface)] relative min-h-[720px]">
              {/* 1. Time Column (col-span-1) */}
              <div className="col-span-1 select-none">
                {hours.map((h) => (
                  <div
                    key={h}
                    style={{ height: "80px" }}
                    className="border-b border-[var(--df-border)]/50 p-2 text-center flex flex-col items-center justify-start pt-2"
                  >
                    <span className="font-mono text-[11px] font-semibold text-[var(--df-text)] whitespace-nowrap">
                      {formatClinicTime(h, timeFormat)}
                    </span>
                  </div>
                ))}
              </div>

              {/* 2. Chair Columns (col-span-2 each for C1, C2, C3, C4) */}
              {chairs.map((c) => {
                const chairBlocks = filteredBlocks.filter((b) => b.chair === c.id);
                const HOUR_HEIGHT = 80;

                return (
                  <div key={c.id} className="col-span-2 relative">
                    {/* Droppable hour cells */}
                    {hours.map((h) => (
                      <ChairHourDropSlot
                        key={h}
                        chairId={c.id as "C1" | "C2" | "C3" | "C4"}
                        hour={h}
                        timeFormat={timeFormat}
                      />
                    ))}

                    {/* Draggable appointment cards for this chair */}
                    {chairBlocks.map((b) => {
                      const topOffset = (b.startHour - 9.0) * HOUR_HEIGHT;
                      const height = Math.max(b.durationHours * HOUR_HEIGHT, 52);

                      return (
                        <DraggableAppointmentBlock
                          key={b.id}
                          block={b}
                          topOffset={topOffset}
                          height={height}
                          timeFormat={timeFormat}
                          onOpen={handleOpenBlock}
                        />
                      );
                    })}
                  </div>
                );
              })}

              {/* 3. Waitlist & Walk-in Queue Column (col-span-3) */}
              <div className="col-span-3 bg-[var(--df-surface-muted)]/30 p-3 space-y-3">
                <div className="flex items-center justify-between text-[11px] text-[var(--df-text-muted)] px-0.5">
                  <span className="font-semibold uppercase tracking-wider text-[10px]">Queue · Priority</span>
                  <span className="text-[10px] text-[var(--df-teal)] font-medium">Auto-match on</span>
                </div>

                {WAITLIST_QUEUE.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] shadow-xs hover:border-[var(--df-teal-border)] transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <p className="font-bold text-xs text-[var(--df-text)]">{item.name}</p>
                        <p className="text-[10px] text-[var(--df-text-muted)]">
                          {item.phone} · Arrived {formatClinicTime(item.arrivedTime, timeFormat)}
                        </p>
                      </div>
                      <span
                        className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold ${
                          item.type === "Walk-in"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {item.type}
                      </span>
                    </div>

                    <p className="text-[11px] font-medium text-[var(--df-text-secondary)]">
                      {item.procedure}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-[var(--df-text-muted)] pt-1 border-t border-[var(--df-border)]/60">
                      <span>{item.waitingInfo}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPatientId(item.patientId);
                          setSelectedProcedure(item.procedure);
                          setSelectedDoctor(item.preferredDoctor);
                          setNewApptOpen(true);
                        }}
                        className="df-btn-primary px-2.5 py-1 text-[10px] font-semibold cursor-pointer rounded-lg inline-flex items-center gap-1 shadow-xs"
                      >
                        Seat in Chair
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => setNewApptOpen(true)}
                  className="w-full py-2.5 border border-dashed border-[var(--df-border-strong)] rounded-xl text-[11px] font-semibold text-[var(--df-text-muted)] hover:text-[var(--df-teal)] hover:border-[var(--df-teal)] bg-[var(--df-surface)]/60 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>+ Add Walk-in / Waitlist</span>
                </button>
              </div>
            </div>
          </div>

          <DragOverlay>
            {activeDragBlock ? (
              <div className="rounded-xl border-2 border-[var(--df-teal)] bg-white p-2.5 shadow-xl text-xs w-48 opacity-95">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-bold text-[var(--df-text)] truncate">
                    {activeDragBlock.patientName}
                  </span>
                  <span className="font-mono text-[10px] text-[var(--df-teal)] font-bold shrink-0">
                    {formatClinicTime(activeDragBlock.startHour, timeFormat)}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--df-text-secondary)] truncate mt-0.5">
                  {activeDragBlock.procedure}
                </p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* List View Table (5 columns; click any row for full detail side panel) */}
      {viewMode === "List" && (
        <div className="df-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--df-border)] bg-[var(--df-surface-muted)] text-[11px] font-bold text-[var(--df-text-muted)] uppercase tracking-wider">
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Procedure &amp; Doctor</th>
                  <th className="py-3 px-4">Chair</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--df-border)]">
                {filteredBlocks.map((b) => (
                  <tr
                    key={b.id}
                    onClick={() => handleOpenBlock(b)}
                    className="hover:bg-[var(--df-surface-hover)] transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-[var(--df-text)] whitespace-nowrap">
                      {formatClinicTime(b.startHour, timeFormat)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-bold text-[var(--df-text)]">{b.patientName}</span>
                        {b.anxietyBufferMin > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF3DC] text-[#9A5B00] border border-[#F8DFAA]">
                            +{b.anxietyBufferMin}m buffer
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-[var(--df-text)] font-medium">{b.procedure}</p>
                      <p className="text-xs text-[var(--df-text-muted)] mt-0.5">{b.doctor}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-[var(--df-surface-muted)] border border-[var(--df-border)] text-xs font-semibold">
                        {b.chair}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <DentflowStatusPill label={b.status} tone={STATUS_TONES[b.status] || "grey"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Week View */}
      {viewMode === "Week" && (
        <div className="df-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-sm text-[var(--df-text)]">
                {formattedSelectedDate}
              </p>
              <p className="text-xs text-[var(--df-text-muted)] mt-0.5">
                Click any day below to open its full chair schedule
              </p>
            </div>
            <button
              type="button"
              onClick={() => setViewMode("Day")}
              className="df-btn-secondary px-3 py-1 text-xs cursor-pointer"
            >
              Open Day View
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-2">
            {weekDays.map((d) => {
              const isSunday = d.getDay() === 0;
              const isSelectedDay =
                d.getDate() === currentDate.getDate() &&
                d.getMonth() === currentDate.getMonth();
              const dayLabel = d.toLocaleDateString("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "short",
              });
              const dayKey = getDateKey(d);
              const dayBlocks = customAppointments[dayKey] || getBaseScheduleForDate(d);
              const bookedCount = dayBlocks.length;

              return (
                <button
                  key={d.toISOString()}
                  type="button"
                  onClick={() => {
                    setCurrentDate(d);
                    setViewMode("Day");
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer hover:border-[var(--df-teal)] hover:shadow-xs ${
                    isSelectedDay
                      ? "bg-[var(--df-teal-soft)] border-[var(--df-teal)] ring-1 ring-[var(--df-teal)]"
                      : "bg-[var(--df-surface-muted)] border-[var(--df-border)]"
                  }`}
                >
                  <p className="font-bold text-xs text-[var(--df-text)]">{dayLabel}</p>
                  <p className="text-xl font-bold mt-2 text-[var(--df-text)]">
                    {isSunday ? (bookedCount > 0 ? `${bookedCount} Emg` : "Closed") : bookedCount}
                  </p>
                  <p className="text-[10px] text-[var(--df-text-muted)] mt-0.5">
                    {isSunday
                      ? bookedCount > 0
                        ? `${bookedCount} emergency cases`
                        : "Sunday closure"
                      : `${bookedCount} appointments`}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Appointment Detail Drawer */}
      {selectedBlock && (
        <DentflowDrawer
          open={detailDrawerOpen}
          onClose={() => setDetailDrawerOpen(false)}
          title={`Appointment · ${selectedBlock.patientName}`}
          subtitle={`${formatClinicTime(selectedBlock.startHour, timeFormat)} – ${formatClinicTime(
            selectedBlock.startHour + selectedBlock.durationHours,
            timeFormat,
          )} · ${selectedBlock.chair} · ${selectedBlock.procedure}`}
        >
          <div className="space-y-5 text-xs pb-10">
            {/* Status Card */}
            <div className="p-3.5 rounded-xl bg-[var(--df-surface-muted)] border border-[var(--df-border)] flex items-center justify-between">
              <div>
                <p className="text-[11px] text-[var(--df-text-muted)]">Current Status</p>
                <p className="font-bold text-sm text-[var(--df-text)] mt-0.5">{selectedBlock.status}</p>
              </div>
              <DentflowStatusPill label={selectedBlock.status} tone={STATUS_TONES[selectedBlock.status] || "grey"} />
            </div>

            {/* Reschedule Chair / Time (mirrors drag-and-drop for keyboard & touch users) */}
            <div className="df-card p-3.5 space-y-2.5">
              <p className="font-bold text-xs text-[var(--df-text)]">Reschedule Chair / Time</p>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] text-[var(--df-text-muted)] mb-1">Chair</label>
                  <select
                    aria-label="Reschedule chair"
                    value={selectedBlock.chair}
                    onChange={(e) =>
                      handleRescheduleBlock(
                        selectedBlock.id,
                        e.target.value as "C1" | "C2" | "C3" | "C4",
                        selectedBlock.startHour,
                      )
                    }
                    className="w-full bg-[var(--df-surface)] border border-[var(--df-border)] rounded-lg px-2.5 py-1.5 text-xs font-medium"
                  >
                    <option value="C1">Chair 1 · General</option>
                    <option value="C2">Chair 2 · Surgery/Endo</option>
                    <option value="C3">Chair 3 · Ortho</option>
                    <option value="C4">Chair 4 · Implant</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-[var(--df-text-muted)] mb-1">Start time</label>
                  <select
                    aria-label="Reschedule start time"
                    value={Math.floor(selectedBlock.startHour)}
                    onChange={(e) =>
                      handleRescheduleBlock(
                        selectedBlock.id,
                        selectedBlock.chair,
                        Number(e.target.value),
                      )
                    }
                    className="w-full bg-[var(--df-surface)] border border-[var(--df-border)] rounded-lg px-2.5 py-1.5 text-xs font-medium"
                  >
                    {hours.map((h) => (
                      <option key={h} value={h}>
                        {formatClinicTime(h, timeFormat)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <p className="font-bold text-xs text-[var(--df-text)]">Status Progression</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdateStatus("Checked in")}
                  className="df-btn-secondary py-2 text-xs font-semibold cursor-pointer"
                >
                  Mark Checked In
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus("In chair")}
                  className="df-btn-secondary py-2 text-xs font-semibold text-[var(--df-teal)] border-[var(--df-teal-border)] cursor-pointer"
                >
                  Move to Chair
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus("Done")}
                  className="df-btn-primary py-2 text-xs font-semibold cursor-pointer"
                >
                  Complete Procedure
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus("Cancelled")}
                  className="df-btn-secondary py-2 text-xs font-semibold text-red-600 hover:bg-red-50 cursor-pointer"
                >
                  Cancel Sitting
                </button>
              </div>
            </div>

            {/* Patient & Anxiety Alert */}
            {selectedBlock.anxietyBufferMin > 0 && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-xs text-amber-800">
                  <AlertCircle className="h-4 w-4" />
                  <span>Anxiety Buffer Active (+{selectedBlock.anxietyBufferMin} mins)</span>
                </div>
                <p className="text-[11px]">
                  Patient sensitive to injections. Doctor must explain each step before starting and observe hand-raise stop signal.
                </p>
              </div>
            )}

            {/* Reminders & WhatsApp */}
            <div className="df-card p-3.5 space-y-2">
              <p className="font-bold text-xs text-[var(--df-text)]">WhatsApp Notifications</p>
              <p className="text-[11px] text-[var(--df-text-secondary)]">
                Automated reminder sent at {formatClinicTime("08:00", timeFormat)} today. Patient confirmed via WhatsApp interactive reply.
              </p>
              <button
                type="button"
                onClick={() => toast.success("WhatsApp appointment details resent!")}
                className="df-btn-secondary px-3 py-1.5 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer mt-1"
              >
                <MessageSquare className="h-3.5 w-3.5 text-[var(--df-teal)]" />
                <span>Resend reminder</span>
              </button>
            </div>
          </div>
        </DentflowDrawer>
      )}

      {/* "+ New Appointment" Right-Side Drawer */}
      <DentflowDrawer
        open={newApptOpen}
        onClose={() => setNewApptOpen(false)}
        title="+ Book Chair Appointment"
        subtitle="Match patient, procedure duration, doctor & anxiety buffer"
      >
        <div className="space-y-5 text-xs pb-10">
          {/* Patient Selection */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-[var(--df-text)]">Select patient *</label>
              <Link href="/app/patients" className="text-[11px] font-semibold text-[var(--df-teal)] hover:underline">
                + New patient
              </Link>
            </div>
            <select
              aria-label="Select patient"
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full bg-[var(--df-surface)] border border-[var(--df-border)] rounded-xl px-3 py-2 font-medium"
            >
              {state.patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.code}) · {p.phone}
                </option>
              ))}
            </select>
          </div>

          {/* Dynamic Allergy & Anxiety Alert */}
          {(selectedPatient.allergies.length > 0 || anxietyBuffer > 0) && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-xs text-amber-800">
                <AlertCircle className="h-4 w-4" />
                <span>Patient Health Alerts</span>
              </div>
              <p className="text-[11.5px]">
                {selectedPatient.allergies.length > 0 && (
                  <span>Allergies: <strong>{selectedPatient.allergies.join(", ")}</strong>. </span>
                )}
                {anxietyBuffer > 0 && (
                  <span>Dental anxiety: <strong>+{anxietyBuffer}m automatic buffer</strong> added to slot.</span>
                )}
              </p>
            </div>
          )}

          {/* Procedure */}
          <div>
            <label className="block font-semibold mb-1 text-[var(--df-text)]">Procedure *</label>
            <select
              aria-label="Procedure"
              value={selectedProcedure}
              onChange={(e) => setSelectedProcedure(e.target.value)}
              className="w-full bg-[var(--df-surface)] border border-[var(--df-border)] rounded-xl px-3 py-2 font-medium"
            >
              <option value="Scaling & polish — 30 min">Scaling & polish — 30 min</option>
              <option value="Composite filling 14 — 45 min">Composite filling — 45 min</option>
              <option value="Root canal 36 · sitting 2 — 60 min">Root canal treatment — 60 min</option>
              <option value="Crown prep & scan — 60 min">Crown prep & scan — 60 min</option>
              <option value="Implant consultation — 45 min">Implant consultation — 45 min</option>
            </select>
          </div>

          {/* Doctor & Chair */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1 text-[var(--df-text)]">Doctor</label>
              <select
                aria-label="Doctor"
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="w-full bg-[var(--df-surface)] border border-[var(--df-border)] rounded-xl px-3 py-2"
              >
                <option value="Dr. Sneha Kulkarni">Dr. Sneha Kulkarni</option>
                <option value="Dr. Arjun Mehta">Dr. Arjun Mehta</option>
                <option value="Dr. Farhan Ali">Dr. Farhan Ali</option>
                <option value="Dr. Karan Shah">Dr. Karan Shah</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1 text-[var(--df-text)]">Chair</label>
              <select
                aria-label="Chair"
                value={selectedChair}
                onChange={(e) => setSelectedChair(e.target.value as any)}
                className="w-full bg-[var(--df-surface)] border border-[var(--df-border)] rounded-xl px-3 py-2"
              >
                <option value="C1">Chair 1 · General</option>
                <option value="C2">Chair 2 · Surgery/Endo</option>
                <option value="C3">Chair 3 · Ortho</option>
                <option value="C4">Chair 4 · Implant</option>
              </select>
            </div>
          </div>

          {/* Suggested Free Slots Chips */}
          <div>
            <label className="block font-semibold mb-1.5 text-[var(--df-text)]">
              Suggested free time slots (Today)
            </label>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_SLOTS.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
                    selectedSlot === slot
                      ? "bg-[var(--df-teal)] text-white border-[var(--df-teal)]"
                      : "bg-[var(--df-surface)] border-[var(--df-border)] text-[var(--df-text-secondary)] hover:bg-[var(--df-surface-hover)]"
                  }`}
                >
                  {formatClinicTime(slot, timeFormat)}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold mb-1 text-[var(--df-text)]">Clinical notes</label>
            <textarea
              rows={2}
              value={apptNotes}
              onChange={(e) => setApptNotes(e.target.value)}
              placeholder="e.g. Patient requested morning sitting, headphones enabled"
              className="w-full bg-[var(--df-surface)] border border-[var(--df-border)] rounded-xl p-2.5 text-xs"
            />
          </div>

          {/* WhatsApp & Deposit Checkboxes */}
          <div className="p-3 rounded-xl bg-[var(--df-surface-muted)] border border-[var(--df-border)] space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={sendWhatsApp}
                onChange={(e) => setSendWhatsApp(e.target.checked)}
                className="h-3.5 w-3.5 rounded text-[var(--df-teal)]"
              />
              <span className="text-[11px] text-[var(--df-text-secondary)]">
                Send WhatsApp confirmation with Google Maps clinic directions
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={askDeposit}
                onChange={(e) => setAskDeposit(e.target.checked)}
                className="h-3.5 w-3.5 rounded text-[var(--df-teal)]"
              />
              <span className="text-[11px] text-[var(--df-text-secondary)]">
                Request booking deposit (₹500 dynamic UPI QR link)
              </span>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[var(--df-border)] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setNewApptOpen(false)}
              className="df-btn-secondary px-4 py-2 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleBookAppointment}
              className="df-btn-primary px-5 py-2 text-xs font-semibold cursor-pointer"
            >
              Book appointment
            </button>
          </div>
        </div>
      </DentflowDrawer>

      {/* "Video Consultation" Modal */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="df-card w-full max-w-lg p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--df-border)] pb-2.5">
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4 text-[var(--df-teal)]" />
                <h3 className="font-bold text-sm text-[var(--df-text)]">
                  Tele-Dentistry Video Consultations
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setVideoModalOpen(false)}
                aria-label="Close video consultation modal"
                title="Close"
                className="p-1 rounded-lg text-[var(--df-text-muted)] hover:bg-[var(--df-surface-muted)] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* 3 Tabs */}
            <div className="flex border-b border-[var(--df-border)] gap-2 pb-1 text-xs">
              {(["Today", "Schedule", "Start now"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setVideoTab(tab)}
                  className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer transition-colors ${
                    videoTab === tab
                      ? "bg-[var(--df-teal-soft)] text-[var(--df-teal)] border border-[var(--df-teal-border)]"
                      : "text-[var(--df-text-secondary)] hover:bg-[var(--df-surface-hover)]"
                  }`}
                >
                  {tab === "Today" ? `Today's Consults (${videoConsults.length})` : tab}
                </button>
              ))}
            </div>

            {/* Tab: Today's Consults List */}
            {videoTab === "Today" && (
              <div className="space-y-2.5">
                {videoConsults.map((consult) => (
                  <div
                    key={consult.id}
                    className="p-3 rounded-xl border border-[var(--df-border)] bg-[var(--df-surface-muted)] flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[var(--df-text)]">{consult.patientName}</span>
                        <DentflowStatusPill
                          label={consult.status}
                          tone={consult.status === "Live" ? "red" : consult.status === "Scheduled" ? "blue" : "green"}
                        />
                      </div>
                      <p className="text-[11px] text-[var(--df-text-muted)] mt-0.5">
                        {consult.time} · {consult.doctorName}
                      </p>
                      <p className="text-[11px] text-[var(--df-text-secondary)] mt-0.5 italic">
                        “{consult.reason}”
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleStartCall(consult)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer shrink-0 inline-flex items-center gap-1 ${
                        consult.status === "Live"
                          ? "bg-red-600 text-white animate-pulse"
                          : "df-btn-primary"
                      }`}
                    >
                      <Video className="h-3.5 w-3.5" />
                      <span>{consult.status === "Live" ? "Join Live" : "Start Call"}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Tab: Schedule */}
            {videoTab === "Schedule" && (
              <form onSubmit={handleScheduleVideoConsult} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1 text-[var(--df-text)]">Patient</label>
                  <select
                    aria-label="Select patient for video"
                    value={videoPatientId}
                    onChange={(e) => setVideoPatientId(e.target.value)}
                    className="w-full bg-[var(--df-surface)] border border-[var(--df-border)] rounded-xl px-3 py-2 text-xs"
                  >
                    {state.patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.code}) · {p.phone}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-[var(--df-text)]">Attending Doctor</label>
                    <select
                      aria-label="Select doctor for video"
                      value={videoDoctor}
                      onChange={(e) => setVideoDoctor(e.target.value)}
                      className="w-full bg-[var(--df-surface)] border border-[var(--df-border)] rounded-xl px-3 py-2 text-xs"
                    >
                      <option value="Dr. Sneha Kulkarni">Dr. Sneha Kulkarni</option>
                      <option value="Dr. Arjun Mehta">Dr. Arjun Mehta</option>
                      <option value="Dr. Karan Shah">Dr. Karan Shah</option>
                      <option value="Dr. Farhan Ali">Dr. Farhan Ali</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-[var(--df-text)]">Time</label>
                    <input
                      type="text"
                      value={videoTime}
                      onChange={(e) => setVideoTime(e.target.value)}
                      placeholder="e.g. 11:30 AM"
                      className="w-full bg-[var(--df-surface)] border border-[var(--df-border)] rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[var(--df-text)]">Reason for consultation</label>
                  <input
                    type="text"
                    value={videoReason}
                    onChange={(e) => setVideoReason(e.target.value)}
                    placeholder="e.g. Aligner tracking check & post-op sensitivity"
                    className="w-full bg-[var(--df-surface)] border border-[var(--df-border)] rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-[11px] text-[var(--df-text-secondary)]">
                  <input type="checkbox" defaultChecked className="h-3.5 w-3.5 rounded text-[var(--df-teal)]" />
                  <span>Send meeting link via WhatsApp and SMS to patient</span>
                </label>
                <button
                  type="submit"
                  className="w-full df-btn-primary py-2.5 text-xs font-semibold cursor-pointer mt-2"
                >
                  Schedule Video Consult &amp; Add to List
                </button>
              </form>
            )}

            {/* Tab: Start now */}
            {videoTab === "Start now" && (
              <div className="space-y-3 text-xs text-center py-4">
                <p className="text-[var(--df-text-secondary)]">
                  Launch an instant video room and send a direct join link to the patient's phone.
                </p>
                <div className="max-w-xs mx-auto text-left space-y-2">
                  <label className="block font-semibold text-[var(--df-text)]">Patient</label>
                  <select aria-label="Select patient for instant video" className="w-full bg-[var(--df-surface)] border border-[var(--df-border)] rounded-xl px-3 py-2">
                    <option>Priya Deshmukh · +91 98220 11210</option>
                    <option>Rohan Mehta · +91 98220 33441</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const instantItem: VideoConsultationItem = {
                      id: `vc-${Date.now()}`,
                      patientName: "Priya Deshmukh",
                      doctorName: "Dr. Sneha Kulkarni",
                      time: "Now",
                      status: "Live",
                      reason: "Instant clinical consultation",
                    };
                    setVideoConsults((prev) => [instantItem, ...prev]);
                    handleStartCall(instantItem);
                  }}
                  className="df-btn-primary px-6 py-2.5 text-xs font-semibold inline-flex items-center gap-2 cursor-pointer mt-2"
                >
                  <Video className="h-4 w-4" />
                  <span>Launch Instant Room</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tele-Dentistry Live Call Screen / Overlay */}
      {activeCall && (
        <div className="fixed inset-0 z-50 bg-[#0F172A] text-white flex flex-col">
          {/* Top Bar of Call */}
          <div className="h-14 border-b border-slate-700 bg-slate-900/90 px-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
              <div>
                <p className="font-bold text-xs">Tele-Consult · {activeCall.patientName}</p>
                <p className="text-[10px] text-slate-400">{activeCall.doctorName} · Duration: 04:12</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/30">
                HD Encrypted (WebRTC)
              </span>
              <button
                type="button"
                onClick={handleEndCall}
                className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <PhoneOff className="h-3.5 w-3.5" />
                <span>End Call</span>
              </button>
            </div>
          </div>

          {/* Main Call View */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left: Video Tiles */}
            <div className="flex-1 p-4 flex flex-col items-center justify-center relative bg-black/40">
              {/* Patient Main Tile */}
              <div className="w-full h-full max-h-[500px] max-w-2xl rounded-2xl bg-slate-800 border border-slate-700 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="h-24 w-24 rounded-full bg-teal-800 text-teal-200 text-3xl font-bold flex items-center justify-center">
                  {activeCall.patientName.split(" ").map((n) => n[0]).join("")}
                </div>
                <p className="font-semibold text-sm mt-3">{activeCall.patientName} (Patient)</p>
                <p className="text-xs text-slate-400">Microphone active · Camera connected</p>

                {/* Self View (Doctor Preview Pip) */}
                <div className="absolute bottom-4 right-4 h-32 w-48 rounded-xl bg-slate-900 border-2 border-teal-500 overflow-hidden flex flex-col items-center justify-center">
                  <div className="h-10 w-10 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-xs">
                    Dr
                  </div>
                  <span className="text-[10px] text-slate-300 mt-1">You (Dr. Sneha)</span>
                </div>
              </div>

              {/* In-Call Action Toolbar */}
              <div className="absolute bottom-6 flex items-center gap-3 bg-slate-900/90 border border-slate-700 p-2 rounded-2xl backdrop-blur shadow-2xl">
                <button
                  type="button"
                  onClick={() => setCallMuted((v) => !v)}
                  aria-label={callMuted ? "Unmute microphone" : "Mute microphone"}
                  title={callMuted ? "Unmute microphone" : "Mute microphone"}
                  className={`p-3 rounded-xl cursor-pointer ${callMuted ? "bg-red-600 text-white" : "bg-slate-800 hover:bg-slate-700 text-white"}`}
                >
                  {callMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => setCallVideoOff((v) => !v)}
                  aria-label={callVideoOff ? "Turn camera on" : "Turn camera off"}
                  title={callVideoOff ? "Turn camera on" : "Turn camera off"}
                  className={`p-3 rounded-xl cursor-pointer ${callVideoOff ? "bg-red-600 text-white" : "bg-slate-800 hover:bg-slate-700 text-white"}`}
                >
                  {callVideoOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => toast.info("Screen sharing initiated")}
                  aria-label="Share screen"
                  className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
                  title="Share Screen"
                >
                  <Share2 className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={handleEndCall}
                  className="px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <PhoneOff className="h-4 w-4" />
                  <span>Leave</span>
                </button>
              </div>
            </div>

            {/* Right: In-Call Clinical Chat & Notes Sidebar */}
            <div className="w-80 border-l border-slate-700 bg-slate-900 flex flex-col">
              <div className="p-3 border-b border-slate-700 font-bold text-xs flex items-center justify-between">
                <span>In-Call Notes & Chat</span>
                <Link
                  href="/app/prescriptions"
                  target="_blank"
                  className="text-[11px] font-semibold text-teal-400 hover:underline"
                >
                  + Rx
                </Link>
              </div>

              <div className="flex-1 p-3 space-y-2 overflow-y-auto text-xs">
                {callChatMessages.map((m, i) => (
                  <div key={i} className="p-2 rounded-lg bg-slate-800 border border-slate-700">
                    <span className="font-bold text-[10px] text-teal-400">{m.sender}: </span>
                    <span className="text-[11px] text-slate-200">{m.text}</span>
                  </div>
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!callInputChat.trim()) return;
                  setCallChatMessages((prev) => [...prev, { sender: "Dr. Sneha", text: callInputChat.trim() }]);
                  setCallInputChat("");
                }}
                className="p-2 border-t border-slate-700 flex gap-1.5"
              >
                <input
                  type="text"
                  value={callInputChat}
                  onChange={(e) => setCallInputChat(e.target.value)}
                  placeholder="Send note or link..."
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CalendarPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[var(--df-text-muted)]">Loading calendar...</div>}>
      <CalendarPageInner />
    </Suspense>
  );
}
