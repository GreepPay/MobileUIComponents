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
    <app-image-loader
      v-if="imageUrl"
      :photo-url="imageUrl"
      :style="{
      width: size + 'px',
      height: size + 'px',
    }"
      
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
  import { computed, defineComponent } from "vue"
  import AppImageLoader from "../AppImageLoader"

  /**
   * Avatar Component
   *
   * Displays a user avatar with image support and fallback to initials
   */
  export default defineComponent({
    name: "AppAvatar",
    components: {
      AppImageLoader,
    },
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
      const imageUrl = computed(() => {
        if (!props.src) return "/images/profile-image.svg"
        else return props.src
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

      return {
        textSize,
        initials,
        imageUrl,
        handleImageError,
      }
    },
  })
</script>
