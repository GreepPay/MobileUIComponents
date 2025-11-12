<template>
  <div class="w-full h-full flex flex-col" :id="`pan${tabIndex}`">
    <img :src="url" />
  </div>
</template>
<script lang="ts">
import { onMounted } from "vue";
import panzoom from "panzoom";

export default {
  props: {
    url: {
      type: String,
      required: true,
    },
    customClass: {
      type: String,
      required: true,
    },
  },
  name: "AppImageInteractive",
  setup() {
    const tabIndex = Math.floor(Math.random() * 100000);

    onMounted(() => {
      setTimeout(() => {
        const container = document.getElementById(`pan${tabIndex}`);
        if (container != null) {
          panzoom(container);
        }
      });
    });

    return {
      tabIndex,
    };
  },
};
</script>
