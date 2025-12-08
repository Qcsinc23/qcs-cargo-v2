export interface ProhibitedItem {
  name: string;
  category: 'prohibited' | 'restricted';
  keywords: string[];
  reason: string;
  note?: string;
}

export const PROHIBITED_ITEMS: ProhibitedItem[] = [
  // Absolutely Prohibited
  {
    name: 'Explosives & Ammunition',
    category: 'prohibited',
    keywords: ['explosive', 'ammunition', 'ammo', 'bullet', 'gunpowder', 'firework', 'firecracker'],
    reason: 'Dangerous goods prohibited by aviation law'
  },
  {
    name: 'Illegal Drugs',
    category: 'prohibited',
    keywords: ['drug', 'narcotic', 'marijuana', 'cocaine', 'heroin', 'cannabis', 'weed'],
    reason: 'Illegal substances'
  },
  {
    name: 'Flammable Liquids',
    category: 'prohibited',
    keywords: ['gasoline', 'petrol', 'lighter fluid', 'acetone', 'paint thinner', 'alcohol 90%'],
    reason: 'Fire hazard during air transport'
  },
  {
    name: 'Live Animals',
    category: 'prohibited',
    keywords: ['live animal', 'pet', 'dog', 'cat', 'bird', 'fish', 'reptile'],
    reason: 'Requires special handling not available'
  },
  {
    name: 'Currency',
    category: 'prohibited',
    keywords: ['cash', 'money', 'currency', 'banknote', 'bearer bond'],
    reason: 'Financial regulations'
  },
  {
    name: 'Weapons',
    category: 'prohibited',
    keywords: ['gun', 'firearm', 'weapon', 'knife', 'sword', 'taser', 'pepper spray'],
    reason: 'Security regulations'
  },
  {
    name: 'Compressed Gases',
    category: 'prohibited',
    keywords: ['compressed gas', 'propane', 'butane', 'aerosol', 'fire extinguisher'],
    reason: 'Pressure hazard during flight'
  },
  
  // Restricted Items
  {
    name: 'Lithium Batteries',
    category: 'restricted',
    keywords: ['lithium', 'battery', 'powerbank', 'power bank'],
    reason: 'Must be installed in device',
    note: 'Loose lithium batteries are prohibited. Batteries must be installed in the device. Max 2 devices with batteries per package.'
  },
  {
    name: 'Perfumes & Fragrances',
    category: 'restricted',
    keywords: ['perfume', 'cologne', 'fragrance', 'eau de'],
    reason: 'Flammable contents',
    note: 'Limited to 500ml total per package. Must be in original sealed packaging.'
  },
  {
    name: 'Medications',
    category: 'restricted',
    keywords: ['medicine', 'medication', 'prescription', 'pill', 'pharmaceutical'],
    reason: 'Customs regulations',
    note: 'Must include copy of prescription. Over-the-counter medications allowed in reasonable quantities.'
  },
  {
    name: 'Alcohol',
    category: 'restricted',
    keywords: ['alcohol', 'wine', 'beer', 'liquor', 'rum', 'vodka', 'whiskey'],
    reason: 'Varies by destination',
    note: 'Check destination country regulations. May require import permit.'
  },
  {
    name: 'Electronics over $500',
    category: 'restricted',
    keywords: ['laptop', 'macbook', 'iphone', 'samsung', 'computer', 'tablet', 'ipad'],
    reason: 'Customs declaration required',
    note: 'Must declare accurate value for customs. Insurance recommended.'
  },
  {
    name: 'Food Items',
    category: 'restricted',
    keywords: ['food', 'perishable', 'meat', 'cheese', 'fruit', 'vegetable'],
    reason: 'Agricultural restrictions',
    note: 'Non-perishable, commercially packaged foods generally allowed. Fresh produce may be restricted.'
  },
  {
    name: 'Tobacco Products',
    category: 'restricted',
    keywords: ['tobacco', 'cigarette', 'cigar', 'vape', 'e-cigarette'],
    reason: 'Customs duty applies',
    note: 'Subject to destination country import limits and duties.'
  }
];

export interface ProhibitedCheckResult {
  found: boolean;
  item?: ProhibitedItem;
  status: 'allowed' | 'restricted' | 'prohibited';
}

export function checkProhibitedItem(query: string): ProhibitedCheckResult {
  const normalizedQuery = query.toLowerCase().trim();
  
  if (normalizedQuery.length < 2) {
    return { found: false, status: 'allowed' };
  }
  
  for (const item of PROHIBITED_ITEMS) {
    for (const keyword of item.keywords) {
      if (normalizedQuery.includes(keyword) || keyword.includes(normalizedQuery)) {
        return {
          found: true,
          item,
          status: item.category
        };
      }
    }
  }
  
  return {
    found: false,
    status: 'allowed'
  };
}

export function getProhibitedByCategory(category: 'prohibited' | 'restricted'): ProhibitedItem[] {
  return PROHIBITED_ITEMS.filter(item => item.category === category);
}
