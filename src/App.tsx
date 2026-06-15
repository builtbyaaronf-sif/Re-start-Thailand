import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  MapPin, 
  Compass, 
  ArrowRight, 
  User, 
  ExternalLink, 
  Calendar, 
  Plane, 
  Hotel, 
  Check, 
  Info, 
  RefreshCw, 
  X, 
  ChevronRight, 
  Sparkles, 
  Droplets, 
  ShieldCheck, 
  Heart, 
  Award, 
  Wallet, 
  DollarSign,
  Briefcase,
  Layers,
  Utensils,
  ShoppingBag,
  ShoppingCart,
  Tag,
  Filter,
  ArrowLeft,
  Star
} from 'lucide-react';
import { QuestionnaireAnswers, PackageResponse, GymOption, AccommodationOption, FlightOption } from './types';
import { getFallbackPackage } from './fallbackData';
import { shopItems, ShopItem } from './shopData';

export default function App() {
  // Navigation & State
  const [step, setStep] = useState<'intro' | 'questionnaire' | 'results' | 'booked'>('intro');
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<string>('');
  
  // Tab within the Results view
  const [activeTab, setActiveTab] = useState<'overview' | 'gyms' | 'stays' | 'flights' | 'itinerary' | 'shop'>('overview');
  
  // Package Duration and Date States
  const [packageDuration, setPackageDuration] = useState<'1_week' | '2_weeks' | '1_month'>('1_week');
  const [travelStartDate, setTravelStartDate] = useState<string>('2026-11-12');
  const [travelEndDate, setTravelEndDate] = useState<string>('2026-11-19');
  const [trainingStartDate, setTrainingStartDate] = useState<string>('2026-11-13');
  const [trainingEndDate, setTrainingEndDate] = useState<string>('2026-11-18');

  // Gear CTA Prompt States
  const [hasGearPromptAnswered, setHasGearPromptAnswered] = useState<boolean>(false);
  const [userHasGear, setUserHasGear] = useState<boolean | null>(null);

  // For viewing deep detailed profiles of gyms
  const [focusedGym, setFocusedGym] = useState<GymOption | null>(null);

  // Shop state: items inside the bundle cart
  const [cart, setCart] = useState<Array<{ id: string; item: ShopItem; size: string; color: string }>>([]);

  // Sync dates automatically based on duration
  useEffect(() => {
    const start = new Date(travelStartDate);
    if (isNaN(start.getTime())) return;

    let days = 7;
    if (packageDuration === '2_weeks') days = 14;
    else if (packageDuration === '1_month') days = 30;

    // Travel End Date is start + days
    const endTravel = new Date(start);
    endTravel.setDate(start.getDate() + days);
    setTravelEndDate(endTravel.toISOString().split('T')[0]);

    // Training Start Date is start + 1 day
    const startTraining = new Date(start);
    startTraining.setDate(start.getDate() + 1);
    setTrainingStartDate(startTraining.toISOString().split('T')[0]);

    // Training End Date is start + days - 1 day
    const endTraining = new Date(start);
    endTraining.setDate(start.getDate() + (days - 1));
    setTrainingEndDate(endTraining.toISOString().split('T')[0]);
  }, [travelStartDate, packageDuration]);

  // Shop Filter States
  const [selectedBrand, setSelectedBrand] = useState<'All' | 'Fairtex' | 'Primo' | 'Yokkao'>('All');
  const [selectedType, setSelectedType] = useState<'All' | 'shorts' | 'gloves' | 'wraps'>('All');
  const [productSelections, setProductSelections] = useState<Record<string, string>>({});

  const setProductSelection = (key: string, value: string) => {
    setProductSelections((prev) => ({ ...prev, [key]: value }));
  };

  const addToCart = (item: ShopItem, size: string, color: string) => {
    const id = `${item.id}_${size}_${color}`.replace(/\s+/g, '_');
    if (cart.some((ci) => ci.id === id)) return;
    setCart((prev) => [...prev, { id, item, size, color }]);
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((ci) => ci.id !== id));
  };

  const filteredItems = shopItems.filter((item) => {
    const matchesBrand = selectedBrand === 'All' || item.brand === selectedBrand;
    const matchesType = selectedType === 'All' || item.type === selectedType;
    return matchesBrand && matchesType;
  });
  
  // Questionnaire variables
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({
    experience: 'beginner',
    budget: 'midrange',
    destination: 'phuket',
    comfortAccent: 'wellness',
    departureCity: 'London (LHR)'
  });

  // Current active selections (can be swapped interactively by user!)
  const [curatedPackage, setCuratedPackage] = useState<PackageResponse | null>(null);
  const [selectedGym, setSelectedGym] = useState<GymOption | null>(null);
  const [selectedAccommodation, setSelectedAccommodation] = useState<AccommodationOption | null>(null);
  const [selectedFlight, setSelectedFlight] = useState<FlightOption | null>(null);
  
  // Custom addon options
  const [addonScooter, setAddonScooter] = useState<boolean>(true);
  const [addonPrivateSession, setAddonPrivateSession] = useState<boolean>(false);
  const [addonNutritionalMealPrep, setAddonNutritionalMealPrep] = useState<boolean>(false);

  // Booking details Form
  const [checkoutName, setCheckoutName] = useState<string>('');
  const [checkoutEmail, setCheckoutEmail] = useState<string>('djswiftno1@gmail.com');
  const [checkoutPhone, setCheckoutPhone] = useState<string>('');
  const [checkoutDate, setCheckoutDate] = useState<string>('2026-11-12');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  
  // Custom flight inputs
  const [customCityInput, setCustomCityInput] = useState<string>('London (LHR)');
  const [isUpdatingFlight, setIsUpdatingFlight] = useState<boolean>(false);

  // Start with default template when needed
  useEffect(() => {
    // Generate initial fallback
    const pkg = getFallbackPackage(answers);
    setCuratedPackage(pkg);
    if (pkg.suggestedGyms.length > 0) setSelectedGym(pkg.suggestedGyms[0]);
    if (pkg.suggestedAccommodations.length > 0) setSelectedAccommodation(pkg.suggestedAccommodations[0]);
    if (pkg.suggestedFlights.length > 0) setSelectedFlight(pkg.suggestedFlights[0]);
  }, []);

  // Fetch package from real-time Node API endpoint
  const generateBespokePackage = async (finalAnswers: QuestionnaireAnswers) => {
    setIsLoading(true);
    setLoadingProgress('Analyzing martial arts profiles...');
    
    // Simulate beautiful progressive status logging for luxury look
    const statuses = [
      'Calibrating striking experience vectors...',
      'Mapping climate and humidity requirements on Phuket & Koh Samui...',
      'Matching beachfront boutique stays and luxury retreats...',
      'Retrieving flight ticket prices and transit layovers...',
      'Formulating custom 7-Day Re:start recovery itinerary...'
    ];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      if (currentLogIndex < statuses.length) {
        setLoadingProgress(statuses[currentLogIndex]);
        currentLogIndex++;
      }
    }, 800);

    try {
      const response = await fetch('/api/suggest-package', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(finalAnswers)
      });
      
      const payload = await response.json();
      clearInterval(interval);
      
      if (payload && payload.data) {
        const pkg: PackageResponse = payload.data;
        setCuratedPackage(pkg);
        
        // Pick primary matches
        if (pkg.suggestedGyms && pkg.suggestedGyms.length > 0) {
          setSelectedGym(pkg.suggestedGyms[0]);
        }
        if (pkg.suggestedAccommodations && pkg.suggestedAccommodations.length > 0) {
          setSelectedAccommodation(pkg.suggestedAccommodations[0]);
        }
        if (pkg.suggestedFlights && pkg.suggestedFlights.length > 0) {
          setSelectedFlight(pkg.suggestedFlights[0]);
        }
      }
    } catch (err) {
      console.error("API error, falling back locally:", err);
      const pkg = getFallbackPackage(finalAnswers);
      setCuratedPackage(pkg);
      if (pkg.suggestedGyms.length > 0) setSelectedGym(pkg.suggestedGyms[0]);
      if (pkg.suggestedAccommodations.length > 0) setSelectedAccommodation(pkg.suggestedAccommodations[0]);
      if (pkg.suggestedFlights.length > 0) setSelectedFlight(pkg.suggestedFlights[0]);
    } finally {
      clearInterval(interval);
      setTimeout(() => {
        setIsLoading(false);
        setStep('results');
        setActiveTab('overview');
      }, 500);
    }
  };

  const handleStartQuestionnaire = () => {
    setStep('questionnaire');
    setCurrentQuestion(0);
  };

  // Step calculations
  const totalQuestions = 5;

  const handleAnswerSelect = (field: keyof QuestionnaireAnswers, value: any) => {
    const updatedAnswers = { ...answers, [field]: value };
    setAnswers(updatedAnswers);
    
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Completed, trigger package suggestion
      generateBespokePackage(updatedAnswers);
    }
  };

  const handleCustomCitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingFlight(true);
    const updated = { ...answers, departureCity: customCityInput };
    setAnswers(updated);
    
    // Simulate live recalculation callback
    setTimeout(() => {
      // Create new packages with new flight rates
      const pkg = getFallbackPackage(updated);
      setCuratedPackage(pkg);
      if (pkg.suggestedFlights.length > 0) {
        setSelectedFlight(pkg.suggestedFlights[0]);
      }
      setIsUpdatingFlight(false);
    }, 700);
  };

  // Recalculate dynamic totals instantly based on active user selection state and duration
  const durationMultiplier = packageDuration === '1_week' ? 1 : packageDuration === '2_weeks' ? 2 : 4;
  const stayNights = packageDuration === '1_week' ? 7 : packageDuration === '2_weeks' ? 14 : 30;

  const accommodationTotalCost = selectedAccommodation ? selectedAccommodation.costPerNight * stayNights : 0;
  const gymCostRaw = selectedGym ? parseInt(selectedGym.typicalCost.replace(/[^0-9]/g, '')) || 120 : 120;
  const gymTotalCost = Math.round(gymCostRaw * durationMultiplier * (packageDuration === '1_month' ? 0.9 : 1.0)); // 10% monthly discount
  const flightPrice = selectedFlight ? selectedFlight.averagePriceUsd : 0;
  
  // Calculate Base Scooter and food cost based on budget config
  let baseRunningCostWeekly = 150;
  if (answers.budget === 'backpacker') baseRunningCostWeekly = 90;
  if (answers.budget === 'luxury') baseRunningCostWeekly = 450;
  const baseRunningCost = baseRunningCostWeekly * durationMultiplier;
  
  // Add extra values from modern additions scaled by duration
  const addonScooterCost = addonScooter ? (40 * durationMultiplier) : 0;
  const addonMealCost = addonNutritionalMealPrep ? (130 * durationMultiplier) : 0;
  const addonPrivateCost = addonPrivateSession ? (100 * durationMultiplier) : 0;

  // Total gear added from original shop cart
  const shopGearCost = cart.reduce((overall, cartItem) => overall + cartItem.item.price, 0);
  
  const computedTotal = Math.round(flightPrice + gymTotalCost + accommodationTotalCost + baseRunningCost + addonScooterCost + addonMealCost + addonPrivateCost + shopGearCost);

  // Real Muay Thai Gym reference data is available for Phuket & Koh Samui to allow beautiful swapping
  const phuketGymPool: GymOption[] = [
    {
      id: 'tiger_muay_thai',
      name: 'Tiger Muay Thai & MMA',
      location: 'Soi Ta-iad, Chalong, Phuket',
      island: 'Phuket',
      description: 'The world-famous giant training campus. Tiger has separate training rings designated by experience level.',
      trainingFocus: 'All Levels, Heavy Conditioning, MMA Cross-training',
      typicalCost: '$160 / week',
      rating: 4.8,
      amenities: ['Massive Weight Gym', 'On-site Grill Cafe', 'Ice Baths', 'Gear Shop'],
      whyMatch: 'Outstanding for structured beginner classes and pristine weight-lifting recovery centers.',
      schedule: ['08:00 AM - Morning Drills', '10:30 AM - Clinching', '04:00 PM - Heavy Bags & Boxing Sparring'],
      imageUrl: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&q=80&w=800',
      difficulty: 4,
      keywords: ['MMA', 'Western Boxing', 'Strength & Conditioning', 'Beginner friendly', 'Professional', 'Meal packages available'],
      testimonial: {
        quote: "Tiger Muay Thai has the most complete, world-class athletic facilities in Southeast Asia. The coaching is incredibly professional.",
        author: "Marcus Vance, Professional K-1 Fighter"
      },
      detailedSummary: "Tiger Muay Thai is legendary, serving as a rite of passage for elite martial artists. Offering specialized training across Muay Thai, MMA, Western Boxing, and high-intensity Strength & Conditioning, this sprawling compound features separate rings categorized strictly by skill level. This structured approach allows absolute beginners to train comfortably in a welcoming environment, while professional competitors sharpen their weapons under the watchful eye of Lumpinee and Rajadamnern stadium alumni. The facility incorporates on-site high-protein kitchens, a complete rehabilitation center, and custom recovery tools.",
      googleMapsAddress: "7/35 Moo 5, Soi Ta-iad, Chalong, Mueang Phuket District, Phuket 83130, Thailand"
    },
    {
      id: 'sinbi_muay_thai',
      name: 'Sinbi Muay Thai',
      location: 'Rawai Pantai, Phuket',
      island: 'Phuket',
      description: 'Traditional and legendary beach gym in the green south of Phuket. Famously technical and run by veteran champions.',
      trainingFocus: 'Traditional technique, padwork, pure championship striking',
      typicalCost: '$135 / week',
      rating: 4.9,
      amenities: ['Three Full Rings', 'On-site Gear Store', 'Direct ocean breeze', 'Kettlebell garden'],
      whyMatch: 'Excellent trainer-to-student attention, providing authentic technical refinement.',
      schedule: ['07:30 AM - Cardio Run & Padwork', '03:30 PM - Bag work & Sparring Clinics'],
      imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=800',
      difficulty: 4,
      keywords: ['Western Boxing', 'Strength & Conditioning', 'Professional', 'Family run', 'Female friendly'],
      testimonial: {
        quote: "The authentic, family-run feel of Sinbi, paired with top-tier technical pad work, makes it my favorite escape. Invaluable details!",
        author: "Elena Rostova, Amateur Competitor"
      },
      detailedSummary: "Sinbi Muay Thai is a prestigious, traditional gym nestled in Rawai's lush green southern peninsula. It represents authentic old-school training without unnecessary commercial vanity. Celebrated globally for technical excellence and veteran champion trainers, Sinbi teaches clean defense, strategic clinching, and robust fight tactics. With deep family-oriented values, it boasts a highly supportive, female-friendly and welcoming atmosphere. Training takes place in fully equipped, open-air beach-breeze pavilions with an attached premium fight gear shop.",
      googleMapsAddress: "100/15 Moo 7, Sai Yuan Rd, Rawai, Mueang Phuket District, Phuket 83130, Thailand"
    },
    {
      id: 'bangtao_muay_thai',
      name: 'Bangtao Muay Thai & MMA',
      location: 'Bang Tao Beach, Phuket',
      island: 'Phuket',
      description: 'Premium, modern fitness facility right on the beach, created by elite international MMA and striking coaches.',
      trainingFocus: 'Gold-standard striking, Recovery-focused wellness, BJJ',
      typicalCost: '$225 / week',
      rating: 5.0,
      amenities: ['Infrared Saunas', 'Cold Plunges', 'Healthy Organic Cafe', 'Boutique Yoga Studio'],
      whyMatch: 'Perfect visual fit for wellness and luxury recovery in a world-leading beachfront sanctuary.',
      schedule: ['08:00 AM - Premium Striking & Cardio', '11:00 AM - Hot/Cold Hydrotherapy', '04:30 PM - Technique & Flow'],
      imageUrl: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&q=80&w=800',
      difficulty: 5,
      keywords: ['MMA', 'Western Boxing', 'Strength & Conditioning', 'Professional', 'Spa and wellness', 'Meal packages available'],
      testimonial: {
        quote: "Bangtao is high-performance paradise. Training with world champion coaches next to the beach, followed by ice baths, is incredible.",
        author: "Alexander Gustafsson, MMA Veteran"
      },
      detailedSummary: "Bangtao Muay Thai & MMA is a high-performance wellness oasis situated on the pristine coastline of Bang Tao Beach. Co-founded by international MMA icons and striking specialists, it sets the global standard for elite combat training. The facility merges state-of-the-art weights, physical therapy, and intensive Muay Thai instruction with custom holistic recovery, including infrared dry saunas, premium ice plunges, and wholesome organic fuel bars. It caters perfectly to wellness-oriented trainees seeking premium physical and mental mastery.",
      googleMapsAddress: "72/46 Moo 3, Bang Tao Beach, Cherngtalay, Thalang District, Phuket 83110, Thailand"
    },
    {
      id: 'phuket_fight_club',
      name: 'Phuket Fight Club',
      location: 'Chalong Bay, Phuket',
      island: 'Phuket',
      description: 'Intense and dedicated striking center with high counts of competing professional fighters. Traditional stance focus.',
      trainingFocus: 'Hard Sparring, Sweep defense, Traditional clinch',
      typicalCost: '$120 / week',
      rating: 4.7,
      amenities: ['Waterfront location', 'Elite boxing rings', 'Traditional weight room', 'Thai healing oil station'],
      whyMatch: 'Ideal for those seeking a highly dedicated fight-camp family atmosphere and traditional instruction.',
      schedule: ['07:30 AM - Run & Bag drill', '04:00 PM - Elite Clinch & hard sparring'],
      imageUrl: 'https://images.unsplash.com/photo-1595078475328-1ab05d0a6a0e?auto=format&fit=crop&q=80&w=800',
      difficulty: 5,
      keywords: ['Western Boxing', 'Strength & Conditioning', 'Professional', 'Family run'],
      testimonial: {
        quote: "Phuket Fight Club is proper hardcore striking. If you want real sparring, intense conditioning, and zero shortcuts, this is your home.",
        author: "Thiago Teixeira, Muay Thai Champion"
      },
      detailedSummary: "Phuket Fight Club is a dedicated, high-intensity striking institute located near the Chalong waterfront. It commands immense respect in the local stadium circuit as a true fighter's gym. Run as a tight-knit family, the camp specializes in relentless cardio, hard clinch lock-ups, and traditional fight mechanics. It is highly suited for experienced practitioners or highly committed beginners looking to challenge themselves alongside active, professional Muay Thai fighters.",
      googleMapsAddress: "Chalong, Mueang Phuket District, Phuket 83130, Thailand"
    }
  ];

  const samuiGymPool: GymOption[] = [
    {
      id: 'yodyut_muay_thai',
      name: 'Yodyut Muay Thai',
      location: 'Chaweng, Koh Samui',
      island: 'Koh Samui',
      description: 'Widely considered the premier technical gym on Koh Samui. Famous for intense pad rounds and highly engaging coaches.',
      trainingFocus: 'Furious Padwork, Traditional clinching, Heavy Cardio',
      typicalCost: '$125 / week',
      rating: 4.9,
      amenities: ['Large training Rings', 'Heavy Bags Forest', 'Showers & Lockers', 'Close to Chaweng Lake'],
      whyMatch: 'Outstanding combination of traditional Thai values, friendly island family style, and superb cardio work.',
      schedule: ['07:00 AM - Lake Run', '08:00 AM - Premium Padwork', '04:00 PM - Daily Clinch Mastery'],
      imageUrl: 'https://images.unsplash.com/photo-1517438322307-e67111335449?auto=format&fit=crop&q=80&w=800',
      difficulty: 3,
      keywords: ['Western Boxing', 'Beginner friendly', 'Professional', 'Family run', 'Female friendly'],
      testimonial: {
        quote: "The absolute best pad work and technical breakdowns in Samui! The atmosphere is incredibly energetic and supportive.",
        author: "Liam O'Connor, Wellness Enthusiast"
      },
      detailedSummary: "Yodyut Muay Thai is Koh Samui's crowd-favorite technical camp, known for its engaging and energetic training philosophy. Located in Chaweng, Yodyut provides an elegant balance between traditional martial arts disciplines and island hospitality. With a primary focus on clean mechanics, defense, and high-frequency pad work, its supportive family-style instructors specialize in boosting student stamina. It is highly recommended for female tourists and martial arts beginners wanting to experience authentic Muay Thai in a friendly, zero-ego space.",
      googleMapsAddress: "22/30 Moo 2, Chaweng, Koh Samui, Surat Thani 84320, Thailand"
    },
    {
      id: 'superpro_samui',
      name: 'Superpro Samui Sport Resort',
      location: 'Chaweng Noi, Koh Samui',
      island: 'Koh Samui',
      description: 'Resort-style physical wellness complex with comfortable bungalows, large fitness gym, and a pristine swimming pool.',
      trainingFocus: 'Muay Thai, Kickboxing, Functional Strength, Yoga',
      typicalCost: '$145 / week',
      rating: 4.8,
      amenities: ['Swimming Pool', 'Weights Gym', 'Healthy Kitchen on site', 'Yoga platform'],
      whyMatch: 'Highly curated for mid-range and luxury visitors looking for modern high-speed recovery assets on site.',
      schedule: ['08:00 AM - Striking Camp', '10:30 AM - Pool recovery drills', '04:30 PM - Strength & Bag drilling'],
      imageUrl: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&q=80&w=800',
      difficulty: 3,
      keywords: ['MMA', 'Western Boxing', 'Strength & Conditioning', 'Beginner friendly', 'Spa and wellness', 'Meal packages available'],
      testimonial: {
        quote: "Superpro offers the ultimate sport-resort experience. Training Muay Thai in the morning, hitting the strength machines, and relaxing by the pool is fantastic.",
        author: "Anke de Vries, Multi-sport Enthusiast"
      },
      detailedSummary: "Superpro Samui is a comprehensive sport resort that seamlessly blends fitness vacations with professional athletic camps. Situated in Chaweng Noi, this modern multi-discipline facility offers high-grade Muay Thai, MMA, and functional HIIT classes. Standard amenities include a sparkling swimming pool, massive indoor weights area, functional conditioning rigs, yoga decks, and an on-site clean-eating restaurant. Ideal for mid-range and luxury travellers desiring an active fitness holiday with comfortable resort lodgings.",
      googleMapsAddress: "48/10 Moo 3 Chaweng Noi, Koh Samui, Surat Thani 84320, Thailand"
    },
    {
      id: 'lamai_muay_thai',
      name: 'Lamai Muay Thai Camp',
      location: 'Lamai Beach, Koh Samui',
      island: 'Koh Samui',
      description: 'Under the oversight of the World Muay Thai Council (WMC), this open-air camp provides old-school, highly intense training cycles.',
      trainingFocus: 'Old-school Thai training, high sweat, body weight conditioning',
      typicalCost: '$110 / week',
      rating: 4.6,
      amenities: ['Open-air beach breeze', 'Direct beach access', 'Gear store', 'Traditional Thai massage partner'],
      whyMatch: 'Excellent for looking to escape modern vanity and immerse into highly traditional sweaty sand training.',
      schedule: ['07:00 AM - Beach cardio sprint', '04:00 PM - Padwork & Clinch sweat'],
      imageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&q=80&w=800',
      difficulty: 4,
      keywords: ['Western Boxing', 'Professional', 'Family run'],
      testimonial: {
        quote: "Training under WMC oversight under the open sea breeze teaches you real mental toughness. Proper old-school pads of Samui.",
        author: "Devon Shaw, amateur active fighter"
      },
      detailedSummary: "Lamai Muay Thai Camp is an iconic, open-air training facility operating under the official oversight of the World Muay Thai Council (WMC). Overlooking Lamai Beach, this legendary camp focuses on high-stamina conditioning, old-school sand training, and authentic ring tactics. There are zero shortcuts here: training is sweaty, rigorous, and rewarding. The beachside community feel is exceptionally strong, featuring classic massage partners and a traditional Thai fight camp spirit.",
      googleMapsAddress: "Lamai Beach, Maret, Koh Samui, Surat Thani 84310, Thailand"
    },
    {
      id: 'bxb_fight_lab',
      name: 'BXB Fight Lab (BXB Lamai)',
      location: 'Lamai, Koh Samui',
      island: 'Koh Samui',
      description: 'An elite, state-of-the-art high-performance fight lab focusing on professional-grade Muay Thai, Western boxing, and custom strength and conditioning.',
      trainingFocus: 'High-Performance Striking, S&C Integration, Elite Boxing',
      typicalCost: '$135 / week',
      rating: 4.9,
      amenities: ['Elite S&C Area', 'Full-Size Boxing Ring', 'Ice Baths & Cold Plunges', 'Coffee & Protein Bar', 'Premium Airflow System'],
      whyMatch: 'Perfect if you desire prime modern equipment, professional sparring, high-level trainers, and high-performance recovery arrays.',
      schedule: ['08:00 AM - Muay Thai & Striking Cardio', '10:30 AM - S&C / Power Development', '04:30 PM - Technical Sparring & Pad rounds'],
      imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=800',
      difficulty: 4,
      keywords: ['Western Boxing', 'Strength & Conditioning', 'Professional', 'Spa and wellness'],
      testimonial: {
        quote: "BXB is a pristine, premium scientific fight camp. The strength coaching combined with technical boxing analysis is unmatched here on Samui.",
        author: "Dr. Rachel Thorne, Sports Physiologist"
      },
      detailedSummary: "BXB Fight Lab (BXB Lamai) is an elite, high-performance athletic laboratory on the southern end of Koh Samui. It is designed around state-of-the-art strength and conditioning equipment, biometric monitoring, and high-level Western boxing and striking. Known for its scientific, recovery-first training philosophy, BXB offers full cold plunging, clean coffee and protein formulation bars, and high-velocity custom airflow structures to ensure optimal clinical training efficiency.",
      googleMapsAddress: "Lamai, Maret, Koh Samui, Surat Thani 84310, Thailand"
    },
    {
      id: 'dowden_muay_thai',
      name: 'Dowden Muay Thai',
      location: 'Choeng Mon, Koh Samui',
      island: 'Koh Samui',
      description: 'A welcoming, government-approved full-service Destination Thailand Visa (DTV) camp. Highly respected for highly supportive trainers and a spacious, pristine traditional training pavilion.',
      trainingFocus: 'Traditional strike skills, cardio conditioning, flexible memberships',
      typicalCost: '$60 / week',
      rating: 4.9,
      amenities: ['Professionally Sized Ring', 'Free Weights Area', 'DTV Visa Support Hub', 'Gear & Apparel Shop', 'In-Villa Training Options'],
      whyMatch: 'Awesome balance of friendly trainers, traditional technical instructions, and quick seaside breezes in scenic Choeng Mon.',
      schedule: ['08:00 AM - Technical Morning Session', '04:30 PM - Intensive Padwork & Clinch sparring'],
      imageUrl: 'https://images.unsplash.com/photo-1544033527-b192daee1f5b?auto=format&fit=crop&q=80&w=800',
      difficulty: 2,
      keywords: ['Western Boxing', 'Beginner friendly', 'Professional', 'Family run', 'Female friendly'],
      testimonial: {
        quote: "Dowden is exceptionally welcoming. As a total beginner, they made me feel like family instantly. Plus they sorted my DTV visa smoothly!",
        author: "Fiona Gallagher, Digital Nomad"
      },
      detailedSummary: "Dowden Muay Thai is a prestigious, government-approved training center situated in scenic Choeng Mon. Widely known for facilitating flexible long-term Destination Thailand Visas (DTV), it features incredibly friendly, champion-level trainers operating in a pristine, non-commercial sea-breeze pavilion. Dowden prides itself on welcoming female trainees, children, and absolute beginners with positive reinforcement and structured, low-ego technical support.",
      googleMapsAddress: "Choeng Mon, Bophut, Koh Samui, Surat Thani 84320, Thailand"
    },
    {
      id: 'koh_fit_muay_thai',
      name: 'Koh Fit Muay Thai (FitKoh)',
      location: 'Ban Tai, Maenam, Koh Samui',
      island: 'Koh Samui',
      description: 'A holistic health, weights, and Muay Thai holiday camp. Boasts a massive health-oriented cafe, extensive free weight setups, and scenic outdoor rings.',
      trainingFocus: 'Holistic striking, weight loss, conditioning, yoga integration',
      typicalCost: '$150 / week',
      rating: 4.8,
      amenities: ['Integrated Health Cafe', 'Massive Strength & Cardio Gym', 'Yoga Shala Deck', 'Saltwater Pool Access', 'Ice Baths'],
      whyMatch: 'Perfect if you prefer healthy whole-food recipes, robust weightlifting gyms, active yoga shalas, and ocean walks.',
      schedule: ['07:30 AM - Beach Cardio Run', '08:30 AM - Muay Thai Striking Class', '11:00 AM - Strength & Bodyweight conditioning', '04:30 PM - Techniques & Shala Yoga'],
      imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=800',
      difficulty: 3,
      keywords: ['Strength & Conditioning', 'Beginner friendly', 'Spa and wellness', 'Meal packages available', 'Female friendly'],
      testimonial: {
        quote: "The ultimate wellness and fat loss holiday. Love the clean-eating cafe, the massive weight room, and the gorgeous beachfront runs.",
        author: "Nate Diaz, Fitness Vacationist"
      },
      detailedSummary: "Koh Fit Muay Thai (FitKoh) is a massive, premium health, weight loss, and combat holiday camp located in Maenam's tranquil Ban Tai beach region. Specially engineered for clients seeking total body transformation, it features a giant indoor strength and conditioning weights center, saltwater pool, specialized hot/cold recovery arrays, a yoga shala, and a highly popular organic health food cafe. Excellent for holistic martial arts holidaymakers seeking structured training paired with premium lifestyle nutrition.",
      googleMapsAddress: "Ban Tai Road, Bophut, Koh Samui, Surat Thani 84320, Thailand"
    },
    {
      id: 'fas_muay_thai',
      name: 'Fas Muay Thai Gym',
      location: 'Maenam, Koh Samui',
      island: 'Koh Samui',
      description: 'A superb, traditional family-run camp nestled under mature coconut groves. Focused on authentic technique, intensive stamina, and customized instructions.',
      trainingFocus: 'Pure Traditional striking, authentic clinching, body conditioning',
      typicalCost: '$120 / week',
      rating: 4.9,
      amenities: ['Fighter-Led Pad Rounds', 'Dedicated Sparring Rings', 'Ice Baths & Soaking', 'Apparel Shop', 'Encouraging Family Community'],
      whyMatch: 'Incredibly welcoming, non-commercial, fighter-led training environment away from crowded tourist hotspots.',
      schedule: ['07:30 AM - Coconut Grove run', '08:00 AM - Group Padwork & Clinch', '04:00 PM - Afternoon Sweat: Clinch & Sparring'],
      imageUrl: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&q=80&w=800',
      difficulty: 4,
      keywords: ['Western Boxing', 'Professional', 'Family run', 'Female friendly'],
      testimonial: {
        quote: "Fas Muay Thai represents the true heart of old-school Koh Samui. Training under mature coconut palms with active fighters is magical.",
        author: "Cody Harrison, Amateur Fighter"
      },
      detailedSummary: "Fas Muay Thai Gym is an authentic, family-run training sanctuary nestled deep inside stunning coconut groves in Maenam. Led by highly dedicated local fighters who train students with immense passion, Fas is completely free of commercialized tourist crowds. The camp concentrates on rich, traditional Thai fighting systems: extreme stamina, powerful kicks, and intricate clinch manipulation. Trainees are integrated directly into a welcoming family atmosphere that embodies genuine Thai warmth.",
      googleMapsAddress: "Maenam Soi 5, Bophut, Koh Samui, Surat Thani 84320, Thailand"
    }
  ];

  // Accommodation Pool for Phuket/Samui to allow seamless swapping
  const accommodationPool: AccommodationOption[] = [
    {
      id: 'soi_camp_dorm',
      name: 'The Soi Fighter Dorms',
      type: 'Premium Shared Camp Dormitory (8-bed AC)',
      location: 'Chalong, Phuket',
      description: 'Fully air-conditioned luxury style pods designed specifically for martial arts trainees. High social cohesion.',
      costPerNight: 12,
      comfortLevel: 'Backpacker',
      distanceToGym: 'On-site / 100m walk',
      whyMatch: 'Allows you to allocate maximum funds to elite food and flights while maintaining a high training focus.',
      features: ['High-speed AC', 'Secure personal lockers', 'Shared lounge space', 'Washing machines', 'Gym community']
    },
    {
      id: 'chaweng_hostel_pod',
      name: 'Chaweng Beach side Chill Hostel',
      type: 'Modern Privacy Pod Dormitory',
      location: 'Chaweng Beach, Koh Samui',
      description: 'Super clean design hostel right on the beachfront. High-grade wooden cabins with personal lighting and sound insulation.',
      costPerNight: 14,
      comfortLevel: 'Backpacker',
      distanceToGym: '5 mins walking path',
      whyMatch: 'Extremely cost-effective, lets you sleep next to Chaweng beach waves for unmatched post-combat rest.',
      features: ['Private privacy cabins', 'Power outlets', 'Ocean-view terrace', 'Bicycle hires']
    },
    {
      id: 'rawai_palms_resort',
      name: 'Rawai Palms Resort & Bungalows',
      type: 'Tropical Lagoon King Room',
      location: 'Rawai, Phuket',
      description: 'Charming private suites surrounding a massive saltwater lagoon pool. Features traditional Thai teak wood and modern amenities.',
      costPerNight: 45,
      comfortLevel: 'Mid-range',
      distanceToGym: '3 mins scooter run',
      whyMatch: 'Excellent intermediate option providing complete private AC rest, hot private showers, and quiet workspaces.',
      features: ['Lagoon Swimming Pool', 'Private balcony with pool views', 'AC & Superfast Wifi', 'Fridge & Mineral waters']
    },
    {
      id: 'superpro_private_bungalows',
      name: 'Superpro Camp Deluxe Bungalow',
      type: 'Private Camp King Room',
      location: 'Chaweng Noi, Koh Samui',
      description: 'Private detached garden bungalows. Literally step out of your bedroom straight onto the training mats or into the swimming pool.',
      costPerNight: 50,
      comfortLevel: 'Mid-range',
      distanceToGym: 'On-site (0 meters)',
      whyMatch: 'Eliminates commute, allowing elite recovery cycles next to the ring mats.',
      features: ['Direct ring mat & pool access', 'Garden patio seating', 'En-suite hot showers', 'Daily fresh towels']
    },
    {
      id: 'the_surin_luxury',
      name: 'The Surin Phuket Ocean Villas',
      type: 'Luxury Beachfront Hillside Cottage',
      location: 'Pansea Beach, Phuket',
      description: 'A five-star architectural masterpiece nesting in a premium coconut grove. Elite spa therapists, zero tourist crowds, absolute zen.',
      costPerNight: 195,
      comfortLevel: 'Luxury',
      distanceToGym: 'Direct VIP Shuttle service',
      whyMatch: 'Designed for high-end rest with ocean sunsets, coconut forest views, and five-star organic cuisine.',
      features: ['Private ocean-facing deck', '24/7 dedicated local helper', 'Premium daily herbal sauna access', 'Chilled organic refreshments']
    },
    {
      id: 'sala_samui_resort',
      name: 'SALA Samui Choengmon Beach Resort',
      type: 'Luxury Pool Ocean Villa',
      location: 'Choeng Mon, Koh Samui',
      description: 'Stunning luxury villas featuring private plunge pools, open-air garden bathrooms, and premium beachfront beach beds.',
      costPerNight: 235,
      comfortLevel: 'Luxury',
      distanceToGym: '10 mins private luxury transfer included',
      whyMatch: 'Unrivaled tropical sanctuary for total mental reset and physical pampering between gruelling workouts.',
      features: ['Private Infinity Pool', 'Outdoor private garden bathroom', 'Herbal steam spa voucher', 'Beach yoga programs']
    }
  ];

  // Helper lists based on destination
  const availableGyms = answers.destination === 'phuket' 
    ? phuketGymPool 
    : answers.destination === 'samui' 
    ? samuiGymPool 
    : [...phuketGymPool, ...samuiGymPool];

  const availableAccommodations = accommodationPool.filter(acc => {
    const isPhuketAcc = acc.id.includes('soi') || acc.id.includes('rawai') || acc.id.includes('surin');
    const isSamuiAcc = acc.id.includes('chaweng') || acc.id.includes('superpro') || acc.id.includes('sala');
    if (answers.destination === 'phuket') return isPhuketAcc;
    if (answers.destination === 'samui') return isSamuiAcc;
    return true; // combo shows all
  });

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutName || !checkoutName.trim()) {
      return;
    }
    setIsCheckoutOpen(false);
    setStep('booked');
  };

  return (
    <div className="w-full min-h-screen bg-[#121212] text-[#fdfdfd] flex flex-col justify-between overflow-x-hidden select-none">
      
      {/* HEADER NAVIGATION */}
      <nav className="flex flex-col sm:flex-row items-center justify-between px-6 sm:px-10 py-6 border-b border-white/10 gap-4 bg-black/40 backdrop-blur-md">
        <div className="flex flex-col cursor-pointer" onClick={() => setStep('intro')}>
          <span className="text-3xl font-bold tracking-tighter leading-none italic uppercase serif text-[#fdfdfd] hover:text-[#D4AF37] transition">
            Re:start
          </span>
          <span className="text-[10px] tracking-[0.34em] uppercase text-[#f97316] font-semibold">
            Thailand Travel Concierge
          </span>
        </div>
        
        {step === 'results' && (
          <div className="flex flex-wrap gap-4 sm:gap-10 text-[11px] uppercase tracking-widest font-semibold text-white/50">
            <button 
              onClick={() => setActiveTab('overview')} 
              className={`hover:text-[#D4AF37] transition-all pb-1 ${activeTab === 'overview' ? 'text-white border-b border-[#D4AF37]' : ''}`}
            >
              Curated Package
            </button>
            <button 
              onClick={() => setActiveTab('gyms')} 
              className={`hover:text-[#D4AF37] transition-all pb-1 ${activeTab === 'gyms' ? 'text-white border-b border-[#D4AF37]' : ''}`}
            >
              The Gyms
            </button>
            <button 
              onClick={() => setActiveTab('stays')} 
              className={`hover:text-[#D4AF37] transition-all pb-1 ${activeTab === 'stays' ? 'text-white border-b border-[#D4AF37]' : ''}`}
            >
              Stays
            </button>
            <button 
              onClick={() => setActiveTab('flights')} 
              className={`hover:text-[#D4AF37] transition-all pb-1 ${activeTab === 'flights' ? 'text-white border-b border-[#D4AF37]' : ''}`}
            >
              Flights
            </button>
            <button 
              onClick={() => setActiveTab('itinerary')} 
              className={`hover:text-[#D4AF37] transition-all pb-1 ${activeTab === 'itinerary' ? 'text-white border-b border-[#D4AF37]' : ''}`}
            >
              Daily Schedule
            </button>
            <button 
              onClick={() => setActiveTab('shop')} 
              className={`hover:text-[#D4AF37] transition-all pb-1 flex items-center gap-1 ${activeTab === 'shop' ? 'text-white border-[#D4AF37] border-b' : ''}`}
            >
              Shop 🥊
            </button>
          </div>
        )}

        <div className="flex gap-4">
          {step === 'results' ? (
            <button 
              onClick={handleStartQuestionnaire}
              className="px-5 py-2 border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all rounded-full text-[10px] uppercase font-bold tracking-widest"
            >
              Refine Package
            </button>
          ) : step === 'booked' ? (
            <button 
              onClick={() => setStep('intro')}
              className="px-5 py-2 border border-white/20 hover:bg-white/10 transition-all rounded-full text-[10px] uppercase tracking-widest"
            >
              Back to Start
            </button>
          ) : (
            <div className="px-5 py-2 border border-white/20 rounded-full text-[10px] uppercase tracking-widest text-white/60">
              Active Session
            </div>
          )}
        </div>
      </nav>

      {/* STEP 1: INTRO LANDING PAGE */}
      {step === 'intro' && (
        <div className="flex-1 max-w-7xl mx-auto px-6 sm:px-10 py-12 md:py-20 flex flex-col lg:flex-row items-center gap-12 sm:gap-16">
          <div className="flex-1 space-y-8 max-w-2xl text-left">
            <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] px-4 py-1 rounded-full text-xs uppercase tracking-widest font-semibold">
              <Sparkles className="w-3 h-3" /> Spiritual & Physical Breakthroughs
            </div>
            
            <h1 className="text-5xl sm:text-7xl font-light leading-none tracking-tight text-white uppercase italic serif">
              The Ultimate <br />
              <span className="text-[#D4AF37] font-normal not-italic">Muay Thai</span> <br />
              Reset in Thailand.
            </h1>
            
            <p className="text-base sm:text-lg text-white/70 font-light leading-relaxed">
              We curate custom combative retreats in Phuket & Koh Samui. 
              By connecting elite beachfront training camps, premium restorative villas, 
              and global airline coordinates, we build the optimal wellness escape. 
              Fill in our brief questionaire to instantly compile your custom martial itinerary.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button 
                onClick={handleStartQuestionnaire}
                className="group relative px-8 py-5 bg-white text-black font-extrabold uppercase tracking-widest text-xs rounded-none transition duration-300 hover:bg-[#D4AF37] flex items-center justify-center gap-3 shadow-xl"
              >
                Begin Custom Curation
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <div className="px-6 py-4 border border-white/10 bg-white/[0.02] flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <div className="text-left">
                  <p className="text-[10px] uppercase tracking-widest opacity-40 leading-none mb-1">Authenticity Guaranteed</p>
                  <p className="text-xs font-bold text-white/90">Curated with active fighters & verified Krus</p>
                </div>
              </div>
            </div>

            {/* Quick trust metrics */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10 text-left">
              <div>
                <span className="text-3xl font-extralight serif italic text-[#D4AF37]">12+</span>
                <p className="text-[9px] uppercase tracking-widest text-white/40 mt-1">Verified gyms</p>
              </div>
              <div>
                <span className="text-3xl font-extralight serif italic text-[#D4AF37]">100%</span>
                <p className="text-[9px] uppercase tracking-widest text-white/40 mt-1">Custom tailorable</p>
              </div>
              <div>
                <span className="text-3xl font-extralight serif italic text-[#D4AF37]">0.0s</span>
                <p className="text-[9px] uppercase tracking-widest text-white/40 mt-1">Hassle integration</p>
              </div>
            </div>
          </div>

          {/* Right side graphic design panel */}
          <div className="flex-1 w-full max-w-md lg:max-w-none">
            <div className="grid grid-cols-2 gap-4 h-[440px]">
              {/* Box 1: Landscape image */}
              <div className="relative overflow-hidden group border border-white/10 rounded-lg">
                <img 
                  src="https://images.unsplash.com/photo-1528181304800-2f1702413221?auto=format&fit=crop&q=80&w=600" 
                  alt="Beautiful Thailand Island Landscape" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-5 sm:p-6 flex flex-col justify-between">
                  <span className="text-[9px] uppercase tracking-[0.25em] bg-[#D4AF37]/90 text-black px-1.5 py-0.5 rounded self-start font-mono font-bold">SCENERY</span>
                  <div>
                    <h4 className="text-lg font-bold uppercase text-white tracking-wide font-sans leading-tight">Phuket Shores</h4>
                    <p className="text-[10px] text-white/70 font-light mt-1">Limestone cliffs & turquoise waves</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {/* Box 2: Muay Thai training image */}
                <div className="relative flex-1 overflow-hidden group border border-white/10 rounded-lg">
                  <img 
                    src="https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&q=80&w=600" 
                    alt="Muay Thai Training Handwraps" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent p-4 flex flex-col justify-end">
                    <h4 className="text-sm font-bold uppercase text-white tracking-wide font-sans">Sacred Handwrap</h4>
                    <span className="text-[9px] text-[#D4AF37] font-mono mt-0.5">Focus & Discipline</span>
                  </div>
                </div>

                {/* Box 3: Koh Samui landscape */}
                <div className="relative flex-1 overflow-hidden group border border-white/10 rounded-lg">
                  <img 
                    src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600" 
                    alt="Samui beach landscape" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent p-4 flex flex-col justify-end">
                    <h4 className="text-sm font-bold uppercase text-white tracking-wide font-serif">Koh Samui Palms</h4>
                    <span className="text-[9px] text-amber-500 font-mono mt-0.5">Beach restoration</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: FULLY-FEATURED EDITORIAL QUESTIONNAIRE */}
      {step === 'questionnaire' && (
        <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-12 flex flex-col justify-center">
          
          {/* Progress Header */}
          <div className="flex justify-between items-center mb-8">
            <span className="text-[10px] uppercase font-mono tracking-widest text-white/40">
              Curator Configurator // Stage {currentQuestion + 1} of {totalQuestions}
            </span>
            <div className="flex gap-1.5">
              {Array.from({ length: totalQuestions }).map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-1 w-8 transition-all duration-300 ${
                    idx <= currentQuestion ? 'bg-[#D4AF37]' : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* BACK BUTTON */}
          {currentQuestion > 0 && (
            <button 
              onClick={() => setCurrentQuestion(currentQuestion - 1)}
              className="mb-6 self-start text-[10px] uppercase tracking-widest text-white/40 hover:text-white flex items-center gap-1.5 transition"
            >
              ← Previous Segment
            </button>
          )}

          {/* QUESTION 1: EXPERIENCE */}
          {currentQuestion === 0 && (
            <div className="space-y-8 text-left animate-fadeIn">
              <div className="space-y-2">
                <span className="text-xs uppercase text-[#D4AF37] tracking-[0.2em] font-bold">01 / Ring Experience</span>
                <h2 className="text-3xl sm:text-5xl font-light italic serif uppercase">Select your striking background</h2>
                <p className="text-sm text-white/60 font-light">Trainers calibrate pace and manual pads depending on this category.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <button 
                  onClick={() => handleAnswerSelect('experience', 'beginner')}
                  className="p-6 bg-white/[0.02] border border-white/10 hover:border-[#D4AF37] hover:bg-white/[0.04] transition-all text-left flex flex-col justify-between group h-44"
                >
                  <span className="text-xs uppercase text-[#D4AF37] tracking-widest font-mono">Lv. 01 / Newcomer</span>
                  <div>
                    <h3 className="text-xl font-bold uppercase tracking-tight mb-2 text-white">Beginner</h3>
                    <p className="text-xs text-white/60 leading-normal font-light">No prior sparring. Focused on core stance, weight transfer, and general conditioning.</p>
                  </div>
                </button>

                <button 
                  onClick={() => handleAnswerSelect('experience', 'intermediate')}
                  className="p-6 bg-white/[0.02] border border-white/10 hover:border-[#D4AF37] hover:bg-white/[0.04] transition-all text-left flex flex-col justify-between group h-44"
                >
                  <span className="text-xs uppercase text-[#D4AF37] tracking-widest font-mono">Lv. 02 / Combatant</span>
                  <div>
                    <h3 className="text-xl font-bold uppercase tracking-tight mb-2 text-white">Intermediate</h3>
                    <p className="text-xs text-white/60 leading-normal font-light">Understand basic kicks & punches. Ready for active pads drills & playful technical sparring.</p>
                  </div>
                </button>

                <button 
                  onClick={() => handleAnswerSelect('experience', 'advanced')}
                  className="p-6 bg-white/[0.02] border border-white/10 hover:border-[#D4AF37] hover:bg-white/[0.04] transition-all text-left flex flex-col justify-between group h-44"
                >
                  <span className="text-xs uppercase text-[#D4AF37] tracking-widest font-mono">Lv. 03 / Fighter</span>
                  <div>
                    <h3 className="text-xl font-bold uppercase tracking-tight mb-2 text-white">Advanced</h3>
                    <p className="text-xs text-white/60 leading-normal font-light">Comfortable in intense pad cycles, clinching wars, and full-power active sparring.</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* QUESTION 2: BUDGET & COMFORT */}
          {currentQuestion === 1 && (
            <div className="space-y-8 text-left animate-fadeIn">
              <div className="space-y-2">
                <span className="text-xs uppercase text-[#D4AF37] tracking-[0.2em] font-bold">02 / Financial Direction</span>
                <h2 className="text-3xl sm:text-5xl font-light italic serif uppercase">Determine your comfort tier</h2>
                <p className="text-sm text-white/60 font-light">This parameter shapes your accomodation matching and flight categories.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <button 
                  onClick={() => handleAnswerSelect('budget', 'backpacker')}
                  className="p-6 bg-white/[0.02] border border-white/10 hover:border-[#D4AF37] hover:bg-white/[0.04] transition-all text-left flex flex-col justify-between group h-44"
                >
                  <span className="text-xs uppercase text-emerald-400 font-mono tracking-widest">$10 - $20 / Night</span>
                  <div>
                    <h3 className="text-xl font-bold uppercase tracking-tight mb-2 text-white">Backpacker</h3>
                    <p className="text-xs text-white/60 leading-normal font-light">Shared AC pod dorms directly on or next to the training street. High social and community drive.</p>
                  </div>
                </button>

                <button 
                  onClick={() => handleAnswerSelect('budget', 'midrange')}
                  className="p-6 bg-white/[0.02] border border-white/10 hover:border-[#D4AF37] hover:bg-white/[0.04] transition-all text-left flex flex-col justify-between group h-44"
                >
                  <span className="text-xs uppercase text-emerald-400 font-mono tracking-widest">$30 - $70 / Night</span>
                  <div>
                    <h3 className="text-xl font-bold uppercase tracking-tight mb-2 text-white">Mid-Range</h3>
                    <p className="text-xs text-white/60 leading-normal font-light">Private AC bungalows or boutique rooms surrounding active recovery pools. Unrivaled comfort balance.</p>
                  </div>
                </button>

                <button 
                  onClick={() => handleAnswerSelect('budget', 'luxury')}
                  className="p-6 bg-white/[0.02] border border-white/10 hover:border-[#D4AF37] hover:bg-white/[0.04] transition-all text-left flex flex-col justify-between group h-44"
                >
                  <span className="text-xs uppercase text-emerald-400 font-mono tracking-widest">$150 - $250+ / Night</span>
                  <div>
                    <h3 className="text-xl font-bold uppercase tracking-tight mb-2 text-white">Luxury Elite</h3>
                    <p className="text-xs text-white/60 leading-normal font-light">Five-star ocean beachfront villas, cold plunge reserves, premium spa recovery, and gourmet organic meals.</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* QUESTION 3: ISLAND SECLUSION */}
          {currentQuestion === 2 && (
            <div className="space-y-8 text-left animate-fadeIn">
              <div className="space-y-2">
                <span className="text-xs uppercase text-[#D4AF37] tracking-[0.2em] font-bold">03 / Geography & Islands</span>
                <h2 className="text-3xl sm:text-5xl font-light italic serif uppercase">Select your island training base</h2>
                <p className="text-sm text-white/60 font-light">Choose Phuket for legendary camp scale, Samui for relaxed palm forests, or Combo.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <button 
                  onClick={() => handleAnswerSelect('destination', 'phuket')}
                  className="p-6 bg-white/[0.02] border border-white/10 hover:border-[#D4AF37] hover:bg-white/[0.04] transition-all text-left flex flex-col justify-between group h-44"
                >
                  <div className="w-8 h-8 rounded-full bg-orange-600/10 flex items-center justify-center text-orange-500">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold uppercase tracking-tight mb-2 text-white">Phuket</h3>
                    <p className="text-xs text-white/60 leading-normal font-light">Chalong & Rawai. High intensity fight camps. The Soi Ta-iad strip. Giant conditioning facilities.</p>
                  </div>
                </button>

                <button 
                  onClick={() => handleAnswerSelect('destination', 'samui')}
                  className="p-6 bg-white/[0.02] border border-white/10 hover:border-[#D4AF37] hover:bg-white/[0.04] transition-all text-left flex flex-col justify-between group h-44"
                >
                  <div className="w-8 h-8 rounded-full bg-cyan-600/10 flex items-center justify-center text-cyan-400">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold uppercase tracking-tight mb-2 text-white">Koh Samui</h3>
                    <p className="text-xs text-white/60 leading-normal font-light">Chaweng & Lamai. Authentic cozy style, stunning palm runs, peaceful beach vibe, and traditional Krus.</p>
                  </div>
                </button>

                <button 
                  onClick={() => handleAnswerSelect('destination', 'combo')}
                  className="p-6 bg-white/[0.02] border border-white/10 hover:border-[#D4AF37] hover:bg-white/[0.04] transition-all text-left flex flex-col justify-between group h-44"
                >
                  <div className="w-8 h-8 rounded-full bg-purple-600/10 flex items-center justify-center text-purple-400">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold uppercase tracking-tight mb-2 text-white">Grand Island Combo</h3>
                    <p className="text-xs text-white/60 leading-normal font-light font-mono">1 Week Phuket + 1 Week Koh Samui. Perfect comprehensive physical rewrite across both lands.</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* QUESTION 4: COMFORT ACCENT STYLE */}
          {currentQuestion === 3 && (
            <div className="space-y-8 text-left animate-fadeIn">
              <div className="space-y-2">
                <span className="text-xs uppercase text-[#D4AF37] tracking-[0.2em] font-bold">04 / Wellness & Vibe Emphasis</span>
                <h2 className="text-3xl sm:text-5xl font-light italic serif uppercase">What is your primary training accent?</h2>
                <p className="text-sm text-white/60 font-light">We customize your rest cycles and day-to-day timeline to align with this choice.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <button 
                  onClick={() => handleAnswerSelect('comfortAccent', 'training')}
                  className="p-6 bg-white/[0.02] border border-white/10 hover:border-[#D4AF37] hover:bg-white/[0.04] transition-all text-left flex flex-col justify-between group h-44"
                >
                  <div className="w-8 h-8 rounded-full bg-red-600/10 flex items-center justify-center text-red-500">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold uppercase tracking-tight mb-2 text-white">Dedicated Training</h3>
                    <p className="text-xs text-white/60 leading-normal font-light">Double down on conditioning, bagwork technical sessions, and heavy target sparring.</p>
                  </div>
                </button>

                <button 
                  onClick={() => handleAnswerSelect('comfortAccent', 'wellness')}
                  className="p-6 bg-white/[0.02] border border-white/10 hover:border-[#D4AF37] hover:bg-white/[0.04] transition-all text-left flex flex-col justify-between group h-44"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-600/10 flex items-center justify-center text-emerald-400">
                    <Heart className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold uppercase tracking-tight mb-2 text-white">Wellness & Spa</h3>
                    <p className="text-xs text-white/60 leading-normal font-light">Emphasize chemical regeneration: hot volcanic stone baths, cold water plunges, healthy juice bars.</p>
                  </div>
                </button>

                <button 
                  onClick={() => handleAnswerSelect('comfortAccent', 'beach')}
                  className="p-6 bg-white/[0.02] border border-white/10 hover:border-[#D4AF37] hover:bg-white/[0.04] transition-all text-left flex flex-col justify-between group h-44"
                >
                  <div className="w-8 h-8 rounded-full bg-yellow-600/10 flex items-center justify-center text-yellow-400">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold uppercase tracking-tight mb-2 text-white">Beach Relaxation</h3>
                    <p className="text-xs text-white/60 leading-normal font-light">Moderate pace training. Maximize beach sleep, hammock lounge hours, and coconut beach dining.</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* QUESTION 5: ORIGIN CITY */}
          {currentQuestion === 4 && (
            <div className="space-y-8 text-left animate-fadeIn">
              <div className="space-y-2">
                <span className="text-xs uppercase text-[#D4AF37] tracking-[0.2em] font-bold">05 / Flight Coordinates</span>
                <h2 className="text-3xl sm:text-5xl font-light italic serif uppercase">Departure City / Port of Origin</h2>
                <p className="text-sm text-white/60 font-light">Enter your home town so our AI travel desk can estimate flight options.</p>
              </div>

              <div className="space-y-4 pt-4">
                <input 
                  type="text" 
                  value={answers.departureCity} 
                  onChange={(e) => setAnswers({ ...answers, departureCity: e.target.value })}
                  placeholder="e.g. London (LHR), New York (JFK), Sydney (SYD)"
                  className="w-full bg-[#1a1a1a] border border-white/20 p-5 text-lg font-mono focus:outline-none focus:border-[#D4AF37] text-white"
                />

                <div className="flex flex-wrap gap-2 pt-2">
                  {['London (LHR)', 'New York (JFK)', 'Sydney (SYD)', 'Frankfurt (FRA)', 'Singapore (SIN)'].map((city) => (
                    <button 
                      key={city}
                      type="button"
                      onClick={() => setAnswers({ ...answers, departureCity: city })}
                      className="px-4 py-2 bg-white/5 border border-white/10 hover:border-white/30 text-xs font-mono text-white/80 transition"
                    >
                      {city}
                    </button>
                  ))}
                </div>

                <div className="pt-6">
                  <button 
                    onClick={() => handleAnswerSelect('departureCity', answers.departureCity)}
                    className="w-full py-5 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black font-extrabold uppercase tracking-widest text-xs rounded-none transition flex items-center justify-center gap-2 shadow"
                  >
                    Compile Bespoke Package Suggestions
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* LOADING SCREEN WITH PROGRESS SYSTEM */}
      {isLoading && (
        <div className="flex-1 bg-[#121212] flex flex-col items-center justify-center p-6 min-h-[500px]">
          <div className="relative w-24 h-24 mb-8">
            {/* Double outer golden spinning loops */}
            <div className="absolute inset-0 rounded-full border-4 border-[#D4AF37]/10" />
            <div className="absolute inset-0 rounded-full border-4 border-t-[#D4AF37] animate-spin" />
          </div>
          
          <h2 className="text-3xl font-light italic serif text-[#D4AF37] uppercase mb-2">
            Re:start Thailand
          </h2>
          <p className="text-[10px] uppercase tracking-[0.3em] font-mono text-white/40 mb-6">
            Curating Luxury Combative Itinerary
          </p>
          
          <div className="max-w-md w-full px-4 text-center">
            {/* Status updates logs */}
            <p className="text-xs font-mono text-[#D4AF37] transition duration-300 h-6">
              {loadingProgress}
            </p>
            <div className="w-full h-[1px] bg-white/10 my-4" />
            <span className="text-[9px] uppercase tracking-widest text-white/30">
              Generating server-side tailored packages with real-world price models
            </span>
          </div>
        </div>
      )}

      {/* STEP 3: THE RICH EDITORIAL RESULTS VIEW */}
      {step === 'results' && curatedPackage && (
        <div className="flex-1 w-full bg-[#121212] flex flex-col">
          
          {/* USER PROFILE MINISTAT BANNER */}
          <div className="px-6 sm:px-10 py-5 bg-white/[0.02] border-b border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 sm:gap-8">
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-[0.2em] opacity-40 mb-1">Strikers Level</span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" /> {answers.experience}
                </span>
              </div>
              <div className="hidden sm:block w-[1px] h-6 bg-white/10"></div>
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-[0.2em] opacity-40 mb-1">Target Budget</span>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  {answers.budget === 'backpacker' ? 'Backpacker' : answers.budget === 'midrange' ? 'Mid-Range' : 'Luxury Elite'}
                </span>
              </div>
              <div className="hidden sm:block w-[1px] h-6 bg-white/10"></div>
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-[0.2em] opacity-40 mb-1">Vibe Accent</span>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  {answers.comfortAccent === 'training' ? 'Striking Focus' : answers.comfortAccent === 'wellness' ? 'Wellness Rest' : 'Beach Relaxation'}
                </span>
              </div>
              <div className="hidden sm:block w-[1px] h-6 bg-white/10"></div>
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-[0.2em] opacity-40 mb-1">Ports of flight</span>
                <span className="text-xs font-bold uppercase tracking-wider font-mono text-white/90">
                  {answers.departureCity}
                </span>
              </div>
            </div>

            <div className="text-left md:text-right">
              <span className="text-[9px] uppercase tracking-[0.2em] opacity-40">Matched Island Base</span>
              <div className="text-lg font-light italic serif text-white">
                {answers.destination === 'phuket' ? 'Phuket Island' : answers.destination === 'samui' ? 'Koh Samui Island' : 'Phuket-Samui Combo Split'}
              </div>
            </div>
          </div>

          {/* MAIN COLUMN SYSTEM */}
          <div className="flex-1 max-w-7xl mx-auto w-full px-6 sm:px-10 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LIKED COMPONENT: THE LEFT HERO EDITORIAL CARD */}
            <div className="col-span-1 lg:col-span-7 space-y-6">

              {/* THE ESSENTIAL ITEMS PROMPT BANNER */}
              {!hasGearPromptAnswered && activeTab !== 'shop' && (
                <div className="bg-gradient-to-r from-red-950/40 to-[#1a1c1d] border border-red-500/30 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden animate-fadeIn">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="space-y-1.5 text-left max-w-md z-15">
                    <span className="text-[9px] uppercase tracking-widest text-[#D4AF37] font-mono font-bold flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-[#D4AF37]" /> ESSENTIAL MUAY THAI GEAR CHECKLIST
                    </span>
                    <h4 className="text-lg font-bold uppercase tracking-tight text-white italic serif">
                      Do you have your training gear?
                    </h4>
                    <p className="text-[11px] text-white/70 leading-relaxed font-light">
                      To train safely and respect camp etiquette in Thailand, you are required to have traditional **Muay Thai shorts**, **boxing gloves**, and protective **hand wraps**. Do you currently own these?
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 shrink-0 z-10 w-full sm:w-auto">
                    <button
                      onClick={() => {
                        setHasGearPromptAnswered(true);
                        setUserHasGear(true);
                      }}
                      className="px-4 py-2.5 bg-white/5 border border-white/10 text-white hover:bg-white/10 text-xs font-bold uppercase tracking-widest transition"
                    >
                      Yes, equipped
                    </button>
                    <button
                      onClick={() => {
                        setHasGearPromptAnswered(true);
                        setUserHasGear(false);
                        setActiveTab('shop');
                      }}
                      className="px-4 py-2.5 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black text-xs font-extrabold uppercase tracking-widest transition shadow-lg flex items-center justify-center gap-1"
                    >
                      No, buy gear
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
              
              {/* TAB 1: CURATED DETAILED OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="bg-[#1a1a1a] border border-white/10 flex flex-col relative overflow-hidden p-6 sm:p-10">
                  <div className="absolute top-6 right-6 bg-[#D4AF37] text-black px-4 py-1 text-[10px] font-extrabold uppercase tracking-widest shadow z-10">
                    Best Match
                  </div>

                  {/* Wide Premium Island Banner */}
                  <div className="w-full h-48 md:h-60 overflow-hidden relative mb-8 rounded-lg border border-white/5">
                    <img 
                      src={
                        answers.destination === 'phuket' 
                          ? 'https://images.unsplash.com/photo-1528181304800-2f1702413221?auto=format&fit=crop&q=80&w=1200' 
                          : answers.destination === 'samui'
                          ? 'https://images.unsplash.com/photo-1540974163-36de903a4cd2?auto=format&fit=crop&q=80&w=1200'
                          : 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200'
                      }
                      alt="Thailand Island Landscape Resort Banner"
                      className="w-full h-full object-cover brightness-[0.85]"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#161616] via-transparent to-transparent flex flex-col justify-end p-6">
                      <span className="text-[10px] uppercase tracking-[0.25em] text-[#D4AF37] font-semibold font-mono">
                        DESTINATION PARADISE
                      </span>
                      <h3 className="text-2xl sm:text-4xl font-light italic serif text-white uppercase mt-1">
                        {answers.destination === 'phuket' 
                          ? 'Phuket Coastal Base' 
                          : answers.destination === 'samui' 
                          ? 'Koh Samui Sanctuary' 
                          : 'Phuket & Koh Samui Combo Sabbatical'}
                      </h3>
                    </div>
                  </div>

                  <div className="mb-6">
                    <span className="text-[10px] tracking-[0.25em] uppercase text-[#D4AF37] font-mono block mb-2">
                      YOUR EXCLUSIVE RE:START RETREAT
                    </span>
                    <h2 className="text-3xl sm:text-5xl font-light mb-4 leading-none italic serif uppercase text-white">
                      The {answers.experience === 'beginner' ? 'Tropical Restart' : answers.experience === 'intermediate' ? 'Striking Combatant' : 'Elite Gladiator'}
                    </h2>
                    
                    <p className="text-sm font-light text-white/70 leading-relaxed pt-2 border-t border-white/10">
                      {curatedPackage.recommendationReason}
                    </p>
                  </div>

                  {/* ACTIVE CONFIGURATION PREVIEWS WITH ACTIVE SWAP LABELS */}
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-3 gap-2">
                      <div>
                        <span className="text-[10px] uppercase font-semibold tracking-widest opacity-40 block mb-1">Muay Thai Gym</span>
                        <span className="text-sm font-semibold tracking-tight text-white flex items-center gap-1.5">
                          <Flame className="w-4 h-4 text-[#f97316]" /> {selectedGym ? selectedGym.name : 'Not selected'}
                        </span>
                      </div>
                      <button 
                        onClick={() => setActiveTab('gyms')} 
                        className="text-[10px] uppercase tracking-widest text-[#D4AF37] border-b border-[#D4AF37]/30 hover:border-[#D4AF37] transition font-bold"
                      >
                        Swap Gym
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-3 gap-2">
                      <div>
                        <span className="text-[10px] uppercase font-semibold tracking-widest opacity-40 block mb-1">Selected Lodging</span>
                        <span className="text-sm font-semibold tracking-tight text-white flex items-center gap-1.5">
                          <Hotel className="w-4 h-4 text-[#06b6d4]" /> {selectedAccommodation ? selectedAccommodation.name : 'Not selected'}
                        </span>
                      </div>
                      <button 
                        onClick={() => setActiveTab('stays')} 
                        className="text-[10px] uppercase tracking-widest text-[#D4AF37] border-b border-[#D4AF37]/30 hover:border-[#D4AF37] transition font-bold"
                      >
                        Swap Lodgings
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-3 gap-2">
                      <div>
                        <span className="text-[10px] uppercase font-semibold tracking-widest opacity-40 block mb-1">Estimated Flights</span>
                        <span className="text-sm font-semibold tracking-tight text-white flex items-center gap-1.5">
                          <Plane className="w-4 h-4 text-emerald-400" /> {selectedFlight ? `${selectedFlight.airline} (${selectedFlight.duration})` : 'Not configured'}
                        </span>
                      </div>
                      <button 
                        onClick={() => setActiveTab('flights')} 
                        className="text-[10px] uppercase tracking-widest text-[#D4AF37] border-b border-[#D4AF37]/30 hover:border-[#D4AF37] transition font-bold"
                      >
                        Modify Cities
                      </button>
                    </div>
                  </div>

                  {/* SAVINGS & HEALTH PROTOCOLS ACCENT */}
                  <div className="bg-white/[0.02] border border-white/5 p-4 rounded-none mt-6 space-y-2">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-white/40 flex items-center gap-1">
                      <Info className="w-3.5 h-3.5 text-[#D4AF37]" /> Inside Traveler Pro Tips:
                    </span>
                    <ul className="text-xs text-white/60 space-y-1.5 list-disc list-inside font-light">
                      {curatedPackage.costSummary.savingTips.map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>

                </div>
              )}

              {/* TAB 2: ACTIVE GYM LIST FOR INTERACTIVE SWAPPING */}
              {activeTab === 'gyms' && (
                <div className="space-y-6">
                  {focusedGym ? (
                    <div className="space-y-6 animate-fadeIn text-left">
                      {/* Back Button & Header */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4">
                        <button
                          onClick={() => setFocusedGym(null)}
                          className="flex items-center gap-1.5 text-xs text-white/60 hover:text-[#D4AF37] transition font-mono uppercase tracking-wider"
                        >
                          <ArrowLeft className="w-4 h-4 text-[#D4AF37]" /> Back to partners list
                        </button>
                        
                        <button
                          onClick={() => setSelectedGym(focusedGym)}
                          className={`px-4 py-2 text-[10px] uppercase tracking-widest font-mono font-extrabold flex items-center justify-center gap-1.5 transition-all ${
                            selectedGym?.id === focusedGym.id
                              ? 'bg-[#D4AF37] text-black font-semibold'
                              : 'bg-white text-black hover:bg-[#D4AF37]'
                          }`}
                        >
                          {selectedGym?.id === focusedGym.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 stroke-[3]" /> Selected Gym
                            </>
                          ) : (
                            <>
                              <Compass className="w-3.5 h-3.5" /> Select & Apply to Package
                            </>
                          )}
                        </button>
                      </div>

                      {/* Title & Core Meta */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] bg-white/10 text-white px-2 py-0.5 rounded uppercase tracking-wider font-mono">
                            {focusedGym.island} Partner
                          </span>
                          <span className="text-[10px] bg-[#D4AF37]/10 text-[#D4AF37] px-2 py-0.5 rounded uppercase tracking-wider font-mono">
                            {focusedGym.typicalCost}
                          </span>
                        </div>
                        <h3 className="text-3xl sm:text-4xl font-light italic serif text-white uppercase mt-1">
                          {focusedGym.name}
                        </h3>
                        <p className="text-xs text-white/50 flex items-center gap-1.5 mt-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#ea580c] shrink-0" /> {focusedGym.location}
                        </p>
                      </div>

                      {/* Hero Image Block */}
                      <div className="w-full h-56 sm:h-72 overflow-hidden relative rounded-lg border border-white/10">
                        <img
                          src={focusedGym.imageUrl || 'https://images.unsplash.com/photo-1544033527-b192daee1f5b?auto=format&fit=crop&q=80&w=800'}
                          alt={focusedGym.name}
                          className="w-full h-full object-cover brightness-95"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#161616] via-transparent to-transparent" />
                      </div>

                      {/* INITIAL RATING SECTION & CLASSIFICATIONS BADGES */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-black/40 border border-white/10 p-5 rounded-lg">
                        {/* Rating block & Difficulty */}
                        <div className="space-y-4">
                          {/* User Evaluation */}
                          <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                            <span className="text-[10px] uppercase font-mono tracking-wider text-white/40 block text-left">
                              Guest Satisfaction:
                            </span>
                            <div className="flex items-center gap-1.5">
                              <div className="flex gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3.5 h-3.5 ${
                                      i < Math.floor(focusedGym.rating || 4)
                                        ? 'text-[#D4AF37] fill-[#D4AF37]'
                                        : 'text-white/20'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs font-mono font-bold text-white">
                                {focusedGym.rating.toFixed(1)} / 5.0
                              </span>
                            </div>
                          </div>

                          {/* Difficulty Levels */}
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] uppercase font-mono tracking-wider text-white/40 block text-left">
                              Combat Challenge Level:
                            </span>
                            <div className="flex items-center gap-1.5">
                              <div className="flex gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Flame
                                    key={i}
                                    className={`w-3.5 h-3.5 ${
                                      i < (focusedGym.difficulty || 4)
                                        ? 'text-red-500 fill-red-500 animate-pulse'
                                        : 'text-white/20'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs font-mono font-bold text-red-400">
                                {focusedGym.difficulty === 2 ? 'Light (2/5)' : focusedGym.difficulty === 3 ? 'Medium (3/5)' : focusedGym.difficulty === 4 ? 'Intense (4/5)' : 'Hardcore (5/5)'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Keyword Classifications */}
                        <div className="flex flex-col justify-center space-y-2 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-5">
                          <span className="text-[10px] text-white/40 uppercase font-mono tracking-wider mb-1 block text-left">
                            Gym Classifications & Highlights:
                          </span>
                          <div className="flex flex-wrap gap-1.5 justify-start">
                            {(focusedGym.keywords || ['Beginner friendly', 'Professional']).map((word) => (
                              <span
                                key={word}
                                className="px-2.5 py-1 bg-[#D4AF37]/5 border border-[#D4AF37]/25 text-[9px] uppercase tracking-wider font-mono text-[#D4AF37] rounded font-semibold"
                              >
                                {word}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Editorial Story narrative & Testimonial details */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
                        {/* Summary & Testimonial column */}
                        <div className="space-y-6">
                          <div className="space-y-3">
                            <h4 className="text-sm font-mono uppercase tracking-widest text-white/50 border-b border-white/5 pb-1">
                              Editorial Summary
                            </h4>
                            <p className="text-sm text-white/80 leading-relaxed font-light">
                              {focusedGym.detailedSummary || focusedGym.description}
                            </p>
                          </div>

                          {/* Testimonial card */}
                          {focusedGym.testimonial && (
                            <div className="bg-[#1b1c1d] border border-white/5 p-5 relative overflow-hidden">
                              <span className="text-5xl text-[#D4AF37]/15 font-serif absolute top-1 left-2 pointer-events-none select-none">“</span>
                              <p className="text-xs sm:text-sm text-white/90 leading-relaxed italic relative z-10 pl-4">
                                &ldquo;{focusedGym.testimonial.quote}&rdquo;
                              </p>
                              <div className="mt-3 text-right pr-2">
                                <span className="text-[9px] uppercase font-mono tracking-wider text-[#D4AF37] font-semibold">
                                  — {focusedGym.testimonial.author}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Schedule & Interactive Maps column */}
                        <div className="space-y-6">
                          {/* Schedule array and amenities */}
                          <div className="bg-white/5 p-5 border border-white/10 rounded-lg space-y-4">
                            <h4 className="text-xs font-mono uppercase tracking-widest text-[#D4AF37] font-bold border-b border-white/5 pb-1.5 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" /> Regular Daily Sequence
                            </h4>
                            
                            <ul className="space-y-2.5 text-xs">
                              {(focusedGym.schedule || ['08:00 AM - Striking Camp', '04:00 PM - Techniques Sessions']).map((sch, index) => (
                                <li key={index} className="flex gap-2.5 items-start">
                                  <span className="text-emerald-400 font-mono font-semibold shrink-0">✓</span>
                                  <span className="text-white/80 font-light leading-snug">{sch}</span>
                                </li>
                              ))}
                            </ul>
                            
                            <div className="pt-3 border-t border-white/5 space-y-2">
                              <p className="text-[10px] font-mono uppercase tracking-wider text-white/40">Amenity inclusions:</p>
                              <div className="flex flex-wrap gap-1.5">
                                {focusedGym.amenities.map((am) => (
                                  <span key={am} className="text-[9px] px-2 py-0.5 bg-black/40 border border-white/5 text-white/60">
                                    {am}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Google Maps pseudo-interactive visualization */}
                          <div className="bg-black/50 border border-white/15 p-4 rounded-lg space-y-4">
                            <div className="flex gap-2 items-start text-xs">
                              <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                              <div>
                                <p className="text-[9px] text-white/50 uppercase font-mono tracking-wider leading-none">OFFICIAL ADDRESS</p>
                                <p className="text-xs text-white font-medium mt-1 leading-normal">{focusedGym.googleMapsAddress}</p>
                              </div>
                            </div>
                            
                            {/* Pseudo-tactical visual Map */}
                            <div className="h-44 bg-[#111] border border-white/5 rounded relative overflow-hidden flex items-center justify-center group/map">
                              <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px]" />
                              <div className="absolute top-1/2 left-0 right-0 h-px bg-white/5 pointer-events-none" />
                              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/5 pointer-events-none" />
                              
                              <div className="absolute w-24 h-24 rounded-full border border-[#D4AF37]/20 animate-ping duration-[3000ms]" />
                              
                              <div className="absolute flex flex-col items-center">
                                <div className="bg-[#D4AF37] text-black text-[9px] uppercase font-mono px-2 py-0.5 rounded font-extrabold shadow-lg shadow-black/80 flex items-center gap-1 z-10 whitespace-nowrap">
                                  <MapPin className="w-3 h-3 text-black fill-black" /> {focusedGym.name}
                                </div>
                                <div className="w-2.5 h-2.5 bg-[#D4AF37] rounded-full border-2 border-black shadow mt-1 animate-pulse" />
                              </div>

                              <div className="absolute bottom-2 left-2 bg-black/80 border border-white/10 px-2 py-0.5 rounded text-[8px] text-emerald-400 font-mono">
                                GPS Coordinates: {focusedGym.island === 'Phuket' ? '7.8286° N, 98.3378° E' : '9.5298° N, 99.9922° E'}
                              </div>
                              
                              <a 
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(focusedGym.name + ' ' + focusedGym.location)}`}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="absolute bottom-2 right-2 bg-black/80 hover:bg-[#D4AF37] hover:text-black hover:border-[#D4AF37] border border-white/10 px-2 py-1 rounded text-[8px] uppercase tracking-wider font-mono text-white flex items-center gap-1 transition-all"
                              >
                                Google Maps <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Apply & Back actions block at bottom */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-white/5 justify-between">
                        <button
                          onClick={() => setFocusedGym(null)}
                          className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-bold uppercase tracking-widest transition"
                        >
                          Back to Gym partners list
                        </button>
                        
                        <button
                          onClick={() => {
                            setSelectedGym(focusedGym);
                            setFocusedGym(null); // Direct back to dashboard after selection
                          }}
                          className="px-6 py-3 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black text-xs font-extrabold uppercase tracking-widest transition shadow-lg flex items-center justify-center gap-1.5"
                        >
                          <Check className="w-4 h-4 stroke-[3]" /> Selected and Return
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-end border-b border-white/10 pb-2">
                        <div>
                          <h3 className="text-2xl font-light italic serif text-white">Muay Thai Gym Partners</h3>
                          <p className="text-xs text-white/50">Click &quot;Select and Apply to Package&quot; to instant recalculate pricing.</p>
                        </div>
                        <span className="text-[10px] uppercase tracking-widest font-mono text-white/40">
                          {availableGyms.length} options located
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {availableGyms.map((gym) => {
                          const isCurrentlySelected = selectedGym?.id === gym.id;
                          return (
                            <div 
                              key={gym.id}
                              onClick={() => setSelectedGym(gym)}
                              className={`group border transition-all duration-300 cursor-pointer flex flex-col overflow-hidden bg-[#1a1a1a] rounded-lg ${
                                isCurrentlySelected 
                                  ? 'border-[#D4AF37] shadow-lg shadow-[#D4AF37]/10' 
                                  : 'border-white/10 hover:border-white/20'
                              }`}
                            >
                              {/* Rich Gym Card header image */}
                              <div className="h-44 w-full overflow-hidden relative">
                                <img 
                                  src={gym.imageUrl || 'https://images.unsplash.com/photo-1544033527-b192daee1f5b?auto=format&fit=crop&q=80&w=800'} 
                                  alt={gym.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent flex flex-col justify-between p-4">
                                  <span className="text-[9px] uppercase tracking-widest bg-black/70 backdrop-blur-sm self-start px-2 py-1 text-[#D4AF37] font-mono rounded">
                                    {gym.island}
                                  </span>
                                  <span className="text-xs font-semibold bg-black/70 backdrop-blur-sm self-end px-2 py-1 rounded text-[#D4AF37] font-mono">
                                    ★ {gym.rating.toFixed(1)}
                                  </span>
                                </div>
                              </div>

                              <div className="p-6 flex-1 flex flex-col justify-between space-y-4 text-left">
                                <div>
                                  <h4 className="text-xl font-bold uppercase tracking-tight text-white mb-2 group-hover:text-[#D4AF37] transition">{gym.name}</h4>
                                  <p className="text-[11px] font-mono text-white/40 flex items-center gap-1 mb-3">
                                    <MapPin className="w-3.5 h-3.5 text-[#ea580c]" /> {gym.location}
                                  </p>
                                  <p className="text-xs text-white/70 font-light line-clamp-3 leading-relaxed">{gym.description}</p>
                                </div>

                                <div className="pt-4 border-t border-white/5 flex justify-between items-center mt-auto gap-2">
                                  <div>
                                    <p className="text-[9px] uppercase tracking-widest opacity-40 leading-none mb-1">Rates Package</p>
                                    <span className="text-sm font-bold text-white font-mono">{gym.typicalCost}</span>
                                  </div>
                                  
                                  <div className="flex gap-1.5 shrink-0 z-10">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setFocusedGym(gym);
                                      }}
                                      className="text-[10px] uppercase font-bold tracking-widest px-3 py-2 border border-white/20 text-white hover:bg-white/5 hover:border-white/40 transition-all font-mono"
                                    >
                                      Gym details
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedGym(gym);
                                      }}
                                      className={`text-[10px] uppercase font-bold tracking-widest px-3 py-2 transition-all font-mono ${
                                        isCurrentlySelected 
                                          ? 'bg-[#D4AF37] text-black font-semibold' 
                                          : 'border border-white/20 text-white hover:bg-white/5'
                                      }`}
                                    >
                                      {isCurrentlySelected ? 'Selected' : 'Select'}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* TAB 3: ACCOMMODATIONS FOR INTERACTIVE SWAPPING */}
              {activeTab === 'stays' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-end border-b border-white/10 pb-2">
                    <div>
                      <h3 className="text-2xl font-light italic serif text-white">Tropical Stays & Camps Lodgings</h3>
                      <p className="text-xs text-white/50">Click on any resort tier below to swap. Your weekly package rates tally live.</p>
                    </div>
                    <span className="text-[10px] uppercase tracking-widest font-mono text-white/40">
                      {availableAccommodations.length} properties
                    </span>
                  </div>

                  <div className="space-y-6">
                    {availableAccommodations.map((stay) => {
                      const isCurrentlySelected = selectedAccommodation?.id === stay.id;
                      return (
                        <div 
                          key={stay.id}
                          onClick={() => setSelectedAccommodation(stay)}
                          className={`group border transition-all duration-300 cursor-pointer flex flex-col md:flex-row justify-between overflow-hidden bg-[#1a1a1a] rounded-lg ${
                            isCurrentlySelected 
                              ? 'border-[#D4AF37] shadow-lg shadow-[#D4AF37]/5' 
                              : 'border-white/10 hover:border-white/20'
                          }`}
                        >
                          {/* Stay Image with responsive sizing */}
                          <div className="w-full md:w-56 h-48 md:h-auto overflow-hidden relative flex-shrink-0">
                            <img 
                              src={stay.imageUrl || 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=800'} 
                              alt={stay.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                              <span className="text-[9px] uppercase tracking-widest bg-black/70 backdrop-blur-sm px-2 py-0.5 text-cyan-300 font-mono rounded">
                                {stay.comfortLevel}
                              </span>
                            </div>
                          </div>

                          <div className="flex-1 p-6 space-y-3 flex flex-col justify-between">
                            <div>
                              <div className="flex flex-wrap gap-2 items-center mb-1.5">
                                <span className="text-[9px] uppercase tracking-widest bg-[#f97316]/20 px-2 py-0.5 text-amber-500 font-bold rounded">
                                  {stay.distanceToGym} from camp
                                </span>
                              </div>
                              <h4 className="text-xl font-semibold text-white uppercase tracking-tight group-hover:text-[#D4AF37] transition">{stay.name}</h4>
                              <p className="text-[10px] font-mono text-white/40">{stay.type}</p>
                              <p className="text-xs text-white/70 font-light mt-2 leading-relaxed">{stay.description}</p>
                            </div>
                            
                            <div className="flex flex-wrap gap-1.5 pt-2">
                              {stay.features.map((feat, i) => (
                                <span key={i} className="text-[10px] px-2 py-0.5 bg-white/5 border border-white/5 text-white/60 font-serif italic">
                                  {feat}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="w-full md:w-40 flex flex-row md:flex-col justify-between items-end text-right border-t md:border-t-0 md:border-l border-white/10 p-6 md:pl-6 bg-black/[0.1]">
                            <div>
                              <p className="text-[9px] uppercase tracking-widest opacity-40 mb-1">Nightly Cost</p>
                              <span className="text-2xl font-light italic serif text-[#D4AF37]">${stay.costPerNight}</span>
                              <p className="text-[9px] text-white/50 mt-1 font-mono">${stay.costPerNight * 7} / week</p>
                            </div>

                            <button className={`text-[10px] uppercase font-bold tracking-widest w-full py-2 text-center border mt-4 transition duration-300 ${
                              isCurrentlySelected ? 'bg-[#D4AF37] text-black border-[#D4AF37]' : 'border-white/20 text-white hover:bg-white/5'
                            }`}>
                              {isCurrentlySelected ? 'Selected' : 'Swap In'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 4: FLIGHT CALIBRATOR */}
              {activeTab === 'flights' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-end border-b border-white/10 pb-2">
                    <div>
                      <h3 className="text-2xl font-light italic serif text-white">Flight Desk & Origin configuration</h3>
                      <p className="text-xs text-white/50">Change your city of origin to retrieve accurate travel rates.</p>
                    </div>
                  </div>

                  <div className="p-6 bg-[#1a1a1a] border border-white/10 space-y-6">
                    <form onSubmit={handleCustomCitySubmit} className="space-y-4">
                      <label className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold block">
                        Airport Departure City (Port of Origin)
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={customCityInput} 
                          onChange={(e) => setCustomCityInput(e.target.value)}
                          className="flex-1 bg-black border border-white/20 p-3 font-mono text-sm focus:outline-none focus:border-[#D4AF37]"
                          placeholder="e.g. Frankfurt (FRA), Paris (CDG)"
                        />
                        <button 
                          type="submit"
                          disabled={isUpdatingFlight}
                          className="px-6 bg-white text-black font-extrabold uppercase tracking-widest text-[10px] transition hover:bg-[#D4AF37]"
                        >
                          {isUpdatingFlight ? 'Mapping...' : 'Update Flights'}
                        </button>
                      </div>
                    </form>

                    <div className="h-[1px] bg-white/10" />

                    <div className="space-y-4 text-left">
                      <span className="text-[10px] uppercase tracking-widest text-white/40 block">
                        Drawn Flight Estimates to {curatedPackage.suggestedFlights[0]?.destinationCity || 'Thailand'}
                      </span>
                      
                      <div className="p-4 bg-black border border-white/5 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-xs font-mono text-[#D4AF37] uppercase">{selectedFlight?.airline}</span>
                            <h4 className="text-lg font-bold text-white mt-1">
                              {answers.departureCity} to {selectedFlight?.destinationCity}
                            </h4>
                          </div>
                          <span className="text-2xl font-light italic text-emerald-400 serif">
                            ${selectedFlight?.averagePriceUsd} USD
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-xs font-mono text-white/60">
                          <div>
                            <span className="text-[9px] uppercase opacity-40 block">Trip Style</span>
                            <span>{selectedFlight?.connections}</span>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase opacity-40 block">Est Duration</span>
                            <span>{selectedFlight?.duration}</span>
                          </div>
                        </div>

                        <p className="text-[10px] text-white/40 italic pt-2 border-t border-white/5 font-serif">
                          * {selectedFlight?.seasonalNote}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: DAILY DAY-BY-DAY SCHEDULER */}
              {activeTab === 'itinerary' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-end border-b border-white/10 pb-2">
                    <div>
                      <h3 className="text-2xl font-light italic serif text-white">The 7-Day Re:start Timeline</h3>
                      <p className="text-xs text-white/50 font-light">Custom sequenced to align physical exertion and recovery states.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {curatedPackage.itinerary.map((day) => (
                      <div key={day.dayNum} className="border border-white/10 bg-[#1a1a1a] p-6 lg:p-8 space-y-4">
                        <div className="flex justify-between items-center border-b border-white/5 pb-3">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-[#D4AF37]/10 flex items-center justify-center font-mono text-xs text-[#D4AF37] font-bold">
                              0{day.dayNum}
                            </span>
                            <h4 className="text-xl font-medium tracking-tight text-white uppercase italic serif">
                              {day.title}
                            </h4>
                          </div>
                          <span className="text-[9px] font-mono uppercase bg-white/5 px-2 py-0.5 text-[#D4AF37]">
                            Day {day.dayNum} Planner
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-left pt-2">
                          <div>
                            <span className="text-[9px] uppercase tracking-widest text-[#ea580c] font-bold block mb-1">
                              ☼ Morning Session
                            </span>
                            <p className="text-white/85 leading-relaxed font-light">{day.morning}</p>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase tracking-widest text-cyan-400 font-bold block mb-1">
                              ☊ Midday Recovery
                            </span>
                            <p className="text-white/85 leading-relaxed font-light">{day.afternoon}</p>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase tracking-widest text-[#D4AF37] font-bold block mb-1">
                              ☾ Evening Combat flow
                            </span>
                            <p className="text-white/85 leading-relaxed font-light">{day.evening}</p>
                          </div>
                        </div>

                        <div className="mt-4 bg-white/[0.02] border-t border-dashed border-white/10 pt-3 flex items-start gap-2">
                          <span className="text-[9px] uppercase bg-[#D4AF37] text-black font-semibold px-2 py-0.5 block mt-0.5">
                            Kru Tip
                          </span>
                          <p className="text-[11px] text-[#D4AF37] font-mono leading-relaxed italic">
                            &quot;{day.tips}&quot;
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: PREMIUM GEAR SHOP */}
              {activeTab === 'shop' && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Shop header */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10 pb-4 gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
                        <h3 className="text-3xl font-light italic serif text-white uppercase">The Gear Pavilion</h3>
                      </div>
                      <p className="text-xs text-white/50 font-light mt-1">Official combat accessories from Thailand's premier elite brands.</p>
                    </div>

                    {/* Cart Status Badge */}
                    <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/20 p-2 sm:px-4 flex items-center gap-3 font-mono text-xs text-[#D4AF37]">
                      <ShoppingCart className="w-4 h-4 text-[#D3AF37]" />
                      <span>Bundle Cart: {cart.length} items (${shopGearCost})</span>
                    </div>
                  </div>

                  {/* Filter controls */}
                  <div className="bg-black/30 border border-white/5 p-4 flex flex-wrap gap-4 items-center justify-between text-xs">
                    
                    {/* Brand filters */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-mono tracking-wider opacity-50 flex items-center gap-1">
                        <Filter className="w-3 h-3" /> Brand:
                      </span>
                      <div className="flex gap-1.5 flex-wrap">
                        {['All', 'Fairtex', 'Primo', 'Yokkao'].map((b) => (
                          <button
                            key={b}
                            onClick={() => setSelectedBrand(b as any)}
                            className={`px-3 py-1 text-[10px] uppercase font-bold tracking-widest transition ${
                              selectedBrand === b
                                ? 'bg-[#D4AF37] text-black'
                                : 'bg-white/5 text-white/70 hover:bg-white/10'
                            }`}
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Type filters */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-mono tracking-wider opacity-50">Type:</span>
                      <div className="flex gap-1.5 flex-wrap">
                        {['All', 'shorts', 'gloves', 'wraps'].map((t) => (
                          <button
                            key={t}
                            onClick={() => setSelectedType(t as any)}
                            className={`px-3 py-1 text-[10px] uppercase font-bold tracking-widest transition ${
                              selectedType === t
                                ? 'bg-white text-black'
                                : 'bg-white/5 text-white/70 hover:bg-white/10'
                            }`}
                          >
                            {t === 'All' ? 'All Gear' : t === 'shorts' ? 'Shorts' : t === 'gloves' ? 'Gloves' : 'Wraps'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bundled Items Cart Section */}
                  {cart.length > 0 && (
                    <div className="p-4 bg-[#D4AF37]/5 border border-[#D4AF37]/20 space-y-3 animate-fadeIn">
                      <h4 className="text-[10px] uppercase font-mono tracking-widest text-[#D4AF37] font-bold">
                        Your Bundled Combat Gear:
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        {cart.map((cartItem) => (
                          <div key={cartItem.id} className="bg-black/60 p-3 border border-white/5 flex justify-between items-center">
                            <div>
                              <span className="font-bold text-[#D4AF37]">{cartItem.item.brand}</span>
                              <p className="text-white font-medium">{cartItem.item.name}</p>
                              <span className="text-[10px] text-white/40 font-mono">
                                Size: {cartItem.size} / Color: {cartItem.color}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold font-mono text-[#D4AF37]">${cartItem.item.price}</span>
                              <button
                                onClick={() => removeFromCart(cartItem.id)}
                                className="text-red-400 hover:text-red-300 font-mono text-[10px] uppercase underline tracking-wider"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Products Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredItems.map((item) => {
                      // Separate states for size and color selectors per product
                      const itemSizeKey = `size_${item.id}`;
                      const itemColorKey = `color_${item.id}`;
                      const chosenSize = productSelections[itemSizeKey] || item.sizes[0];
                      const chosenColor = productSelections[itemColorKey] || item.colors[0];

                      const isAlreadyInCart = cart.some(
                        (cartItem) => cartItem.item.id === item.id && cartItem.size === chosenSize && cartItem.color === chosenColor
                      );

                      return (
                        <div key={item.id} className="bg-[#1a1a1a] border border-white/10 overflow-hidden flex flex-col justify-between group transition-all hover:border-[#D4AF37]/30">
                          
                          {/* Image Container */}
                          <div className="h-44 w-full relative overflow-hidden bg-black/40 border-b border-white/5">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute top-3 left-3 bg-black/80 border border-white/10 text-[#D4AF37] px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest">
                              {item.brand}
                            </div>
                            <div className="absolute top-3 right-3 bg-black/80 border border-white/10 text-emerald-400 px-2.5 py-0.5 text-xs font-mono font-bold">
                              ${item.price} USD
                            </div>
                          </div>

                          {/* Content Container */}
                          <div className="p-5 flex-1 flex flex-col justify-between space-y-4 text-left">
                            <div className="space-y-1">
                              <span className="text-[9px] uppercase tracking-widest text-[#D4AF37] font-mono block">
                                {item.type === 'shorts' ? 'Authentic Shorts' : item.type === 'gloves' ? 'Boxing Gloves' : 'Metacarpal Wraps'}
                              </span>
                              <h4 className="text-lg font-bold text-white tracking-tight uppercase leading-snug">
                                {item.name}
                              </h4>
                              <p className="text-xs text-white/50 leading-relaxed font-light">
                                {item.description}
                              </p>
                            </div>

                            {/* Dropdowns / Buttons for Selector */}
                            <div className="space-y-3 pt-2 border-t border-white/5 text-xs text-white">
                              {/* Color selector */}
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] text-white/40 uppercase font-mono">Select Color:</span>
                                <div className="flex gap-1">
                                  {item.colors.map((c) => (
                                    <button
                                      key={c}
                                      onClick={() => setProductSelection(itemColorKey, c)}
                                      className={`px-2 py-0.5 text-[9px] font-bold border transition ${
                                        chosenColor === c
                                          ? 'bg-white text-black border-white'
                                          : 'bg-transparent text-white/60 border-white/10 hover:border-white/30'
                                      }`}
                                    >
                                      {c.split(' ')[0]}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Size Selector */}
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] text-white/40 uppercase font-mono">Select Size:</span>
                                <div className="flex gap-1">
                                  {item.sizes.map((s) => (
                                    <button
                                      key={s}
                                      onClick={() => setProductSelection(itemSizeKey, s)}
                                      className={`px-2 py-0.5 text-[9px] font-bold border transition ${
                                        chosenSize === s
                                          ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                                          : 'bg-transparent text-white/60 border-white/10 hover:border-white/30'
                                      }`}
                                    >
                                      {s}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Add to package CTA */}
                            <button
                              onClick={() => {
                                if (isAlreadyInCart) {
                                  const matchingCartItem = cart.find(
                                    (ci) => ci.item.id === item.id && ci.size === chosenSize && ci.color === chosenColor
                                  );
                                  if (matchingCartItem) removeFromCart(matchingCartItem.id);
                                } else {
                                  addToCart(item, chosenSize, chosenColor);
                                }
                              }}
                              className={`w-full py-3.5 text-[10px] font-mono uppercase tracking-widest font-extrabold flex items-center justify-center gap-1.5 transition ${
                                isAlreadyInCart
                                  ? 'bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20'
                                  : 'bg-white text-black hover:bg-[#D4AF37] hover:text-black'
                              }`}
                            >
                              {isAlreadyInCart ? (
                                <>
                                  <X className="w-3.5 h-3.5" /> Remove from Retreat Bundle
                                </>
                              ) : (
                                <>
                                  <ShoppingCart className="w-3.5 h-3.5" /> Bundle with Retreat Package
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              )}

            </div>

            {/* THE RIGHT INTERACTIVE PRICING SIDEBAR SHEET */}
            <div className="col-span-1 lg:col-span-5 space-y-6">

              {/* DYNAMIC PACKAGE CONFIGURATOR BRAND CARD */}
              <div className="bg-[#1a1a1a] border border-white/10 p-6 sm:p-8 space-y-6 text-left animate-fadeIn">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#D4AF37] font-bold">
                    RETREAT SETTINGS
                  </span>
                </div>
                
                <h3 className="text-2xl font-light italic serif uppercase text-white pb-3 border-b border-white/10">
                  Duration & Dates
                </h3>

                {/* DURATION SELECTION SELECTOR */}
                <div className="space-y-3">
                  <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold block">
                    Choose Camp Duration:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {(['1_week', '2_weeks', '1_month'] as const).map((dur) => (
                      <button
                        key={dur}
                        onClick={() => setPackageDuration(dur)}
                        className={`py-3 px-1 text-[10px] font-extrabold uppercase tracking-widest transition border text-center ${
                          packageDuration === dur
                            ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow'
                            : 'bg-black/40 text-white/70 border-white/10 hover:border-white/30'
                        }`}
                      >
                        {dur === '1_week' ? '1 Week' : dur === '2_weeks' ? '2 Weeks' : '1 Month'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* DATE SELECTORS */}
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] uppercase tracking-widest text-white/40 font-bold block mb-1">
                        Travel Departure
                      </label>
                      <input
                        type="date"
                        value={travelStartDate}
                        onChange={(e) => {
                          setTravelStartDate(e.target.value);
                          // Sync checkoutDate as well to keep legacy forms correct
                          setCheckoutDate(e.target.value);
                        }}
                        className="w-full bg-black/60 border border-white/20 p-2 text-xs font-mono focus:outline-none focus:border-[#D4AF37] text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase tracking-widest text-white/40 font-bold block mb-1">
                        Training Starts
                      </label>
                      <input
                        type="date"
                        value={trainingStartDate}
                        onChange={(e) => setTrainingStartDate(e.target.value)}
                        className="w-full bg-black/60 border border-white/20 p-2 text-xs font-mono focus:outline-none focus:border-[#D4AF37] text-white"
                      />
                    </div>
                  </div>

                  {/* AUTO COMPUTED WINDOWS INFO */}
                  <div className="p-4 bg-black/40 border border-white/5 space-y-3 rounded-none text-xs font-mono">
                    <div className="flex justify-between text-white/60">
                      <span>Travel Duration:</span>
                      <span className="text-white font-semibold">
                        {packageDuration === '1_week' ? '7 Nights' : packageDuration === '2_weeks' ? '14 Nights' : '30 Nights'}
                      </span>
                    </div>
                    <div className="flex justify-between text-white/60">
                      <span>Departure Flight:</span>
                      <span className="text-white font-semibold">{travelStartDate}</span>
                    </div>
                    <div className="flex justify-between text-white/60">
                      <span>Return Flight (Est):</span>
                      <span className="text-white font-semibold">{travelEndDate}</span>
                    </div>
                    <div className="flex justify-between border-t border-white/10 pt-2 text-[#D4AF37]/80">
                      <span>Training window:</span>
                      <span className="text-[#D4AF37] font-bold">
                        {trainingStartDate} to {trainingEndDate}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#1a1a1a] border border-white/10 p-6 sm:p-8 space-y-6 text-left">
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#D4AF37] block">
                  REAL-TIME QUOTE ANALYTICS
                </span>
                
                <h3 className="text-3xl font-light italic serif uppercase text-white pb-4 border-b border-white/10">
                  Interactive Total
                </h3>

                {/* COMPUTED LINE ITEMS */}
                <div className="space-y-3.5 text-xs font-mono text-white/70">
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <span className="flex items-center gap-1 opacity-70">
                      <Plane className="w-3.5 h-3.5 text-emerald-400" /> Flights (Departure city)
                    </span>
                    <span className="text-white font-semibold">${flightPrice}</span>
                  </div>

                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <span className="flex items-center gap-1 opacity-70">
                      <Flame className="w-3.5 h-3.5 text-orange-500" /> Muay Thai Training ({packageDuration === '1_week' ? '1 Week' : packageDuration === '2_weeks' ? '2 Weeks' : '1 Month'})
                    </span>
                    <span className="text-white font-semibold">${gymTotalCost}</span>
                  </div>

                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <span className="flex items-center gap-1 opacity-70">
                      <Hotel className="w-3.5 h-3.5 text-cyan-400" /> Lodging AC Stay ({stayNights} Nights)
                    </span>
                    <span className="text-white font-semibold">
                      ${accommodationTotalCost} <span className="text-[9px] text-white/40">(${selectedAccommodation?.costPerNight}/nt)</span>
                    </span>
                  </div>

                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <span className="flex items-center gap-1 opacity-70">
                      <Compass className="w-3.5 h-3.5 text-[#D4AF37]" /> Core local food & fruit
                    </span>
                    <span className="text-white font-semibold">${baseRunningCost}</span>
                  </div>

                  {shopGearCost > 0 && (
                    <div className="flex justify-between items-center pb-2 border-b border-white/5 animate-fadeIn">
                      <span className="flex items-center gap-1 text-[#D4AF37]">
                        <ShoppingBag className="w-3.5 h-3.5" /> Curated Fight Gear Bundle
                      </span>
                      <span className="text-[#D4AF37] font-semibold">${shopGearCost}</span>
                    </div>
                  )}

                  {/* ACTIVE CONFIGURATION TOGGLES (ADDONS) */}
                  <div className="pt-2 space-y-3">
                    <p className="text-[9px] uppercase tracking-widest text-white/40 font-bold block">
                      Enhance Experience Toggles:
                    </p>

                    <label className="flex items-center justify-between text-[11px] p-2 bg-black border border-white/5 hover:border-white/10 cursor-pointer transition">
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={addonScooter} 
                          onChange={(e) => setAddonScooter(e.target.checked)}
                          className="accent-[#D4AF37]"
                        />
                        <span className="text-white">Scooter Rental (Full Week)</span>
                      </div>
                      <span className="text-[#D4AF37] font-semibold">+$40</span>
                    </label>

                    <label className="flex items-center justify-between text-[11px] p-2 bg-black border border-white/5 hover:border-white/10 cursor-pointer transition">
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={addonNutritionalMealPrep} 
                          onChange={(e) => setAddonNutritionalMealPrep(e.target.checked)}
                          className="accent-[#D4AF37]"
                        />
                        <span className="text-white">Fighter Prep Daily Meal Plan</span>
                      </div>
                      <span className="text-[#D4AF37] font-semibold">+$130</span>
                    </label>

                    <label className="flex items-center justify-between text-[11px] p-2 bg-[#D4AF37]/5 border border-[#D4AF37]/10 hover:border-white/10 cursor-pointer transition">
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={addonPrivateSession} 
                          onChange={(e) => setAddonPrivateSession(e.target.checked)}
                          className="accent-[#D4AF37]"
                        />
                        <span className="text-[#D4AF37] font-bold">1-on-1 private Kru hour</span>
                      </div>
                      <span className="text-[#D4AF37] font-bold">+$100</span>
                    </label>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/15 space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-[9px] uppercase tracking-widest opacity-40">Compulsory Grand Total</span>
                      <p className="text-xs text-white/40 leading-none mt-1">Tax, transfers & gear included</p>
                    </div>
                    <span className="text-4xl font-light italic serif text-white block">
                      ${computedTotal} <span className="text-xs uppercase tracking-widest font-sans opacity-50 not-italic">USD</span>
                    </span>
                  </div>

                  <button 
                    onClick={() => setIsCheckoutOpen(true)}
                    className="w-full py-5 bg-white text-black font-extrabold uppercase tracking-widest text-xs rounded-none transition duration-300 hover:bg-[#D4AF37] flex items-center justify-center gap-2 shadow-lg"
                  >
                    Initiate Booking Registration
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* QUICK RETAKE COMPONENT */}
              <div className="p-6 bg-white/[0.02] border border-white/10 text-left space-y-4">
                <span className="text-[10px] uppercase font-mono tracking-widest opacity-40 block">
                  MISSED SOME DETAILS?
                </span>
                <p className="text-xs text-white/60 font-light">
                  You can retake the full questionaire at any time. It calibrates alternative routes dynamically using Google AI Studio backend pipelines.
                </p>
                <button 
                  onClick={handleStartQuestionnaire}
                  className="w-full py-3 border border-white/20 text-white hover:bg-white/5 text-xs uppercase tracking-widest font-bold transition"
                >
                  Restart questionnaire Setup
                </button>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* BOOKING MODAL DRAWER OVERLAY */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#1a1a1a] border border-white/15 p-6 sm:p-10 text-left relative focus:outline-none animate-fadeIn">
            
            <button 
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute top-6 right-6 text-white/60 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[9px] uppercase tracking-[0.25em] text-[#D4AF37] font-mono block mb-2">
              RE:START RESERVATION GATEWAY
            </span>
            <h3 className="text-3xl font-light italic serif uppercase text-white mb-6">
              Finalize Your Retreat
            </h3>

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <label className="text-[9px] uppercase tracking-widest opacity-40 font-bold block mb-1">
                  Full Legal Name
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. John Doe"
                  value={checkoutName}
                  onChange={(e) => setCheckoutName(e.target.value)}
                  className="w-full bg-black border border-white/20 p-3 text-sm focus:outline-none focus:border-[#D4AF37] text-white"
                />
              </div>

              <div>
                <label className="text-[9px] uppercase tracking-widest opacity-40 font-bold block mb-1">
                  Email Address
                </label>
                <input 
                  type="email" 
                  required
                  value={checkoutEmail}
                  onChange={(e) => setCheckoutEmail(e.target.value)}
                  className="w-full bg-black border border-white/20 p-3 text-sm focus:outline-none focus:border-[#D4AF37] text-white"
                />
              </div>

              <div>
                <label className="text-[9px] uppercase tracking-widest opacity-40 font-bold block mb-1">
                  Primary Mobile Number
                </label>
                <input 
                  type="tel" 
                  required
                  placeholder="e.g. +44 7911 123456"
                  value={checkoutPhone}
                  onChange={(e) => setCheckoutPhone(e.target.value)}
                  className="w-full bg-black border border-white/20 p-3 text-sm focus:outline-none focus:border-[#D4AF37] text-white"
                />
              </div>

              <div>
                <label className="text-[9px] uppercase tracking-widest opacity-40 font-bold block mb-1">
                  Target Retreat Start Date
                </label>
                <input 
                  type="date" 
                  required
                  value={checkoutDate}
                  onChange={(e) => setCheckoutDate(e.target.value)}
                  className="w-full bg-black border border-white/20 p-3 text-sm font-mono focus:outline-none focus:border-[#D4AF37] text-white"
                />
              </div>

              {/* ESTIMATIONS PREVIEW */}
              <div className="p-4 bg-black border border-white/5 text-xs space-y-2 mt-4 font-mono text-white/70">
                <div className="flex justify-between">
                  <span>Camp Duration:</span>
                  <span className="text-white uppercase font-bold">{packageDuration === '1_week' ? '1 Week' : packageDuration === '2_weeks' ? '2 Weeks' : '1 Month'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Travel Window:</span>
                  <span className="text-white">{travelStartDate} to {travelEndDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Training Window:</span>
                  <span className="text-[#D4AF37]">{trainingStartDate} to {trainingEndDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Selected Gym:</span>
                  <span className="text-white">{selectedGym?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Matched Stay:</span>
                  <span className="text-white">{selectedAccommodation?.name}</span>
                </div>
                {cart.length > 0 && (
                  <div className="flex justify-between text-[#D4AF37] animate-fadeIn">
                    <span>Bundled Shop Gear:</span>
                    <span>{cart.length} items (${shopGearCost})</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-white/10 pt-2 font-bold">
                  <span className="text-[#D4AF37]">Estimated package total:</span>
                  <span className="text-white">${computedTotal} USD</span>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsCheckoutOpen(false)}
                  className="flex-1 py-4 border border-white/20 hover:bg-white/5 uppercase tracking-widest font-bold text-xs text-center transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black font-extrabold uppercase tracking-widest text-xs text-center transition shadow"
                >
                  Submit Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STEP 4: GORGEOUS BOARDING PASS / CONFIRMED BOOKING STATE */}
      {step === 'booked' && (
        <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-12 flex flex-col justify-center items-center">
          
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-6 py-3 rounded-none inline-flex items-center gap-2 mb-8 uppercase tracking-widest text-xs font-mono">
            <Check className="w-4 h-4" /> Booking Successfully Generated
          </div>

          <h2 className="text-4xl sm:text-6xl font-light italic serif text-white uppercase text-center mb-2">
            Clear For Departure.
          </h2>
          <p className="text-xs uppercase tracking-[0.3em] font-mono text-white/50 text-center mb-8">
            Your custom combative restart itinerary is locked in.
          </p>

          {/* VOUCHER / TICKET TANGIBLE DESIGN CARD */}
          <div className="w-full bg-[#1c1c1c] border border-white/10 flex flex-col md:flex-row relative overflow-hidden">
            
            {/* Ticket Left Section */}
            <div className="flex-1 p-8 sm:p-10 space-y-6 text-left">
              <div className="flex justify-between items-start border-b border-white/10 pb-4">
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-[#D4AF37] font-mono block">
                    RE:START THAILAND TRAVEL CONCIERGE
                  </span>
                  <h3 className="text-2xl font-bold text-white uppercase tracking-tight mt-1">
                    Offical Retreat Voucher
                  </h3>
                </div>
                {/* QR code simulation */}
                <div className="w-14 h-14 bg-white p-1 flex items-center justify-center">
                  <div className="w-full h-full bg-[#121212] flex flex-wrap gap-1 p-1">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div key={i} className={`w-2.5 h-2.5 ${i % 3 === 0 || i % 5 === 0 ? 'bg-white' : 'bg-transparent'}`} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 font-mono text-xs">
                <div>
                  <span className="text-[9px] uppercase text-white/40 block">Primary Passenger</span>
                  <span className="text-white font-bold">{checkoutName || 'Guest User'}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase text-white/40 block">Departure airport</span>
                  <span className="text-white font-bold">{answers.departureCity}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase text-white/40 block">Camp Duration</span>
                  <span className="text-[#D4AF37] font-bold uppercase">{packageDuration === '1_week' ? '1 Week' : packageDuration === '2_weeks' ? '2 Weeks' : '1 Month'}</span>
                </div>

                <div>
                  <span className="text-[9px] uppercase text-white/40 block">Travel Flight Dates</span>
                  <span className="text-white font-bold">{travelStartDate} to {travelEndDate}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase text-white/40 block">Camp Training Dates</span>
                  <span className="text-[#D4AF37] font-bold">{trainingStartDate} to {trainingEndDate}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase text-white/40 block">Bundled Fight Gear</span>
                  <span className="text-white font-bold">
                    {cart.length > 0 ? `${cart.length} Premium Items` : 'Self-Supplied'}
                  </span>
                </div>

                <div>
                  <span className="text-[9px] uppercase text-white/40 block">Camp Training Complex</span>
                  <span className="text-[#D4AF37] font-bold uppercase">{selectedGym?.name}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase text-white/40 block">Matched Stay</span>
                  <span className="text-white font-bold">{selectedAccommodation?.name}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase text-white/40 block">Registered Addons</span>
                  <span className="text-white font-bold">
                    {[
                      addonScooter && 'Scooter',
                      addonNutritionalMealPrep && 'MealPrep',
                      addonPrivateSession && 'PrivateKru'
                    ].filter(Boolean).join(', ') || 'None'}
                  </span>
                </div>
              </div>

              {/* TRAVEL GEAR CHECKLIST ACCENT */}
              <div className="pt-6 border-t border-dashed border-white/20 space-y-3">
                <span className="text-[9px] uppercase tracking-widest text-teal-400 font-bold block">
                  🛡️ Essential Fighter Packing Checklist
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-light text-white/70">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>Shin Guards & 14-16oz Leather Gloves</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>3 to 5 pairs of authentic Muay Thai shorts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>Compression shorts & hydration salts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>Thai Liniment rubbing oils (Namman Muay)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ticket Right section (Stubs) */}
            <div className="bg-black border-t md:border-t-0 md:border-l border-dashed border-white/20 w-full md:w-64 p-8 flex flex-col justify-between text-left">
              <div className="space-y-4">
                <span className="text-[9px] uppercase tracking-widest text-white/40 block font-mono">
                  RETREAT PASS STUB
                </span>
                
                <div>
                  <p className="text-[9px] uppercase text-white/50 leading-none mb-1 font-mono">Reference Identification</p>
                  <span className="font-mono text-sm text-white">RE_START_{checkoutName ? checkoutName.toUpperCase().replace(/\s+/g, '_') : 'TH_GUEST'}_2026</span>
                </div>

                <div>
                  <p className="text-[9px] uppercase text-white/50 leading-none mb-1 font-mono">Airline carrier</p>
                  <span className="text-xs text-white font-mono">{selectedFlight ? selectedFlight.airline : 'Standard Air Carrier'}</span>
                </div>

                <div>
                  <p className="text-[9px] uppercase text-white/50 leading-none mb-1 font-mono">Estimated cost</p>
                  <span className="text-xl font-light italic serif text-emerald-400">${computedTotal} USD</span>
                </div>
              </div>

              <div className="mt-8 border-t border-white/10 pt-4">
                <button 
                  onClick={() => {
                    window.print();
                  }}
                  className="w-full py-3 bg-white hover:bg-[#D4AF37] text-black text-xs font-bold uppercase tracking-widest transition"
                >
                  Print Voucher
                </button>
              </div>
            </div>

          </div>

          <p className="text-xs text-white/40 mt-8 max-w-xl text-center leading-relaxed font-light font-mono">
            We sent a verification copy and next-action steps directly to your email at <span className="text-white font-semibold">djswiftno1@gmail.com</span>. Our dedicated travel manager is on standby.
          </p>
        </div>
      )}

      {/* FOOTER BAR */}
      <footer className="py-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between px-6 sm:px-10 gap-4 bg-black text-[9px] uppercase tracking-[0.3em] font-semibold text-white/50 text-center sm:text-left">
        <div className="flex flex-wrap justify-center sm:justify-start gap-6">
          <span className="hover:text-[#D4AF37] cursor-pointer transition">Terms of Concierge Service</span>
          <span>•</span>
          <span className="hover:text-[#D4AF37] cursor-pointer transition">Retreat Insurance Coverage</span>
          <span>•</span>
          <span className="hover:text-[#D4AF37] cursor-pointer transition">Local Health & Sport Protocol</span>
        </div>
        <div>
          © 2026 RE:START THAILAND — ALL RIGHTS RESERVED
        </div>
      </footer>

    </div>
  );
}
