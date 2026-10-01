import { useEffect, useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Overview from "./pages/Overview";
import LiveDemo from "./pages/LiveDemo";

export type Page = "overview" | "demo";

function pageFromHash(): Page {
  return window.location.hash.startsWith("#/demo") ? "demo" : "overview";
}

export default function App() {
  const [page, setPage] = useState<Page>(pageFromHash);

  useEffect(() => {
    const onHash = () => {
      setPage(pageFromHash());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header page={page} />
      <main className="flex-1">{page === "overview" ? <Overview /> : <LiveDemo />}</main>
      <Footer />
    </div>
  );
}
