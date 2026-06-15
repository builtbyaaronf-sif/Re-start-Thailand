import { QuestionnaireAnswers, PackageResponse } from './types.js';

export function getFallbackPackage(answers: QuestionnaireAnswers): PackageResponse {
  const isPhuket = answers.destination === 'phuket' || answers.destination === 'combo';
  const isSamui = answers.destination === 'samui' || answers.destination === 'combo';

  // Customize Gym suggestions
  const phuketGyms = [
    {
      id: 'tiger_muay_thai',
      name: 'Tiger Muay Thai & MMA',
      location: 'Soi Ta-iad, Chalong, Phuket',
      island: 'Phuket' as const,
      description: 'The world-famous premium training facility sprawled across a massive campus. Tiger is high-energy, with separate rings separated by experience level.',
      trainingFocus: 'All Levels, Heavy Conditioning, MMA Cross-training',
      typicalCost: '$160 / week',
      rating: 4.8,
      amenities: ['Massive Weight Room', 'On-site Tiger Grill Cafe', 'Ice Baths', 'Gear Shop', 'AC Shared/Private Rooms'],
      whyMatch: answers.experience === 'beginner' 
        ? 'Offers highly structured weekly beginner camps and dedicated instructors who guide newcomers patiently.'
        : answers.experience === 'intermediate'
        ? 'Perfect for improving sparring technique and getting exposed to top-tier international martial artists.'
        : 'World-renowned professional fighter program with elite sparring, conditioning, and wrestling classes.',
      coordinates: '7.8428, 98.3451',
      schedule: ['08:00 AM - Morning Run & Padwork', '10:30 AM - Clinch/Wrestling', '04:00 PM - Evening Technical Sparring'],
      imageUrl: 'https://images.unsplash.com/photo-1544033527-b192daee1f5b?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'sinbi_muay_thai',
      name: 'Sinbi Muay Thai',
      location: 'Rawai, Phuket',
      island: 'Phuket' as const,
      description: 'A traditional yet modern gym located in the peaceful south of Phuket. Renowned for its highly technical championship trainers and authentic style.',
      trainingFocus: 'Traditional Technique, Fine-tuned Padwork, Clinching',
      typicalCost: '$135 / week',
      rating: 4.9,
      amenities: ['Three Full Rings', 'On-site Gear Store', 'Direct Sea Breeze', 'Technique-oriented sparring area', 'Scooter Rentals'],
      whyMatch: 'Offers incredible focused trainer attention and a friendly environment close to the stunning beaches of Rawai.',
      coordinates: '7.7845, 98.3123',
      schedule: ['07:30 AM - Morning Cardio & Padwork', '03:30 PM - Afternoon Bag Work & Sparring'],
      imageUrl: 'https://images.unsplash.com/photo-1517438322307-e67111335449?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'bangtao_muay_thai',
      name: 'Bangtao Muay Thai & MMA',
      location: 'Bang Tao Beach, Phuket',
      island: 'Phuket' as const,
      description: 'An ultra-modern, high-end beachfront facility created by legendary coaches. Elite recovery pools and active beach lifestyle training.',
      trainingFocus: 'Elite striking, recovery-focused wellness, Brazilian Jiu-Jitsu',
      typicalCost: '$220 / week',
      rating: 5.0,
      amenities: ['Infrared Saunas & Cold Plunges', 'Yoga Studio', 'Organic Superfood Cafe', 'Elite MMA Cage', 'Beach Cardio sessions'],
      whyMatch: answers.comfortAccent === 'wellness'
        ? 'Perfect fit for your wellness focus with elite hot/cold therapy pools and organic recovery plans right by the beach.'
        : 'Provides unmatched premium facilities and expert recovery techniques for optimizing physical restarts.',
      coordinates: '7.9945, 98.2912',
      schedule: ['08:00 AM - Striking & Conditioning', '11:00 AM - Beach Rest & Cold Plunge', '04:30 PM - Technical Sparring & Massage'],
      imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=800'
    }
  ];

  const samuiGyms = [
    {
      id: 'yodyut_muay_thai',
      name: 'Yodyut Muay Thai',
      location: 'Chaweng, Koh Samui',
      island: 'Koh Samui' as const,
      description: 'The premier training destination on Koh Samui. Offers a focused family atmosphere with premium, hands-on corrections and intense conditioning.',
      trainingFocus: 'Furious Padwork, Traditional clinching, High Cardio',
      typicalCost: '$120 / week',
      rating: 4.9,
      amenities: ['Two Large Instruction Rings', 'Heavy Bags Forest', 'Showers & Lockers', 'Premium Thai Liniment provided', 'Close to Chaweng Lake'],
      whyMatch: 'Perfect balance of classic, unyielding Thai training and supportive coaching, highly matching your preferred island rhythm.',
      coordinates: '9.5245, 100.0421',
      schedule: ['07:00 AM - Chaweng Lake Cardio Run', '08:00 AM - Intensive Padwork', '04:00 PM - Daily Clinch & Conditioning'],
      imageUrl: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'superpro_samui',
      name: 'Superpro Samui',
      location: 'Chaweng Noi, Koh Samui',
      island: 'Koh Samui' as const,
      description: 'A resort-style gym featuring comfortable on-site bungalows, fully equipped rings, a fitness gym, and an active swimming pool for active recovery.',
      trainingFocus: 'Cross-training, Muay Thai, Kickboxing, Fitness Bootcamps',
      typicalCost: '$140 / week',
      rating: 4.7,
      amenities: ['Active Swimming Pool', 'Fully Equipped Free Weights', 'On-site Healthy Kitchen', 'Bungalow Lodging', 'AC Yoga Zone'],
      whyMatch: answers.budget === 'midrange' || answers.budget === 'luxury'
        ? 'The resort-style setup matches your comfort goals, combining solid ring time with an outstanding pool & gym setup.'
        : 'Excellent combo of holiday comfort and rigorous striking training.',
      coordinates: '9.5089, 100.0578',
      schedule: ['08:00 AM - striking camp class', '10:00 AM - Pool active recovery', '04:30 PM - Power & Bag drilling'],
      imageUrl: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'bxb_fight_lab',
      name: 'BXB Fight Lab (BXB Lamai)',
      location: 'Lamai, Koh Samui',
      island: 'Koh Samui' as const,
      description: 'An elite, state-of-the-art high-performance fight lab in Lamai beach focusing on professional-grade Muay Thai, Western boxing, and custom strength and conditioning.',
      trainingFocus: 'High-Performance Striking, S&C Integration, Elite Boxing',
      typicalCost: '$135 / week',
      rating: 4.9,
      amenities: ['Elite S&C Area', 'Full-Size Boxing Ring', 'Ice Baths & Cold Plunges', 'Coffee & Protein Bar', 'Premium Airflow System'],
      whyMatch: answers.comfortAccent === 'training'
        ? 'Matches your technical focus perfectly with its premium equipment, elite recovery systems, and custom conditioning arrays.'
        : 'Superb newly minted training pavilion providing premier strength and sparring facilities.',
      coordinates: '9.4674, 100.0465',
      schedule: ['08:00 AM - Muay Thai & Striking Cardio', '10:30 AM - S&C / Power Development', '04:30 PM - Technical Sparring & Pad rounds'],
      imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'dowden_muay_thai',
      name: 'Dowden Muay Thai',
      location: 'Choeng Mon, Koh Samui',
      island: 'Koh Samui' as const,
      description: 'A friendly, government-approved full-service Destination Thailand Visa (DTV) camp. Highly respected for highly supportive trainers and a spacious, pristine traditional pavilion.',
      trainingFocus: 'Traditional strike skills, cardio conditioning, flexible memberships',
      typicalCost: '$60 / week',
      rating: 4.9,
      amenities: ['Professionally Sized Ring', 'Free Weights Area', 'DTV Visa Support Hub', 'Gear & Apparel Shop', 'In-Villa Training Options'],
      whyMatch: 'Outstanding choice if you value highly supportive trainers, solid technical padwork, and quick beach dips at nearby scenic Choeng Mon beach.',
      coordinates: '9.5705, 100.0790',
      schedule: ['08:00 AM - Technical Morning Session', '04:30 PM - Intensive Padwork & Clinch sparring'],
      imageUrl: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'koh_fit_muay_thai',
      name: 'Koh Fit Muay Thai (FitKoh)',
      location: 'Ban Tai, Maenam, Koh Samui',
      island: 'Koh Samui' as const,
      description: 'A holistic health, weights, and Muay Thai holiday camp in sleepy Ban Tai. Boasts a massive health-oriented cafe, extensive free weight setups, and scenic outdoor rings.',
      trainingFocus: 'Holistic striking, weight loss, conditioning, yoga integration',
      typicalCost: '$150 / week',
      rating: 4.8,
      amenities: ['Integrated Health Cafe', 'Massive Strength & Cardio Gym', 'Yoga Shala Deck', 'Saltwater Pool Access', 'Ice Baths'],
      whyMatch: answers.comfortAccent === 'wellness'
        ? 'Perfect for your wellness drive with its modern recovery setups, on-site healthy menu, and shaded yoga decks.'
        : 'Excellent options for individuals wishing to pair rigorous conditioning with holistic health programs.',
      coordinates: '9.5638, 100.0051',
      schedule: ['07:30 AM - Beach Cardio Run', '08:30 AM - Muay Thai Striking Class', '11:00 AM - Strength & Bodyweight conditioning', '04:30 PM - Techniques & Shala Yoga'],
      imageUrl: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'fas_muay_thai',
      name: 'Fas Muay Thai Gym',
      location: 'Maenam, Koh Samui',
      island: 'Koh Samui' as const,
      description: 'A brilliant, traditional family-ran camp nestled under mature coconut groves in Maenam. Focused on authentic technique, intensive stamina, and personalized instructions.',
      trainingFocus: 'Pure Traditional striking, authentic clinching, body conditioning',
      typicalCost: '$120 / week',
      rating: 4.9,
      amenities: ['Fighter-Led Pad Rounds', 'Dedicated Sparring Rings', 'Ice Baths & Soaking', 'Apparel Shop', 'Encouraging Family Community'],
      whyMatch: 'Superb if you want to avoid busy tourist centers and dive into personalized, traditional instruction with friendly local fighters.',
      coordinates: '9.5684, 99.9951',
      schedule: ['07:30 AM - Coconut Grove run', '08:00 AM - Group Padwork & Clinch', '04:00 PM - Afternoon Sweat: Clinch & Sparring'],
      imageUrl: 'https://images.unsplash.com/photo-1517438322307-e67111335449?auto=format&fit=crop&q=80&w=800'
    }
  ];

  // Select Gyms
  let selectedGyms = [];
  if (answers.destination === 'phuket') {
    selectedGyms = [phuketGyms[0], phuketGyms[1]];
    if (answers.budget === 'luxury' || answers.comfortAccent === 'wellness') {
      selectedGyms = [phuketGyms[2], phuketGyms[0]];
    }
  } else if (answers.destination === 'samui') {
    if (answers.comfortAccent === 'wellness') {
      selectedGyms = [samuiGyms[4], samuiGyms[1]]; // Koh Fit & Superpro
    } else if (answers.comfortAccent === 'training') {
      selectedGyms = [samuiGyms[2], samuiGyms[0]]; // BXB Fight Lab & Yodyut
    } else if (answers.budget === 'backpacker') {
      selectedGyms = [samuiGyms[3], samuiGyms[5]]; // Dowden & Fas
    } else {
      selectedGyms = [samuiGyms[0], samuiGyms[1]]; // Yodyut & Superpro
    }
  } else {
    // combo
    selectedGyms = [phuketGyms[0], samuiGyms[0]];
    if (answers.comfortAccent === 'wellness') {
      selectedGyms = [phuketGyms[2], samuiGyms[4]]; // Bangtao & Koh Fit
    } else if (answers.comfortAccent === 'training') {
      selectedGyms = [phuketGyms[0], samuiGyms[2]]; // Tiger & BXB Fight Lab
    }
  }

  // Select Accommodation Options
  const accommodations = [];
  
  if (isPhuket) {
    if (answers.budget === 'backpacker') {
      accommodations.push({
        id: 'soi_camp_dorm',
        name: 'The Soi Fighter Dorms',
        type: 'Shared Camp Dormitory (8-bed AC)',
        location: 'Chalong, Phuket (2 mins walk to Tiger)',
        description: 'Clean, secure, and fully air-conditioned shared rooms designed specifically for budget Muay Thai trainees. Massive community spirit where you sleep, eat, and train together.',
        costPerNight: 12,
        comfortLevel: 'Backpacker' as const,
        distanceToGym: 'On-site / 100m walk',
        whyMatch: 'Ultra-affordable and ensures you stay locked into the camp lifestyle while saving on transport.',
        features: ['AC', 'High-speed Wifi', 'Personal lockers', 'Shared Kitchen & Cafe', 'Laundry facilities'],
        imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=800'
      });
    } else if (answers.budget === 'midrange') {
      accommodations.push({
        id: 'rawai_beachfront_bungalows',
        name: 'Rawai Palms Resort or bungalows',
        type: 'Private Tropical Room',
        location: 'Rawai, Phuket (5 mins scooter to Sinbi)',
        description: 'Charming private rooms surrounding a peaceful swimming pool. Includes modern AC, private balconies, and proximity to stunning local cafes.',
        costPerNight: 40,
        comfortLevel: 'Mid-range' as const,
        distanceToGym: '3 mins scooter run',
        whyMatch: 'Offers superb rest, AC seclusion, and pool recovery without breaking your budget.',
        features: ['Tropical Pool', 'AC & Cable TV', 'Private balcony', 'Gym access', 'Free Scooter Parking'],
        imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800'
      });
    } else {
      accommodations.push({
        id: 'bangtao_elite_resort',
        name: 'The Lazy Coconut Lagoon & Villas',
        type: 'Luxury Pool Access Sanctuary',
        location: 'Bang Tao Beach, Phuket',
        description: 'A five-star luxury beachfront resort with direct beach entry, private cold plunge pools, deep massage services, and organic nutrition buffets.',
        costPerNight: 180,
        comfortLevel: 'Luxury' as const,
        distanceToGym: 'Directly next to Bangtao Gym',
        whyMatch: 'Provides the high-end luxury, exceptional wellness assets, and absolute comfort you desired.',
        features: ['Private Pool', 'Five-star Recovery Spa', 'Direct Beach Entry', 'Gourmet Organic Dining', 'Private Concierge'],
        imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=800'
      });
    }
  }

  if (isSamui) {
    if (answers.budget === 'backpacker') {
      accommodations.push({
        id: 'samui_beach_backpacker',
        name: 'Chaweng Beachside Chill Hostel',
        type: 'Modern Pod Dorm',
        location: 'Chaweng Beach, Koh Samui',
        description: 'An exceptionally clean, lively social hostel right on the beach. Features robust privacy pods with individual lights and plugs.',
        costPerNight: 10,
        comfortLevel: 'Backpacker' as const,
        distanceToGym: '5 mins walk to Yodyut',
        whyMatch: 'Optimal budget saver right on Chaweng beach, matching both your wallet and beach preferences.',
        features: ['Private pods', 'Beach Bar', 'Superfast Wifi', 'Lounge Game area', 'Bicycle hire'],
        imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=800'
      });
    } else if (answers.budget === 'midrange') {
      accommodations.push({
        id: 'superpro_samui_private',
        name: 'Superpro On-site Bungalows',
        type: 'Private Camp King Room',
        location: 'Chaweng Noi, Koh Samui',
        description: 'En-suite private AC bungalows sitting directly adjacent to the training rings. Steps away from morning workouts and the refreshing pool.',
        costPerNight: 45,
        comfortLevel: 'Mid-range' as const,
        distanceToGym: 'On-site',
        whyMatch: 'Enables maximum training dedication with zero commute time, backed by on-site resort comforts.',
        features: ['Direct Pool view', 'Hot showers', 'Balcony seating', 'Daily room cleanup', 'On-site protein shakes bar'],
        imageUrl: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&q=80&w=800'
      });
    } else {
      accommodations.push({
        id: 'samui_cliff_villa',
        name: 'The Sala Samui Beach Resort & Spa',
        type: 'Luxury Cliffside Ocean Villa',
        location: 'Choeng Mon, Koh Samui',
        description: 'World-class oceanfront private pool villas. Includes high-end private fitness instructors, ocean breeze decks, and premium herbal steam rooms.',
        costPerNight: 230,
        comfortLevel: 'Luxury' as const,
        distanceToGym: '12 mins luxury chauffeur to Yodyut',
        whyMatch: 'An elite tropical escape with private butler care and unrivaled ocean rest for premium rejuvenation.',
        features: ['Private Infinity Pool', '24/7 Butler Service', 'Ocean Spa Gazebos', 'Luxury Yacht Charter links', 'Champagne breakfasts'],
        imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800'
      });
    }
  }

  // Generate Flight Estimates based on departure city
  const city = answers.departureCity || 'London';
  const flightPrice = answers.budget === 'backpacker' ? 650 : answers.budget === 'midrange' ? 950 : 1800;
  const flightOption = {
    id: 'suggested_flight_1',
    airline: answers.budget === 'luxury' ? 'Singapore Airlines (Premium Economy)' : 'Qatar Airways',
    departureCity: city,
    destinationCity: isPhuket ? 'Phuket (HKT)' : 'Koh Samui (USM)',
    duration: isPhuket ? '14 hours' : '16 hours',
    averagePriceUsd: flightPrice,
    connections: answers.budget === 'luxury' ? '1 stop via Singapore' : '1 stop via Doha',
    seasonalNote: 'Rates estimates are for the upcoming dry training season. Booking 4 weeks in advance recommended.'
  };

  // Generate Itinerary
  const itinerary = [
    {
      dayNum: 1,
      title: 'Arrival & Acclimatization',
      morning: 'Touch down in Thailand, take a pre-arranged private AC transfer directly to your accommodation, unpack and settle in.',
      afternoon: 'Meet the head trainer at the gym, collect your custom handwraps and gloves, and explore the immediate street area.',
      evening: 'Enjoy a light nourishing Thai dinner (Pad Kra Prow or Chicken Rice) and hydrate with fresh coconuts.',
      tips: 'Sleep early tonight! The tropical humidity combined with morning training requires instant adaptation.'
    },
    {
      dayNum: 2,
      title: 'First Strike: Unleash the Basics',
      morning: '07:30 AM: Standard camp warm-up (3km run or rope skipping), shadowboxing, 1-on-1 focus pads with your Kru (trainer), and heavy bag work.',
      afternoon: 'Delicious camp protein lunch, followed by dynamic stretching and a deep wellness recovery nap.',
      evening: '04:00 PM: Evening technical drills, footwork exercises, and introductory clinch work. Finish with core workouts and cool down stretching.',
      tips: 'Let your assigned Kru know your exact fitness limit. It is normal to pace your self on Day 1.'
    },
    {
      dayNum: 3,
      title: 'Technique Over Power',
      morning: '08:00 AM: Stance work, perfecting the fundamental Thai teak/kick hip rotation, 3 rounds of pads and 3 rounds of bag blasting.',
      afternoon: 'Explore a local health cafe (or beach smoothie bar) to replenish minerals.',
      evening: 'Clinching clinic: Join fellow international students to learn close-quarter levers, sweep defenses, and neck posture controls.',
      tips: 'Ensure you buy Thai liniment (Namman Muay) to rub on sore shins and shoulders after hot showers!'
    },
    {
      dayNum: 4,
      title: 'Mid-week Active Recovery',
      morning: '08:30 AM: Light technical shadowboxing followed directly by an active recovery ice bath and herbal sauna session.',
      afternoon: 'Take a long walk along the beautiful sands of Rawai/Chaweng beach. Hydrate and sample island tropical fruits.',
      evening: 'Head to the local Muay Thai Stadium to witness authentic high-stakes live fights. Feel the traditional Sarama music and energy!',
      tips: 'Rest is just as critical as training. Your muscles grow during the restoration phases.'
    },
    {
      dayNum: 5,
      title: 'Sparring Flow & Combinations',
      morning: '07:30 AM: Advanced striking combinations, defensive parries, block defenses, and counter-kick pad setups.',
      afternoon: 'Enjoy a legendary local muscle-recovery meal (Gai Yang Grilled Chicken with Papaya Salad).',
      evening: 'Controlled technical flow sparring: Put your defensive blocks and light punches to use with helpful, friendly sparring partners.',
      tips: 'Keep sparring light (20% power) and focused purely on timing and speed. Never match ego with power.'
    },
    {
      dayNum: 6,
      title: 'The Champion Final Grind',
      morning: '08:00 AM: Intensive padwork test! 4 intense 4-minute rounds with your Kru, focusing on endurance, kicks, knees, and elbows.',
      afternoon: 'Traditional beach recovery and foot massages. Souvenir shopping or picking up high-grade authentic Muay Thai shorts.',
      evening: 'Camp completion dinner and celebratory tropical sunset beach drinks with trainers and teammates.',
      tips: 'Take group photos with your Krus! The training bonds formed in Thai camps are legendary.'
    },
    {
      dayNum: 7,
      title: 'Consolidation & Re:start Journey Home',
      morning: 'Light morning jog and final technical check-in at the rings. Wrap up and pack your gear.',
      afternoon: 'Airport shuttle transfer. Reflect on your newfound striking skills, physical restart, and mental discipline.',
      evening: 'Depart Thailand, fully refreshed, empowered, and physically reset.',
      tips: 'Make sure your wet handwraps have been thoroughly air-dried before packing them in your main suitcase!'
    }
  ];

  // Calculate totals
  const gymCost = selectedGyms.reduce((sum, g) => sum + parseInt(g.typicalCost.replace(/[^0-9]/g, '')) || 0, 0);
  const accomCost = accommodations.reduce((sum, a) => sum + a.costPerNight, 0) * 7;
  const foodScooterCost = answers.budget === 'backpacker' ? 100 : answers.budget === 'midrange' ? 220 : 500;
  const totalCost = flightPrice + gymCost + accomCost + foodScooterCost;

  return {
    recommendationReason: `Welcome to your customized Muay Thai Reset! Based on your level (${answers.experience.toUpperCase()}), budget (${answers.budget.toUpperCase()}) and goals, we selected ${isPhuket && isSamui ? 'a grand Combo split' : isPhuket ? 'Phuket' : 'Koh Samui'} to ensure the perfect blend of conditioning, stunning scenery, and premium recovery.`,
    suggestedGyms: selectedGyms,
    suggestedAccommodations: accommodations,
    suggestedFlights: [flightOption],
    itinerary,
    costSummary: {
      gymWeeklyCost: gymCost,
      accommodationNightlyCost: accommodations[0]?.costPerNight || 30,
      flightCost: flightPrice,
      scooterAndFoodWeeklyCost: foodScooterCost,
      totalEstimatedCost: totalCost,
      savingTips: answers.budget === 'backpacker' 
        ? ['Eat exclusively at local open-air street stalls where healthy training food costs under $3 / meal.', 'Walk or hitch common Songthaew trucks instead of private Grab taxis.', 'Rent a small scooter weekly to lock in rates under $50/week.']
        : ['Buy a dual gym/meal package direct at the camp for massive loyalty discounts.', 'Prepare electrolyte hydration yourself using salts rather than buying bottled energy drinks.']
    }
  };
}
