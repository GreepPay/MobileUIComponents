<template>
  <div class="flex w-full min-h-36 relative" :class="customClass">
    <!-- Main Ticket Body -->
    <div class="!w-3/4 bg-[#D9D9D9] flex flex-col justify-between p-4">
      <div class="w-full flex flex-col">
        <app-header-text customClass="!text-black !text-base">
          ID: {{ variant.id }}
        </app-header-text>
        <app-normal-text customClass="!text-gray-two !font-medium !text-sm">
          Ticket type: {{ variant.sku }}
        </app-normal-text>
      </div>

      <app-header-text customClass="!text-black !text-base">
        {{ currencySymbol }} {{ variant.priceAdjustment }}
      </app-header-text>
    </div>

    <!-- Ticket Type -->
    <div
      class="w-1/4 flex justify-center items-center"
      :class="attributeBgColor"
    >
      <app-header-text customClass="!text-white !text-xl vertical-rl">
        {{ variant.sku }}
      </app-header-text>
    </div>

    <!-- Dotted Cutout -->
    <div
      class="absolute h-full -mr-2.5 right-1/4 rounded-full size-5 flex flex-col justify-between"
    >
      <span class="block size-5 bg-white rounded-full -mt-2.5"></span>
      <span class="block size-5 bg-white rounded-full -mb-2.5"></span>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent, computed } from "vue"
  import { AppHeaderText, AppNormalText } from "../AppTypography"
  import { ProductVariant } from "@greep/logic/src/gql/graphql"

  enum BgColor {
    Green = "bg-green",
    Purple = "bg-purple",
    Orange = "bg-orange",
    DarkGreen = "bg-dark-green",
    Blue = "bg-blue",
    BlueGreen = "bg-blue-green",
    Gray = "bg-gray",
  }

  export default defineComponent({
    name: "AppVariantCard",
    components: {
      AppHeaderText,
      AppNormalText,
    },
    props: {
      variant: {
        type: Object as () => ProductVariant,
        required: true,
      },
      customClass: {
        type: String,
        default: "",
      },
      currencySymbol: {
        type: String,
        default: "₦",
      },
    },
    setup(props) {
      const firstAttribute = computed(
        () => props.variant.attributes?.find(Boolean) || null
      )
      const attributesText = computed(
        () =>
          props.variant.attributes?.filter(Boolean).join(", ") ||
          "No attributes"
      )

      const bgColorFromAttribute = (): BgColor => {
        const sku = props.variant.sku.toLowerCase()
        if (sku.includes("regular")) return BgColor.Green
        if (sku.includes("vvip+")) return BgColor.Orange
        if (sku.includes("vvip")) return BgColor.Blue
        if (sku.includes("vip")) return BgColor.Purple
        if (sku.includes("online")) return BgColor.BlueGreen
        if (sku.includes("in-person")) return BgColor.DarkGreen
        return BgColor.Gray
      }

      const attributeBgColor = computed(() =>
        props.variant.sku ? bgColorFromAttribute() : BgColor.Gray
      )

      return {
        attributesText,
        firstAttribute,
        attributeBgColor,
      }
    },
  })
</script>
