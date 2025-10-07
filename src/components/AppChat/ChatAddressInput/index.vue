<template>
  <!-- Address Input Modal -->
  <div class="fixed inset-0 bg-white bg-opacity-60 z-50 flex items-end" @click="handleCancel">
    <div class="w-full bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto shadow-2xl border-t border-gray-200"
      @click.stop>
      <div class="p-4 pb-8">
        <!-- Handle bar -->
        <div class="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>

        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center space-x-2">
            <span class="text-xl">📍</span>
            <span class="text-lg font-semibold text-gray-800">Delivery Address</span>
          </div>
          <button @click="handleCancel" class="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="space-y-4">
          <!-- Address search input -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
            <app-select placeholder="Search for your address..." :hasTitle="false" v-model="selectedAddress"
              ref="addressSelect" @OnSearch="handleAddressSearch" :options="addressOptions" autoComplete
              :hasSearch="true" name="DeliveryAddress" usePermanentFloatingLabel
              searchMessage="Type to search for addresses" :searchIsLoading="addressSearchIsLoading" />
            <!-- Use current location -->
            <button type="button" @click="useCurrentLocation" class="text-xs text-blue-600 hover:underline mt-1"
              :disabled="isLocating">
              <span v-if="isLocating">📍 Detecting your location...</span>
              <span v-else>📍 Use my current location</span>
            </button>
          </div>

          <!-- Additional details input -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Address Details</label>
            <app-text-field :has-title="false" type="text"
              placeholder="Add helpful details (apartment, floor, landmark, etc.)" ref="addressDetailsField"
              name="AddressDetails" v-model="addressDetails" usePermanentFloatingLabel is-textarea
              :max-character="500" />
            <div class="text-xs text-gray-500 text-right">{{ addressDetailsLength }}/500</div>
          </div>

          <!-- Address preview -->
          <div v-if="selectedAddress" class="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div class="text-sm font-medium text-blue-800 mb-1">Delivery Address:</div>
            <div class="text-sm text-blue-700">{{ selectedAddress }}</div>
            <div v-if="addressDetails" class="text-sm text-blue-600 mt-1">{{ addressDetails }}</div>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="modal-footer">
        <button class="btn-secondary" @click="handleCancel">
          Cancel
        </button>
        <button class="btn-primary" @click="confirmAddress" :disabled="!selectedAddress || isProcessing">
          {{ isProcessing ? 'Confirming...' : '✓ Continue' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, computed, onMounted } from "vue";
import { AppSelect, AppTextField } from "../..";
import { Logic } from "@greep/logic";

interface SelectOption {
  key: string;
  value: string;
  title: string;
  icon: string;
}

declare global {
  interface Window {
    google: any;
  }
}

export default defineComponent({
  name: "ChatAddressInput",
  components: {
    AppSelect,
    AppTextField,
  },
  props: {
    onAddressConfirm: {
      type: Function,
      required: true,
    },
    onCancel: {
      type: Function,
      required: true,
    },
    isProcessing: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['address-confirm', 'cancel'],
  setup(props, { emit }) {
    const selectedAddress = ref("");
    const addressDetails = ref("");
    const addressSearchIsLoading = ref(false);
    const addressOptions = reactive<SelectOption[]>([]);

    const autocompleteSuggestion = ref<any>();
    const sessionToken = ref<any>();
    const geocoder = ref<any>();
    const isLocating = ref(false);

    const addressDetailsLength = computed(() => addressDetails.value.length);

    const handleDetailsInput = (values: any) => {
      addressDetails.value = values.AddressDetails || '';
    };

    const debounce = (func: Function, delay: number) => {
      let timeoutId: NodeJS.Timeout;
      return (...args: any[]) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(null, args), delay);
      };
    };

    const handleAddressSearch = debounce(async (searchValue: string) => {
      if (!searchValue || searchValue.length < 2) return;

      addressOptions.splice(0, addressOptions.length);

      try {
        if (!autocompleteSuggestion.value || !searchValue) return;

        addressSearchIsLoading.value = true;
        const predictions = await autocompleteSuggestion.value.fetchAutocompleteSuggestions({
          input: searchValue,
          sessionToken: sessionToken.value,
        });

        if (predictions.suggestions) {
          predictions.suggestions.forEach((prediction: any) => {
            const currentPrediction = prediction.placePrediction;
            addressOptions.push({
              key: currentPrediction.text.text,
              value: currentPrediction.text.text,
              title: "",
              icon: ""
            });
          });
        }
      } catch (error) {
        console.error("Error searching addresses:", error);
      } finally {
        addressSearchIsLoading.value = false;
      }
    }, 500);

    const useCurrentLocation = () => {
      if (!navigator.geolocation) {
        console.error("Geolocation is not supported by your browser.");
        return;
      }

      isLocating.value = true;

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;

            if (!geocoder.value) {
              console.error("Google Maps Geocoder not initialized.");
              return;
            }

            geocoder.value.geocode(
              { location: { lat: latitude, lng: longitude } },
              (results: any, status: any) => {
                if (status === "OK" && results[0]) {
                  selectedAddress.value = results[0].formatted_address;
                } else {
                  console.error("Unable to fetch address for current location.");
                }
              }
            );
          } catch (error) {
            console.error("Error fetching current location:", error);
          } finally {
            isLocating.value = false;
          }
        },
        (error) => {
          isLocating.value = false;
          console.error("Unable to retrieve your location:", error);
        }
      );
    };

    const confirmAddress = () => {
      if (!selectedAddress.value) {
        console.error("Please select an address first.");
        return;
      }

      const fullAddress = addressDetails.value
        ? `${selectedAddress.value}, ${addressDetails.value}`
        : selectedAddress.value;

      try {
        props.onAddressConfirm(fullAddress);
        emit('address-confirm', fullAddress);
        selectedAddress.value = "";
        addressDetails.value = "";
        addressOptions.splice(0, addressOptions.length);
      } catch (error) {
        console.error("Error confirming address:", error);
      }
    };

    const cancelAddress = () => {
      selectedAddress.value = "";
      addressDetails.value = "";
      addressOptions.splice(0, addressOptions.length);
      try {
        props.onCancel();
        emit('cancel');
      } catch (error) {
        console.error("Error cancelling address:", error);
      }
    };

    const initPlacesService = async () => {
      try {
        // @ts-ignore Google Maps API
        if (typeof window !== 'undefined' && (window as any).google?.maps) {
          const { AutocompleteSuggestion, AutocompleteSessionToken, Geocoder } =
            await (window as any).google.maps.importLibrary("places");

          autocompleteSuggestion.value = AutocompleteSuggestion;
          sessionToken.value = new AutocompleteSessionToken();
          geocoder.value = new (window as any).google.maps.Geocoder();
        }
      } catch (error) {
        console.error("Error initializing Google Places service:", error);
      }
    };

    const handleCancel = () => {
      cancelAddress();
    };

    onMounted(() => {
      initPlacesService();
    });

    return {
      selectedAddress,
      addressDetails,
      addressDetailsLength,
      addressSearchIsLoading,
      addressOptions,
      isLocating,
      handleAddressSearch,
      confirmAddress,
      cancelAddress,
      handleCancel,
      useCurrentLocation,
    };
  },
});
</script>

<style scoped>
/* Modal Footer Styles */
.modal-footer {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  padding: 1rem 1.5rem 1.5rem;
  border-top: 1px solid #e9ecef;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn-primary:disabled {
  background: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .modal-footer {
    padding: 1rem;
  }

  .btn-primary,
  .btn-secondary {
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
  }
}
</style>