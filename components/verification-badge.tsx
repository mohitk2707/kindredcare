const MAP: Record<string, { cls: string; label: string }> = {
  UNSUBMITTED: { cls: "pill", label: "Not submitted" },
  PENDING: { cls: "pill pill-warn", label: "Verification pending" },
  VERIFIED: { cls: "pill pill-verified", label: "✓ Verified" },
  REJECTED: { cls: "pill pill-accent", label: "Needs attention" },
};

export function VerificationBadge({ status }: { status: string }) {
  const m = MAP[status] ?? MAP.UNSUBMITTED;
  return <span className={m.cls}>{m.label}</span>;
}
