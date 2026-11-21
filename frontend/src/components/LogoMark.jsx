function LogoMark() {
  return (
    <span className="logo-mark" aria-hidden="true">
      <svg viewBox="0 0 40 40" focusable="false" role="presentation">
        <path d="M20 9.5 33.5 16 20 22.5 6.5 16Z" fill="#ffffff" />
        <path
          d="M11.5 19v4.1c0 2.7 3.8 4.8 8.5 4.8s8.5-2.1 8.5-4.8V19L20 23Z"
          fill="#ffffff"
          opacity="0.82"
        />
        <path
          d="M33.5 16.4v5.4"
          stroke="#f4b860"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="33.5" cy="23" r="2" fill="#f4b860" />
      </svg>
    </span>
  );
}

export default LogoMark;
