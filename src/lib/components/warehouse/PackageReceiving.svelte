<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import type { QRScanResult, PackageCondition, WarehousePackage } from '$lib/types/warehouse';
  import { NumericInput } from '$lib/components/ui/numeric-input';

  // Scanner state
  let isScanning = false;
  let scannerError: string | null = null;
  let scanResult: QRScanResult | null = null;
  let showCamera = false;
  let videoStream: MediaStream | null = null;
  let videoElement: HTMLVideoElement;

  // Package data
  let currentPackage: WarehousePackage | null = null;
  let trackingNumber = '';
  let selectedCondition: PackageCondition = 'excellent';
  let actualWeight: number | null = null;
  let actualDimensions = {
    length: null as number | null,
    width: null as number | null,
    height: null as number | null
  };
  let notes = '';
  let photos: File[] = [];
  let photoPreviewUrls: string[] = [];
  let bayLocation = {
    bay: '',
    shelf: '',
    zone: 'receiving'
  };

  // UI state
  let isSaving = false;
  let saveMessage = '';
  let showSuccessModal = false;

  const conditions: { value: PackageCondition; label: string; color: string }[] = [
    { value: 'excellent', label: 'Excellent', color: 'green' },
    { value: 'good', label: 'Good', color: 'blue' },
    { value: 'fair', label: 'Fair', color: 'yellow' },
    { value: 'damaged', label: 'Damaged', color: 'red' },
    { value: 'wet', label: 'Wet', color: 'blue' },
    { value: 'open', label: 'Open', color: 'orange' },
    { value: 'repacked', label: 'Repacked', color: 'purple' }
  ];

  onMount(() => {
    // Initialize scanner when component mounts
  });

  async function startScanning() {
    isScanning = true;
    scannerError = null;
    showCamera = true;

    try {
      // Request camera access
      videoStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      if (videoElement) {
        videoElement.srcObject = videoStream;
        await videoElement.play();
      }

      // Initialize QR scanner (in production, use a proper QR library)
      // For now, we'll simulate manual entry
      setTimeout(() => {
        if (isScanning) {
          showCamera = false;
          manualScan();
        }
      }, 5000);
    } catch (error) {
      console.error('Camera access error:', error);
      scannerError = 'Failed to access camera. Please enter tracking number manually.';
      showCamera = false;
      manualScan();
    }
  }

  function stopScanning() {
    isScanning = false;
    showCamera = false;

    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      videoStream = null;
    }
  }

  async function manualScan() {
    const number = prompt('Enter tracking number:');
    if (number) {
      await scanPackage(number);
    } else {
      isScanning = false;
    }
  }

  async function scanPackage(trackingNum: string) {
    try {
      const response = await fetch(`/api/warehouse/packages/${trackingNum}/scan`);
      const result = await response.json();

      if (response.ok) {
        scanResult = result.data;
        trackingNumber = trackingNum;

        if (!scanResult || !scanResult.exists) {
          scannerError = 'Package not found in system';
          isScanning = false;
          return;
        }

        if (scanResult.status && scanResult.status !== 'incoming') {
          scannerError = `Package already ${scanResult.status}`;
          isScanning = false;
          return;
        }

        // Load package details
        await loadPackageDetails(trackingNum);
      } else {
        scannerError = result.message || 'Failed to scan package';
        isScanning = false;
      }
    } catch (error) {
      console.error('Scan error:', error);
      scannerError = 'Failed to scan package';
      isScanning = false;
    }
  }

  async function loadPackageDetails(trackingNum: string) {
    try {
      // In a real implementation, fetch package details from API
      // For now, simulate package data
      currentPackage = {
        id: 'pkg-123',
        trackingNumber: trackingNum,
        qrCode: '',
        status: 'incoming',
        serviceType: 'express',
        destination: 'JM',
        weight: { actual: 5.5, verified: false, unit: 'kg' },
        photos: [],
        condition: 'excellent',
        exceptions: [],
        receivedAt: new Date().toISOString(),
        receivedBy: 'user-123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as unknown as WarehousePackage;

      // Pre-fill weight if available
      if (currentPackage?.weight?.actual) {
        actualWeight = currentPackage.weight.actual;
      }

      // Generate bay location
      bayLocation.bay = `BAY-${Math.floor(Math.random() * 20) + 1}`;
      bayLocation.shelf = `${String.fromCharCode(65 + Math.floor(Math.random() * 3))}${Math.floor(Math.random() * 5) + 1}`;
    } catch (error) {
      console.error('Failed to load package details:', error);
    }
  }

  function handlePhotoCapture(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = Array.from(target.files || []);

    files.forEach(file => {
      photos.push(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          photoPreviewUrls.push(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    });
  }

  function removePhoto(index: number) {
    photos.splice(index, 1);
    photoPreviewUrls.splice(index, 1);
  }

  async function savePackage() {
    if (!trackingNumber) {
      scannerError = 'No package scanned';
      return;
    }

    isSaving = true;
    saveMessage = '';

    try {
      const packageData = {
        trackingNumber,
        condition: selectedCondition,
        actualWeight: actualWeight ?? undefined,
        actualDimensions: {
          length: actualDimensions.length ?? undefined,
          width: actualDimensions.width ?? undefined,
          height: actualDimensions.height ?? undefined
        },
        notes,
        bayLocation
      };

      const response = await fetch('/api/warehouse/packages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(packageData)
      });

      const result = await response.json();

      if (response.ok) {
        saveMessage = 'Package received successfully!';
        showSuccessModal = true;

        // Upload photos if any
        if (photos.length > 0) {
          await uploadPhotos(result.data.warehousePackageId);
        }

        // Reset form after delay
        setTimeout(() => {
          resetForm();
        }, 2000);
      } else {
        saveMessage = result.message || 'Failed to save package';
      }
    } catch (error) {
      console.error('Save error:', error);
      saveMessage = 'Failed to save package';
    } finally {
      isSaving = false;
    }
  }

  async function uploadPhotos(packageId: string) {
    // In a real implementation, upload photos to storage
    console.log('Uploading photos for package:', packageId);
  }

  function resetForm() {
    scanResult = null;
    currentPackage = null;
    trackingNumber = '';
    selectedCondition = 'excellent';
    actualWeight = null;
    actualDimensions = { length: null, width: null, height: null };
    notes = '';
    photos = [];
    photoPreviewUrls = [];
    bayLocation = { bay: '', shelf: '', zone: 'receiving' };
    scannerError = null;
    saveMessage = '';
    showSuccessModal = false;
  }

  function cancel() {
    stopScanning();
    goto('/warehouse');
  }
</script>

<div class="min-h-screen bg-gray-50">
  <!-- Header -->
  <div class="bg-white shadow-sm border-b">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center py-6">
        <div class="flex items-center space-x-4">
          <button
            on:click={cancel}
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Receive Package</h1>
            <p class="mt-1 text-sm text-gray-500">Scan and verify incoming packages</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Scanner Section -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <div class="text-center">
        {#if !isScanning}
          <button
            on:click={startScanning}
            class="inline-flex items-center justify-center w-32 h-32 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors mb-4"
          >
            <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </button>
          <p class="text-gray-600">Click to start scanning</p>
        {:else if showCamera}
          <div class="relative inline-block">
            <video
              bind:this={videoElement}
              class="rounded-lg border-2 border-blue-600"
              width="400"
              height="300"
            ></video>
            <div class="absolute inset-0 border-4 border-blue-600 rounded-lg pointer-events-none"></div>
            <button
              on:click={stopScanning}
              class="absolute -top-12 right-0 text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        {:else}
          <div class="space-y-4">
            <div class="inline-flex items-center justify-center w-32 h-32 bg-gray-100 rounded-full">
              <svg class="w-16 h-16 text-gray-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <p class="text-gray-600">Scanning...</p>
          </div>
        {/if}

        {#if scannerError}
          <div class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-red-800">{scannerError}</p>
          </div>
        {/if}

        {#if scanResult && scanResult.exists}
          <div class="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p class="text-green-800 font-medium">Package Found</p>
            <p class="text-green-700 text-sm mt-1">Tracking: {trackingNumber}</p>
          </div>
        {/if}
      </div>
    </div>

    <!-- Package Details Form -->
    {#if currentPackage}
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">Package Details</h2>
          <p class="text-sm text-gray-500 mt-1">Tracking: {trackingNumber}</p>
        </div>

        <div class="p-6 space-y-6">
          <!-- Package Condition -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">Package Condition</label>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              {#each conditions as condition}
                <button
                  type="button"
                  on:click={() => selectedCondition = condition.value}
                  class="p-3 rounded-lg border-2 text-center transition-all {
                    selectedCondition === condition.value
                      ? `border-${condition.color}-500 bg-${condition.color}-50`
                      : 'border-gray-200 hover:border-gray-300'
                  }"
                >
                  <div class="text-2xl mb-1">
                    {#if condition.value === 'excellent'} ✅
                    {:else if condition.value === 'good'} 👍
                    {:else if condition.value === 'fair'} 😐
                    {:else if condition.value === 'damaged'} 💥
                    {:else if condition.value === 'wet'} 💧
                    {:else if condition.value === 'open'} 📂
                    {:else if condition.value === 'repacked'} 📦
                    {/if}
                  </div>
                  <p class="text-sm font-medium">{condition.label}</p>
                </button>
              {/each}
            </div>
          </div>

          <!-- Weight Verification -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Actual Weight (kg)
            </label>
            <NumericInput
              bind:value={actualWeight}
              options={{ precision: 1, valueRange: { min: 0 } }}
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter actual weight"
            />
          </div>

          <!-- Dimensions -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Actual Dimensions (cm)
            </label>
            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="block text-xs text-gray-500 mb-1">Length</label>
                <NumericInput
                  bind:value={actualDimensions.length}
                  options={{ precision: 1, valueRange: { min: 0 } }}
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Length"
                />
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">Width</label>
                <NumericInput
                  bind:value={actualDimensions.width}
                  options={{ precision: 1, valueRange: { min: 0 } }}
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Width"
                />
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">Height</label>
                <NumericInput
                  bind:value={actualDimensions.height}
                  options={{ precision: 1, valueRange: { min: 0 } }}
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Height"
                />
              </div>
            </div>
          </div>

          <!-- Bay Location -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Bay Location</label>
            <div class="grid grid-cols-3 gap-3">
              <input
                type="text"
                bind:value={bayLocation.bay}
                class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Bay (e.g., BAY-01)"
                readonly
              />
              <input
                type="text"
                bind:value={bayLocation.shelf}
                class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Shelf (e.g., A1)"
                readonly
              />
              <input
                type="text"
                bind:value={bayLocation.zone}
                class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Zone"
                readonly
              />
            </div>
          </div>

          <!-- Photos -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Photos</label>
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <input
                type="file"
                accept="image/*"
                multiple
                on:change={handlePhotoCapture}
                class="hidden"
                id="photo-upload"
              />
              <label for="photo-upload" class="cursor-pointer">
                <div class="text-center">
                  <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <p class="mt-2 text-sm text-gray-600">Click to add photos</p>
                  <p class="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB each</p>
                </div>
              </label>

              {#if photoPreviewUrls.length > 0}
                <div class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {#each photoPreviewUrls as url, index}
                    <div class="relative group">
                      <img
                        src={url}
                        alt="Package photo {index + 1}"
                        class="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        on:click={() => removePhoto(index)}
                        class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  {/each}
                </div>
              {/if}
            </div>
          </div>

          <!-- Notes -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              bind:value={notes}
              rows={3}
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add any additional notes about the package condition..."
            ></textarea>
          </div>

          <!-- Actions -->
          <div class="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              on:click={resetForm}
              class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              on:click={savePackage}
              disabled={isSaving}
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {#if isSaving}
                <span class="inline-flex items-center">
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              {:else}
                Receive Package
              {/if}
            </button>
          </div>

          {#if saveMessage}
            <div class="p-4 rounded-lg {
              saveMessage.includes('success')
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }">
              {saveMessage}
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </div>

  <!-- Success Modal -->
  {#if showSuccessModal}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg p-6 max-w-sm w-full">
        <div class="text-center">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Package Received!</h3>
          <p class="text-gray-600 text-sm mb-4">
            Package {trackingNumber} has been successfully received and is ready for processing.
          </p>
          <button
            on:click={() => showSuccessModal = false}
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>