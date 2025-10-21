<template>
    <!-- Delivery Address Input Modal -->
    <div class="fixed inset-0 bg-white bg-opacity-60 z-50 flex items-end" @click="handleCancel">
        <div class="w-full bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto shadow-2xl border-t border-gray-200"
            @click.stop>
            <div class="p-4 pb-8">
                <!-- Handle bar -->
                <div class="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>

                <!-- Header -->
                <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center space-x-2">
                        <span class="text-xl">🚚</span>
                        <app-header-text class="text-lg text-gray-800">{{ addressType }}</app-header-text>
                    </div>
                    <app-button variant="text" icon-only @click="handleCancel" custom-class="!p-2 hover:bg-gray-100">
                        <template #icon>
                            <app-icon name="close" custom-class="w-5 h-5 text-gray-500" />
                        </template>
                    </app-button>
                </div>

                <!-- Content -->
                <app-form-wrapper :parent-refs="formRefs">
                    <div class="space-y-4">
                        <!-- Area Selection -->
                        <div class="space-y-2">
                            <app-normal-text class="block text-sm font-medium text-gray-700 mb-1">Select
                                Area</app-normal-text>
                            <app-select :placeholder="'Choose your area...'" :hasTitle="false" v-model="selectedArea"
                                ref="areaSelect" :options="areaOptions" :hasSearch="true" name="DeliveryArea" />
                        </div>

                        <!-- Google Maps Link -->
                        <div class="space-y-2">
                            <app-normal-text class="block text-sm font-medium text-gray-700 mb-1">Google Maps Location
                                Link</app-normal-text>
                            <app-text-field :has-title="false" type="url"
                                :placeholder="'Paste your Google Maps location link here...'" ref="mapsLinkField"
                                name="MapsLink" v-model="mapsLink" />
                            <app-normal-text class="text-xs text-gray-500">
                                💡 Open Google Maps, find your location, tap "Share" and copy the link
                            </app-normal-text>
                        </div>

                        <!-- Additional details input -->
                        <div class="space-y-2">
                            <app-normal-text class="block text-sm font-medium text-gray-700 mb-1">Address
                                Details</app-normal-text>
                            <app-text-field :has-title="false" type="text" :placeholder="detailsPlaceholder"
                                ref="addressDetailsField" name="AddressDetails" v-model="addressDetails" is-textarea
                                :max-character="500" />
                        </div>

                        <!-- Address preview -->
                        <div v-if="selectedArea && (mapsLink || addressDetails)"
                            class="bg-blue-50 p-3 rounded-lg border border-blue-200">
                            <app-normal-text class="text-sm font-medium text-blue-800 mb-1">{{ addressType
                            }}:</app-normal-text>
                            <app-normal-text class="text-sm text-blue-700">📍 {{ selectedArea }}</app-normal-text>
                            <div v-if="mapsLink" class="text-sm text-blue-600 mt-1">
                                🗺️ <app-link-text text="View on Google Maps" @click="openMapsLink"
                                    custom-class="!text-blue-600 hover:!text-blue-800" />
                            </div>
                            <app-normal-text v-if="addressDetails" class="text-sm text-blue-600 mt-1">📝 {{
                                addressDetails
                            }}</app-normal-text>
                        </div>
                    </div>
                </app-form-wrapper>
            </div>

            <!-- Modal Footer -->
            <div class="modal-footer">
                <app-button variant="secondary" @click="handleCancel" custom-class="px-6">
                    Cancel
                </app-button>
                <app-button variant="primary" @click="confirmAddress" :disabled="!isValidAddress || isProcessing"
                    :loading="isProcessing" custom-class="px-6">
                    <template v-if="!isProcessing">
                        Continue
                    </template>
                </app-button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, computed } from "vue";
import {
    AppSelect,
    AppTextField,
    AppButton,
    AppIcon,
    AppFormWrapper,
    AppHeaderText,
    AppNormalText,
    AppLinkText
} from "../..";

interface SelectOption {
    key: string;
    value: string;
    title: string;
    icon: string;
}

