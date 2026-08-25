"use client";

import { useTheme } from "next-themes";
import AuthShell from "./AuthShell";
import Silk from "@/src/registry/magicui/silk";
import type { AuthMode } from "./auth.types";
import brandLogo from "../../../public/brand/AI-Pather-blue.png"
// import cubeImg from "../../../public/images/cube.png"
import Image from "next/image";
import Link from "next/link";

interface AuthPageProps {
    mode: AuthMode;
}

export default function AuthPage({ mode }: AuthPageProps) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

    return (
        <div className="relative min-h-screen w-full overflow-hidden">
            {/* Full-bleed animated silk background */}
            <div aria-hidden="true" className="absolute inset-0 z-0">
                <Silk
                    color={isDark ? "#402066" : "#6a28b8"}
                    speed={4}
                    scale={1.2}
                    noiseIntensity={1.2}
                />
            </div>

            <AuthShell
                initialMode={mode}
                cubeSrc="/images/cube.png"
                logo={
                    <Link href="/" className="flex gap-2 items-center">
                        <Image src={brandLogo} alt="Brand-logo" className="ml-1 h-fit dark:invert" height={20} width={20} />
                        <span className="font-sans text-[30px] font-semibold tracking-[-0.03em] text-foreground">
                            Ai Pather
                        </span>
                    </Link>
                }
            />
        </div>
    );
}
