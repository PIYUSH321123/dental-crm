import React from "react";
import { Metadata } from "next";
import fs from "fs";
import path from "path";
import { INITIAL_DENTFLOW_STATE } from "@/lib/dentflow-data";
import { migrateDentflowState } from "@/lib/dentflow-migrations";
import { ClinicLandingConfig, DentflowAppState } from "@/types/dentflow";
import ClinicLandingClient from "./clinic-landing-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const DATA_DIR = path.join(process.cwd(), ".data");
const STATE_FILE = path.join(DATA_DIR, "dentflow-state.json");

function getLandingConfig(slug: string): ClinicLandingConfig {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(STATE_FILE, "utf-8"));
      const state: DentflowAppState = migrateDentflowState(parsed);
      if (state.clinicLandings && state.clinicLandings[slug]) {
        return state.clinicLandings[slug];
      }
    }
  } catch {}

  const defaultLandings = INITIAL_DENTFLOW_STATE.clinicLandings || {};
  return (
    defaultLandings[slug] ||
    defaultLandings["smile-studio"] || {
      clinicName: "Smile Studio Dental",
      slug,
      tagline: "Comprehensive Multi-Speciality Dental Care",
      heroTitle: "Exceptional care for healthy, radiant smiles.",
      heroSubtitle:
        "Modern digital dentistry, microscopic treatments, and gentle touch for every family member.",
      phone: "+91 20 2612 4400",
      email: "care@smilestudio.in",
      address: "Station Road, Pune",
      workingHours: "Mon – Sat: 09:30 am – 08:30 pm",
      services: [],
      doctors: [],
      testimonials: [],
      pricing: [],
    }
  );
}

export async function generateMetadata(props: {
  params: Promise<{ clinicSlug: string }>;
}): Promise<Metadata> {
  const { clinicSlug } = await props.params;
  const config = getLandingConfig(clinicSlug);

  return {
    title: `${config.clinicName} · ${config.tagline}`,
    description: config.heroSubtitle,
    openGraph: {
      title: `${config.clinicName} · Multi-Speciality Dental Care`,
      description: config.heroSubtitle,
    },
  };
}

export default async function ClinicLandingPageRoute(props: {
  params: Promise<{ clinicSlug: string }>;
}) {
  const { clinicSlug } = await props.params;
  const config = getLandingConfig(clinicSlug);

  return <ClinicLandingClient initialConfig={config} slug={clinicSlug} />;
}
