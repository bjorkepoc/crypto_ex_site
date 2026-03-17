"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePrefs, Theme } from "@/lib/preferences";
import { t } from "@/lib/i18n";

const themes: { value: Theme; labelKey: "prefs.light" | "prefs.mild" | "prefs.dark" }[] = [
  { value: "light", labelKey: "prefs.light" },
  { value: "mild", labelKey: "prefs.mild" },
  { value: "dark", labelKey: "prefs.dark" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { prefs, setLang, setTheme } = usePrefs();
  const lang = prefs.lang;

  const links = [
    { href: "/", label: t("nav.dashboard", lang) },
    { href: "/learn", label: t("nav.learn", lang) },
    { href: "/exercises", label: t("nav.exercises", lang) },
    { href: "/exam", label: t("nav.exam", lang) },
    { href: "/progress", label: t("nav.progress", lang) },
  ];

  return (
    <nav className="border-b border-th-border bg-th-nav">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold text-th-text">
            CryptoEx
          </Link>
          <div className="flex gap-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))
                    ? "text-th-text-accent"
                    : "text-th-text-muted hover:text-th-text"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <div className="flex rounded-lg border border-th-border bg-th-muted p-0.5">
            {themes.map((th) => (
              <button
                key={th.value}
                onClick={() => setTheme(th.value)}
                className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                  prefs.theme === th.value
                    ? "bg-th-card text-th-text shadow-sm"
                    : "text-th-text-muted hover:text-th-text"
                }`}
              >
                {t(th.labelKey, lang)}
              </button>
            ))}
          </div>
          {/* Language toggle */}
          <div className="flex rounded-lg border border-th-border bg-th-muted p-0.5">
            {(["en", "no"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                  prefs.lang === l
                    ? "bg-th-card text-th-text shadow-sm"
                    : "text-th-text-muted hover:text-th-text"
                }`}
              >
                {l === "en" ? "EN" : "NO"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
