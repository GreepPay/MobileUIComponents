<template>
  <div>
    <img
      :src="`${basePath}images/icons/${name}.${extension}`"
      :class="`${customClass}`"
    />
  </div>
</template>

<script setup>
defineProps({
  /**
   * The name of the icon file (without the `.svg` extension).
   * The component will attempt to load `/images/icons/{name}.svg`.
   */
  name: {
    type: String,
    required: true,
  },
  /**
   * Custom CSS classes to apply to the `<img>` element.
   * Useful for styling the icon's size, color, etc.
   */
  customClass: {
    type: String,
    default: "w-5 h-5",
  },
  /**
   * The file extension of the icon.
   */
  extension: {
    type: String,
    default: "svg",
  },
});

const basePath = import.meta.env.VITE_APP_BASE_URL || "/";
</script>
