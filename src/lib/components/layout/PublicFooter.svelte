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
        { label: 'Terms of Service', href: '/legal/terms' }
      ]
    }
  ];
</script>

<footer class="bg-gray-100 dark:bg-gray-900 border-t" aria-labelledby="footer-heading">
  <h2 id="footer-heading" class="sr-only">Footer</h2>
  <div class="container py-12 lg:py-16">
    <div class="xl:grid xl:grid-cols-3 xl:gap-8">
      <!-- Company Info -->
      <div class="space-y-8 xl:col-span-1">
        <a href="/" class="flex items-center space-x-2">
          <Logo class="h-10 w-auto" />
        </a>
        <p class="text-sm text-gray-700 dark:text-gray-300 max-w-xs">
          Trusted air freight to the Caribbean from our New Jersey warehouse.
        </p>
        <div class="flex space-x-6">
          <a
            href={COMPANY.social.facebook}
            target="_blank"
            rel="noopener noreferrer"
            class="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <Facebook class="h-6 w-6" />
            <span class="sr-only">Facebook</span>
          </a>
          <a
            href={COMPANY.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            class="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <Instagram class="h-6 w-6" />
            <span class="sr-only">Instagram</span>
          </a>
          <a href={`tel:${COMPANY.phone}`} class="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
            <Phone class="h-6 w-6" />
            <span class="sr-only">Phone</span>
          </a>
          <a href={`mailto:${COMPANY.email}`} class="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
            <Mail class="h-6 w-6" />
            <span class="sr-only">Email</span>
          </a>
        </div>
      </div>

      <!-- Links -->
      <div class="mt-16 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
        <div class="md:grid md:grid-cols-2 md:gap-8">
          <div>
            <h3 class="text-sm font-semibold text-foreground tracking-wider uppercase">
              {footerLinks[0].title}
            </h3>
            <ul role="list" class="mt-4 space-y-4">
              {#each footerLinks[0].links as link}
                <li>
                  <a
                    href={link.href}
                    class="text-base text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              {/each}
            </ul>
          </div>
          <div class="mt-16 md:mt-0">
            <h3 class="text-sm font-semibold text-foreground tracking-wider uppercase">
              {footerLinks[2].title}
            </h3>
            <ul role="list" class="mt-4 space-y-4">
              {#each footerLinks[2].links as link}
                <li>
                  <a
                    href={link.href}
                    class="text-base text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              {/each}
            </ul>
          </div>
        </div>
        <div>
          <h3 class="text-sm font-semibold text-foreground tracking-wider uppercase">
            {footerLinks[1].title}
          </h3>
          <ul role="list" class="mt-4 space-y-4">
            {#each footerLinks[1].links as link}
              <li>
                <a href={link.href} class="text-base text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                  {link.label}
                </a>
              </li>
            {/each}
          </ul>
        </div>
      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="mt-12 border-t pt-8">
      <p class="text-base text-gray-700 dark:text-gray-300 xl:text-center">
        &copy; {new Date().getFullYear()} {COMPANY.name}. All rights reserved.
      </p>
    </div>
  </div>
</footer>



