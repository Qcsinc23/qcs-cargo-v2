export const DESTINATIONS = {
  guyana: {
    name: 'Guyana',
    city: 'Georgetown',
    airportCode: 'GEO',
    transitDays: '3-4',
    baseRate: 3.50,
    flag: '🇬🇾'
  },
  jamaica: {
    name: 'Jamaica',
    city: 'Kingston',
    airportCode: 'KIN',
    transitDays: '3-4',
    baseRate: 3.75,
    flag: '🇯🇲'
  },
  trinidad: {
    name: 'Trinidad',
    city: 'Port of Spain',
    airportCode: 'POS',
    transitDays: '3-5',
    baseRate: 3.50,
    flag: '🇹🇹'
  },
  barbados: {
    name: 'Barbados',
    city: 'Bridgetown',
    airportCode: 'BGI',
    transitDays: '4-5',
    baseRate: 4.00,
    flag: '🇧🇧'
  },
  suriname: {
    name: 'Suriname',
    city: 'Paramaribo',
    airportCode: 'PBM',
    transitDays: '4-5',
    baseRate: 4.25,
    flag: '🇸🇷'
  }
} as const;

export type DestinationId = keyof typeof DESTINATIONS;
export type Destination = (typeof DESTINATIONS)[DestinationId];

export const DESTINATION_LIST = Object.entries(DESTINATIONS).map(([id, dest]) => ({
  id: id as DestinationId,
  ...dest
}));

