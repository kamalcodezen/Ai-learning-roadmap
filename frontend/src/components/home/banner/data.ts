import type { CoverflowSlide } from "./CoverflowCarousel";

export interface CarouselItem {
  id: number;
  title: string;
  description: string;
  image: string;
  source: string;
}

export const carouselItems: CarouselItem[] = [
  {
    id: 1,
    title: "A Clear Direction",
    description: "Stop wondering what to learn next.",
    source: "https://pin.it/SwjeIBI1x",
    image: "/images/learning/direction.jpg",
  },
  {
    id: 2,
    title: "Learning That Fits You",
    description: "Your starting point matters.",
    source: "https://pin.it/4fw286LFZ",
    image: "/images/learning/personalized.jpg",
  },
  {
    id: 3,
    title: "Less Noise, Better Resources",
    description: "Find what actually deserves your time.",
    source: "https://pin.it/1VEGVZoZF",
    image: "/images/learning/resources.jpg",
  },
  {
    id: 4,
    title: "Knowledge That Becomes Practice",
    description:
      "Learning becomes more valuable when you build with it.",
    source: "https://pin.it/7JvmuYcXg",
    image: "/images/learning/practice.jpg",
  },
  {
    id: 5,
    title: "Progress You Can See",
    description:
      "Know how far you've come — and what's still ahead.",
    source: "https://pin.it/1ykOHW6dS",
    image: "/images/learning/progress.jpg",
  },
  {
    id: 6,
    title: "Guidance When You're Stuck",
    description:
      "Get help without breaking your learning flow.",
    source: "https://pin.it/15Z1WDekx",
    image: "/images/learning/guidance.jpg",
  },
  {
    id: 7,
    title: "Skills With a Destination",
    description:
      "Connect what you're learning to where you want to go.",
    source: "https://pin.it/2cQ93r3Hf",
    image: "/images/learning/destination.jpg",
  },
];

export const slides: CoverflowSlide[] = carouselItems.map((item) => ({
  src: item.image,
  alt: item.title,
  title: item.title,
  subtitle: item.description,
}));