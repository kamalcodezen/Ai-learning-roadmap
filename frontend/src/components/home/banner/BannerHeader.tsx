"use client";

import TextBody from "./TextBody";

interface BannerHeaderProps {
  badge?: string;
  heading: string;
}

export default function BannerHeader({
  badge,
  heading,
}: BannerHeaderProps) {
  return (
    <div className="w-full">
      <TextBody badge={badge} heading={heading} />
    </div>
  );
}