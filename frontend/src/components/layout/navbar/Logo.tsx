import Image from "next/image";
import Link from "next/link";

export default function Logo({
  className = "",
  imageClassName = "h-[21px] sm:h-6 md:h-8",
}: {
  className?: string;
  imageClassName?: string;
}) {
  return (
    <Link
      href="/"
      className={`flex shrink-0 items-center ${className}`}
      aria-label="AI Pather home"
    >
      {/* Light version (dark logo) */}
      <Image
        src="/brand/AI-Pather-blue.png"
        alt="AI Pather"
        width={160}
        height={30}
        className={`${imageClassName} w-auto block dark:hidden object-contain`}
        priority
      />
      {/* Dark version (light logo) */}
      <Image
        src="/brand/AI-Pather-white.png"
        alt="AI Pather"
        width={160}
        height={30}
        className={`${imageClassName} w-auto hidden dark:block object-contain`}
        priority
      />
    </Link>
  );
}