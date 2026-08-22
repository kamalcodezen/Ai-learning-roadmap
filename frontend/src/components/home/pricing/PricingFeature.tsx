import { FiCheckCircle } from "react-icons/fi";

interface PricingFeatureProps {
  text: string;
}

const PricingFeature = ({ text }: PricingFeatureProps) => {
  return (
    <div className="flex items-start gap-3 text-sm ">
      <FiCheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

      <span className="leading-5">
        {text}
      </span>
    </div>
  );
};

export default PricingFeature;