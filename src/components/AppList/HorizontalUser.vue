<template>
  <div
    v-if="items && items.length >= 1"
    :class="[
      'flex items-center overflow-x-auto h-fit scrollbar-hide',
      customClass,
    ]"
  >
    <div
      v-for="user in items"
      :key="user.id"
      class="flex flex-col items-center justify-center space-y-1 px-3"
    >
      <app-avatar :src="user.avatar" :alt="user.name" :size="imageSize" />
      <app-normal-text class="text-base !text-gray-two !leading-6">
        {{ user.name }}
      </app-normal-text>
    </div>
  </div>

  <div v-else class="border flex justify-center rounded-2xl p-5">
    <app-normal-text class="!text-center !text-gray-two !leading-6">
      {{ noDataText }}
    </app-normal-text>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import AppAvatar from "../AppAvatar/index.vue";
import { AppNormalText } from "../AppTypography";

/**
 * Horizontal List Component
 *
 * This component renders a horizontally scrollable list of items with avatars and names.
 * It supports customization for avatar size and additional styling via props.
 *
 * Features:
 * - Displays a horizontal list of items.
 * - Scrollable with hidden scrollbar.
 * - Customizable avatar size.
 * - Supports additional custom classes.
 *
 * @prop {Array} items - List of items with `id`, `name`, and `avatar` properties.
 * @prop {Number} [imageSize=56] - Size of the avatar.
 * @prop {String} [customClass=""] - Additional classes for styling.
 */

interface List {
  id: string | number;
  name: string;
  avatar: string;
}

export default defineComponent({
  name: "HorizontalList",
  components: { AppAvatar, AppNormalText },
  props: {
    /**
     * List of items with `id`, `name`, and `avatar` properties.
     */
    items: {
      type: Array as PropType<List[]>,
      required: true,
    },
    /**
     * Size of the user avatar.
     * @default 40
     */
    imageSize: {
      type: Number,
      default: 40,
    },
    /**
     * Text for no data for user list
     * @default string
     */
    noDataText: {
      type: String,
      default: "You have no beneficiary",
    },
    /**
     * Allows additional custom styling classes.
     * @default ""
     */
    customClass: {
      type: String,
      default: "",
    },
  },
});
</script>
