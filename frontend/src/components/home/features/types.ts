import { IconType } from "react-icons";

export interface FeatureItem {
  id: string;
  metric: string;
  title: string;
  description: string;
  icon: IconType;
  badge: string;
  points: string[];
}