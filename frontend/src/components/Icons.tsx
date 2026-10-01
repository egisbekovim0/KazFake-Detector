import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = { fill: "none", stroke: "currentColor", strokeWidth: 1.75, strokeLinecap: "round", strokeLinejoin: "round", viewBox: "0 0 24 24" } as const;

export const DocIcon = (p: P) => (
  <svg {...base} {...p}><path d="M7 3h7l5 5v13H7z" /><path d="M14 3v5h5M10 13h6M10 17h4" /></svg>
);
export const LanguageIcon = (p: P) => (
  <svg {...base} {...p}><path d="M4 5h9M8.5 3v2M6 5c.6 3.5 2.8 6.3 6 8M11 5c-.8 4-3.3 7-7 9" /><path d="M13 21l4-9 4 9M14.5 18h5" /></svg>
);
export const NetworkIcon = (p: P) => (
  <svg {...base} {...p}><circle cx="5" cy="6" r="2" /><circle cx="5" cy="18" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="7" r="2" /><circle cx="19" cy="17" r="2" /><path d="M7 6.8l3.2 4M7 17.2l3.2-4M13.8 11l3.4-3M13.8 13l3.4 3" /></svg>
);
export const LayersIcon = (p: P) => (
  <svg {...base} {...p}><path d="M12 3l9 5-9 5-9-5z" /><path d="M3 13l9 5 9-5" /></svg>
);
export const SplitIcon = (p: P) => (
  <svg {...base} {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M15 5v14" /></svg>
);
export const TagIcon = (p: P) => (
  <svg {...base} {...p}><path d="M3 12V4h8l10 10-8 8z" /><circle cx="7.5" cy="8.5" r="1.3" /></svg>
);
export const CheckIcon = (p: P) => (
  <svg {...base} strokeWidth={2.2} {...p}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);
export const WarnIcon = (p: P) => (
  <svg {...base} strokeWidth={2} {...p}><path d="M12 4L2.8 19.5h18.4z" /><path d="M12 10v4.5M12 17.2v.1" /></svg>
);
export const ArrowRight = (p: P) => (
  <svg {...base} strokeWidth={2} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const InfoIcon = (p: P) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 7.8v.1" /></svg>
);
export const ChartIcon = (p: P) => (
  <svg {...base} {...p}><path d="M4 20V4M4 20h16" /><path d="M8 16v-5M12 16V8M16 16v-3" /></svg>
);
export const SparkIcon = (p: P) => (
  <svg {...base} {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6" /></svg>
);
