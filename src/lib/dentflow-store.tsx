"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { INITIAL_DENTFLOW_STATE } from "@/lib/dentflow-data";
import { migrateDentflowState } from "@/lib/dentflow-migrations";
import { DentflowRoleKey, ROLE_USER_PROFILES } from "@/lib/dentflow-theme";
import { BranchName, DentflowAppState } from "@/types/dentflow";

export interface AuditEventInput {
  patientName: string;
  screenName: string;
  action: string;
  entityType: "patient" | "dental_chart" | "prescription" | "consent" | "system";
  entityId?: string;
  details?: string;
}

interface DentflowContextValue {
  state: DentflowAppState;
  backendConnected: boolean;
  isHydrated: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  setActiveRole: (role: DentflowRoleKey) => void;
  setActiveBranch: (branch: BranchName) => void;
  updateState: (updater: (prev: DentflowAppState) => DentflowAppState) => void;
  logPatientRead: (patientName: string, screenName: string, readAction?: string) => void;
  logAuditEvent: (event: AuditEventInput) => void;
  resetDemoState: () => Promise<void>;
}

const DentflowContext = createContext<DentflowContextValue | null>(null);

export function DentflowProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DentflowAppState>(INITIAL_DENTFLOW_STATE);
  const [backendConnected, setBackendConnected] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/dentflow/state")
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        if (data?.state) {
          setState(migrateDentflowState(data.state));
        }
        setBackendConnected(Boolean(data?.backendConnected));
        setIsHydrated(true);
      })
      .catch(() => {
        if (active) setIsHydrated(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const persist = useCallback((next: DentflowAppState) => {
    fetch("/api/dentflow/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "REPLACE_STATE", state: next }),
    }).catch(() => {});
  }, []);

  const updateState = useCallback(
    (updater: (prev: DentflowAppState) => DentflowAppState) => {
      setState((prev) => {
        const next = updater(prev);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const setActiveRole = useCallback(
    (role: DentflowRoleKey) => {
      updateState((prev) => ({ ...prev, activeRole: role }));
    },
    [updateState],
  );

  const setActiveBranch = useCallback(
    (branch: BranchName) => {
      updateState((prev) => ({ ...prev, activeBranch: branch }));
    },
    [updateState],
  );

  const logPatientRead = useCallback(
    (patientName: string, screenName: string, readAction = "READ") => {
      setState((prev) => {
        const profile = ROLE_USER_PROFILES[prev.activeRole];
        const latest = prev.dpdpAccessLogs[0];
        if (
          latest &&
          latest.patientName === patientName &&
          latest.screenName === screenName &&
          latest.actor === profile.name
        ) {
          return prev;
        }
        const now = new Date();
        const entry = {
          id: `dl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          timestamp: now.toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          }),
          isoTimestamp: now.toISOString(),
          actor: profile.name,
          role: prev.activeRole,
          patientName,
          screenName,
          action: readAction,
          entityType: "patient" as const,
        };
        const next = {
          ...prev,
          dpdpAccessLogs: [entry, ...prev.dpdpAccessLogs].slice(0, 500),
        };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const logAuditEvent = useCallback(
    (event: AuditEventInput) => {
      setState((prev) => {
        const profile = ROLE_USER_PROFILES[prev.activeRole];
        const now = new Date();
        const entry = {
          id: `dl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          timestamp: now.toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          }),
          isoTimestamp: now.toISOString(),
          actor: profile?.name || "Clinic Staff",
          role: prev.activeRole,
          patientName: event.patientName,
          screenName: event.screenName,
          action: event.action,
          entityType: event.entityType,
          entityId: event.entityId,
          details: event.details,
        };
        const next = {
          ...prev,
          dpdpAccessLogs: [entry, ...prev.dpdpAccessLogs].slice(0, 500),
        };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const resetDemoState = useCallback(async () => {
    const res = await fetch("/api/dentflow/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "RESET_DEMO" }),
    });
    const data = await res.json();
    if (data?.state) setState(data.state);
  }, []);

  return (
    <DentflowContext.Provider
      value={{
        state,
        backendConnected,
        isHydrated,
        searchQuery,
        setSearchQuery,
        setActiveRole,
        setActiveBranch,
        updateState,
        logPatientRead,
        logAuditEvent,
        resetDemoState,
      }}
    >
      {children}
    </DentflowContext.Provider>
  );
}

export function useDentflow() {
  const ctx = useContext(DentflowContext);
  if (!ctx) {
    throw new Error("useDentflow must be used inside DentflowProvider");
  }
  return ctx;
}

