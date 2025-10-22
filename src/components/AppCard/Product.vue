<template>
  <div
    :class="['h-fit min-w-[140px] w-full', customClass]"
    @click="viewProduct"
  >
    <div class="min-w-[140px] w-full h-32 relative rounded-[16px]">
      <app-image-loader
        :photo-url="product.imageUrl || defaultBanner"
        :alt="product.name"
        :size="imageSize"
        custom-class="size-full  rounded-[16px]"
      >
        <div class="relative w-full h-full rounded-2xl">
          <!-- <span class="absolute top-2 right-2">
            <app-icon name="favourite-red" class="h-5" />
          </span> -->

          <span
            class="absolute bottom-2 right-2 size-7 bg-white shadow rounded-full flex items-center justify-center"
            :class="isInCart && '!border !border-red '"
            @click="isInCart ? removeFromCart() : addToCart()"
          >
            <app-icon
              :name="isInCart ? 'minus' : 'add'"
              class="h-5"
              :class="isInCart && 'scale-[70%]'"
            />
          </span>
        </div>
      </app-image-loader>
    </div>

    <div class="flex flex-col pt-2">
      <app-normal-text class="!text-xs !text-black !truncate pb-0.5">
        {{ product?.name }}
      </app-normal-text>
      <app-normal-text class="!text-sm !font-bold !text-black !truncate">
        {{ product?.formattedPrice }}
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
  type ProductSource = "market" | "event" | "ticket" | "other"
  type ProductCategory = "physical" | "ticket" | "event" | "other"

  interface MerchantProduct {
    id: string | number
    uuid?: string
    name: string
    price: number
    formattedPrice: string
    currency?: string
    currencySymbol?: string
    imageUrl: string
    quantity: number
    category: ProductCategory
    productType?: ProductSource
    selected?: boolean
    meta?: Record<string, any>
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
      isInCart: {
        type: Boolean,
        default: false,
      },
    },
    emits: ["click", "add-to-cart"],
    setup(props, { emit }) {
      const defaultBanner = "/images/greep-transparent-logo.svg"

      const viewProduct = () => emit("click", props.product)
      const addToCart = () => emit("add-to-cart", props.product)
      const removeFromCart = () => emit("remove-from-cart", props.product)

      return {
        viewProduct,
        defaultBanner,
        addToCart,
        removeFromCart,
      }
    },
  })
</script>
