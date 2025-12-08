export const PROHIBITED_ITEMS = {
  absolute: [
    {
      name: 'Explosives and ammunition',
      description: 'Firearms, fireworks, ammunition, and explosive materials',
      severity: 'absolute'
    },
    {
      name: 'Illegal drugs and narcotics',
      description: 'Controlled substances and illegal drugs',
      severity: 'absolute'
    },
    {
      name: 'Hazardous materials',
      description: 'Flammables, corrosives, radioactive materials, toxic substances',
      severity: 'absolute'
    },
    {
      name: 'Live animals',
      description: 'Any living animals or insects',
      severity: 'absolute'
    },
    {
      name: 'Perishable foods',
      description: 'Fresh food items (without special arrangement)',
      severity: 'absolute'
    },
    {
      name: 'Currency and bearer instruments',
      description: 'Cash, money orders, bearer bonds',
      severity: 'absolute'
    },
    {
      name: 'Counterfeit goods',
      description: 'Fake branded items and pirated materials',
      severity: 'absolute'
    }
  ],
  restricted: [
    {
      name: 'Lithium batteries',
      description: 'Must be installed in device, maximum 2 per package',
      requirements: 'Must be in device, max 2 per package',
      severity: 'restricted'
    },
    {
      name: 'Perfumes and cosmetics',
      description: 'Limited quantity allowed',
      requirements: 'Limited to personal quantities',
      severity: 'restricted'
    },
    {
      name: 'Medications',
      description: 'Prescription required',
      requirements: 'Must include copy of prescription',
      severity: 'restricted'
    },
    {
      name: 'Electronics over $500',
      description: 'High-value electronics must be declared',
      requirements: 'Must declare value, insurance recommended',
      severity: 'restricted'
    },
    {
      name: 'Alcohol',
      description: 'Regulations vary by destination',
      requirements: 'Check destination-specific rules',
      severity: 'restricted'
    }
  ]
} as const;

export type ProhibitedItem = (typeof PROHIBITED_ITEMS.absolute)[number] | (typeof PROHIBITED_ITEMS.restricted)[number];

// Keywords to check in item descriptions
export const PROHIBITED_KEYWORDS = [
  'gun', 'weapon', 'ammunition', 'ammo', 'explosive', 'firework',
  'drug', 'narcotic', 'marijuana', 'cocaine', 'heroin',
  'flammable', 'corrosive', 'radioactive', 'toxic', 'poison',
  'live animal', 'pet', 'livestock',
  'cash', 'money', 'currency',
  'counterfeit', 'fake', 'replica'
];

export function checkProhibited(description: string): {
  isProhibited: boolean;
  isRestricted: boolean;
  matchedKeywords: string[];
} {
  const lowerDesc = description.toLowerCase();
  const matchedKeywords = PROHIBITED_KEYWORDS.filter(keyword => 
    lowerDesc.includes(keyword)
  );

  return {
    isProhibited: matchedKeywords.length > 0,
    isRestricted: ['battery', 'lithium', 'perfume', 'medication', 'medicine', 'alcohol', 'wine', 'beer']
      .some(keyword => lowerDesc.includes(keyword)),
    matchedKeywords
  };
}

