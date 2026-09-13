"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { LeadCaptureModal } from "./LeadCaptureModal";

interface OpenOptions {
  propertyId?: string | null;
  propertyLabel?: string | null;
  headline?: string;
}

interface LeadCaptureContextValue {
  openLeadCapture: (opts?: OpenOptions) => void;
}

const LeadCaptureContext = createContext<LeadCaptureContextValue | null>(null);

const ENGAGEMENT_DELAY_MS = 30_000;
const SESSION_PROMPTED_KEY = "tr_lead_prompted"; // avoid repeatedly interrupting the same session
const SUBMITTED_KEY = "tr_lead_submitted"; // avoid ever prompting again once they've converted

export function LeadCaptureProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState<OpenOptions>({});

  const openLeadCapture = useCallback((next: OpenOptions = {}) => {
    setOpts(next);
    setOpen(true);
  }, []);

  // 30s-of-engagement auto trigger, once per session, never if already converted.
  useEffect(() => {
    let alreadySubmitted = false;
    let alreadyPromptedThisSession = false;
    try {
      alreadySubmitted = window.localStorage.getItem(SUBMITTED_KEY) === "1";
      alreadyPromptedThisSession = window.sessionStorage.getItem(SESSION_PROMPTED_KEY) === "1";
    } catch {
      // storage unavailable — fall back to prompting once, which is still acceptable
    }
    if (alreadySubmitted || alreadyPromptedThisSession) return;

    const timer = setTimeout(() => {
      try {
        window.sessionStorage.setItem(SESSION_PROMPTED_KEY, "1");
      } catch {
        // ignore
      }
      setOpts({});
      setOpen(true);
    }, ENGAGEMENT_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  const value = useMemo(() => ({ openLeadCapture }), [openLeadCapture]);

  return (
    <LeadCaptureContext.Provider value={value}>
      {children}
      <LeadCaptureModal
        open={open}
        onClose={() => setOpen(false)}
        propertyId={opts.propertyId}
        propertyLabel={opts.propertyLabel}
        headline={opts.headline}
      />
    </LeadCaptureContext.Provider>
  );
}

export function useLeadCapture(): LeadCaptureContextValue {
  const ctx = useContext(LeadCaptureContext);
  if (!ctx) throw new Error("useLeadCapture must be used within LeadCaptureProvider");
  return ctx;
}
