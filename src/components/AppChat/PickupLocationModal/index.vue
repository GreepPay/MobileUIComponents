<template>
  <!-- Pickup Location Bottom Sheet -->
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-end"
    @click="handleClose"
  >
    <div
      class="w-full bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto shadow-2xl border-t border-gray-200"
      @click.stop
    >
      <div class="p-4 pb-4">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-2">
            <app-header-text class="!text-base">
              Select Pickup Location
            </app-header-text>
          </div>

          <div class="w-[28px] h-[28px]" @click="handleClose">
            <app-icon name="close" custom-class="h-[22px]" />
          </div>
        </div>

        <!-- Description -->
        <app-normal-text class="text-sm text-gray-600 mb-6">
          Choose the branch location where you'd like to pickup your cash
        </app-normal-text>

        <!-- Store Locations List -->
        <div
          v-if="deliveryAddresses && deliveryAddresses.length > 0"
          class="space-y-3 py-4"
        >
          <div
            v-for="location in deliveryAddresses"
            :key="location.name || location.id"
            class="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <div class="flex items-center justify-between">
              <div class="w-full flex flex-col">
                <div class="pb-[2px]">
                  <app-normal-text class="font-semibold text-gray-900 mb-1">
                    {{ location.name }}
                  </app-normal-text>
                </div>
                <div class="pb-2">
                  <app-normal-text class="text-gray-600 mb-1">
                    {{ location.description }}
                  </app-normal-text>
                </div>
                <div>
                  <app-normal-text class="!text-primary !underline">
                    <a :href="location.google_map_link" target="_blank">
                      See on map
                    </a>
                  </app-normal-text>
                </div>
              </div>

              <div>
                <app-button
                  variant="secondary"
                  class="!py-1 px-4 !w-fit"
                  @click="selectLocation(location)"
                >
                  Select
                </app-button>
              </div>
            </div>
          </div>
        </div>

        <!-- No Locations Available -->
        <div
          v-else
          class="text-center flex flex-col justify-center items-center py-8 bg-gray-50 rounded-lg my-3 border border-gray-200"
        >
          <app-normal-text class="font-semibold text-gray-900 mb-2">
            No pickup locations available
          </app-normal-text>
          <app-normal-text class="text-gray-600">
            Please contact the business for pickup options
          </app-normal-text>
        </div>

        <!-- Error Message -->

        <!-- Footer -->
        <div class="flex space-x-3 pt-4">
          <app-button
            @click="handleClose"
            variant="secondary"
            class="flex-1 py-3"
          >
            Cancel
          </app-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, PropType, onMounted } from "vue";
import AppButton from "../../AppButton/index.vue";
import { AppHeaderText, AppNormalText } from "../../AppTypography";
import AppIcon from "../../AppIcon/index.vue";
import { DeliveryAddress } from "@greep/logic/src/gql/graphql";
import { Logic } from "../../../composable";

interface Coordinates {
  lat: number;
  lng: number;
}

interface Location {
  id?: string;
  name?: string;
  address: string;
  city?: string;
  country?: string;
  coordinates?: Coordinates;
  type?: "home" | "work" | "other";
  notes?: string;
}

export default {
  name: "PickupLocationModal",
  components: {
    AppButton,
    AppHeaderText,
    AppNormalText,
    AppIcon,
  },
  props: {
    isOpen: {
      type: Boolean,
      required: true,
    },
    savedLocations: {
      type: Array as PropType<Location[]>,
      default: () => [],
    },
    currentLocation: {
      type: Object as PropType<Location | undefined>,
      default: undefined,
    },
  },
  emits: ["close", "confirm"],
  setup(props, { emit }) {
    const selectedLocation = ref<Location | null>(null);
    const errorMessage = ref("");
    const isSubmitting = ref(false);

    const deliveryAddresses = ref<DeliveryAddress[]>([]);

    const selectLocation = (location: DeliveryAddress) => {
      try {
        isSubmitting.value = true;
        errorMessage.value = "";

        // Emit the selected location immediately (simple selection like local version)
        emit("confirm", location);
        handleClose();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to select location:", error);
        errorMessage.value = "Failed to select location. Please try again.";
      } finally {
        isSubmitting.value = false;
      }
    };

    const handleClose = () => {
      selectedLocation.value = null;
      errorMessage.value = "";
      emit("close");
    };

    onMounted(async () => {
      const businessUserId =
        Logic.Messaging.SingleConversation?.exchangeAd?.business?.auth_user_id;
      const response = await Logic.User.GetP2PDeliveryAddresses(
        10,
        1,
        "UPDATED_AT",
        "DESC",
        `{
        column: AUTH_USER_ID,
        operator: EQ,
        value: ${businessUserId}
        }`
      );

      if (response?.data) {
        deliveryAddresses.value = response.data;
      }
    });

    return {
      selectedLocation,
      errorMessage,
      isSubmitting,
      selectLocation,
      handleClose,
      deliveryAddresses,
    };
  },
};
</script>
