<template>
  <!-- Pickup Location Bottom Sheet -->
  <div v-if="isOpen" class="fixed inset-0 bg-white bg-opacity-60 z-50 flex items-end" @click="handleClose">
    <div class="w-full bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto shadow-2xl border-t border-gray-200"
      @click.stop>
      <div class="p-4 pb-8">
        <!-- Handle bar -->
        <div class="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>

        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center space-x-2">
            <span class="text-xl">📍</span>
            <div>
              <h2 class="text-lg font-semibold text-gray-800">Pickup Location</h2>
              <p class="text-sm text-gray-600">Set your pickup location</p>
            </div>
          </div>
          <button @click="handleClose"
            class="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Description -->
        <p class="text-sm text-gray-600 mb-6">
          Choose the branch location where you'd like to pickup your cash
        </p>

        <!-- Store Locations List -->
        <div v-if="savedLocations && savedLocations.length > 0" class="space-y-3 mb-6">
          <div v-for="location in savedLocations" :key="location.name || location.id" @click="selectLocation(location)"
            class="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors">
            <div class="flex items-center justify-between">
              <div class="flex-grow">
                <div class="font-medium text-gray-900 mb-1">{{ location.name }}</div>
                <div class="text-sm text-gray-600 mb-1">{{ location.address }}</div>
                <div class="text-xs text-blue-600 font-medium">{{ location.city }}, {{ location.country }}</div>
              </div>
              <div class="text-blue-500 font-bold text-lg">→</div>
            </div>
          </div>
        </div>

        <!-- No Locations Available -->
        <div v-else class="text-center py-8">
          <div class="text-4xl mb-4 opacity-60">🏪</div>
          <p class="font-medium text-gray-900 mb-2">No pickup locations available</p>
          <p class="text-sm text-gray-600">Please contact the business for pickup options</p>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage"
          class="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mt-4">
          <span>⚠️</span>
          {{ errorMessage }}
        </div>

        <!-- Footer -->
        <div class="flex space-x-3 pt-4 border-t border-gray-200">
          <app-button @click="handleClose" variant="secondary" class="flex-1">
            Cancel
          </app-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue'
import AppButton from '../../AppButton/index.vue'

interface Coordinates {
  lat: number
  lng: number
}

interface Location {
  id?: string
  name?: string
  address: string
  city?: string
  country?: string
  coordinates?: Coordinates
  type?: 'home' | 'work' | 'other'
  notes?: string
}

interface Props {
  isOpen: boolean
  savedLocations?: Location[]
  currentLocation?: Location
}

interface Emits {
  (e: 'close'): void
  (e: 'confirm', location: Location): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Reactive data
const selectedLocation = ref<Location | null>(null)
const errorMessage = ref('')
const isSubmitting = ref(false)

// Methods
const selectLocation = (location: Location) => {
  try {
    isSubmitting.value = true
    errorMessage.value = ''

    // Emit the selected location immediately (simple selection like local version)
    emit('confirm', location)
    handleClose()
  } catch (error) {
    console.error('Failed to select location:', error)
    errorMessage.value = 'Failed to select location. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

const handleClose = () => {
  selectedLocation.value = null
  errorMessage.value = ''
  emit('close')
}
</script>