export default defineComponent({
    name: "DeliveryAddressInput",
    components: {
        AppSelect,
        AppTextField,
        AppButton,
        AppIcon,
        AppFormWrapper,
        AppHeaderText,
        AppNormalText,
        AppLinkText,
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
            default: 'Delivery Address',
            validator: (value: string) => {
                return ['Delivery Address', 'Pickup Address'].includes(value) || value.length > 0;
            }
        },
    },
    emits: ['address-confirm', 'cancel'],
    setup(props, { emit }) {
        const selectedArea = ref("");
        const mapsLink = ref("");
        const addressDetails = ref("");

        // Form refs for validation
        const areaSelect = ref(null);
        const mapsLinkField = ref(null);
        const addressDetailsField = ref(null);

        const formRefs = computed(() => ({
            areaSelect: areaSelect.value,
            mapsLinkField: mapsLinkField.value,
            addressDetailsField: addressDetailsField.value,
        }));





        // Area pricing configuration - delivery cost per area
        const areaPricing: Record<string, number> = {
            // Zone 1: Central areas - Lower cost (₦5-8)
            "lefkosia-center": 5,
            "limassol-center": 6,
            "larnaca-center": 5,
            "paphos-center": 7,

            // Zone 2: Suburban areas - Medium cost (₦8-12)
            "engomi": 8,
            "strovolos": 9,
            "mesa-geitonia": 10,
            "germasogeia": 11,
            "aglandjia": 8,

            // Zone 3: Outer areas - Higher cost (₦12-20)
            "limassol-marina": 12,
            "coral-bay": 15,
            "protaras": 18,
            "ayia-napa": 20,
            "troodos": 25,

            // Default pricing for unlisted areas
            "default": 10
        };

        // Cyprus areas with pricing information
        const areaOptions = reactive<SelectOption[]>([
            // Zone 1: Central Areas (₦5-8)
            {
                key: "lefkosia-center",
                value: "Lefkosia Center",
                title: "Lefkosia Center (₦5)",
                icon: "�️"
            },
            {
                key: "limassol-center",
                value: "Limassol Center",
                title: "Limassol Center (₦6)",
                icon: "�️"
            },
            {
                key: "larnaca-center",
                value: "Larnaca Center",
                title: "Larnaca Center (₦5)",
                icon: "�️"
            },
            {
                key: "paphos-center",
                value: "Paphos Center",
                title: "Paphos Center (₦7)",
                icon: "🏛️"
            },

            // Zone 2: Suburban Areas (₦8-12)
            {
                key: "engomi",
                value: "Engomi",
                title: "Engomi (₦8)",
                icon: "�️"
            },
            {
                key: "strovolos",
                value: "Strovolos",
                title: "Strovolos (₦9)",
                icon: "�️"
            },
            {
                key: "mesa-geitonia",
                value: "Mesa Geitonia",
                title: "Mesa Geitonia (₦10)",
                icon: "🏘️"
            },
            {
                key: "germasogeia",
                value: "Germasogeia",
                title: "Germasogeia (₦11)",
                icon: "�️"
            },
            {
                key: "aglandjia",
                value: "Aglandjia",
                title: "Aglandjia (₦8)",
                icon: "🏘️"
            },

            // Zone 3: Outer Areas (₦12-25)
            {
                key: "limassol-marina",
                value: "Limassol Marina",
                title: "Limassol Marina (₦12)",
                icon: "⛵"
            },
            {
                key: "coral-bay",
                value: "Coral Bay",
                title: "Coral Bay (₦15)",
                icon: "�️"
            },
            {
                key: "protaras",
                value: "Protaras",
                title: "Protaras (₦18)",
                icon: "�️"
            },
            {
                key: "ayia-napa",
                value: "Ayia Napa",
                title: "Ayia Napa (₦20)",
                icon: "�️"
            },
            {
                key: "troodos",
                value: "Troodos Mountains",
                title: "Troodos Mountains (₦25)",
                icon: "⛰️"
            },
        ]);

        const addressDetailsLength = computed(() => addressDetails.value.length);

        // Computed properties for dynamic text based on address type
        const detailsPlaceholder = computed(() => {
            const isPickup = props.addressType.toLowerCase().includes('pickup');
            return isPickup
                ? 'Add helpful details for pickup (building name, floor, landmark, etc.)'
                : 'Add helpful details (building name, floor, landmark, etc.)';
        });



        // Validation computed property
        const isValidAddress = computed(() => {
            return selectedArea.value && (mapsLink.value || addressDetails.value);
        });

        // Validate Google Maps link
        const isValidGoogleMapsLink = computed(() => {
            if (!mapsLink.value) return true; // Optional field

            const googleMapsPatterns = [
                /^https?:\/\/(www\.)?google\.com\/maps/,
                /^https?:\/\/maps\.google\.com/,
                /^https?:\/\/goo\.gl\/maps/,
                /^https?:\/\/maps\.app\.goo\.gl/,
            ];

            return googleMapsPatterns.some(pattern => pattern.test(mapsLink.value));
        });

        const confirmAddress = () => {
            if (!selectedArea.value) {
                console.error("Please select an area first.");
                return;
            }

            if (!mapsLink.value && !addressDetails.value) {
                console.error("Please provide either a Google Maps link or address details.");
                return;
            }

            if (mapsLink.value && !isValidGoogleMapsLink.value) {
                console.error("Please provide a valid Google Maps link.");
                return;
            }

            // Construct the full address object
            const addressData = {
                area: selectedArea.value,
                mapsLink: mapsLink.value,
                details: addressDetails.value,
                fullAddress: constructFullAddress()
            };

            try {
                props.onAddressConfirm(addressData);
                emit('address-confirm', addressData);

                // Reset form
                selectedArea.value = "";
                mapsLink.value = "";
                addressDetails.value = "";
            } catch (error) {
                console.error("Error confirming address:", error);
            }
        };

        const constructFullAddress = () => {
            let fullAddress = selectedArea.value;

            if (addressDetails.value) {
                fullAddress += `, ${addressDetails.value}`;
            }

            if (mapsLink.value) {
                fullAddress += ` (Maps: ${mapsLink.value})`;
            }

            return fullAddress;
        };

        const cancelAddress = () => {
            selectedArea.value = "";
            mapsLink.value = "";
            addressDetails.value = "";

            try {
                props.onCancel();
                emit('cancel');
            } catch (error) {
                console.error("Error cancelling address:", error);
            }
        };

        const handleCancel = () => {
            cancelAddress();
        };

        const openMapsLink = () => {
            if (mapsLink.value) {
                window.open(mapsLink.value, '_blank');
            }
        };

        return {
            selectedArea,
            mapsLink,
            addressDetails,
            addressDetailsLength,
            areaOptions,
            detailsPlaceholder,
            isValidAddress,
            isValidGoogleMapsLink,
            confirmAddress,
            cancelAddress,
            handleCancel,
            openMapsLink,
            // Form refs
            areaSelect,
            mapsLinkField,
            addressDetailsField,
            formRefs,
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

/* Mobile optimizations */
@media (max-width: 768px) {
    .modal-footer {
        padding: 1rem;
    }
}
</style>