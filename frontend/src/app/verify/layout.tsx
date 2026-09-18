import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Credential Verification",
  description: "Cryptographic career skill and proof verification passport.",
};

export default function VerifyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
