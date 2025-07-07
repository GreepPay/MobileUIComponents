<template>
  <span
    :class="`inline-flex items-center  font-medium gap-1 cursor-pointer text-green w-fit px-2 ${customClass} 
      ${size === 'large' ? 'lg:text-base mdlg:text-sm text-[12px]' : ''}
      ${size === 'base' ? 'lg:text-sm mdlg:text-[12px] text-xs' : ''}
      ${size === 'small' ? 'text-xs' : ''}`"
    @click="handleClick"
  >
    <!-- Prefix Icon -->
    <app-icon v-if="prefixIcon" :name="prefixIcon" />

    <!-- Slot for text -->
    <span> {{ text }} </span>

    <!-- Suffix Icon or Default Icon -->
    <app-icon v-if="suffixIcon" :name="suffixIcon" />
  </span>
</template>

<script lang="ts">
  import { defineComponent } from "vue"
  import AppIcon from "../AppIcon"

  export default defineComponent({
    name: "AppLinkText",
    components: { AppIcon },
    props: {
      size: {
        type: String,
        default: "base",
        validator: (value: string) =>
          ["small", "base", "large"].includes(value),
      },
      color: {
        type: String,
        default: "",
      },
      customClass: {
        type: String,
        default: "",
      },
      text: {
        type: String,
        default: "",
      },
      prefixIcon: {
        type: String,
        default: null,
      },
      suffixIcon: {
        type: String,
        default: null,
      },
    },

    emits: ["click"],
    setup(_, { emit }) {
      const handleClick = () => {
        emit("click")
      }

      return {
        handleClick,
      }
    },
  })
</script>
