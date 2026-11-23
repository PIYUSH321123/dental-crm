import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { INITIAL_DENTFLOW_STATE } from "@/lib/dentflow-data";
import { migrateDentflowState } from "@/lib/dentflow-migrations";
import { ClinicLandingConfig, DentflowAppState } from "@/types/dentflow";

const DATA_DIR = path.join(process.cwd(), ".data");
const STATE_FILE = path.join(DATA_DIR, "dentflow-state.json");

function readState(): DentflowAppState {
  try {
    if (!fs.existsSync(STATE_FILE)) return migrateDentflowState(INITIAL_DENTFLOW_STATE);
    const parsed = JSON.parse(fs.readFileSync(STATE_FILE, "utf-8"));
    return migrateDentflowState(parsed);
  } catch {
    return migrateDentflowState(INITIAL_DENTFLOW_STATE);
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug") || "smile-studio";

  const state = readState();
  const landings = state.clinicLandings || INITIAL_DENTFLOW_STATE.clinicLandings || {};
  const config = landings[slug] || landings["smile-studio"] || Object.values(landings)[0];

  return NextResponse.json({
    ok: true,
    slug,
    config,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const slug = String(body?.slug || "smile-studio").trim();
    const config = body?.config as ClinicLandingConfig;

    if (!config) {
      return NextResponse.json({ ok: false, error: "Missing config" }, { status: 400 });
    }

    const state = readState();
    const nextState: DentflowAppState = {
      ...state,
      clinicLandings: {
        ...(state.clinicLandings || {}),
        [slug]: config,
      },
    };

    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(STATE_FILE, JSON.stringify(nextState, null, 2), "utf-8");

    return NextResponse.json({ ok: true, slug, config });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
