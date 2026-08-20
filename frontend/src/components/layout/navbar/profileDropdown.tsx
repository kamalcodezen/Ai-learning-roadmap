"use client";

import { useEffect, useRef, useState } from "react";

interface ProfileDropdownProps {
  name: string;
  email?: string;
}

const dropdownLinks = [
  { label: "Profile", variant: "default" },
  { label: "Settings", variant: "default" },
  { label: "Sign out", variant: "danger" },
] as const;

export default function ProfileDropdown({
  name,
  email,
}: ProfileDropdownProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        className="flex items-center gap-2 rounded-full border border-neutral-200 bg-[#fafafa] py-1 pl-1 pr-2 transition-all hover:border-neutral-300"
        aria-expanded={open}
      >
        {/* User Icon */}
        <span className="flex size-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-700">

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

        <span className="hidden max-w-24 truncate text-sm font-medium text-neutral-800 sm:block">
          {name}
        </span>

        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className={`transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-60 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-2 shadow-xl">
          <div className="border-b border-neutral-100 px-3 py-3">
            <p className="truncate text-sm font-semibold text-neutral-900">
              {name}
            </p>

            {email && (
              <p className="mt-0.5 truncate text-xs text-neutral-500">
                {email}
              </p>
            )}
          </div>

<div className="mt-1">
  {dropdownLinks.map((link) => (
    <button
      key={link.label}
      type="button"
      className={`flex w-full rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
        link.variant === "danger"
          ? "text-red-500 hover:bg-red-50"
          : "text-neutral-700 hover:bg-neutral-50"
      }`}
    >
      {link.label}
    </button>
  ))}
</div>
        </div>
      )}
    </div>
  );
}