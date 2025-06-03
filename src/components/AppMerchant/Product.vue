<template>
  <div :class="['h-fit w-[140px]', customClass]" @click="viewProduct">
    <div class="w-[140px] h-32 relative rounded-[16px]">
      <app-image-loader
        :photo-url="product.imageUrl"
        :alt="product.name"
        :size="imageSize"
        custom-class="size-full rounded-[16px]"
      >
        <div class="relative w-full h-full rounded-2xl">
          <!-- <span class="absolute top-2 right-2">
            <app-icon name="favourite-red" class="h-5" />
          </span> -->

          <span
            class="absolute bottom-2 right-2 size-8 bg-white rounded-full flex items-center justify-center"
          >
            <app-icon name="add" class="h-5" />
          </span>
        </div>
      </app-image-loader>
    </div>

    <div class="flex flex-col pt-2">
      <app-normal-text class="!text-xs !text-black !truncate pb-0.5">
        {{ product.name }}
      </app-normal-text>
      <app-normal-text class="!text-sm !font-bold !text-black !truncate">
        {{ product.price }}
      </app-normal-text>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent, PropType, ref, watch } from "vue"
  import AppImageLoader from "../AppImageLoader"
  import AppIcon from "../AppIcon"
  import { AppNormalText } from "../AppTypography"

  /**
   * MerchantProduct Products
   */
  interface MerchantProduct {
    id: string | number
    name: string
    price: string
    imageUrl: string
  }

  export default defineComponent({
    name: "AppMerchantProduct",
    components: {
      AppNormalText,
      AppImageLoader,
      AppIcon,
    },
    props: {
      product: {
        type: Object as PropType<MerchantProduct>,
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
      const viewProduct = (product: MerchantProduct) => {
        emit("click", product)
      }

      return {
        viewProduct,
      }
    },
  })
</script>
