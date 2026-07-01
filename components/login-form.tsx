"use client";

import { useActionState } from "react";
import { requestOtpAction, verifyOtpAction, type OtpState, type VerifyState } from "@/lib/actions/auth";

export function LoginForm({ intent, next }: { intent: string; next: string }) {
  const [otpState, requestOtp, requesting] = useActionState<OtpState, FormData>(requestOtpAction, {});
  const [verifyState, verify, verifying] = useActionState<VerifyState, FormData>(verifyOtpAction, {});

  if (!otpState.ok) {
    return (
      <form action={requestOtp} className="grid gap-4">
        <div>
          <label className="field-label" htmlFor="phone">Mobile number</label>
          <div className="flex items-center gap-2">
            <span className="pill" style={{ padding: "11px 12px" }}>🇮🇳 +91</span>
            <input
              id="phone"
              name="phone"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="98••• •••••"
              className="input num"
              required
            />
          </div>
        </div>
        {otpState.error && <p className="text-sm text-warn">{otpState.error}</p>}
        <button className="btn btn-primary" disabled={requesting}>
          {requesting ? "Sending code…" : "Send OTP →"}
        </button>
      </form>
    );
  }

  return (
    <form action={verify} className="grid gap-4">
      <input type="hidden" name="phone" value={otpState.phone} />
      <input type="hidden" name="intent" value={intent} />
      <input type="hidden" name="next" value={next} />
      <div>
        <label className="field-label" htmlFor="code">
          Enter the code sent to {otpState.phone}
        </label>
        <input
          id="code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="6-digit code"
          className="input num tracking-[0.4em] text-lg"
          required
        />
        <p className="text-xs text-faint mt-2">
          Dev mode: the code is printed in the server console.
        </p>
      </div>
      {verifyState.error && <p className="text-sm text-warn">{verifyState.error}</p>}
      <button className="btn btn-primary" disabled={verifying}>
        {verifying ? "Verifying…" : "Verify & continue"}
      </button>
    </form>
  );
}
