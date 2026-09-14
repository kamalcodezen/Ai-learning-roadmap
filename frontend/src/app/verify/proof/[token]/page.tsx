"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getPublicProofGraph } from "@/src/lib/api/learner/proof-graph";
import BrandLoader from "@/src/components/shared/BrandLoader";
import {
  AlertCircle,
  ExternalLink,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { SkillPassportStream } from "@/src/components/dashboard/learner/proof-graph/SkillPassport/SkillPassportStream";

export default function PublicProofGraphPage() {
  const params = useParams();
  const token = params?.token as string;

  const { data, isLoading, error } = useQuery({
    queryKey: ["publicProofGraph", token],
    queryFn: () => getPublicProofGraph(token),
    enabled: !!token,
  });

  if (isLoading) {
    return <BrandLoader message="Verifying cryptographic proof credentials..." />;
  }

  if (error || !data) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full p-8 rounded-2xl border border-destructive/20 bg-card text-center shadow-lg">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold mb-2">Invalid Verification Link</h1>
          <p className="text-sm text-muted-foreground mb-6">
            {(error instanceof Error ? error.message : null) || "This proof verification token does not exist or has been revoked."}
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Return to AI Pather
          </Link>
        </div>
      </main>
    );
  }

  const { primarySkill, overallProofScore, nodes, edges } = data;

  return (
    <main className="min-h-screen bg-background text-foreground py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
        {/* Recruiter Security Notice */}
        <section className="flex items-center gap-3 p-4 rounded-2xl border border-primary/20 bg-primary/5 text-xs text-muted-foreground">
          <Lock className="w-4 h-4 text-primary shrink-0" />
          <span>
            <strong>Recruiter Security Notice:</strong> This cryptographic verification passport displays authenticated candidate evidence only. Private account credentials and sensitive tokens are excluded.
          </span>
        </section>

        {/* Skill Passport Stream */}
        <SkillPassportStream
          primarySkill={primarySkill}
          overallProofScore={overallProofScore}
          nodes={nodes}
          edges={edges || []}
        />

        {/* Footer */}
        <footer className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <p>© {new Date().getFullYear()} AI Pather • Cryptographic Career Verification Passport</p>
          <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1 font-medium">
            Learn more about AI Pather verification <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </footer>
      </div>
    </main>
  );
}
