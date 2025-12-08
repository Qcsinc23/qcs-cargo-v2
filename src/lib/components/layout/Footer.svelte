<script lang="ts">
  import { Package, Phone, Mail, MapPin, Facebook, Instagram, Twitter } from 'lucide-svelte';

  const currentYear = new Date().getFullYear();

  const navigation = {
    services: [
      { name: 'Standard Air Freight', href: '/services#standard' },
      { name: 'Express Delivery', href: '/services#express' },
      { name: 'Door-to-Door', href: '/services#door-to-door' },
      { name: 'Customs Clearance', href: '/services#customs' }
    ],
    destinations: [
      { name: 'Guyana', href: '/services?destination=guyana' },
      { name: 'Jamaica', href: '/services?destination=jamaica' },
      { name: 'Trinidad', href: '/services?destination=trinidad' },
      { name: 'Barbados', href: '/services?destination=barbados' },
      { name: 'Suriname', href: '/services?destination=suriname' }
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Contact', href: '/contact' },
      { name: 'FAQ', href: '/faq' },
      { name: 'Careers', href: '/careers' }
    ],
    legal: [
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Prohibited Items', href: '/prohibited-items' }
    ]
  };
</script>

<footer class="border-t bg-gray-50">
  <div class="container py-12 md:py-16">
    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
      <!-- Brand -->
      <div class="col-span-2">
        <a href="/" class="flex items-center gap-2">
          <Package class="h-8 w-8 text-primary-600" />
          <span class="text-xl font-bold text-primary-800">QCS Cargo</span>
        </a>
        <p class="mt-4 text-sm text-muted-foreground max-w-xs">
          Trusted air freight to the Caribbean from New Jersey. TSA licensed with 15+ years of experience.
        </p>
        <div class="mt-6 space-y-2 text-sm text-muted-foreground">
          <a href="tel:201-249-0929" class="flex items-center gap-2 hover:text-primary-600">
            <Phone class="h-4 w-4" />
            201-249-0929
          </a>
          <a href="mailto:sales@quietcraftsolutions.com" class="flex items-center gap-2 hover:text-primary-600">
            <Mail class="h-4 w-4" />
            sales@quietcraftsolutions.com
          </a>
          <div class="flex items-start gap-2">
            <MapPin class="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>35 Obrien St, E12<br />Kearny, NJ 07032</span>
          </div>
        </div>
      </div>

      <!-- Services -->
      <div>
        <h3 class="font-semibold mb-4">Services</h3>
        <ul class="space-y-2">
          {#each navigation.services as item}
            <li>
              <a href={item.href} class="text-sm text-muted-foreground hover:text-primary-600">
                {item.name}
              </a>
            </li>
          {/each}
        </ul>
      </div>

      <!-- Destinations -->
      <div>
        <h3 class="font-semibold mb-4">Destinations</h3>
        <ul class="space-y-2">
          {#each navigation.destinations as item}
            <li>
              <a href={item.href} class="text-sm text-muted-foreground hover:text-primary-600">
                {item.name}
              </a>
            </li>
          {/each}
        </ul>
      </div>

      <!-- Company -->
      <div>
        <h3 class="font-semibold mb-4">Company</h3>
        <ul class="space-y-2">
          {#each navigation.company as item}
            <li>
              <a href={item.href} class="text-sm text-muted-foreground hover:text-primary-600">
                {item.name}
              </a>
            </li>
          {/each}
        </ul>
      </div>

      <!-- Legal -->
      <div>
        <h3 class="font-semibold mb-4">Legal</h3>
        <ul class="space-y-2">
          {#each navigation.legal as item}
            <li>
              <a href={item.href} class="text-sm text-muted-foreground hover:text-primary-600">
                {item.name}
              </a>
            </li>
          {/each}
        </ul>
      </div>
    </div>

    <!-- Bottom bar -->
    <div class="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
      <p class="text-sm text-muted-foreground">
        © {currentYear} QCS Cargo. All rights reserved.
      </p>
      <div class="flex items-center gap-4">
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" class="text-muted-foreground hover:text-primary-600" aria-label="Facebook">
          <Facebook class="h-5 w-5" />
        </a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" class="text-muted-foreground hover:text-primary-600" aria-label="Instagram">
          <Instagram class="h-5 w-5" />
        </a>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" class="text-muted-foreground hover:text-primary-600" aria-label="Twitter">
          <Twitter class="h-5 w-5" />
        </a>
      </div>
    </div>
  </div>
</footer>

