export interface QuestionnaireAnswers {
  experience: 'beginner' | 'intermediate' | 'advanced';
  budget: 'backpacker' | 'midrange' | 'luxury';
  destination: 'phuket' | 'samui' | 'combo';
  comfortAccent: 'training' | 'wellness' | 'beach';
  departureCity: string;
}

export interface GymOption {
  id: string;
  name: string;
  location: string;
  island: 'Phuket' | 'Koh Samui';
  description: string;
  trainingFocus: string;
  typicalCost: string;
  rating: number;
  amenities: string[];
  whyMatch: string;
  coordinates?: string;
  schedule?: string[];
  imageUrl?: string;
  difficulty?: number; // Challenging / Intended difficulty rating from 1 to 5
  keywords?: string[]; // Custom tag list e.g. MMA, Western Boxing, etc.
  testimonial?: {
    quote: string;
    author: string;
  };
  detailedSummary?: string;
  googleMapsAddress?: string;
}

export interface AccommodationOption {
  id: string;
  name: string;
  type: string;
  location: string;
  description: string;
  costPerNight: number;
  comfortLevel: 'Backpacker' | 'Mid-range' | 'Luxury';
  distanceToGym: string;
  whyMatch: string;
  features: string[];
  imageUrl?: string;
}

export interface FlightOption {
  id: string;
  airline: string;
  departureCity: string;
  destinationCity: string;
  duration: string;
  averagePriceUsd: number;
  connections: string;
  seasonalNote: string;
}

export interface DayItinerary {
  dayNum: number;
  title: string;
  morning: string;
  afternoon: string;
  evening: string;
  tips: string;
}

export interface PackageResponse {
  recommendationReason: string;
  suggestedGyms: GymOption[];
  suggestedAccommodations: AccommodationOption[];
  suggestedFlights: FlightOption[];
  itinerary: DayItinerary[];
  costSummary: {
    gymWeeklyCost: number;
    accommodationNightlyCost: number;
    flightCost: number;
    scooterAndFoodWeeklyCost: number;
    totalEstimatedCost: number;
    savingTips: string[];
  };
}
