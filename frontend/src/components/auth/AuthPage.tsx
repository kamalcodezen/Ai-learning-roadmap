"use client";

import { useTheme } from "next-themes";
import AuthShell from "./AuthShell";
import Silk from "@/src/registry/magicui/silk";
import type { AuthMode } from "./auth.types";
import cubeImg from "../../../public/images/cube.png";
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
                cubeSrc={cubeImg}
                logo={
                    <Link href="/" className="flex items-center" aria-label="AI Pather home">
                        <Image
                            src="/brand/AI-Pather-blue.png"
                            alt="AI Pather"
                            width={160}
                            height={30}
                            className="h-8 w-auto block dark:hidden object-contain"
                            priority
                        />
                        <Image
                            src="/brand/AI-Pather-white.png"
                            alt="AI Pather"
                            width={160}
                            height={30}
                            className="h-8 w-auto hidden dark:block object-contain"
                            priority
                        />
                    </Link>
                }
            />
        </div>
    );
}
