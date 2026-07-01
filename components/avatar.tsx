export function Avatar({
  initials,
  color = "#0F766E",
  size = 48,
}: {
  initials: string;
  color?: string;
  size?: number;
}) {
  return (
    <span
      className="avatar"
      style={{ width: size, height: size, background: color, fontSize: Math.round(size * 0.34) }}
    >
      {initials}
    </span>
  );
}

export function initialsFrom(name?: string | null): string {
  if (!name) return "KC";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "KC";
}
