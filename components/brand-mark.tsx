export function BrandMark() {
  return (
    <span
      aria-hidden="true"
      className="grid place-items-center rounded-[9px] text-white"
      style={{
        width: 30,
        height: 30,
        background: "linear-gradient(150deg, var(--color-primary), var(--color-primary-deep))",
      }}
    >
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 21s-7.5-4.6-7.5-10A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 7.5 4c0 5.4-7.5 10-7.5 10Z"
          stroke="#fff"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M7 13h2l1.2-2.4L12 15l1.5-3 .8 1.5H17"
          stroke="#fff"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
