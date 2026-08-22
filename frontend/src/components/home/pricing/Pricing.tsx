
import PricingCard from "./PricingCard";
import { FiArrowUpRight } from "react-icons/fi";

const freeFeatures = [
  "One-user access",
  "Personalized Learning Roadmap",
  "AI Skill Gap Analysis",
  "Project-based Milestones",
  "Learning Resource Collection",
];

const proFeatures = [
  "Everything in Free",
  "Advanced Skill Gap Analysis",
  "Adaptive Learning Roadmap",
  "Career Trajectory Insights",
  "Priority AI Features",
];

const Pricing = () => {
  return (
    <section
      id="pricing"
      className="relative w-full overflow-hidden px-4 py-10 sm:px-8 md:px-0"
    >
      <div className="global-pos relative w-full">
        

        {/* Main Pricing Structure */}
<div className="mt-10 grid grid-cols-1 items-stretch gap-5 lg:grid-cols-3">

  {/* ================= LEFT COLUMN ================= */}
  <div className="grid auto-rows-fr gap-5">

    {/* Text Body */}
    <div className="dashboard-card flex min-h-[250px] items-center justify-center rounded-3xl">
      <div className="w-full md:max-w-xl">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl lg:leading-[1.08]">
          Simple pricing for your
          <br className="hidden sm:block" />
          <span className="text-primary"> learning journey</span>
        </h2>

        <p className="section-description mt-4 max-w-lg text-sm sm:text-base">
          Start building your personalized AI learning roadmap for free and
          unlock advanced features when you are ready.
        </p>
      </div>
    </div>

    {/* Free Card */}
    <PricingCard
      badge="FREE"
      price="Free"
      description="Perfect for getting started with your personalized learning journey."
      features={freeFeatures}
      buttonText="Get Roadmap"
    />

  </div>


  {/* ================= MIDDLE COLUMN ================= */}
  <div className="relative h-full">

    <PricingCard
      badge="PRO"
      price="$19"
      priceSuffix="/month"
      description="For learners who want deeper AI guidance and advanced career insights."
      features={proFeatures}
      buttonText="Buy Now"
      popular
      className="h-full min-h-[530px]"
    />

  </div>


  {/* ================= RIGHT COLUMN ================= */}
  <div className="grid auto-rows-fr gap-5">

    {/* Description */}
    <div className="w-full md:max-w-md md:pb-1">
      <p className="mb-3 flex items-center gap-1.5 text-sm italic text-muted-foreground">
        <span>Learn smarter, grow faster</span>
        <FiArrowUpRight className="h-4 w-4" />
      </p>

      <p className="text-sm leading-6 text-muted-foreground sm:text-base">
        One simple plan for getting started, with an advanced option for
        learners who want deeper AI-powered guidance and career insights.
      </p>

      <div className="mt-5 flex items-center gap-3">
        <span className="text-sm font-medium text-foreground">
          Start for free
        </span>

        <span className="h-1 w-1 rounded-full bg-muted-foreground/60" />

        <span className="text-sm text-muted-foreground">
          Upgrade anytime
        </span>
      </div>
    </div>

    {/* Master Plan */}
    <PricingCard
      badge="FREE"
      price="Free"
      description="Perfect for getting started with your personalized learning journey."
      features={freeFeatures}
      buttonText="Get Roadmap"
    />

  </div>

</div>

        {/* Bottom Note */}
        <p className="mx-auto mt-8 max-w-3xl text-center text-xs leading-5 text-muted-foreground sm:text-sm">
          We keep our pricing simple and transparent. Choose the plan that fits
          your learning journey and upgrade whenever you need more advanced
          features.
        </p>
      </div>
    </section>
  );
};

export default Pricing;