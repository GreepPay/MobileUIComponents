<template>
  <!-- Address Input Modal -->
  <div
    class="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-end"
    @click="handleCancel"
  >
    <div
      class="w-full bg-white rounded-t-3xl max-h-[60vh] overflow-y-auto shadow-2xl border-t border-gray-200 absolute"
      @click.stop
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between pb-4 sticky top-0 bg-white pt-4 px-4 z-10"
      >
        <div class="flex items-center space-x-2">
          <app-header-text class="!text-base">
            {{ addressType }} ({{ expectedLocationCounts }})
          </app-header-text>
        </div>

        <div class="w-[28px] h-[28px]" @click="handleCancel">
          <app-icon name="close" custom-class="h-[22px]" />
        </div>
      </div>
      <div class="px-4 pb-4">
        <template v-if="showAddLocationSection">
          <div class="w-full flex flex-col">
            <!-- Delivery Address Name -->

            <div class="w-full flex flex-col mb-4">
              <app-normal-text class="!text-gray-600 !text-[12px] pb-2">
                Address Name
              </app-normal-text>
              <app-text-field
                :has-title="true"
                title="Address Name"
                type="text"
                placeholder="Enter address name (e.g., HQ, Branch Office)"
                v-model="formData.name"
                name="Address Name"
                :rules="[FormValidations.RequiredRule]"
              />
            </div>

            <!-- Delivery Location Area -->
            <div class="w-full flex flex-col mb-4" v-if="showDeliverySelector">
              <app-normal-text class="!text-gray-600 !text-[12px] pb-2">
                Location Area
              </app-normal-text>
              <app-select
                :placeholder="'Select Location Area'"
                :hasTitle="false"
                :paddings="'py-4 !px-4'"
                :options="deliveryLocationOptions"
                ref="deliveryArea"
                usePermanentFloatingLabel
                v-on:update:model-value="
                  (data) => {
                    formData.delivery_location_id = data;
                  }
                "
                v-model="deliveryLocationId"
                auto-complete
              >
              </app-select>
            </div>

            <!-- Google Maps Link  -->
            <div class="w-full flex flex-col mb-4">
              <app-normal-text class="!text-gray-600 !text-[12px] pb-2">
                Google Maps Link
              </app-normal-text>
              <app-text-field
                :has-title="true"
                title="Google Maps Link"
                type="url"
                placeholder="Google Map Link"
                v-model="formData.google_map_link"
                :rules="[FormValidations.RequiredRule]"
                name="Google Maps Link"
              />
            </div>

            <!-- Description -->
            <div class="w-full flex flex-col mb-4">
              <app-normal-text class="!text-gray-600 !text-[12px] pb-2">
                Description
              </app-normal-text>
              <app-text-field
                :has-title="true"
                title="Description"
                type="text"
                placeholder="Description"
                v-model="formData.description"
                :is-textarea="true"
                text-area-row="4"
                :rules="[FormValidations.RequiredRule]"
                name="Description"
              />
            </div>

            <div class="w-full grid grid-cols-2 gap-3 mt-2">
              <div class="col-span-1 flex flex-col">
                <app-button
                  @click="showAddLocationSection = false"
                  class="!w-full px-4 py-3"
                  variant="secondary"
                  outlined
                >
                  Cancel
                </app-button>
              </div>

              <div class="col-span-1 flex flex-col">
                <app-button
                  @click="addDeliveryAddress"
                  :is-loading="isLoading"
                  class="!w-full px-4 py-3"
                  variant="secondary"
                >
                  Confirm Address
                </app-button>
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <template v-if="deliveryAddresses.length > 0">
            <div class="space-y-3">
              <div class="w-full flex flex-col">
                <app-button
                  custom-class="!w-full px-4 py-3 mb-2 !border-secondary !border-[1.5px]"
                  variant="secondary"
                  @click="showAddLocationSection = true"
                >
                  + Add new location
                </app-button>
              </div>
              <div
                v-for="location in deliveryAddresses"
                :key="location.name || location.id"
                :class="` ${
                  selectedLocations.includes(location)
                    ? '!border-primary !border-[2px]'
                    : '!border-gray-200 !border'
                } rounded-lg p-4 cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors`"
                @click="toggleLocationSelection(location)"
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
                </div>
              </div>
            </div>
          </template>
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

            <div class="w-full flex flex-col items-center mt-2 justify-center">
              <app-button
                class="!w-fit px-4 py-1 mt-2"
                variant="secondary"
                @click="showAddLocationSection = true"
              >
                + Add new location
              </app-button>
            </div>
          </div>
        </template>

        <!-- Content -->
        <div class="space-y-4"></div>

        <!-- Modal Footer -->
        <div class="modal-footer"></div>
      </div>

      <!-- Spacer -->
      <div class="h-[30px]"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, computed, onMounted } from "vue";
import { AppSelect, AppTextField } from "../../AppForm";
import { AppHeaderText, AppNormalText } from "../../AppTypography";
import AppIcon from "../../AppIcon";
import { DeliveryAddress } from "@greep/logic/src/gql/graphql";
import { Logic } from "../../../composable";
import AppButton from "../../AppButton";
import { watch } from "vue";
import { getChatMetadata } from "../../../composable/useWorkflowEngine";

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
    AppHeaderText,
    AppNormalText,
    AppIcon,
    AppButton,
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
    addressType: {
      type: String,
      default: "Delivery Address",
      validator: (value: string) => {
        return (
          ["Delivery Address", "Pickup Address"].includes(value) ||
          value.length > 0
        );
      },
    },
  },
  emits: ["address-confirm", "cancel"],
  setup(props, { emit }) {
    const selectedAddress = ref("");
    const addressDetails = ref("");
    const addressSearchIsLoading = ref(false);
    const addressOptions = reactive<SelectOption[]>([]);
    const showDeliverySelector = ref(true);

    const formData = reactive<{
      name: string;
      description?: string;
      google_map_link?: string;
      delivery_location_id?: string;
      is_default?: boolean;
    }>({
      name: "",
      description: "",
      google_map_link: "",
      delivery_location_id: "",
      is_default: true,
    });

    const showAddLocationSection = ref(false);
    const deliveryLocationOptions = reactive<SelectOption[]>([]);
    const isLoading = ref(false);
    const deliveryArea = ref<any>(null);
    const deliveryLocationId = ref("");
    const expectedLocationCounts = ref(0);
    const selectedLocations = reactive<DeliveryAddress[]>([]);

    const isLocating = ref(false);

    const deliveryAddresses = ref<DeliveryAddress[]>([]);

    const FormValidations = Logic.Form;

    const toggleLocationSelection = (location: DeliveryAddress) => {
      const index = selectedLocations.indexOf(location);
      if (index > -1) {
        selectedLocations.splice(index, 1);
      } else {
        if (
          expectedLocationCounts.value === 0 ||
          selectedLocations.length < expectedLocationCounts.value
        ) {
          selectedLocations.push(location);
        } else {
          confirmAddress(selectedLocations);
        }
      }
    };

    const confirmAddress = (locations: DeliveryAddress[]) => {
      try {
        props.onAddressConfirm(locations);
        emit("address-confirm", locations);

        selectedAddress.value = "";
        addressDetails.value = "";
      } catch (error) {
        console.error("Error confirming address:", error);
      }
    };

    const cancelAddress = () => {
      selectedAddress.value = "";
      addressDetails.value = "";

      try {
        props.onCancel();
        emit("cancel");
      } catch (error) {
        console.error("Error cancelling address:", error);
      }
    };

    watch(selectedLocations, () => {
      if (
        expectedLocationCounts.value > 0 &&
        selectedLocations.length === expectedLocationCounts.value
      ) {
        confirmAddress(selectedLocations);
      }
    });

    const handleCancel = () => {
      cancelAddress();
    };

    const fetchDeliveryLocations = async () => {
      try {
        // GetDeliveryLocations endpoint is in Commerce service
        // Parameters: page, count, orderType, order, whereQuery

        await (Logic.Commerce
          ? Logic.Commerce
          : // @ts-expect-error
            Logic.Delivery
        ).GetDeliveryLocations(1, 100, "CREATED_AT", "DESC", "");
        const locations =
          (Logic.Commerce
            ? Logic.Commerce
            : // @ts-expect-error
              Logic.Delivery
          ).ManyDeliveryLocations?.data || [];

        deliveryLocationOptions.length = 0;
        deliveryLocationOptions.push(
          // @ts-ignore
          ...locations.map((location: any) => ({
            key: location.id?.toString() || "",
            value: location.area || "", // area is the primary field
            extraInfo: location.country || "", // country as extra info
          }))
        );
      } catch (error) {
        console.error("Error fetching delivery locations:", error);
      }
    };

    const fetchDeliveryAddresses = async () => {
      try {
        const response = await Logic.User.GetP2PDeliveryAddresses(
          10,
          1,
          "UPDATED_AT",
          "DESC",
          `{
        column: AUTH_USER_ID,
        operator: EQ,
        value: ${Logic.Auth.AuthUser?.id}
        }`
        );

        if (response?.data) {
          deliveryAddresses.value = response.data;
        }
      } catch (error) {
        console.error("Error fetching delivery addresses:", error);
      }
    };

    const addDeliveryAddress = async () => {
      if (
        formData.delivery_location_id === "" ||
        !formData.delivery_location_id
      ) {
        Logic.Common.showAlert({
          show: true,
          message: "Please select a delivery location area.",
          type: "error",
        });
        return;
      }

      if (!formData.name || formData.name.trim() === "") {
        Logic.Common.showAlert({
          show: true,
          message: "Please enter an address name.",
          type: "error",
        });
        return;
      }

      if (!formData.google_map_link || formData.google_map_link.trim() === "") {
        Logic.Common.showAlert({
          show: true,
          message: "Please enter a Google Maps link.",
          type: "error",
        });
        return;
      }
      isLoading.value = true;

      try {
        const requestData = {
          name: formData.name,
          description: formData.description,
          google_map_link: formData.google_map_link,
          delivery_location_id: formData.delivery_location_id,
          is_default: formData.is_default,
        };
        if (Logic.User.AddDeliveryAddressForm) {
          Logic.User.AddDeliveryAddressForm = requestData;
        }

        // Add delivery address
        const result = Logic.User.AddDeliveryAddress
          ? await Logic.User.AddDeliveryAddress()
          : // @ts-ignore
            await Logic.Delivery.AddDeliveryAddress(requestData);

        if (result) {
          Logic.Common.showAlert({
            show: true,
            message: "Address added successfully!",
            type: "success",
          });
        }

        fetchDeliveryAddresses();
        showAddLocationSection.value = false;
      } catch (error) {
        console.error("Error adding delivery address:", error);
        Logic.Common.showAlert({
          show: true,
          message: "Failed to add address. Please try again.",
          type: "error",
        });
      } finally {
        isLoading.value = false;
      }
    };

    // Sync deliveryLocationId with formData when options update
    watch(deliveryLocationId, () => {
      formData.delivery_location_id = deliveryLocationId.value;
    });

    // Watch for when deliveryLocationOptions are updated and remount the select
    watch(deliveryLocationOptions, () => {
      if (deliveryLocationOptions.length > 0) {
        showDeliverySelector.value = false;
        setTimeout(() => {
          showDeliverySelector.value = true;
        }, 100);
      }
    });

    onMounted(async () => {
      fetchDeliveryAddresses();
      fetchDeliveryLocations();

      const chatMetadata: any = getChatMetadata();

      if (chatMetadata?.selected_option) {
        // Handle the selected option
        const selectedOptionIsNumeric = !isNaN(
          Number(chatMetadata.selected_option)
        );

        if (selectedOptionIsNumeric) {
          expectedLocationCounts.value = Number(chatMetadata.selected_option);
        }
      }
    });

    return {
      selectedAddress,
      addressDetails,
      addressSearchIsLoading,
      addressOptions,
      isLocating,
      confirmAddress,
      cancelAddress,
      handleCancel,
      deliveryAddresses,
      showAddLocationSection,
      formData,
      FormValidations,
      showDeliverySelector,
      deliveryLocationOptions,
      deliveryLocationId,
      addDeliveryAddress,
      isLoading,
      selectedLocations,
      toggleLocationSelection,
      expectedLocationCounts,
    };
  },
});
</script>
