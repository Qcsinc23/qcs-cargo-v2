<script lang="ts">
  import { COMPANY } from '$lib/config/constants';
  
  const lastUpdated = 'December 12, 2024';
</script>

<svelte:head>
  <title>Privacy Policy | QCS Cargo</title>
  <meta name="description" content="QCS Cargo privacy policy. Learn how we collect, use, and protect your personal information." />
</svelte:head>

<header class="mb-8 pb-8 border-b">
  <h1 class="text-3xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
  <p class="text-slate-500">Last updated: {lastUpdated}</p>
</header>

<section>
  <h2>1. Introduction</h2>
  <p>
    {COMPANY.name} ("we," "us," or "our") is committed to protecting your privacy. 
    This Privacy Policy explains how we collect, use, disclose, and safeguard your 
    information when you use our website, services, and applications.
  </p>
  <p>
    By using our services, you consent to the data practices described in this policy. 
    If you do not agree with the terms of this policy, please do not use our services.
  </p>
</section>

<section>
  <h2>2. Information We Collect</h2>
  
  <h3>2.1 Personal Information</h3>
  <p>We may collect the following personal information when you use our services:</p>
  <ul>
    <li><strong>Contact Information:</strong> Name, email address, phone number, mailing address</li>
    <li><strong>Account Information:</strong> Username, password, account preferences</li>
    <li><strong>Payment Information:</strong> Credit card details (processed securely through Stripe)</li>
    <li><strong>Shipping Information:</strong> Sender and recipient names, addresses, package contents descriptions</li>
    <li><strong>Identity Verification:</strong> Government ID when required for customs purposes</li>
  </ul>

  <h3>2.2 Automatically Collected Information</h3>
  <p>When you visit our website, we automatically collect:</p>
  <ul>
    <li>IP address and browser type</li>
    <li>Device information and operating system</li>
    <li>Pages visited and time spent on our site</li>
    <li>Referring website or source</li>
    <li>Cookies and similar tracking technologies</li>
  </ul>
</section>

<section>
  <h2>3. How We Use Your Information</h2>
  <p>We use your personal information to:</p>
  <ul>
    <li>Process and fulfill your shipping orders</li>
    <li>Communicate with you about your shipments and account</li>
    <li>Process payments and prevent fraud</li>
    <li>Comply with customs and regulatory requirements</li>
    <li>Improve our services and website functionality</li>
    <li>Send marketing communications (with your consent)</li>
    <li>Respond to customer service inquiries</li>
    <li>Enforce our terms and conditions</li>
  </ul>
</section>

<section>
  <h2>4. Information Sharing</h2>
  <p>We may share your information with:</p>
  
  <h3>4.1 Service Providers</h3>
  <ul>
    <li>Payment processors (Stripe) for transaction processing</li>
    <li>Email service providers for communications</li>
    <li>Airlines and logistics partners for shipping</li>
    <li>Customs brokers for clearance services</li>
  </ul>

  <h3>4.2 Legal Requirements</h3>
  <p>We may disclose your information when required by:</p>
  <ul>
    <li>Law enforcement agencies</li>
    <li>Court orders or legal proceedings</li>
    <li>Government regulators (TSA, customs authorities)</li>
    <li>Protection of our legal rights</li>
  </ul>

  <h3>4.3 Business Transfers</h3>
  <p>
    In the event of a merger, acquisition, or sale of assets, your information may 
    be transferred as part of that transaction.
  </p>
</section>

<section>
  <h2>5. Data Security</h2>
  <p>We implement appropriate security measures to protect your information:</p>
  <ul>
    <li>SSL/TLS encryption for all data transmission</li>
    <li>Secure password hashing and storage</li>
    <li>Payment card data processed by PCI-compliant providers</li>
    <li>Regular security assessments and updates</li>
    <li>Access controls and employee training</li>
  </ul>
  <p>
    However, no method of transmission over the internet is 100% secure. 
    We cannot guarantee absolute security of your data.
  </p>
