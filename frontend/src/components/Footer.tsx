export default function Footer() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-5 text-xs text-ink-3">
        <span>
          KazFake Detector · research prototype · data:{" "}
          <a className="underline decoration-line underline-offset-2 hover:text-ink" href="https://github.com/Anargul-Aimuratovna/news-veracity-corpus" target="_blank" rel="noreferrer">
            KazFakeCorpus / news-veracity-corpus
          </a>{" "}
          (CC BY 4.0)
        </span>
        <span>News-veracity classification learned from a corpus — not an automated fact checker.</span>
      </div>
    </footer>
  );
}
