"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

export function SortSelect({ value }: { value: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = new URLSearchParams(params.toString());
    next.set("sort", e.target.value);
    router.push(`${pathname}?${next.toString()}`);
  }

  return (
    <select value={value} onChange={onChange} className="select" style={{ width: "auto" }}>
      <option value="rating">Highest rated</option>
      <option value="rate">Lowest rate</option>
      <option value="experience">Most experienced</option>
    </select>
  );
}
