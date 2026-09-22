import AudienceBanner from "./AudienceBanner";
import { ProgressBridgeMarquee } from "../ProgressBridge/ProgressBridgeSection";

export default function HeroSection() {
  return (
    <div className="relative w-full">
      <AudienceBanner />
      <ProgressBridgeMarquee />
    </div>
  );
}