</section>

<section>
  <h2>6. Your Rights</h2>
  
  <h3>6.1 Access and Correction</h3>
  <p>
    You have the right to access, correct, or update your personal information 
    at any time through your account settings or by contacting us.
  </p>

  <h3>6.2 Deletion (Right to be Forgotten)</h3>
  <p>
    You may request deletion of your personal data. Upon receiving a valid request, 
    we will delete your personal information within 30 days, except for data we are 
    legally required to retain (e.g., shipping records for customs compliance).
  </p>
  <p>
    To delete your account, visit your account settings or contact our support team. 
    You will have a 30-day grace period to recover your account before permanent deletion.
  </p>

  <h3>6.3 Data Portability</h3>
  <p>
    You may request a copy of your personal data in a commonly used, machine-readable format.
  </p>

  <h3>6.4 Marketing Opt-Out</h3>
  <p>
    You can opt out of marketing communications at any time by clicking the "unsubscribe" 
    link in our emails or updating your notification preferences in your account.
  </p>
</section>

<section>
  <h2>7. Cookies and Tracking</h2>
  <p>We use cookies and similar technologies to:</p>
  <ul>
    <li>Remember your login status and preferences</li>
    <li>Analyze website traffic and usage patterns</li>
    <li>Improve website functionality and user experience</li>
    <li>Serve relevant content and advertisements</li>
  </ul>
  <p>
    You can control cookies through your browser settings. Disabling cookies may 
    affect some features of our website.
  </p>
</section>

<section>
  <h2>8. Third-Party Links</h2>
  <p>
    Our website may contain links to third-party websites. We are not responsible 
    for the privacy practices of these external sites. We encourage you to review 
    their privacy policies before providing any personal information.
  </p>
</section>

<section>
  <h2>9. Children's Privacy</h2>
  <p>
    Our services are not intended for individuals under 18 years of age. 
    We do not knowingly collect personal information from children. 
    If we learn that we have collected information from a child, 
    we will delete it promptly.
  </p>
</section>

<section>
  <h2>10. International Data Transfers</h2>
  <p>
    Your information may be transferred to and processed in countries other than 
    your country of residence, including the United States and Caribbean nations 
    where we operate. These countries may have different data protection laws. 
    By using our services, you consent to such transfers.
  </p>
</section>

<section>
  <h2>11. California Privacy Rights (CCPA)</h2>
  <p>If you are a California resident, you have additional rights under the CCPA:</p>
  <ul>
    <li>Right to know what personal information we collect and how we use it</li>
    <li>Right to request deletion of your personal information</li>
    <li>Right to opt-out of the sale of your personal information (we do not sell your data)</li>
    <li>Right to non-discrimination for exercising your privacy rights</li>
  </ul>
  <p>
    To exercise these rights, contact us using the information below.
  </p>
</section>

<section>
  <h2>12. Changes to This Policy</h2>
  <p>
    We may update this Privacy Policy from time to time. Changes will be posted 
    on this page with an updated revision date. Significant changes will be 
    communicated via email or website notice. Your continued use of our services 
    after changes constitutes acceptance of the updated policy.
  </p>
</section>

<section>
  <h2>13. Contact Us</h2>
  <p>
    For questions, concerns, or requests regarding this Privacy Policy or your 
    personal data, please contact us:
  </p>
  <ul>
    <li><strong>Email:</strong> <a href="mailto:{COMPANY.supportEmail}">{COMPANY.supportEmail}</a></li>
    <li><strong>Phone:</strong> <a href="tel:{COMPANY.phone}">{COMPANY.phone}</a></li>
    <li><strong>Mail:</strong> {COMPANY.name}, Attn: Privacy, {COMPANY.fullAddress}</li>
  </ul>
  <p>
    We will respond to privacy-related inquiries within 30 days.
  </p>
</section>

