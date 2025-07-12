<template>
  <div
    :class="`overflow-hidden ${
      shape === 'circle' ? 'rounded-full' : 'rounded-lg'
    }`"
    :style="{
      width: size + 'px',
      height: size + 'px',
    }"
  >
    <!-- Skeleton Loader -->
    <div
      v-if="isLoading"
      class="skeleton animate-pulse bg-gray-200 w-full h-full"
    ></div>

    <img
      v-show="!isLoading"
      v-if="imageUrl"
      :src="imageUrl"
      :alt="alt"
      class="w-full h-full object-cover"
      @error="handleImageError"
      @load="handleImageLoad"
    />
    <div
      v-else
      :class="`flex items-center justify-center w-full h-full ${bgColor}`"
    >
      <span :class="`text-${textSize} font-medium ${textColor}`">
        {{ initials }}
      </span>
    </div>
  </div>
</template>

<script lang="ts">
  import { computed, defineComponent, ref } from "vue"

  /**
   * Avatar Component
   *
   * Displays a user avatar with image support and fallback to initials
   */
  export default defineComponent({
    name: "AppAvatar",
    props: {
      /**
       * Image source URL
       */
      src: {
        type: String,
        default: "/images/profile-image.svg",
      },
      /**
       * Alternative text for the image
       */
      alt: {
        type: String,
        default: "",
      },
      /**
       * Size of the avatar in pixels
       */
      size: {
        type: Number,
        default: 40,
      },
      /**
       * Shape of the avatar - 'circle' or 'square'
       */
      shape: {
        type: String,
        default: "circle",
        validator: (value: string) => ["circle", "square"].includes(value),
      },
      /**
       * Name to generate initials from
       */
      name: {
        type: String,
        default: "",
      },
      /**
       * Background color class (TailwindCSS Class)
       */
      bgColor: {
        type: String,
        default: "bg-gray-200",
      },
      /**
       * Text color class (TailwindCSS Class)
       */
      textColor: {
        type: String,
        default: "text-gray-700",
      },
    },
    setup(props) {
      const isLoading = ref(true)

      const imageUrl = computed(() => {
        return props.src || "/images/profile-image.svg"
      })

      const textSize = computed(() => {
        if (props.size < 32) return "xs"
        if (props.size < 48) return "sm"
        if (props.size < 64) return "base"
        return "lg"
      })

      const initials = computed(() => {
        if (!props.name) return ""
        return props.name
          .split(" ")
          .map((word) => word[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      })

      const handleImageError = (e: Event) => {
        const target = e.target as HTMLImageElement
        target.style.display = "none"
      }

      const handleImageLoad = () => {
        isLoading.value = false
      }

      return {
        isLoading,
        textSize,
        initials,
        imageUrl,
        handleImageError,
        handleImageLoad,
      }
    },
  })
</script>
