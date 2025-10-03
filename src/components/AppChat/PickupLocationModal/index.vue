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

        <!-- Content -->
        <div class="space-y-6">
          <!-- Current Location Option -->
          <div class="border border-gray-200 rounded-lg p-4">
            <button @click="useCurrentLocation" :disabled="isGettingLocation"
              class="w-full flex items-center space-x-3 text-left hover:bg-gray-50 rounded-lg p-2">
              <div class="flex-shrink-0">
                <app-icon :name="isGettingLocation ? 'loading' : 'location-arrow'" :class="[
                  'w-6 h-6',
                  isGettingLocation ? 'animate-spin text-blue-500' : 'text-blue-600'
                ]" />
              </div>
              <div class="flex-grow">
                <p class="font-medium text-gray-900">
                  {{ isGettingLocation ? 'Getting location...' : 'Use Current Location' }}
                </p>
                <p class="text-sm text-gray-600">
                  We'll detect your current position automatically
                </p>
              </div>
            </button>
          </div>

          <!-- Saved Locations -->
          <div v-if="savedLocations && savedLocations.length > 0">
            <h3 class="font-medium text-gray-900 mb-3 flex items-center">
              <app-icon name="bookmark" class="w-5 h-5 mr-2" />
              Saved Locations
            </h3>

            <div class="space-y-2">
              <div v-for="location in savedLocations" :key="location.id" @click="selectSavedLocation(location)"
                class="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors">
                <div class="flex items-start space-x-3">
                  <app-icon :name="getLocationIcon(location.type)" class="w-5 h-5 text-gray-600 mt-1" />
                  <div class="flex-grow">
                    <p class="font-medium text-gray-900">{{ location.name }}</p>
                    <p class="text-sm text-gray-600">{{ location.address }}</p>
                    <div v-if="location.notes" class="text-xs text-gray-500 mt-1">
                      {{ location.notes }}
                    </div>
                  </div>
                  <div class="text-blue-500">→</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Search Location -->
          <div>
            <h3 class="font-medium text-gray-900 mb-3 flex items-center">
              <app-icon name="magnifying-glass" class="w-5 h-5 mr-2" />
              Search Location
            </h3>

            <div class="relative">
              <input ref="addressInputRef" v-model="searchQuery" type="text"
                placeholder="Search for an address or place..."
                class="w-full p-3 border border-gray-300 rounded-lg pr-10" @input="handleAddressSearch"
                @focus="showSuggestions = true" />
              <app-icon name="magnifying-glass"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>

            <!-- Address Suggestions -->
            <div v-if="showSuggestions && addressSuggestions.length > 0"
              class="mt-2 border border-gray-200 rounded-lg bg-white shadow-lg max-h-60 overflow-y-auto">
              <div v-for="(suggestion, index) in addressSuggestions" :key="index"
                @click="selectAddressSuggestion(suggestion)"
                class="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0">
                <div class="flex items-start space-x-3">
                  <app-icon name="map-pin" class="w-4 h-4 text-gray-500 mt-1" />
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ suggestion.main_text }}</p>
                    <p class="text-xs text-gray-600">{{ suggestion.secondary_text }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Selected Location Display -->
          <div v-if="selectedLocation" class="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 class="font-medium text-green-900 mb-2 flex items-center">
              <app-icon name="check-circle" class="w-5 h-5 mr-2" />
              Selected Location
            </h4>
            <div class="text-sm space-y-1">
              <p class="font-medium text-green-800">{{ selectedLocation.name || 'Custom Location' }}</p>
              <p class="text-green-700">{{ selectedLocation.address }}</p>
              <div v-if="selectedLocation.coordinates" class="flex items-center space-x-4 text-xs text-green-600">
                <span>Lat: {{ selectedLocation.coordinates.lat.toFixed(6) }}</span>
                <span>Lng: {{ selectedLocation.coordinates.lng.toFixed(6) }}</span>
              </div>
            </div>
          </div>

          <!-- Additional Notes -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Pickup Instructions (Optional)
            </label>
            <textarea v-model="pickupNotes" placeholder="Any specific instructions for the pickup location..."
              class="w-full p-3 border border-gray-300 rounded-lg resize-none" rows="3" />
          </div>
        </div>

        <!-- Footer -->
        <div class="flex space-x-3 pt-4 border-t border-gray-200">
          <app-button @click="handleClose" variant="secondary" class="flex-1">
            Cancel
          </app-button>
          <app-button @click="handleConfirm" variant="primary" class="flex-1" :disabled="!selectedLocation">
            Confirm Location
          </app-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineProps, defineEmits } from 'vue'
