<template>
  <VueSlider
    ref="rangeComponent"
    v-model="value"
    :tooltip-placement="['bottom']"
    :min="min"
    :max="Math.floor(max)"
    :processStyle="{
      background: 'linear-gradient(269.64deg, #0D965E 0.31%, #00683F 89.75%)',
    }"
    :dotStyle="{
      background: 'linear-gradient(269.64deg, #0D965E 0.31%, #00683F 89.75%)',
    }"
    :interval="step"
    :tooltip="'none'"
  />
</template>
<script lang="ts">
import { Logic } from "../../composable";
import { ref, onMounted, watch } from "vue";
import VueSlider from "vue-3-slider-component";
import "vue-slider-component/theme/default.css";

export default {
  components: {
    VueSlider,
  },
  props: {
    min: {
      type: Number,
      default: 0,
    },
    max: {
      type: Number,
      default: 100,
    },
    modelValue: {
      required: false,
    },
    step: {
      type: Number,
      default: 1,
    },
  },
  name: "AppRange",
  emits: ["update:modelValue"],
  setup(props, context) {
    const value = ref(0);

    const rangeComponent = ref();

    const uniqueId = ref(Logic.Common.makeid(16));

    watch(value, () => {
      context.emit("update:modelValue", value.value);
    });

    watch(
      () => props.modelValue,
      () => {
        rangeComponent.value?.setValue(props.modelValue || 0);
      },
      { immediate: true },
    );

    onMounted(() => {
      setTimeout(() => {
        rangeComponent.value?.setValue(props.modelValue || 0);
      }, 100);
    });

    return {
      value,
      uniqueId,
      Logic,
      rangeComponent,
    };
  },
};
</script>
