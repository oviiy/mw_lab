/**
 * Line icons, drawn on a 24px grid with a 1.5px ink stroke and one accent fill.
 * The accent follows the page's code: claret = hardware that wears out, blue = debt.
 */
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number; accent?: string; title?: string };

function Icon({ size = 24, accent, title, children, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
      strokeLinecap="round" strokeLinejoin="round" role={title ? "img" : undefined} aria-hidden={title ? undefined : true}
      style={{ ["--accent" as string]: accent ?? "var(--claret)", display: "inline-block", verticalAlign: "-0.2em", flex: "none" }}
      {...rest}>
      {title && <title>{title}</title>}
      {children}
    </svg>
  );
}

/** A rack server: the hardware that depreciates. */
export const ServerIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="1.5" />
    <path d="M3.5 9.2h17M3.5 14.8h17" />
    <circle cx="7" cy="6.35" r="1.1" fill="var(--accent)" stroke="none" />
    <circle cx="7" cy="12" r="1.1" fill="var(--accent)" stroke="none" />
    <circle cx="7" cy="17.65" r="1.1" fill="var(--accent)" stroke="none" />
    <path d="M10.5 6.35h6.5M10.5 12h6.5M10.5 17.65h6.5" />
  </Icon>
);

/** A bond certificate with its seal: the debt. */
export const BondIcon = (p: IconProps) => (
  <Icon accent="var(--blue)" {...p}>
    <rect x="2.5" y="4.5" width="19" height="14" rx="1" />
    <rect x="4.6" y="6.6" width="14.8" height="9.8" rx=".5" strokeDasharray="1.2 1.4" strokeWidth={1} />
    <path d="M7 9.7h7M7 12.4h4.5" />
    <circle cx="16.2" cy="14.6" r="2.4" fill="var(--accent)" stroke="var(--accent)" />
    <path d="M15.2 16.8l-.7 3 1.7-1 1.7 1-.7-3" />
  </Icon>
);

/** A GPU die. */
export const ChipIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="6" y="6" width="12" height="12" rx="1.5" />
    <rect x="9" y="9" width="6" height="6" rx=".5" fill="var(--accent)" stroke="none" />
    <path d="M9 6V3M12 6V3M15 6V3M9 21v-3M12 21v-3M15 21v-3M6 9H3M6 12H3M6 15H3M21 9h-3M21 12h-3M21 15h-3" />
  </Icon>
);

/** Stacked coins: amounts raised. */
export const CoinsIcon = (p: IconProps) => (
  <Icon accent="var(--blue)" {...p}>
    <ellipse cx="9" cy="6" rx="6" ry="2.2" fill="var(--accent)" fillOpacity={0.25} />
    <path d="M3 6v4c0 1.2 2.7 2.2 6 2.2s6-1 6-2.2V6" />
    <path d="M3 10v4c0 1.2 2.7 2.2 6 2.2" />
    <ellipse cx="15.5" cy="14.5" rx="5.5" ry="2" />
    <path d="M10 14.5v3.5c0 1.1 2.5 2 5.5 2s5.5-.9 5.5-2v-3.5" />
  </Icon>
);

/** A data-center building. */
export const DataCenterIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 20.5h18M5 20.5V9l7-4.5L19 9v11.5" />
    <rect x="8" y="11" width="8" height="2.2" rx=".4" />
    <rect x="8" y="14.4" width="8" height="2.2" rx=".4" />
    <path d="M10 20.5v-2.4h4v2.4" />
    <circle cx="14.6" cy="12.1" r=".55" fill="var(--accent)" stroke="none" />
    <circle cx="14.6" cy="15.5" r=".55" fill="var(--accent)" stroke="none" />
  </Icon>
);

/** Percent in a ring: the price of credit. */
export const RateIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M8.5 15.5l7-7" />
    <circle cx="9" cy="9" r="1.4" fill="var(--accent)" stroke="var(--accent)" />
    <circle cx="15" cy="15" r="1.4" fill="var(--accent)" stroke="var(--accent)" />
  </Icon>
);

/** Cash in, cash out. */
export const FlowIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3.5 8h14M14.5 5l3 3-3 3" />
    <path d="M20.5 16h-14M9.5 13l-3 3 3 3" stroke="var(--accent)" />
  </Icon>
);

/** Hourglass: time runs out on the hardware before the debt. */
export const HourglassIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 3h12M6 21h12" />
    <path d="M7.5 3c0 4.2 3 5.6 4.5 9-1.5 3.4-4.5 4.8-4.5 9M16.5 3c0 4.2-3 5.6-4.5 9 1.5 3.4 4.5 4.8 4.5 9" />
    <path d="M9 19.5c.8-1.8 2-2.6 3-3.3 1 .7 2.2 1.5 3 3.3z" fill="var(--accent)" stroke="none" />
  </Icon>
);

/** Calendar: when it comes due. */
export const CalendarIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="1.5" />
    <path d="M3.5 9.5h17M8 3v4M16 3v4" />
    <rect x="13.5" y="13" width="3.5" height="3.5" rx=".4" fill="var(--accent)" stroke="none" />
  </Icon>
);

/** Speech bubble with a question mark: objections. */
export const QuestionIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 5.5h16v10H11l-4.5 3.5v-3.5H4z" />
    <path d="M10 8.6a2 2 0 1 1 2.6 1.9c-.5.2-.6.5-.6 1v.4" />
    <circle cx="12" cy="13.6" r=".6" fill="var(--accent)" stroke="var(--accent)" />
  </Icon>
);

/** Magnifier over a table: the sample. */
export const SampleIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="4" width="13" height="12" rx="1" />
    <path d="M3 8h13M3 12h13M8 4v12" />
    <circle cx="16.5" cy="16.5" r="3.2" fill="var(--paper)" />
    <path d="M18.8 18.8L21 21" stroke="var(--accent)" strokeWidth={2} />
  </Icon>
);

/** Document with a seal: the source filing. */
export const FilingIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 3h8l4 4v14H6z" />
    <path d="M14 3v4h4M8.5 10h7M8.5 13h7M8.5 16h4" />
  </Icon>
);
