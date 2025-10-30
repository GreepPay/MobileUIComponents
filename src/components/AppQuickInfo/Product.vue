<template>
  <app-modal
    v-if="showProductDetailsModal"
    :close="() => (showProductDetailsModal = false)"
    :hasTitle="true"
    title="Product Details"
    contentClass="!p-0"
    bottomSectionClass="!border-t-divider"
  >
    <div class="w-full flex flex-col items-center border-b-divider">
      <div
        class="px-4 pb-4 w-full flex flex-col space-y-2 !z-[0] border-b-divider"
      >
        <app-swiper
          :free-mode="false"
          :show-pagination="false"
          :space-between="10"
          :slide-per-view="1"
          :currentSlidePosition="currentSlidePosition"
          custom-class="h-[180px]"
          :swiperClass="''"
          v-model="slidePosition"
          id="swiperContainerProducts"
        >
          <swiper-slide
            class="w-full h-full"
            v-for="(image, index) in product.images"
            :key="index"
          >
            <app-image-loader
              :photoUrl="image.url"
              class="rounded-[12px] h-[180px] w-full border-[1px] border-gray-200 dark:!border-gray-700 cursor-pointer"
            />
          </swiper-slide>
        </app-swiper>

        <div
          class="w-full flex no-scrollbar flex-row space-x-3 flex-nowrap overflow-x-auto scrollbar-hide"
        >
          <div
            class="flex flex-row py-2 pt-1 pr-4"
            v-if="product.images.length > 1"
          >
            <div
              class="flex flex-row cursor-pointer pr-2"
              v-for="(image, index) in product.images"
              :key="index"
              @click="currentSlidePosition = index"
              :id="`image${index}`"
            >
              <app-image-loader
                :photoUrl="image.url"
                :class="`rounded-[10px] h-10 w-10 border-[1.5px] border-gray-200 dark:!border-gray-700 ${
                  currentSlidePosition == index
                    ? '!border-black border-[2px]'
                    : ''
                }`"
              />
            </div>
          </div>
        </div>
      </div>

      <!--  Business Infor -->
      <div class="w-full flex items-center gap-1 px-4 py-3 border-b-divider">
        <app-avatar :src="product.businessLogo" class="!size-7 rounded-full" />
        <app-normal-text class="!block ml-1">
          Sold by
          <span class="font-semibold" @click="viewMerchantDetails">
            {{ product.businessName }}
          </span>
        </app-normal-text>
      </div>

      <!-- Description -->
      <div class="w-full flex flex-col pt-2 !pb-4">
        <app-normal-text class="!text-sm !font-semibold !text-left mb-1 px-4">
          Description
        </app-normal-text>

        <div class="px-4 !max-h-[100px] overflow-y-auto no-scrollbar">
          <app-normal-text class="!text-left mb-1 !leading-5 !text-[#616161]">
            {{
              Logic.Common.TruncateText(
                product?.description,
                seeMoreDescription
              ).truncated
            }}

            <span
              class="font-medium !text-black cursor-pointer"
              @click="seeMoreDescription = !seeMoreDescription"
            >
              {{ seeMoreDescription ? " see less" : " see more" }}
            </span>
          </app-normal-text>
        </div>
      </div>
    </div>

    <template #bottom-section>
      <div
        class="w-full px-4 py-2 shadow-lg bg-white grid grid-cols-2 items-center gap-4"
        :style="`
            ${getBottomPadding}
          `"
      >
        <app-button
          :variant="isInCart ? 'danger' : 'secondary'"
          outlined
          custom-class="w-full py-4 text-xs border !border-black"
          @click.stop="toggleCart"
        >
          {{ isInCart ? "Remove from Cart" : "Add to Cart" }}
        </app-button>

        <app-button
          variant="secondary"
          class="w-full py-4 text-xs"
          @click="viewProduct"
        >
          View Details
        </app-button>
      </div>
    </template>
  </app-modal>
</template>

<script lang="ts">
  import { defineComponent, PropType, ref, watch } from "vue"
  import AppImageLoader from "../AppImageLoader"
  import AppIcon from "../AppIcon"
  import AppButton from "../AppButton"
  import AppModal from "../AppModal"
  import AppAvatar from "../AppAvatar"
  import { AppNormalText } from "../AppTypography"
  import AppSwiper from "../AppSwiper"
  import { SwiperSlide } from "swiper/vue"
  import { Logic } from "../../composable"
  import { getBottomPadding } from "../../composable"

  export default defineComponent({
    name: "AppProductQuickInfo",
    components: {
      AppHeaderText,
      AppNormalText,
    },
    props: {
      product: {
        type: Object as () => {
          id: string
          uuid: string
          description: string
          name: string
          businessName: string
          businessLogo: string
          images: { url: string }[]
        },
        required: true,
      },
      customClass: {
        type: String,
        default: "",
      },
    },
    setup(props, { emit }) {
      const showProductDetailsModal = ref(false)
      const seeMoreDescription = ref(false)
      const currentSlidePosition = ref(0)
      const slidePosition = ref(0)

      const viewProduct = () => {
        showProductDetailsModal.value = false
        emit("view-product", props.product)
      }
      const viewMerchantDetails = () => {
        if (!props.allowViewMerchantDetails) return

        showProductDetailsModal.value = false
        Logic.Common.GoToRoute(`/shops/${props.product.businessUuid}`)
      }
      const toggleCart = () => {
        if (props.isInCart) emit("remove-from-cart", props.product)
        else emit("add-to-cart", props.product)
      }

      watch(slidePosition, () => {
        currentSlidePosition.value = slidePosition.value
      })
      return {
        Logic,
        viewProduct,
        toggleCart,
        showProductDetailsModal,
        currentSlidePosition,
        slidePosition,
        seeMoreDescription,
        viewMerchantDetails,
        getBottomPadding,
      }
    },
  })
</script>
