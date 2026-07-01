"use client";

import { useState } from "react";

export function DocUpload({
  name,
  label,
  hint,
  initialUrl,
}: {
  name: string;
  label: string;
  hint?: string;
  initialUrl?: string | null;
}) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">(
    initialUrl ? "done" : "idle"
  );
  const [message, setMessage] = useState("");

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus("uploading");
    setMessage(file.name);
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body });
    const data = await res.json();
    if (!res.ok) {
      setStatus("error");
      setMessage(data.error ?? "Upload failed");
      return;
    }
    setUrl(data.url);
    setStatus("done");
  }

  return (
    <div>
      <label className="field-label">{label}</label>
      <label
        className="flex items-center gap-3 rounded-[10px] border border-dashed border-line bg-surface-2 px-4 py-3 cursor-pointer hover:border-primary transition"
        style={status === "done" ? { borderStyle: "solid", background: "var(--color-good-soft)", borderColor: "#BFE0CC" } : undefined}
      >
        <input type="file" accept="image/*,application/pdf" className="sr-only" onChange={onFile} />
        <span className="text-lg">
          {status === "done" ? "✓" : status === "uploading" ? "⏳" : "⬆"}
        </span>
        <span className="text-sm text-muted">
          {status === "done"
            ? "Uploaded — tap to replace"
            : status === "uploading"
              ? `Uploading ${message}…`
              : status === "error"
                ? message
                : hint ?? "Tap to upload (JPG, PNG or PDF)"}
        </span>
      </label>
      <input type="hidden" name={name} value={url} />
    </div>
  );
}
