<template>
  <div
    id=""
    :class="`${customClass} blend-in ${
      image == '' ? `${photoUrl ? 'skeleton' : ''}` : ''
    }`"
    :style="`${
      image == ''
        ? ''
        : `background-size: cover;
      background-repeat: no-repeat;
      background-position: center;`
    }
      ${image ? `background-image:url(${imageUrl});` : ''}  ${customStyle}`"
  >
    <!--
     * @slot -  Optional content to be displayed within the image loader.
     -->
    <slot />
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, onMounted, watch } from "vue";

/**
 * Component that loads and displays an image with a fade-in effect.
 */
export default defineComponent({
  name: "AppImageLoader",
  props: {
    /**
     * URL of the image to load.
     * @requires
     */
    photoUrl: {
      type: String,
      required: true,
    },
    /**
     * Custom CSS classes to apply to the container `<div>` element.
     */
    customClass: {
      type: String,
      default: "",
    },
    /**
     * Custom inline styles to apply to the container `<div>` element.
     */
    customStyle: {
      type: String,
      default: "",
    },
  },
  setup(props) {
    const image = ref("");
    const imageUrl = ref("");

    const setImage = () => {
      // @ts-ignore
      const basePath = import.meta.env.VITE_APP_BASE_URL || "/";

      let photoUrl = props.photoUrl || "";

      if (photoUrl.startsWith("/images/")) {
        photoUrl = photoUrl.replace(/^\/(?!\/)/, basePath);
      }

      imageUrl.value = photoUrl;

      const highResImage = new Image();

      highResImage.onload = function () {
        image.value = imageUrl.value;
      };

      highResImage.src = imageUrl.value;
    };

    watch(props, () => {
      setImage();
    });

    onMounted(() => {
      setImage();
    });

    return {
      image,
      imageUrl,
    };
  },
});
</script>
<!-- <style scoped>
.blend-in {
  animation: fadein 0.15s;
  -moz-animation: fadein 0.15s; /* Firefox */
  -webkit-animation: fadein 0.15s; /* Safari and Chrome */
  -o-animation: fadein 0.15s; /* Opera */
}
</style> -->
