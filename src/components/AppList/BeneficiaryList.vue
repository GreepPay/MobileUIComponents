<template>
  <div :class="['flex flex-col w-full h-fit', customClass]">
    <template v-if="dataItems.length">
      <div
        v-for="beneficiary in dataItems"
        :key="beneficiary.id"
        @click="selectBeneficiary(beneficiary)"
        class="flex items-center py-2 mt-2 px-2 cursor-pointer rounded-md"
        :class="{
          'bg-gray-100': selectedBeneficiary?.id === beneficiary.id,
        }"
      >
        <app-avatar
          :src="beneficiary.image"
          :alt="beneficiary.name"
          :size="imageSize"
        />

        <div class="flex flex-1 flex-col py-0.5 px-3">
          <app-normal-text
            customClass="leading-6 !font-[500] !text-sm !text-black"
          >
            {{ beneficiary.name }}
          </app-normal-text>
          <app-normal-text customClass="  !text-gray-two">
            {{ beneficiary.description }}
          </app-normal-text>
        </div>

        <span v-if="showStatusIcon">
          <app-icon
            :name="
              beneficiary.isBeneficiary ? 'tick-white-circle' : 'add-circle'
            "
            custom-class="size-5"
            @click="handleAddBeneficiary"
          />
        </span>
      </div>
    </template>

    <!-- No Data Found Message -->
    <template v-else>
      <div class="w-full flex flex-col pt-2">
        <app-empty-state
          icon="search-normal"
          title="No Beneficiary Found"
          description="Search for a user to continue."
        />
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, watch } from "vue";
import AppAvatar from "../AppAvatar/index.vue";
import AppIcon from "../AppIcon/index.vue";
import { AppNormalText, AppHeaderText } from "../AppTypography";
import AppEmptyState from "../AppEmptyState";

/**
 * Beneficiary List Component
 *
 * This component renders a list of dataItems with avatars, names, and descriptions.
 * It supports v-model to track the elected beneficiary.
 *
 * @prop {Array} dataItems - List of beneficiaries with `id`, `name`, `image`, and `description` properties.
 * @prop {Number} [imageSize=40] - Size of the avatar.
 * @prop {String} [customClass=""] - Additional classes for styling.
 * @prop {Object} [modelValue] - Currently selected beneficiary.
 * @emits {update:modelValue} Emits selected beneficiary.
 */

interface Beneficiary {
  id: string | number;
  name: string;
  image: string;
  description: string;
}

export default defineComponent({
  name: "BeneficiaryList",
  components: {
    AppAvatar,
    AppNormalText,
    AppHeaderText,
    AppIcon,
    AppEmptyState,
  },
  props: {
    dataItems: {
      type: Array as PropType<Beneficiary[]>,
      required: true,
    },
    imageSize: {
      type: Number,
      default: 38,
    },
    customClass: {
      type: String,
      default: "",
    },
    modelValue: {
      type: Object as PropType<Beneficiary | null>,
      default: null,
    },
    /**
     * @default string
     */ showStatusIcon: {
      type: Boolean,
      default: false,
    },
    /**
     * Text for no data for beneficiary list
     * @default string
     */ noDataText: {
      type: String,
      default: "You have no beneficiary",
    },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const selectedBeneficiary = ref<Beneficiary | null>(props.modelValue);
    const handleAddBeneficiary = () => {};
    watch(
      () => props.modelValue,
      (newVal) => {
        selectedBeneficiary.value = newVal;
      }
    );

    const selectBeneficiary = (beneficiary: Beneficiary) => {
      selectedBeneficiary.value = beneficiary;
      emit("update:modelValue", beneficiary);
    };

    return {
      selectedBeneficiary,
      selectBeneficiary,
      handleAddBeneficiary,
    };
  },
});
</script>
