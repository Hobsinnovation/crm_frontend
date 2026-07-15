"use client";

/**
 * Shared design kit for the HOBS CRM dashboard pages.
 * Central place for fonts, icons, and the small presentational components
 * (buttons, modal shell, table/empty/loading states) reused across
 * Users, Clients, Leads, Domains and Invoices.
 *
 * Import from "@/components/ui/kit" (adjust the path if your `@/` alias
 * points somewhere other than `src/`).
 */

import type { ReactNode, ButtonHTMLAttributes } from "react";
import Link from "next/link";
import { Space_Grotesk, Manrope, IBM_Plex_Mono } from "next/font/google";

export const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-display" });
export const body = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-body" });
export const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-mono" });

/** Classes every page's root <div> should carry so the design tokens apply. */
export const pageShellCls =
  `${body.variable} ${display.variable} ${mono.variable} min-h-screen bg-[#F5F6FA] font-[family-name:var(--font-body)] text-[#14192E] antialiased`;

export const displayFont = "font-[family-name:var(--font-display)]";
export const monoFont = "font-[family-name:var(--font-mono)] tabular-nums";

export function getInitials(name: string): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
  return initials || "?";
}

/* ------------------------------------------------------------------ */
/* Layout primitives                                                  */
/* ------------------------------------------------------------------ */

export function PageHeader({
  title,
  backHref,
  backLabel = "Back",
  onBack,
  action,
}: {
  title: ReactNode;
  backHref?: string;
  backLabel?: string;
  onBack?: () => void;
  action?: ReactNode;
}) {
  const backCls =
    "flex items-center gap-1 rounded-lg p-1.5 text-[#8B8FA3] transition-colors hover:bg-[#F1F2F6] hover:text-[#14192E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B5FE0]";

  return (
    <header className="sticky top-0 z-20 border-b border-[#E6E8F0] bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          {onBack ? (
            <button onClick={onBack} className={backCls}>
              <IconArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">{backLabel}</span>
            </button>
          ) : backHref ? (
            <Link href={backHref} className={backCls}>
              <IconArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">{backLabel}</span>
            </Link>
          ) : null}
          <h1 className={`${displayFont} text-xl font-semibold tracking-tight`}>{title}</h1>
        </div>
        {action}
      </div>
    </header>
  );
}

export function PageMain({ children }: { children: ReactNode }) {
  return <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>;
}

