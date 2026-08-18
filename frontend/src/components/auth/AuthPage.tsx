"use client";

import AuthShell from "./AuthShell";
import type { AuthMode } from "./auth.types";
import brandLogo from "../../../public/brand/AI-Pather-blue.png"
// import cubeImg from "../../../public/images/cube.png"
import Image from "next/image";
import Link from "next/link";

interface AuthPageProps {
    mode: AuthMode;
}

export default function AuthPage({ mode }: AuthPageProps) {
    return (
        <AuthShell
            initialMode={mode}
            cubeSrc="/images/cube.png"
            logo={
                <Link href="/" className="flex gap-2 items-center">
                    <Image src={brandLogo} alt="Brand-logo" className="ml-1 h-fit" height={20} width={20} />
                    <span className="font-sans text-[30px] font-semibold tracking-[-0.03em] text-neutral-800">
                        Ai Pather
                    </span>
                </Link>
            }
        />
    );
}