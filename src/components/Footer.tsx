export function Footer() {
  return (
    <footer className="container-tool pt-12 pb-10 text-center">
      <div className="divider-thin mb-8" />
      <p className="text-[12px] uppercase tracking-[0.22em] text-ink-400 font-medium">
        Sold-Out Labs
      </p>
      <p className="mt-3 text-[13px] text-ink-400 leading-relaxed max-w-md mx-auto">
        Built to help fashion founders make better launch decisions — without
        the overwhelm.{" "}
        <a
          href="/"
          className="text-ink-400 underline underline-offset-2 hover:text-ink-900 transition-colors"
        >
          More tools coming
        </a>
        .
      </p>
      <p className="mt-6 text-[11.5px] text-ink-200">
        © {new Date().getFullYear()} Sold-Out Labs
      </p>
    </footer>
  );
}
