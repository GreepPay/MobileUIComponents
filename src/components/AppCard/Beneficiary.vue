<template>
  <div
    class="w-full flex flex-row items-center justify-between !border-[1.5px] !border-[#F0F3F6] rounded-[16px] px-4 py-4"
  >
    <div class="flex flex-row items-center">
      <div class="w-[48px] mr-3">
        <app-image-loader
          class="!h-[48px] !w-[48px] !rounded-full !border-[1px] !border-gray-50"
          :photo-url="data.image"
        />
      </div>
      <div class="flex flex-col">
        <app-normal-text class="!text-black !font-medium">
          {{ data.name }}
        </app-normal-text>
        <app-normal-text class="!text-[#616161] !mt-1">
          {{ data.description }}
        </app-normal-text>
      </div>
    </div>

    <div @click.stop="starred ? (starred = false) : (starred = true)">
      <app-icon
        :name="starred ? 'star-full' : 'star-empty'"
        :custom-class="`!h-[20px]`"
      />
    </div>
  </div>
</template>

<script lang="ts">
/**
 * AppBeneficiaryCard
 *
 * Reusable component for displaying a beneficiary's information.
 */

import { defineComponent, ref } from "vue";
import { AppNormalText } from "../AppTypography";
import AppImageLoader from "../AppImageLoader";
import AppIcon from "../AppIcon";

export default defineComponent({
  name: "AppBeneficiaryCard",
  components: {
    AppNormalText,
    AppImageLoader,
    AppIcon,
  },
  props: {
    data: {
      type: Object as () => {
        id: string;
        image: string;
        name: string;
        description: string;
        currency: string;
        isBeneficiary: boolean;
        wallet_uuid: string;
        isStarred?: boolean;
      },
      required: true,
    },
  },
  setup() {
    const starred = ref(false);

    return {
      starred,
    };
  },
});
</script>
