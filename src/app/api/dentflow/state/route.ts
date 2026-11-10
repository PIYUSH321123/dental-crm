import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { INITIAL_DENTFLOW_STATE } from "@/lib/dentflow-data";
import { DentflowAppState } from "@/types/dentflow";

const DATA_DIR = path.join(process.cwd(), ".data");
const STATE_FILE = path.join(DATA_DIR, "dentflow-state.json");
const BACKEND_URL = process.env.DENTFLOW_BACKEND_URL || "http://localhost:4000/api/v1";

function ensureState(): DentflowAppState {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(STATE_FILE)) {
      fs.writeFileSync(STATE_FILE, JSON.stringify(INITIAL_DENTFLOW_STATE, null, 2), "utf-8");
      return INITIAL_DENTFLOW_STATE;
    }
    const raw = fs.readFileSync(STATE_FILE, "utf-8");
    const parsed = JSON.parse(raw) as DentflowAppState;
    return { ...INITIAL_DENTFLOW_STATE, ...parsed };
  } catch {
    return INITIAL_DENTFLOW_STATE;
  }
}

function saveState(state: DentflowAppState) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), "utf-8");
  } catch {
    // ignore read-only FS errors in serverless environments
  }
}

async function checkBackendHealth(): Promise<{ api: boolean; ai: boolean }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 800);
    const res = await fetch(`${BACKEND_URL}/health`, { signal: controller.signal });
    clearTimeout(timeout);
    return { api: res.ok, ai: res.ok };
  } catch {
    return { api: false, ai: false };
  }
}

export async function GET() {
  const state = ensureState();
  const backendStatus = await checkBackendHealth();
  return NextResponse.json({
    ok: true,
    backendConnected: backendStatus.api,
    backendUrl: BACKEND_URL,
    state,
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const action = body?.action as string;
  const payload = body?.payload || {};

  let state = ensureState();

  if (action === "RESET_DEMO") {
    state = INITIAL_DENTFLOW_STATE;
    saveState(state);
    return NextResponse.json({ ok: true, state });
  }

  if (action === "REPLACE_STATE" && body?.state) {
    state = body.state as DentflowAppState;
    saveState(state);
    return NextResponse.json({ ok: true, state });
  }

  if (action === "LOG_DPDP_READ") {
    const entry = {
      id: `dl-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      actor: payload.actor || "Staff",
      role: payload.role || state.activeRole,
      patientName: payload.patientName || "Priya Deshmukh",
      screenId: payload.screenId || "C03",
      action: payload.readAction || "READ",
    };
    state = {
      ...state,
      dpdpAccessLogs: [entry, ...state.dpdpAccessLogs].slice(0, 50),
    };
    saveState(state);
    return NextResponse.json({ ok: true, state });
  }

  // Forward generic state sync or mutation if payload includes updatedState
  if (body?.updatedState) {
    state = body.updatedState as DentflowAppState;
    saveState(state);
    return NextResponse.json({ ok: true, state });
  }

  return NextResponse.json({ ok: true, state });
}

