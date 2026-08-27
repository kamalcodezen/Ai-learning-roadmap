"use client";

import TextHeader from "./TextHeader";
import DiagnoseCard from "./cards/DiagnoseCard";
import UnblockCard from "./cards/UnblockCard";
import ProveCard from "./cards/ProveCard";
import AdaptCard from "./cards/AdaptCard";

const cards = [
  { id: 1, Component: DiagnoseCard },
  { id: 2, Component: UnblockCard },
  { id: 3, Component: ProveCard },
  { id: 4, Component: AdaptCard },
];

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="section-pad relative w-full overflow-hidden px-4 sm:px-8 md:px-12"
    >
      <div className="global-pos flex flex-col items-center">
        <TextHeader />

        <div className="mt-8 grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:mt-10 md:mt-12 md:gap-8">
          {cards.map(({ id, Component }) => (
            <div key={id} className="min-w-0">
              <Component />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