/* ------------------------------------------------------------------ */
/* Buttons                                                            */
/* ------------------------------------------------------------------ */

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function PrimaryButton({ children, className = "", ...rest }: BtnProps) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center gap-1.5 rounded-lg bg-[#4B5FE0] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#3D4FC7] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B5FE0] focus-visible:ring-offset-2 ${className}`}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, className = "", ...rest }: BtnProps) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-[#5B5F6E] transition-colors hover:bg-[#F1F2F6] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

/** Compact action used inside table rows — e.g. Edit / Delete / Mark Paid. */
export function RowAction({
  children,
  icon,
  variant = "default",
  className = "",
  ...rest
}: BtnProps & { icon?: ReactNode; variant?: "default" | "success" | "danger" }) {
  const variants: Record<string, string> = {
    default: "bg-[#F1F2F6] text-[#5B5F6E] hover:bg-[#E6E8F0]",
    success: "bg-[#E7F5F0] text-[#127A5D] hover:bg-[#D3EDE3]",
    danger: "bg-[#FDEBEA] text-[#C23B34] hover:bg-[#FBDAD8]",
  };
  return (
    <button
      {...rest}
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${variants[variant]} ${className}`}
    >
      {icon}
      {children}
    </button>
  );
}

export function ToggleSwitch({
  checked,
  onChange,
  disabled,
  title,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      title={title}
      className={`relative h-5 w-10 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? "bg-[#127A5D]" : "bg-[#D8DAE5]"
      }`}
    >
      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${checked ? "left-5" : "left-0.5"}`} />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Form primitives                                                    */
/* ------------------------------------------------------------------ */

export const inputCls =
  "w-full rounded-lg border border-[#E6E8F0] bg-white px-3 py-2 text-sm text-[#14192E] placeholder:text-[#9AA0B4] transition-colors focus:border-[#4B5FE0] focus:outline-none focus:ring-2 focus:ring-[#4B5FE0]/20";

export function Field({ label, children, span }: { label: string; children: ReactNode; span?: boolean }) {
  return (
    <div className={span ? "sm:col-span-2" : ""}>
      <label className="mb-1 block text-xs font-medium text-[#5B5F6E]">{label}</label>
      {children}
    </div>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  className?: string;
}) {
  return (
    <div className={`relative min-w-[220px] flex-1 ${className}`}>
      <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B8FA3]" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${inputCls} pl-9`}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Modal shell                                                        */
/* ------------------------------------------------------------------ */

export function Modal({
  title,
  onClose,
  children,
  footer,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#0B0F1F]/50 px-4 py-8 backdrop-blur-sm">
      <div className={`w-full rounded-2xl border border-[#E6E8F0] bg-white p-6 shadow-xl ${wide ? "max-w-2xl" : "max-w-md"}`}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className={`${displayFont} text-lg font-semibold`}>{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#8B8FA3] transition-colors hover:bg-[#F1F2F6] hover:text-[#14192E]"
            aria-label="Close"
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>
        {children}
        <div className="mt-6 flex justify-end gap-2">{footer}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* States                                                             */
/* ------------------------------------------------------------------ */

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="mb-4 flex items-start gap-2 rounded-xl border border-[#F5C6C2] bg-[#FDEBEA] px-4 py-3 text-sm text-[#C23B34]">
      <IconAlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export function EmptyState({ message, action }: { message: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-[#E6E8F0] py-12 text-center">
      <p className="text-sm text-[#8B8FA3]">{message}</p>
      {action}
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-[#E6E8F0] bg-white" aria-hidden="true">
      <div className="h-11 border-b border-[#E6E8F0] bg-[#FAFAFC]" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-6 border-b border-[#F1F2F6] px-4 py-4 last:border-0">
          <div className="h-3 w-1/5 rounded bg-[#F1F2F6]" />
          <div className="h-3 w-1/6 rounded bg-[#F1F2F6]" />
          <div className="h-3 w-1/6 rounded bg-[#F1F2F6]" />
          <div className="h-3 w-16 rounded-full bg-[#F1F2F6]" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonCards({ count = 6 }: { count?: number }) {
  return (
    <div className="grid animate-pulse grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-32 rounded-2xl border border-[#E6E8F0] bg-white p-5">
          <div className="h-3 w-2/3 rounded bg-[#F1F2F6]" />
          <div className="mt-2 h-3 w-1/3 rounded bg-[#F1F2F6]" />
          <div className="mt-6 h-6 w-full rounded bg-[#F1F2F6]" />
        </div>
      ))}
    </div>
  );
}

export function Avatar({ name, tone = "#4B5FE0", bg = "#EDEFFB" }: { name: string; tone?: string; bg?: string }) {
  return (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
      style={{ backgroundColor: bg, color: tone }}
    >
      {getInitials(name)}
    </div>
  );
}

/* Table cell paddings, shared so every table lines up the same way. */
export const tableWrapCls = "overflow-hidden rounded-2xl border border-[#E6E8F0] bg-white shadow-sm overflow-x-auto";
export const theadCls = "bg-[#FAFAFC] text-left text-xs uppercase tracking-wide text-[#8B8FA3]";
export const thCls = "px-4 py-3 font-medium";
export const tdCls = "px-4 py-3.5";
export const trCls = "border-t border-[#F1F2F6] transition-colors hover:bg-[#FAFAFC]";

/* ------------------------------------------------------------------ */
/* Icons — minimal inline SVGs, no external icon package required     */
/* ------------------------------------------------------------------ */

type IconProps = { className?: string };

export function IconArrowLeft({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

export function IconPlus({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconSearch({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}

export function IconPencil({ className = "h-3.5 w-3.5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

export function IconTrash({ className = "h-3.5 w-3.5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

export function IconCheck({ className = "h-3.5 w-3.5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export function IconX({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

export function IconAlertTriangle({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 3L2 20h20L12 3z" />
      <path d="M12 9v5M12 17h.01" />
    </svg>
  );
}

export function IconChevronRight({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export function IconStar({ className = "h-3.5 w-3.5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" className={className}>
      <path d="M12 2l2.9 6.3 6.9.6-5.2 4.6 1.6 6.8L12 16.9l-6.2 3.4 1.6-6.8L2.2 8.9l6.9-.6L12 2z" />
    </svg>
  );
}

export function IconUsers({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M15.5 14.2c2.4.4 4.5 2.4 4.5 5.8" />
    </svg>
  );
}

export function IconBuilding({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="4" y="3" width="12" height="18" rx="1" />
      <path d="M8 8h.01M12 8h.01M8 12h.01M12 12h.01M8 16h.01M12 16h.01" />
      <path d="M16 10h3a1 1 0 0 1 1 1v10h-4" />
    </svg>
  );
}

export function IconTrendingUp({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 17l6-6 4 4 7-8" />
      <path d="M15 7h5v5" />
    </svg>
  );
}

export function IconGlobe({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.8 6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-6-3.8-9s1.3-6.4 3.8-9z" />
    </svg>
  );
}

export function IconReceipt({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="5" y="3" width="14" height="18" rx="1.5" />
      <path d="M8.5 8h7M8.5 12h7M8.5 16h4" />
    </svg>
  );
}