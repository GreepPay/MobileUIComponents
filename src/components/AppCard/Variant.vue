<template>
  <div class="flex w-full min-h-36 relative" :class="customClass">
    <!-- Main Ticket Body -->
    <div class="!w-3/4 bg-[#D9D9D9] flex flex-col justify-between p-4">
      <div class="w-full flex flex-col">
        <app-header-text customClass="!text-black !text-base">
          {{ variant.name }}
        </app-header-text>
        <app-normal-text customClass="!text-gray-two !font-medium !text-sm">
          {{ variant.date }}
        </app-normal-text>
        <app-normal-text customClass="!text-gray-two !font-medium !text-sm">
          {{ variant.time }}
        </app-normal-text>
      </div>

      <app-header-text customClass="!text-black !text-base">
        {{ variant.mappedPrice }}
      </app-header-text>
    </div>

    <!-- Ticket Type -->
    <div
      class="w-1/4 flex justify-center items-center"
      :style="
        variant.color ? `background: ${variant.color};` : `background: #333;`
      "
    >
      <app-header-text customClass="!text-white !text-xl vertical-rl">
        {{ variant.ticket_name }}
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

  export default defineComponent({
    name: "AppVariantCard",
    components: {
      AppHeaderText,
      AppNormalText,
    },
    props: {
      variant: {
        type: Object as () => any,
        required: true,
      },
      customClass: {
        type: String,
        default: "",
      },
    },
    setup() {
      // const firstAttribute = computed(
      //   () => props.variant.attributes?.find(Boolean) || null
      // )
      // const attributesText = computed(
      //   () =>
      //     props.variant.attributes?.filter(Boolean).join(", ") ||
      //     "No attributes"
      // )

      // const bgColorFromAttribute = (): BgColor => {
      //   const sku = props.variant.sku.toLowerCase()
      //   if (sku.includes("regular")) return BgColor.Green
      //   if (sku.includes("vvip+")) return BgColor.Orange
      //   if (sku.includes("vvip")) return BgColor.Blue
      //   if (sku.includes("vip")) return BgColor.Purple
      //   if (sku.includes("online")) return BgColor.BlueGreen
      //   if (sku.includes("in-person")) return BgColor.DarkGreen
      //   return BgColor.Gray
      // }

      // const attributeBgColor = computed(() =>
      //   props.variant.sku ? bgColorFromAttribute() : BgColor.Gray
      // )

      return {
        // attributesText,
        // firstAttribute,
        // attributeBgColor,
      }
    },
  })
</script>
