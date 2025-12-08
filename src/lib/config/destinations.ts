export interface Destination {
  id: string;
  name: string;
  code: string;
  airport: string;
  transitDays: { min: number; max: number };
  baseRate: number;
  flag: string;
  timezone: string;
  currency: string;
  customs: {
    dutyFree: number;
    documents: string[];
  };
}

export const DESTINATIONS: Record<string, Destination> = {
  guyana: {
    id: 'guyana',
    name: 'Guyana',
    code: 'GY',
    airport: 'GEO',
    transitDays: { min: 3, max: 5 },
    baseRate: 3.50,
    flag: '🇬🇾',
    timezone: 'America/Guyana',
    currency: 'GYD',
    customs: {
      dutyFree: 200,
      documents: ['Invoice', 'Packing List']
    }
  },
  jamaica: {
    id: 'jamaica',
    name: 'Jamaica',
    code: 'JM',
    airport: 'KIN',
    transitDays: { min: 3, max: 5 },
    baseRate: 3.75,
    flag: '🇯🇲',
    timezone: 'America/Jamaica',
    currency: 'JMD',
    customs: {
      dutyFree: 500,
      documents: ['Invoice', 'Packing List', 'TIN Number']
    }
  },
  trinidad: {
    id: 'trinidad',
    name: 'Trinidad & Tobago',
    code: 'TT',
    airport: 'POS',
    transitDays: { min: 3, max: 5 },
    baseRate: 3.50,
    flag: '🇹🇹',
    timezone: 'America/Port_of_Spain',
    currency: 'TTD',
    customs: {
      dutyFree: 300,
      documents: ['Invoice', 'Packing List']
    }
  },
  barbados: {
    id: 'barbados',
    name: 'Barbados',
    code: 'BB',
    airport: 'BGI',
    transitDays: { min: 4, max: 6 },
    baseRate: 4.00,
    flag: '🇧🇧',
    timezone: 'America/Barbados',
    currency: 'BBD',
    customs: {
      dutyFree: 200,
      documents: ['Invoice', 'Packing List']
    }
  },
  suriname: {
    id: 'suriname',
    name: 'Suriname',
    code: 'SR',
    airport: 'PBM',
    transitDays: { min: 4, max: 6 },
    baseRate: 4.25,
    flag: '🇸🇷',
    timezone: 'America/Paramaribo',
    currency: 'SRD',
    customs: {
      dutyFree: 200,
      documents: ['Invoice', 'Packing List']
    }
  }
};

export const DESTINATION_LIST = Object.values(DESTINATIONS);

export const DESTINATION_OPTIONS = DESTINATION_LIST.map(d => ({
  value: d.id,
  label: `${d.flag} ${d.name}`,
  shortLabel: d.name
}));

export function getDestination(id: string): Destination | undefined {
  return DESTINATIONS[id];
}

export function getDestinationLabel(id: string): string {
  const dest = DESTINATIONS[id];
  return dest ? `${dest.flag} ${dest.name}` : id;
}
