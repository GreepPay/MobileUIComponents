<template>
  <Vue3Lottie :animation-link="animationLink" :height="90" :width="90" />
</template>
<script lang="ts">
import { defineComponent } from "vue";
import AppIcon from "../AppIcon";
import { Vue3Lottie } from "vue3-lottie";

export default defineComponent({
  components: {
    AppIcon,
    Vue3Lottie,
  },
  props: {
    animationLink: {
      type: String,
      required: false,
      default: "/loader.json",
    },
    height: {
      type: Number,
      required: false,
      default: 90,
    },
    width: {
      type: Number,
      required: false,
      default: 90,
    },
  },
  name: "AppLottieLoader",
  setup() {
    return {};
  },
});
</script>
