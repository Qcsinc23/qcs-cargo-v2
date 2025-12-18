<script lang="ts">
  import { page } from '$app/stores';
  import { COMPANY } from '$lib/config/constants';

  export let title = 'QCS Cargo';
  export let description = 'Reliable Caribbean air freight shipping from New Jersey to Guyana, Jamaica, Trinidad, Barbados, and Suriname. Get instant quotes and real-time tracking.';
  export let keywords = 'caribbean shipping, air freight, guyana shipping, jamaica shipping, trinidad shipping, cargo shipping, package delivery';
  export let image = '/og-image.jpg';
  export let type = 'website';
  export let noindex = false;

  $: canonicalUrl = $page.url.href;
  $: fullTitle = title === 'QCS Cargo' ? title : `${title} | QCS Cargo`;
</script>

<svelte:head>
  <!-- Primary Meta Tags -->
  <title>{fullTitle}</title>
  <meta name="title" content={fullTitle} />
  <meta name="description" content={description} />
  <meta name="keywords" content={keywords} />
  
  {#if noindex}
    <meta name="robots" content="noindex, nofollow" />
  {:else}
    <meta name="robots" content="index, follow" />
  {/if}

  <!-- Canonical -->
  <link rel="canonical" href={canonicalUrl} />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content={type} />
  <meta property="og:url" content={canonicalUrl} />
  <meta property="og:title" content={fullTitle} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={image} />
  <meta property="og:site_name" content="QCS Cargo" />

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content={canonicalUrl} />
  <meta property="twitter:title" content={fullTitle} />
  <meta property="twitter:description" content={description} />
  <meta property="twitter:image" content={image} />

  <!-- Additional -->
  <meta name="author" content={COMPANY.name} />
  <meta name="geo.region" content="US-NJ" />
  <meta name="geo.placename" content="Kearny, New Jersey" />
</svelte:head>






