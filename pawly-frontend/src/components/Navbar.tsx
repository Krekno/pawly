"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { authApi } from "@/lib/api";

export function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const hasRefreshed = useRef(false);

  useEffect(() => {
    async function fetchUser() {
      if (!hasRefreshed.current) {
        try {
          await authApi.refresh();
        } catch (err) {
          // Ignore refresh errors on first enter
        }
        hasRefreshed.current = true;
      }

      try {
        const me = await authApi.getMe();
        setUser(me);
      } catch (err) {
        // Not signed in
        setUser(null);
      }
    }
    fetchUser();
  }, [pathname]);

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  // Close menu on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    if (menuOpen) {
      document.addEventListener("keydown", handleKey);
    }
    return () => document.removeEventListener("keydown", handleKey);
  }, [menuOpen]);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  async function handleSignOut() {
    try {
      await authApi.signout();
    } catch {
      // ignore errors
    }
    setUser(null);
    setMenuOpen(false);
    router.push("/auth/signin");
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <header className="border-b border-border bg-background sticky top-0 z-10">
      <div className="container mx-auto max-w-2xl px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl tracking-tight flex items-center gap-2">
          <img src="favicon.ico" alt="paw logo" className="w-8 h-8" />
          Pawly
        </Link>
        
        <form onSubmit={handleSearch} className="flex-1 max-w-sm mx-4 relative hidden sm:block">
          <input
            type="text"
            placeholder="Search users or posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-muted/50 border border-border rounded-full px-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                id="user-menu-button"
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 hover:bg-muted p-1.5 rounded-full transition-colors pr-3 cursor-pointer"
                aria-haspopup="true"
                aria-expanded={menuOpen}
              >
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-sm overflow-hidden border border-border">
                  {user.profilePictureUrl ? (
                    <img src={user.profilePictureUrl} alt={user.username} className="w-full h-full object-cover" />
                  ) : (
                    user.username.charAt(0).toUpperCase()
                  )}
                </div>
                <span className="text-sm font-medium">{user.username}</span>
                <svg
                  className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {menuOpen && (
                <div
                  id="user-dropdown-menu"
                  className="absolute right-0 mt-2 w-52 rounded-xl border border-border bg-background shadow-lg ring-1 ring-black/5 dark:ring-white/5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
                  role="menu"
                >
                  {/* Profile link */}
                  <Link
                    href={`/users/${user.username}`}
                    className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted transition-colors"
                    role="menuitem"
                    id="menu-profile"
                  >
                    <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                    Profile
                  </Link>

                  <div className="border-t border-border" />

                  {/* Settings section label */}
                  <div className="px-4 pt-3 pb-1.5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Settings</span>
                  </div>

                  {/* Settings link */}
                  <Link
                    href="/settings"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                    role="menuitem"
                    id="menu-settings"
                  >
                    <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Account Settings
                  </Link>

                  <div className="border-t border-border" />

                  {/* Sign Out */}
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                    role="menuitem"
                    id="menu-signout"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/auth/signin" className="text-sm font-medium hover:underline text-muted-foreground hover:text-foreground transition-colors">
              Sign In
            </Link>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

