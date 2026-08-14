"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Brain, Wrench, Menu, X } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { siteConfig } from "@/config/site";
import { Badge } from "@/components/ui/badge";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/smart", label: "Smart Mode", icon: Brain },
  { href: "/expert", label: "Expert Mode", icon: Wrench },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto w-full flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center group-hover:bg-primary/25 transition-colors">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold text-lg tracking-tight">{siteConfig.name}</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              const LinkIcon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
                >
                  {LinkIcon && <LinkIcon className="h-3.5 w-3.5" />}
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Developer Badge + Theme Toggle */}
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1 border-primary/20 bg-primary/5 text-primary/80 text-[11px] font-medium"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {siteConfig.developer.name}
            <span className="text-muted-foreground/50">|</span>
            {siteConfig.developer.degree}
          </Badge>

          <ThemeToggle />

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden h-9 w-9 rounded-lg border border-border/60 bg-card/50 flex items-center justify-center hover:bg-accent transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Panel */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col p-4 gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              const LinkIcon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
                >
                  {LinkIcon && <LinkIcon className="h-4 w-4" />}
                  {link.label}
                </Link>
              );
            })}
            <div className="mt-3 pt-3 border-t border-border/30">
              <Badge
                variant="outline"
                className="w-full justify-center py-2 border-primary/20 bg-primary/5 text-primary/80 text-xs"
              >
                {siteConfig.developer.name} | {siteConfig.developer.degree}
              </Badge>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
