export function Footer() {
  return (
    <footer className="container-tool pt-12 pb-10 text-center">
      <div className="divider-thin mb-8" />
      <p className="text-[12px] uppercase tracking-[0.22em] text-ink-400 font-medium">
        The Sold-Out System Tools
      </p>
      <p className="mt-3 text-[13px] text-ink-400 leading-relaxed max-w-md mx-auto">
        Built to help fashion founders make better launch decisions — without
        the overwhelm.
      </p>
      <p className="mt-6 text-[11.5px] text-ink-200">
        © {new Date().getFullYear()} The Sold-Out System
      </p>
    </footer>
  );
}
