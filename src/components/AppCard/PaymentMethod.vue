<template>
  <div
    class="bg-white p-4 w-full flex flex-1 !border !border-border-color rounded-xl"
    :class="isActive && '!border-green'"
  >
    <app-icon :name="method.icon" custom-class="h-10" />

    <div class="ml-2 gap-3 flex-1 bg-white flex-1">
      <app-header-text customClass="leading-6 !text-sm !text-black">
        {{ method.title }}
      </app-header-text>
      <app-normal-text
        customClass="leading-6  !text-sm !text-very-light-gray  "
      >
        {{ method.price }}
      </app-normal-text>
    </div>

    <app-icon
      :name="isActive ? 'checkbox-input' : 'tick-circle'"
      class="mt-2"
    />
  </div>
</template>

<script lang="ts">
  /**
   * AppCouponCard
   */
  import { defineComponent, PropType } from "vue"
  import AppIcon from "../AppIcon"
  import { AppHeaderText, AppNormalText } from "../AppTypography"

  interface PaymentMethod {
    icon: string
    title: string
    price: string
    value: string
  }

  export default defineComponent({
    name: "AppPaymentMethodCard",
    components: { AppHeaderText, AppNormalText, AppIcon },
    props: {
      method: {
        type: Object as PropType<PaymentMethod>,
        required: true,
      },
      isActive: {
        type: Boolean,
        default: false,
      },
      iconSize: {
        type: String,
        default: "",
      },
    },

    setup() {
      return {}
    },
  })
</script>
