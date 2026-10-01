import type { Page } from "../App";

export default function Header({ page }: { page: Page }) {
  const link = (target: Page, label: string, href: string) => (
    <a
      href={href}
      className={`relative px-1 py-5 text-sm font-medium transition-colors ${
        page === target ? "text-ink" : "text-ink-3 hover:text-ink"
      }`}
    >
      {label}
      {page === target && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-accent" />}
    </a>
  );

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
        <a href="#/" className="flex items-center gap-3">
          <img src="/favicon.svg" alt="" className="h-8 w-8" />
          <div className="leading-tight">
            <div className="text-[15px] font-semibold tracking-tight">KazFake Detector</div>
            <div className="text-[11px] text-ink-3">Kazakh &amp; Russian News Veracity Classification</div>
          </div>
        </a>
        <nav className="flex items-center gap-7">
          {link("overview", "Overview", "#/")}
          {link("demo", "Live Demo", "#/demo")}
        </nav>
      </div>
    </header>
  );
}
