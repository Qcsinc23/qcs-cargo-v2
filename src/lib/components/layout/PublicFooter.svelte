<script lang="ts">
  import { Logo } from '$lib/components/shared';
  import { COMPANY, DESTINATION_LIST } from '$lib/config';
  import { Facebook, Instagram, Phone, Mail } from 'lucide-svelte';

  const footerLinks = [
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: '/about' },
        { label: 'Services', href: '/services' },
        { label: 'Contact', href: '/contact' },
        { label: 'FAQ', href: '/faq' }
      ]
    },
    {
      title: 'Destinations',
      links: DESTINATION_LIST.map((d) => ({
        label: d.name,
        href: `/destinations/${d.id}`
      }))
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '/legal/privacy' },
        { label: 'Terms of Service', href: '/legal/terms' },
        { label: 'Shipping Policy', href: '/legal/shipping-policy' }
      ]
    }
  ];
</script>

<footer class="relative bg-[#001D3D] border-t border-[#0077B6]/20" aria-labelledby="footer-heading">
  <!-- Wave divider (subtle) -->
  <div class="pointer-events-none absolute top-[-1px] left-0 right-0" aria-hidden="true">
    <svg viewBox="0 0 1440 120" preserveAspectRatio="none" class="h-14 w-full">
      <path
        d="M0,42 C220,86 420,10 720,54 C1020,98 1200,40 1440,70 L1440,0 L0,0 Z"
        fill="rgba(2,62,138,0.35)"
      ></path>
      <path
        d="M0,58 C260,104 470,32 760,64 C1040,96 1180,60 1440,86 L1440,0 L0,0 Z"
        fill="rgba(2,62,138,0.55)"
      ></path>
    </svg>
  </div>

  <h2 id="footer-heading" class="sr-only">Footer</h2>
  <div class="container py-16 lg:py-20">
    <div class="xl:grid xl:grid-cols-3 xl:gap-8">
      <!-- Company Info -->
      <div class="space-y-8 xl:col-span-1">
        <a href="/" class="flex items-center space-x-2">
          <Logo class="h-10 w-auto" />
        </a>
        <p class="text-sm text-[#CAF0F8]/70 max-w-xs leading-relaxed tracking-wide font-light">
          Trusted air freight to the Caribbean from our New Jersey warehouse.
        </p>
        <div class="flex space-x-6">
          <a
            href={COMPANY.social.facebook}
            target="_blank"
            rel="noopener noreferrer"
            class="text-[#CAF0F8]/70 hover:text-[#F0F9FF] transition-colors"
          >
            <Facebook class="h-6 w-6" />
            <span class="sr-only">Facebook</span>
          </a>
          <a
            href={COMPANY.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            class="text-[#CAF0F8]/70 hover:text-[#F0F9FF] transition-colors"
          >
            <Instagram class="h-6 w-6" />
            <span class="sr-only">Instagram</span>
          </a>
          <a href={`tel:${COMPANY.phone}`} class="text-[#CAF0F8]/70 hover:text-[#F0F9FF] transition-colors">
            <Phone class="h-6 w-6" />
            <span class="sr-only">Phone</span>
          </a>
          <a href={`mailto:${COMPANY.email}`} class="text-[#CAF0F8]/70 hover:text-[#F0F9FF] transition-colors">
            <Mail class="h-6 w-6" />
            <span class="sr-only">Email</span>
          </a>
        </div>
      </div>

      <!-- Links -->
      <div class="mt-16 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
        <div class="md:grid md:grid-cols-2 md:gap-8">
          <div>
            <h3 class="text-xs font-semibold text-[#F0F9FF] tracking-[0.28em] uppercase">
              {footerLinks[0].title}
            </h3>
            <ul role="list" class="mt-4 space-y-4">
              {#each footerLinks[0].links as link}
                <li>
                  <a
                    href={link.href}
                    class="text-sm text-[#CAF0F8]/70 hover:text-[#F0F9FF] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              {/each}
            </ul>
          </div>
          <div class="mt-16 md:mt-0">
            <h3 class="text-xs font-semibold text-[#F0F9FF] tracking-[0.28em] uppercase">
              {footerLinks[2].title}
            </h3>
            <ul role="list" class="mt-4 space-y-4">
              {#each footerLinks[2].links as link}
                <li>
                  <a
                    href={link.href}
                    class="text-sm text-[#CAF0F8]/70 hover:text-[#F0F9FF] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              {/each}
            </ul>
          </div>
        </div>
        <div>
          <h3 class="text-xs font-semibold text-[#F0F9FF] tracking-[0.28em] uppercase">
            {footerLinks[1].title}
          </h3>
          <ul role="list" class="mt-4 space-y-4">
            {#each footerLinks[1].links as link}
              <li>
                <a href={link.href} class="text-sm text-[#CAF0F8]/70 hover:text-[#F0F9FF] transition-colors">
                  {link.label}
                </a>
              </li>
            {/each}
          </ul>
        </div>
      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="mt-14 border-t border-[#0077B6]/20 pt-10">
      <p class="text-sm text-[#CAF0F8]/60 tracking-wide xl:text-center">
        &copy; {new Date().getFullYear()} {COMPANY.name}. All rights reserved.
      </p>
    </div>
  </div>
</footer>



