/* eslint-disable @typescript-eslint/no-unused-vars */
interface SlideData {
  id: number;
  category: string;
  title: string;
  description: string;
  buttonText: string;
  features?: string[];
  image: string;
  rating?: number;
  testimonial?: string;
  author?: string;
  isSpecial?: boolean;
  discount?: string;
  countdown?: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
  products?: Array<{
    name: string;
    price: string;
    image: string;
  }>;
  specialPrice?: {
    original: string;
    discounted: string;
  };
}
