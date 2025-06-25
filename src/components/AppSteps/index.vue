<template>
  <div
    class="w-full bg-white flex mt-2 !border-l-[2px]"
    :class="step.active ? '!border-primary-400' : '!border-light-gray-two'"
  >
    <span
      class="!-ml-3 size-6 bg-white rounded-full -mt-0.5 flex justify-center items-center"
      :class="{ 'border border-primary-400': step.active }"
    >
      <app-icon :name="step.icon" custom-class="!h-5" />
    </span>

    <div class="flex-1 px-2">
      <app-header-text class="!text-sm !block mb-1">
        {{ step.title }}
      </app-header-text>

      <div>
        <app-normal-text
          class="!text-xs !font-medium !text-light-black !block mb-0.5"
        >
          {{ step.name }}
        </app-normal-text>
        <app-normal-text class="!text-xs !text-light-black !block">
          {{ step.address }}
        </app-normal-text>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent, PropType } from "vue"
  import AppIcon from "../AppIcon"
  import { AppHeaderText, AppNormalText } from "../AppTypography"

  interface Step {
    title: string
    name: string
    address: string
    icon: string
    active?: boolean
  }

  export default defineComponent({
    name: "StepItem",
    components: {
      AppHeaderText,
      AppNormalText,
      AppIcon,
    },
    props: {
      step: {
        type: Object as PropType<Step>,
        required: true,
      },
    },
  })
</script>