import AppButton from '../../AppButton/index.vue'
import AppIcon from '../../AppIcon/index.vue'

// Google Maps type declarations
declare global {
  interface Window {
    google: any
  }
}

interface Coordinates {
  lat: number
  lng: number
}

interface Location {
  id?: string
  name?: string
  address: string
  coordinates?: Coordinates
  type?: 'home' | 'work' | 'other'
  notes?: string
}

interface AddressSuggestion {
  place_id: string
  main_text: string
  secondary_text: string
  description: string
}

interface Props {
  isOpen: boolean
  savedLocations?: Location[]
  currentLocation?: Location
}

interface Emits {
  (e: 'close'): void
  (e: 'confirm', location: Location, notes: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const addressInputRef = ref<HTMLInputElement>()
const searchQuery = ref('')
const showSuggestions = ref(false)
const addressSuggestions = ref<AddressSuggestion[]>([])
const selectedLocation = ref<Location | null>(null)
const pickupNotes = ref('')
const isGettingLocation = ref(false)

let autocompleteService: any = null
let geocoderService: any = null

onMounted(() => {
  initializeGoogleMaps()
})

const initializeGoogleMaps = () => {
  if (window.google && window.google.maps) {
    autocompleteService = new window.google.maps.places.AutocompleteService()
    geocoderService = new window.google.maps.Geocoder()
  }
}

const handleAddressSearch = () => {
  if (!autocompleteService || searchQuery.value.length < 3) {
    addressSuggestions.value = []
    return
  }

  autocompleteService.getPlacePredictions(
    {
      input: searchQuery.value,
      componentRestrictions: { country: 'ng' } // Restrict to Nigeria
    },
    (predictions, status) => {
      if (status === window.google?.maps?.places?.PlacesServiceStatus?.OK && predictions) {
        addressSuggestions.value = predictions.map(prediction => ({
          place_id: prediction.place_id,
          main_text: prediction.structured_formatting.main_text,
          secondary_text: prediction.structured_formatting.secondary_text || '',
          description: prediction.description
        }))
      } else {
        addressSuggestions.value = []
      }
    }
  )
}

const selectAddressSuggestion = (suggestion: AddressSuggestion) => {
  if (!geocoderService) return

  geocoderService.geocode(
    { placeId: suggestion.place_id },
    (results, status) => {
      if (status === window.google?.maps?.GeocoderStatus?.OK && results && results[0]) {
        const result = results[0]
        selectedLocation.value = {
          address: result.formatted_address,
          coordinates: {
            lat: result.geometry.location.lat(),
            lng: result.geometry.location.lng()
          }
        }
        searchQuery.value = suggestion.description
        showSuggestions.value = false
      }
    }
  )
}

const useCurrentLocation = () => {
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by this browser.')
    return
  }

  isGettingLocation.value = true

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const coords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }

      if (geocoderService) {
        geocoderService.geocode(
          { location: coords },
          (results, status) => {
            isGettingLocation.value = false
            if (status === window.google?.maps?.GeocoderStatus?.OK && results && results[0]) {
              selectedLocation.value = {
                name: 'Current Location',
                address: results[0].formatted_address,
                coordinates: coords
              }
            } else {
              selectedLocation.value = {
                name: 'Current Location',
                address: `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`,
                coordinates: coords
              }
            }
          }
        )
      } else {
        isGettingLocation.value = false
        selectedLocation.value = {
          name: 'Current Location',
          address: `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`,
          coordinates: coords
        }
      }
    },
    (error) => {
      isGettingLocation.value = false
      console.error('Error getting location:', error)
      alert('Unable to get your current location. Please try searching for an address.')
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000
    }
  )
}

const selectSavedLocation = (location: Location) => {
  selectedLocation.value = { ...location }
  searchQuery.value = location.address
  showSuggestions.value = false
}

const getLocationIcon = (type?: string): string => {
  switch (type) {
    case 'home':
      return 'home'
    case 'work':
      return 'building-office'
    default:
      return 'map-pin'
  }
}

const handleClose = () => {
  selectedLocation.value = null
  searchQuery.value = ''
  pickupNotes.value = ''
  showSuggestions.value = false
  addressSuggestions.value = []
  emit('close')
}

const handleConfirm = () => {
  if (!selectedLocation.value) return

  emit('confirm', selectedLocation.value, pickupNotes.value)
  handleClose()
}
</script>