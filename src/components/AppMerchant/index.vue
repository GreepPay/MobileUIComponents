<template>
  <div
    :class="[
      'flex flex-col border  rounded-[16px]   w-full h-fit p-4 rounded-lg',
      customClass,
    ]"
  >
    <app-avatar
      :src="merchant.imageUrl"
      :alt="merchant.name"
      :size="imageSize"
    />
    <div class="flex flex-col pt-3">
      <app-normal-text class="!text-sm !font-bold !text-black">
        {{ merchant.name }}
      </app-normal-text>
      <app-normal-text class="text-xs !text-gray-two">
        {{ merchant.category }}
      </app-normal-text>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent, PropType, ref, watch } from "vue"
  import AppAvatar from "../AppAvatar"
  import { AppNormalText, AppHeaderText } from "../AppTypography"

  /**
   * Merchant Item
 
  */

  interface Merchant {
    id: string | number
    name: string
    category: string
    imageUrl: string
  }

  export default defineComponent({
    name: "BeneficiaryList",
    components: {
      AppAvatar,
      AppNormalText,
      AppHeaderText,
    },
    props: {
      merchant: {
        type: Object as PropType<Merchant>,
        required: true,
      },
      imageSize: {
        type: Number,
        default: 44,
      },
      customClass: {
        type: String,
        default: "",
      },
    },
    emits: ["click"],
    setup(_, { emit }) {
      const selectMerhant = (merchant: Merchant) => {
        emit("click", merchant)
      }

      return {
        selectMerhant,
      }
    },
  })
</script>
