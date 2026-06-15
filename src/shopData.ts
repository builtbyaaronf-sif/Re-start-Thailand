export interface ShopItem {
  id: string;
  name: string;
  brand: 'Fairtex' | 'Primo' | 'Yokkao';
  type: 'shorts' | 'gloves' | 'wraps';
  price: number;
  description: string;
  imageUrl: string;
  colors: string[];
  sizes: string[];
}

export const shopItems: ShopItem[] = [
  // FAIRTEX GEAR
  {
    id: 'fairtex_shorts_retro',
    name: 'Retro Slash Slim Cut Shorts',
    brand: 'Fairtex',
    type: 'shorts',
    price: 45,
    description: 'A modern lightweight microfibre satin fabrication with high slash cutoffs. Unrivaled kicking freedom with signature retro applique.',
    imageUrl: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&q=80&w=600',
    colors: ['Classic Black', 'Army Olive', 'Crimson Gold'],
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    id: 'fairtex_gloves_bgv1',
    name: 'BGV1 Breathable Boxing Gloves',
    brand: 'Fairtex',
    type: 'gloves',
    price: 95,
    description: 'Gold-standard ergonomic pre-curved premium cowhide leather. Incorporates breathable mesh palms for tropical heat moisture dispersal.',
    imageUrl: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&q=80&w=600',
    colors: ['Matte Black', 'Vibrant Pink', 'Solid White'],
    sizes: ['10oz', '12oz', '14oz', '16oz']
  },
  {
    id: 'fairtex_wraps_elastic',
    name: 'Semi-Elastic Cotton Handwraps',
    brand: 'Fairtex',
    type: 'wraps',
    price: 12,
    description: 'Full 180-inch stretch cotton and nylon blend wraps. Provides maximal lock-in wrist alignment and secure thumb looping support.',
    imageUrl: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&q=80&w=600',
    colors: ['Stealth Black', 'Direct Red', 'Electric Blue'],
    sizes: ['Standard (180")']
  },

  // YOKKAO GEAR
  {
    id: 'yokkao_shorts_carbon',
    name: 'Carbon Fit Geometric Shorts',
    brand: 'Yokkao',
    type: 'shorts',
    price: 55,
    description: 'Premium heavyweight satin with carbon fiber texture side panels. Handmade by master craftsmen in Bangkok with striking modern neon embroidery.',
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=600',
    colors: ['Neon Orange', 'Acid Lime', 'Stealth Grey'],
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    id: 'yokkao_gloves_matrix',
    name: 'Matrix Premium Leather Gloves',
    brand: 'Yokkao',
    type: 'gloves',
    price: 110,
    description: 'Full grain cowhide leather embedded with shock-absorbent multi-layer foam systems. Exquisite balance, wrist protection, and gorgeous minimalist aesthetics.',
    imageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&q=80&w=600',
    colors: ['Monochrome Black', 'Oxblood Red', 'Forest Green'],
    sizes: ['10oz', '12oz', '14oz', '16oz']
  },
  {
    id: 'yokkao_wraps_pro',
    name: 'Pro Series Printed Wraps',
    brand: 'Yokkao',
    type: 'wraps',
    price: 15,
    description: 'Durable and comfortable semi-stretch wraps with double branding patterns. Ensures tight, slip-free protection for wrist and metacarpal frameworks.',
    imageUrl: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=600',
    colors: ['Signature Icon', 'Neon Orange Splash', 'Tribal Black'],
    sizes: ['Standard (180")']
  },

  // PRIMO GEAR
  {
    id: 'primo_shorts_emblem',
    name: 'Emblem Heavyweight Satin Shorts',
    brand: 'Primo',
    type: 'shorts',
    price: 50,
    description: 'High-slit leg cuts customized for unrestricted high-kicking comfort. Beautiful retro modern branding sewn onto custom milled satin.',
    imageUrl: 'https://images.unsplash.com/photo-1507398941214-572c25f4b1dc?auto=format&fit=crop&q=80&w=600',
    colors: ['Off-White Sand', 'Sage Green', 'Warm Terracotta'],
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    id: 'primo_gloves_pegasus',
    name: 'Pegasus Microfiber Fight Gloves',
    brand: 'Primo',
    type: 'gloves',
    price: 125,
    description: 'Premium quality microfibre material providing greater durability than genuine leather. High-density foam padding fits snugly to avoid thumb strains.',
    imageUrl: 'https://images.unsplash.com/photo-1595078475328-1ab05d0a6a0e?auto=format&fit=crop&q=80&w=600',
    colors: ['Ivory Gold', 'Desert Tan', 'Slate Charcoal'],
    sizes: ['10oz', '12oz', '14oz', '16oz']
  },
  {
    id: 'primo_wraps_soft',
    name: 'Ultra-Soft Premium Wraps',
    brand: 'Primo',
    type: 'wraps',
    price: 14,
    description: 'Luxuriously soft weave offering supreme comfort and safety. Slightly thinner profile for customized hand wraps and exact glove sizing.',
    imageUrl: 'https://images.unsplash.com/photo-1517438322307-e67111335449?auto=format&fit=crop&q=80&w=600',
    colors: ['Sandstone Cream', 'Desert Olive', 'Slate Charcoal'],
    sizes: ['Standard (180")']
  }
];
