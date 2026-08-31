"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AOS from "aos";
import "aos/dist/aos.css";
import { authClient } from "@/src/lib/auth-client";

interface ProfileDropdownProps {
  name: string;
  email?: string;
}

export const getDropdownLinks = (role: string, prefix: string) => {
  if (role === "ADMIN") {
    return [
      { label: "Profile", href: `${prefix}/profile`, variant: "default" },
      { label: "Dashboard", href: `${prefix}/dashboard`, variant: "default" },
      { label: "Settings", href: `${prefix}/settings`, variant: "default" },
      { label: "Sign out", href: "#", variant: "danger" },
    ] as const;
  }
  
  return [
    { label: "Profile", href: `${prefix}/profile`, variant: "default" },
    { label: "Dashboard", href: `${prefix}`, variant: "default" },
    { label: "Settings", href: `${prefix}/settings`, variant: "default" },
    { label: "Sign out", href: "#", variant: "danger" },
  ] as const;
};

export default function ProfileDropdown({
  name,
  email,
}: ProfileDropdownProps) {
  const [open, setOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const router = useRouter();

  const { data: session } = authClient.useSession();
  const userRole = (session?.user as { role?: string })?.role?.toUpperCase() || "LEARNER";
  const prefix = userRole === "ADMIN" ? "/dashboard/admin" : "/dashboard/learner";
  const links = getDropdownLinks(userRole, prefix);

  useEffect(() => {
    AOS.init({ duration: 400, easing: "ease-out", once: true });
  }, []);

  // Re-scan AOS each time the menu mounts (it only exists while hovered)
  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => AOS.refreshHard());
    return () => cancelAnimationFrame(frame);
  }, [open]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.replace("/");
          router.refresh();
        },
        onError: () => {
          router.replace("/");
          router.refresh();
        },
      },
    });
    setIsSigningOut(false);
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-all"
        style={{ background: "var(--gradient-primary)" }}
        aria-expanded={open}
      >
        <span className="flex size-9 items-center justify-center rounded-full bg-neutral-900 text-white">

          {/* Temporary user icon here */}
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <circle cx="12" cy="8" r="3.5" />
            <path d="M5 20c.8-3.5 3.2-5.5 7-5.5s6.2 2 7 5.5" />
          </svg>


        </span>

        <span className="hidden max-w-24 truncate text-sm font-medium text-white sm:block">
          {name}
        </span>

        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className={`text-white transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          data-aos="flip-left"
          className="absolute right-0 top-[calc(100%+8px)] w-60 overflow-hidden rounded-lg p-2 shadow-xl -mt-2
          bg-[linear-gradient(to_bottom,#f3e8ff_0%,#ede5ff_45%,#ddd0ff_100%)]
          dark:bg-[linear-gradient(to_bottom,#0a0015_0%,#120025_28%,#1a0040_55%,#2d1065_100%)]"
        >
          <div className="px-3 pb-2 pt-3">
            <p className="truncate text-sm font-semibold text-neutral-900 dark:text-white">
              {name}
            </p>

            {email && (
              <p className="mt-0.5 truncate text-xs text-neutral-500 dark:text-white/70">
                {email}
              </p>
            )}
          </div>

          <div className="mt-1">
            {links.map((link) =>
              link.variant === "danger" ? (
                <button
                  key={link.label}
                  type="button"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="flex w-full px-3 py-2.5 text-left text-sm transition-colors rounded-md bg-red-500 font-medium text-white hover:bg-red-600 disabled:pointer-events-none disabled:opacity-60"
                >
                  {isSigningOut ? "Signing out..." : link.label}
                </button>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className="flex w-full px-3 py-2.5 text-left text-sm transition-colors rounded-lg text-neutral-700 hover:bg-neutral-50 dark:text-white/75 dark:hover:bg-white/10"
                >
                  {link.label}
                </Link>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
