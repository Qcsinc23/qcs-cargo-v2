<script lang="ts">
  import { COMPANY } from '$lib/config/constants';
  import { DESTINATIONS } from '$lib/config/destinations';
  
  const lastUpdated = 'December 12, 2024';
</script>

<svelte:head>
  <title>Shipping Policy | QCS Cargo</title>
  <meta name="description" content="QCS Cargo shipping policy. Learn about our rates, transit times, packaging requirements, and delivery procedures." />
</svelte:head>

<main class="min-h-screen bg-background text-foreground">
  <div class="container mx-auto px-4 py-20 sm:py-28">
    <header class="mb-10 pb-8 border-b border-border/25">
      <h1 class="font-display text-4xl sm:text-5xl text-foreground mb-2">Shipping Policy</h1>
      <p class="text-sm text-muted-foreground/75 tracking-wide">Last updated: {lastUpdated}</p>
    </header>

    <article class="prose prose-slate prose-headings:font-display prose-a:text-[#023E8A] prose-a:no-underline hover:prose-a:text-[#0077B6] max-w-none">

<section>
  <h2>1. Service Overview</h2>
  <p>
    {COMPANY.name} provides air freight shipping services from New Jersey, USA to 
    Caribbean destinations. We offer various service levels to meet your shipping 
    needs, from standard air freight to express delivery.
  </p>
</section>

