export interface Destination {
  id: string;
  name: string;
  code: string;
  airport: string;
  transitDays: { min: number; max: number };
  baseRate: number;
  rate_multiplier: number;
  base_transit_days: number;
  flag: string;
  timezone: string;
  currency: string;
  customs: {
    dutyFree: number;
    documents: string[];
  };
}

export const DESTINATIONS: Destination[] = [
  {
    id: 'guyana',
    name: 'Guyana',
    code: 'GY',
    airport: 'GEO',
    transitDays: { min: 3, max: 5 },
    baseRate: 3.50,
    rate_multiplier: 1.0,
    base_transit_days: 3,
    flag: '🇬🇾',
    timezone: 'America/Guyana',
    currency: 'GYD',
    customs: {
      dutyFree: 200,
      documents: ['Invoice', 'Packing List']
    }
  },
  {
    id: 'jamaica',
    name: 'Jamaica',
    code: 'JM',
    airport: 'KIN',
    transitDays: { min: 3, max: 5 },
    baseRate: 3.75,
    rate_multiplier: 1.1,
    base_transit_days: 3,
    flag: '🇯🇲',
    timezone: 'America/Jamaica',
    currency: 'JMD',
    customs: {
      dutyFree: 500,
      documents: ['Invoice', 'Packing List', 'TIN Number']
    }
  },
  {
    id: 'trinidad',
    name: 'Trinidad & Tobago',
    code: 'TT',
    airport: 'POS',
    transitDays: { min: 3, max: 5 },
    baseRate: 3.50,
    rate_multiplier: 1.0,
    base_transit_days: 3,
    flag: '🇹🇹',
    timezone: 'America/Port_of_Spain',
    currency: 'TTD',
    customs: {
      dutyFree: 300,
      documents: ['Invoice', 'Packing List']
    }
  },
  {
    id: 'barbados',
    name: 'Barbados',
    code: 'BB',
    airport: 'BGI',
    transitDays: { min: 4, max: 6 },
    baseRate: 4.00,
    rate_multiplier: 1.15,
    base_transit_days: 4,
    flag: '🇧🇧',
    timezone: 'America/Barbados',
    currency: 'BBD',
    customs: {
      dutyFree: 200,
      documents: ['Invoice', 'Packing List']
    }
  },
  {
    id: 'suriname',
    name: 'Suriname',
    code: 'SR',
    airport: 'PBM',
    transitDays: { min: 4, max: 6 },
    baseRate: 4.25,
    rate_multiplier: 1.2,
    base_transit_days: 4,
    flag: '🇸🇷',
    timezone: 'America/Paramaribo',
    currency: 'SRD',
    customs: {
      dutyFree: 200,
      documents: ['Invoice', 'Packing List']
    }
  }
];

export const DESTINATION_LIST = DESTINATIONS;

export const DESTINATION_OPTIONS = DESTINATION_LIST.map(d => ({
  value: d.id,
  label: `${d.flag} ${d.name}`,
  shortLabel: d.name
}));

export function getDestination(id: string): Destination | undefined {
  return DESTINATIONS.find(d => d.id === id);
}

export function getDestinationLabel(id: string): string {
  const dest = DESTINATIONS.find(d => d.id === id);
  return dest ? `${dest.flag} ${dest.name}` : id;
}
