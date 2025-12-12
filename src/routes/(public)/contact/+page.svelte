<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Textarea } from '$lib/components/ui/textarea';
  import { Label } from '$lib/components/ui/label';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
  import { COMPANY } from '$lib/config/constants';
  import { 
    MapPin, Phone, Mail, Clock, Send, CheckCircle2, 
    AlertCircle, MessageSquare 
  } from 'lucide-svelte';

  let formData = {
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  };

  // Honeypot field (hidden). Bots often fill it; humans won't.
  let website = '';

  let isSubmitting = false;
  let submitSuccess = false;
  let submitError: string | null = null;

  function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function validatePhone(phone: string): boolean {
    if (!phone) return true; // Phone is optional
    const phoneRegex = /^[\d\s()+-]+$/;
    return phoneRegex.test(phone);
  }

  async function handleSubmit() {
    submitError = null;
    submitSuccess = false;

    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      submitError = 'Please fill in all required fields';
      return;
    }

    // Email format validation
    if (!validateEmail(formData.email)) {
      submitError = 'Please enter a valid email address';
      return;
    }

    // Phone format validation (if provided)
    if (!validatePhone(formData.phone)) {
      submitError = 'Please enter a valid phone number';
      return;
    }

    // Message length validation
    if (formData.message.length < 10) {
      submitError = 'Message must be at least 10 characters long';
      return;
    }

    if (formData.message.length > 1000) {
      submitError = 'Message must be less than 1000 characters';
      return;
    }

    isSubmitting = true;

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          website
        })
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error || 'Failed to send message');
      }

      submitSuccess = true;
      formData = { name: '', email: '', phone: '', subject: '', message: '' };
      website = '';
    } catch (err: unknown) {
      submitError = err instanceof Error ? err.message : 'Failed to send message. Please try again or call us directly.';
    } finally {
      isSubmitting = false;
    }
  }
</script>

<svelte:head>
  <title>Contact Us | QCS Cargo - Get in Touch</title>
  <meta name="description" content="Contact QCS Cargo for shipping inquiries, quotes, or support. Visit our Kearny, NJ warehouse or reach us by phone and email." />
</svelte:head>

<main class="min-h-screen bg-slate-50">
  <!-- Hero -->
  <section class="bg-gradient-to-br from-primary-600 to-primary-800 py-12 text-white">
    <div class="container mx-auto px-4 text-center">
      <h1 class="text-3xl md:text-4xl font-bold mb-2">
        Get in Touch
      </h1>
      <p class="text-primary-100">
        We're here to help with all your shipping needs
      </p>
    </div>
  </section>

  <section class="py-12">
    <div class="container mx-auto px-4">
      <div class="grid lg:grid-cols-3 gap-8">
        <!-- Contact Info -->
        <div class="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle class="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="flex items-start gap-3">
                <MapPin class="w-5 h-5 text-primary-600 flex-shrink-0 mt-1" />
                <div>
                  <p class="font-medium">Address</p>
                  <p class="text-sm text-slate-600">{COMPANY.fullAddress}</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <Phone class="w-5 h-5 text-primary-600 flex-shrink-0 mt-1" />
                <div>
                  <p class="font-medium">Phone</p>
                  <a href="tel:{COMPANY.phone}" class="text-sm text-primary-600 hover:underline">
                    {COMPANY.phone}
                  </a>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <Mail class="w-5 h-5 text-primary-600 flex-shrink-0 mt-1" />
                <div>
                  <p class="font-medium">Email</p>
                  <a href="mailto:{COMPANY.email}" class="text-sm text-primary-600 hover:underline">
                    {COMPANY.email}
                  </a>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <MessageSquare class="w-5 h-5 text-primary-600 flex-shrink-0 mt-1" />
                <div>
                  <p class="font-medium">WhatsApp</p>
                  <a 
                    href="https://wa.me/{COMPANY.social.whatsapp.replace(/[^0-9]/g, '')}" 
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-sm text-primary-600 hover:underline"
                  >
                    {COMPANY.social.whatsapp}
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle class="text-lg flex items-center gap-2">
                <Clock class="w-5 h-5" />
                Business Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul class="space-y-2 text-sm">
                <li class="flex justify-between">
                  <span class="text-slate-600">Monday - Friday</span>
                  <span class="font-medium">{COMPANY.hours.weekday}</span>
                </li>
                <li class="flex justify-between">
                  <span class="text-slate-600">Saturday</span>
                  <span class="font-medium">{COMPANY.hours.saturday}</span>
                </li>
                <li class="flex justify-between">
                  <span class="text-slate-600">Sunday</span>
                  <span class="font-medium text-red-600">{COMPANY.hours.sunday}</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <!-- Map Embed -->
          <Card class="overflow-hidden">
            <div class="h-48 bg-slate-200">
              <iframe
                title="QCS Cargo Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.1!2d-74.1502!3d40.7676!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDQ2JzAzLjQiTiA3NMKwMDknMDAuNyJX!5e0!3m2!1sen!2sus!4v1234567890"
                width="100%"
                height="100%"
                style="border:0;"
                allowfullscreen
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </Card>
        </div>

        <!-- Contact Form -->
        <div class="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Send Us a Message</CardTitle>
              <CardDescription>
                Fill out the form below and we'll get back to you within 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              {#if submitSuccess}
                <Alert class="bg-green-50 border-green-200 mb-6">
                  <CheckCircle2 class="w-4 h-4 text-green-600" />
                  <AlertDescription class="text-green-800">
                    Thank you for your message! We'll get back to you shortly.
                  </AlertDescription>
                </Alert>
              {/if}

              {#if submitError}
                <Alert variant="destructive" class="mb-6">
                  <AlertCircle class="w-4 h-4" />
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              {/if}

              <form on:submit|preventDefault={handleSubmit} class="space-y-6">
                <!-- Honeypot: hidden field for bots -->
                <div class="hidden" aria-hidden="true">
                  <Label for="website">Website</Label>
                  <Input id="website" bind:value={website} tabindex={-1} autocomplete="off" />
                </div>

                <div class="grid sm:grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <Label for="name">Name <span class="text-red-500">*</span></Label>
                    <Input
                      id="name"
                      bind:value={formData.name}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div class="space-y-2">
                    <Label for="email">Email <span class="text-red-500">*</span></Label>
                    <Input
                      id="email"
                      type="email"
                      bind:value={formData.email}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div class="grid sm:grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <Label for="phone">Phone (Optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      bind:value={formData.phone}
                      placeholder="(201) 555-0123"
                    />
                  </div>
                  <div class="space-y-2">
                    <Label for="subject">Subject</Label>
                    <select
                      id="subject"
                      bind:value={formData.subject}
                      class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <option value="">Select a topic</option>
                      <option value="quote">Request a Quote</option>
                      <option value="tracking">Tracking Issue</option>
                      <option value="shipping">Shipping Question</option>
                      <option value="complaint">File a Complaint</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div class="space-y-2">
                  <Label for="message">Message <span class="text-red-500">*</span></Label>
                  <Textarea
                    id="message"
                    bind:value={formData.message}
                    placeholder="How can we help you?"
                    rows={6}
                    required
                  />
                </div>

                <Button type="submit" disabled={isSubmitting} class="w-full sm:w-auto gap-2">
                  <Send class="w-4 h-4" />
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </section>
</main>

