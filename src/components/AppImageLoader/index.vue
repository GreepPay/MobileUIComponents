<template>
  <div
    id=""
    :class="`${customClass} blend-in ${
      image == '' && photoUrl ? `animate-pulse bg-gray-300` : ''
    }`"
    :style="`${
      image == ''
        ? ''
        : `background-size: cover;
      background-repeat: no-repeat;
      background-position: center;`
    }
      ${image ? `background-image:url(${imageUrl});` : ''}  ${customStyle}`"
    @click="handleClick"
  >
    <!--
     * @slot -  Optional content to be displayed within the image loader.
     -->
    <slot />

    <teleport to="body">
      <div
        v-if="fullImageIsOpened"
        class="w-full h-full fixed top-0 left-0 !bg-black flex flex-col items-center justify-center !z-[999999999999999]"
        style="
          padding-top: calc(env(safe-area-inset-top)) !important;
          padding-bottom: calc(env(safe-area-inset-bottom)) !important;
        "
      >
        <!-- Top section -->
        <div
          class="w-full flex flex-row items-center justify-between absolute top-0 left-0 px-4 py-4 z-50"
          style="padding-top: calc(env(safe-area-inset-top) + 16px) !important"
        >
          <span
            class="h-[25px] w-[30px] z-50"
            @click="fullImageIsOpened = false"
          >
            <app-icon name="close-white" class="h-[25px]" />
          </span>

          <app-normal-text class="!text-white !text-base">
            Image Preview
          </app-normal-text>

          <span class="h-[25px] w-[30px] invisible">
            <app-icon name="close-white" class="h-[25px]" />
          </span>
        </div>
        <!-- Image -->
        <img
          :src="imageUrl"
          alt="Full Image Preview"
          class="max-h-full max-w-full"
        />
      </div>
    </teleport>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, onMounted, watch } from "vue";
import AppIcon from "../AppIcon";
import { AppNormalText } from "../AppTypography";
/**
 * Component that loads and displays an image with a fade-in effect.
 */
export default defineComponent({
  name: "AppImageLoader",
  components: {
    AppIcon,
    AppNormalText,
  },
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

    canShowFullImage: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const image = ref("");
    const imageUrl = ref("");

    const fullImageIsOpened = ref(false);

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

    // new click handler: stop propagation only when canShowFullImage is true
    const handleClick = (event: MouseEvent) => {
      if (props.canShowFullImage) {
        event.stopPropagation();
        fullImageIsOpened.value = true;
      }
      // else do nothing — allow normal propagation
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
      fullImageIsOpened,
      handleClick,
    };
  },
});
</script>
