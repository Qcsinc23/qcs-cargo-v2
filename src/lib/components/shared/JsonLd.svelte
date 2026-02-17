<script lang="ts">
  import { COMPANY } from '$lib/config/constants';

  export let type: 'Organization' | 'LocalBusiness' | 'FAQPage' | 'Service' = 'Organization';
  export let data: Record<string, unknown> = {};

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://qcs-cargo.com',
    name: COMPANY.name,
    alternateName: COMPANY.fullName,
    description: 'Reliable Caribbean air freight shipping from New Jersey',
    url: 'https://qcs-cargo.com',
    telephone: COMPANY.phone,
    email: COMPANY.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: COMPANY.address.street,
      addressLocality: COMPANY.address.city,
      addressRegion: COMPANY.address.state,
      postalCode: COMPANY.address.zip,
      addressCountry: COMPANY.address.country
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: COMPANY.coordinates.lat,
      longitude: COMPANY.coordinates.lng
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00'
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '09:00',
        closes: '14:00'
      }
    ],
    priceRange: '$$',
    areaServed: [
      { '@type': 'Country', name: 'Guyana' },
      { '@type': 'Country', name: 'Jamaica' },
      { '@type': 'Country', name: 'Trinidad and Tobago' },
      { '@type': 'Country', name: 'Barbados' },
      { '@type': 'Country', name: 'Suriname' }
    ],
    sameAs: [COMPANY.social.facebook, COMPANY.social.instagram]
  };

  function getSchema() {
    switch (type) {
      case 'Organization':
      case 'LocalBusiness':
        return organizationSchema;
      case 'FAQPage':
        return {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          mainEntity: (data as any).faqs || []
        };
      case 'Service':
        return {
          '@context': 'https://schema.org',
          '@type': 'Service',
          provider: {
            '@type': 'LocalBusiness',
            name: COMPANY.name
          },
          ...data
        };
      default:
        return organizationSchema;
    }
  }

  $: schema = getSchema();
</script>

<svelte:head>
  <script type="application/ld+json">{JSON.stringify(schema)}</script>
</svelte:head>
