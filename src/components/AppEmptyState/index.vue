<template>
  <div
    :class="[
      'w-full flex flex-col min-h-24 border-[2px] h-fit border-[#F0F3F6] rounded-xl py-8 px-4 justify-center items-center',
      custonClass,
    ]"
  >
    <app-icon :name="icon" custom-class="!h-[60px]" v-if="useIcon" />

    <div class="flex flex-col items-center justify-center px-5 pt-3">
      <app-normal-text class="!text-[#0A141E] !font-[500] !text-sm">
        {{ title }}
      </app-normal-text>
      <app-normal-text
        class="!text-[#616161] !text-center pt-[4px] px-4 leading-5"
      >
        {{ description }}
      </app-normal-text>
    </div>

    <div
      class="w-full flex flex-row justify-center items-center pt-4"
      v-if="buttonData"
    >
      <app-button
        variant="secondary"
        class="!px-6 py-3"
        @click="buttonData.action()"
      >
        {{ buttonData.label }}
      </app-button>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent } from "vue"
  import AppIcon from "../AppIcon"
  import { AppNormalText } from "../AppTypography"
  import AppButton from "../AppButton"
  /**
   * AppEmptyState Component
   *
   * Shows an empty state with an icon, title, and description
   */
  export default defineComponent({
    name: "AppEmptyState",
    components: {
      AppIcon,
      AppNormalText,
      AppButton,
    },
    props: {
      useIcon: {
        type: Boolean,
        default: true,
      },
      icon: {
        type: String,
        default: "no-transaction",
      },
      title: {
        type: String,
        default: "",
      },
      description: {
        type: String,
        default: "",
      },
      custonClass: {
        type: String,
        default: "",
      },
      buttonData: {
        type: Object as () => {
          label: string
          action: Function
        },
        required: false,
      },
    },
    setup() {
      return {}
    },
  })
</script>