<section>
  <h2>2. Destinations and Transit Times</h2>
  <p>We currently serve the following destinations:</p>
  
  <div class="overflow-x-auto my-6">
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b">
          <th class="text-left py-2 pr-4">Destination</th>
          <th class="text-left py-2 pr-4">Airport</th>
          <th class="text-left py-2 pr-4">Standard Transit</th>
          <th class="text-left py-2">Express Transit</th>
        </tr>
      </thead>
      <tbody>
        {#each DESTINATIONS as dest}
          <tr class="border-b">
            <td class="py-2 pr-4">{dest.flag} {dest.name}</td>
            <td class="py-2 pr-4">{dest.capital} ({dest.airport})</td>
            <td class="py-2 pr-4">{dest.transitDays.min}-{dest.transitDays.max} days</td>
            <td class="py-2">1-2 business days</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <p>
    <strong>Note:</strong> Transit times are estimates and do not include time for 
    customs clearance. Actual delivery times may vary due to customs processing, 
    weather conditions, or other factors beyond our control.
  </p>
</section>

<section>
  <h2>3. Shipping Rates</h2>
  
  <h3>3.1 Rate Calculation</h3>
  <p>Shipping rates are calculated based on:</p>
  <ul>
    <li><strong>Actual Weight:</strong> The physical weight of your package in pounds</li>
    <li><strong>Dimensional Weight:</strong> Calculated as (L × W × H) ÷ 166 cubic inches per pound</li>
  </ul>
  <p>
    We charge based on the <strong>greater</strong> of actual weight or dimensional weight. 
    This industry-standard practice ensures fair pricing for lightweight but bulky items.
  </p>

  <h3>3.2 Base Rates</h3>
  <ul>
    <li>Guyana: Starting at $3.50/lb</li>
    <li>Jamaica: Starting at $3.75/lb</li>
    <li>Trinidad: Starting at $3.50/lb</li>
    <li>Barbados: Starting at $4.00/lb</li>
    <li>Suriname: Starting at $4.25/lb</li>
  </ul>

  <h3>3.3 Additional Fees</h3>
  <ul>
    <li><strong>Express Service:</strong> +25% over standard rates</li>
    <li><strong>Door-to-Door Pickup:</strong> $25 within NJ area</li>
    <li><strong>Customs Clearance:</strong> $35 per shipment</li>
    <li><strong>Insurance:</strong> 2% of declared value (minimum $5)</li>
    <li><strong>Oversize Handling:</strong> Custom quote for items over 70 lbs or 48" in any dimension</li>
  </ul>

  <h3>3.4 Volume Discounts</h3>
  <ul>
    <li>100+ lbs: 5% discount</li>
    <li>500+ lbs: 10% discount</li>
    <li>1,000+ lbs: 15% discount</li>
    <li>3+ packages in one booking: Additional 5% discount</li>
  </ul>
</section>

<section>
  <h2>4. Packaging Requirements</h2>
  
  <h3>4.1 General Guidelines</h3>
  <ul>
    <li>Use sturdy, corrugated cardboard boxes in good condition</li>
    <li>Seal all seams with strong packing tape</li>
    <li>Remove or cover old labels and barcodes</li>
    <li>Include padding (bubble wrap, packing paper) for fragile items</li>
    <li>Do not exceed 150 lbs per package</li>
  </ul>

  <h3>4.2 Barrels</h3>
  <ul>
    <li>Standard barrel sizes accepted: 30, 45, and 55 gallon</li>
    <li>Seal barrel lids securely with barrel rings</li>
    <li>Place heavier items at the bottom</li>
    <li>Wrap fragile items individually</li>
    <li>Do not exceed 200 lbs per barrel</li>
  </ul>

  <h3>4.3 Fragile Items</h3>
  <ul>
    <li>Mark packages clearly as "FRAGILE"</li>
    <li>Use double boxing for extremely fragile items</li>
    <li>Include at least 2 inches of cushioning on all sides</li>
    <li>Consider purchasing additional insurance</li>
  </ul>

  <h3>4.4 Prohibited Packaging</h3>
  <ul>
    <li>Damaged or worn boxes</li>
    <li>Plastic bags as outer packaging</li>
    <li>Paper wrapping as outer packaging</li>
    <li>String or rope as primary closure</li>
  </ul>
</section>

<section>
  <h2>5. Drop-Off Procedures</h2>
  
  <h3>5.1 Warehouse Location</h3>
  <p>
    <strong>{COMPANY.fullAddress}</strong><br />
    Monday - Friday: {COMPANY.hours.weekday}<br />
    Saturday: {COMPANY.hours.saturday}<br />
    Sunday: {COMPANY.hours.sunday}
  </p>

  <h3>5.2 Booking Required</h3>
  <p>
    All drop-offs require a booking through our website or mobile app. 
    Walk-ins may experience longer wait times.
  </p>

  <h3>5.3 What to Bring</h3>
  <ul>
    <li>Booking confirmation (QR code or booking number)</li>
    <li>Government-issued photo ID</li>
    <li>Packed and labeled packages ready for shipping</li>
    <li>Completed customs declaration (if required)</li>
  </ul>

  <h3>5.4 Drop-Off Process</h3>
  <ol>
    <li>Arrive during your scheduled time slot</li>
    <li>Present your booking QR code to staff</li>
    <li>Packages will be weighed and measured</li>
    <li>Confirm final charges and complete payment if needed</li>
    <li>Receive tracking number and receipt</li>
  </ol>
</section>

<section>
  <h2>6. Tracking and Delivery</h2>
  
  <h3>6.1 Tracking Your Shipment</h3>
  <p>Track your shipment at any time through:</p>
  <ul>
    <li>Our website at <a href="/track">/track</a></li>
    <li>Your customer dashboard</li>
    <li>Email and SMS notifications (if enabled)</li>
  </ul>

  <h3>6.2 Tracking Statuses</h3>
  <ul>
    <li><strong>Received:</strong> Package has arrived at our warehouse</li>
    <li><strong>Processing:</strong> Package is being prepared for shipment</li>
    <li><strong>In Transit:</strong> Package is on its way to the destination</li>
    <li><strong>Customs:</strong> Package is undergoing customs clearance</li>
    <li><strong>Out for Delivery:</strong> Package is with local delivery partner</li>
    <li><strong>Delivered:</strong> Package has been delivered</li>
  </ul>

  <h3>6.3 Delivery Options</h3>
  <ul>
    <li><strong>Airport Pickup:</strong> Recipient collects from cargo facility</li>
    <li><strong>Door-to-Door:</strong> Delivery to recipient's address</li>
    <li><strong>Agent Pickup:</strong> Authorized agent collects on behalf of recipient</li>
  </ul>
</section>

<section>
  <h2>7. Customs and Documentation</h2>
  
  <h3>7.1 Customs Declaration</h3>
  <p>
    All international shipments require accurate customs declarations. 
    You must provide:
  </p>
  <ul>
    <li>Detailed description of contents</li>
    <li>Quantity of each item</li>
    <li>Declared value in USD</li>
    <li>Country of origin for each item</li>
  </ul>

  <h3>7.2 Duties and Taxes</h3>
  <p>
    Import duties and taxes are the responsibility of the recipient. 
    Rates vary by destination country and item category. 
    {COMPANY.name} is not responsible for any customs duties, taxes, 
    or fees assessed by destination countries.
  </p>

  <h3>7.3 Commercial Shipments</h3>
  <p>
    Business shipments may require additional documentation including:
  </p>
  <ul>
    <li>Commercial invoice</li>
    <li>Packing list</li>
    <li>Certificate of origin</li>
    <li>Import permits (if applicable)</li>
  </ul>
</section>

<section>
  <h2>8. Claims and Liability</h2>
  
  <h3>8.1 Filing a Claim</h3>
  <p>
    Claims for lost, damaged, or delayed shipments must be filed within 
    14 days of delivery (or expected delivery date for lost items).
  </p>
  <p>To file a claim:</p>
  <ol>
    <li>Contact our customer service team</li>
    <li>Provide tracking number and booking details</li>
    <li>Submit photos of damage (if applicable)</li>
    <li>Provide proof of value (receipt, invoice)</li>
  </ol>

  <h3>8.2 Liability Limits</h3>
  <ul>
    <li><strong>Without Insurance:</strong> Maximum liability of $100 per shipment</li>
    <li><strong>With Insurance:</strong> Declared value up to policy limits</li>
  </ul>

  <h3>8.3 Exclusions</h3>
  <p>We are not liable for:</p>
  <ul>
    <li>Items improperly packed by the shipper</li>
    <li>Inherent defects or normal wear</li>
    <li>Confiscation by customs or authorities</li>
    <li>Delays due to weather or force majeure</li>
    <li>Prohibited or undeclared items</li>
  </ul>
</section>

<section>
  <h2>9. Cancellations and Modifications</h2>
  
  <h3>9.1 Cancellation Policy</h3>
  <ul>
    <li>Free cancellation: More than 12 hours before scheduled drop-off</li>
    <li>$15 fee: Within 12 hours of scheduled drop-off</li>
    <li>No cancellation: After packages are received at warehouse</li>
  </ul>

  <h3>9.2 Modifications</h3>
  <ul>
    <li>Free modifications: Up to 24 hours before scheduled drop-off</li>
    <li>Changes after drop-off may incur additional charges</li>
    <li>Recipient address changes may delay delivery</li>
  </ul>
</section>

<section>
  <h2>10. Contact Us</h2>
  <p>
    For questions about our shipping policy or to make a booking:
  </p>
  <ul>
    <li><strong>Phone:</strong> <a href={`tel:${COMPANY.phone}`}>{COMPANY.phone}</a></li>
    <li><strong>Email:</strong> <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a></li>
    <li><strong>Address:</strong> {COMPANY.fullAddress}</li>
  </ul>
</section>

    </article>
  </div>
</main>