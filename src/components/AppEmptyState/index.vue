<template>
  <div
    :class="[
      'w-full flex flex-col min-h-24 border-[2px] h-fit border-[#F0F3F6] rounded-xl py-8 px-4 justify-center items-center',
      custonClass,
    ]"
  >
    <app-icon :name="icon" custom-class="!h-[60px]" v-if="useIcon" />

    <div class="flex flex-col items-center justify-center px-5 pt-3">
      <app-normal-text class="!text-[#0A141E] !font-[500] !text-sm">
        {{ title }}
      </app-normal-text>
      <app-normal-text
        class="!text-[#616161] !text-center pt-[4px] px-4 leading-5"
      >
        {{ description }}
      </app-normal-text>
    </div>

    <div
      v-else
      :class="[
        'relative w-full flex flex-col min-h-24 border-[2px] h-fit border-[#F0F3F6] rounded-xl py-8 px-4 justify-center items-center',
        custonClass,
      ]"
    >
      <app-icon :name="icon" custom-class="!h-[60px]" v-if="useIcon" />

      <div class="flex flex-col items-center justify-center px-5 pt-3">
        <app-normal-text class="!text-[#0A141E] !font-[500] !text-sm">
          {{ title }}
        </app-normal-text>
        <app-normal-text
          class="!text-[#616161] !text-center pt-[4px] px-4 leading-5"
        >
          {{ description }}
        </app-normal-text>
      </div>

      <div
        class="w-full flex flex-row justify-center items-center pt-4"
        v-if="buttonData"
      >
        <app-button
          variant="secondary"
          class="!px-6 py-3"
          @click="buttonData.action()"
        >
          {{ buttonData.label }}
        </app-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent } from "vue"
  import AppIcon from "../AppIcon"
  import { AppNormalText } from "../AppTypography"
  import AppButton from "../AppButton"
  import { AppSkeletonLoader } from "../AppSkeletonLoader"

  /**
   * AppEmptyState Component
   *
   * Shows an empty state with an icon, title, and description
   */
  export default defineComponent({
    name: "AppEmptyState",
    components: {
      AppIcon,
      AppNormalText,
      AppButton,
      AppSkeletonLoader,
    },
    props: {
      /**
       * Whether to display an icon above the title.
       * @type {boolean}
       * @default true
       */
      useIcon: {
        type: Boolean,
        default: true,
      },

      /**
       * The name of the icon to display.
       * Used only if `useIcon` is true.
       * @type {string}
       * @default "no-transaction"
       */
      icon: {
        type: String,
        default: "no-transaction",
      },

      /**
       * The main title text shown in the empty state.
       * Typically a short message like “No Data Found”.
       * @type {string}
       * @default ""
       */
      title: {
        type: String,
        default: "",
      },

      /**
       * The descriptive text below the title.
       * Used to give more context or explanation to users.
       * @type {string}
       * @default ""
       */
      description: {
        type: String,
        default: "",
      },

      /**
       * Custom class(es) to extend or override the default container styles.
       * Can be used to adjust layout or colors.
       * @type {string}
       * @default ""
       */
      custonClass: {
        type: String,
        default: "",
      },

      /**
       * Optional button configuration.
       * Contains the button label and the action callback when clicked.
       * @example
       * buttonData={{ label: 'Retry', action: retryFetch }}
       * @type {{ label: string, action: Function }}
       * @required false
       */
      buttonData: {
        type: Object as () => {
          label: string
          action: Function
        },
        required: false,
      },

      /**
       * Whether to show the skeleton loader instead of the empty state.
       * When true, the loader replaces all other content.
       * @type {boolean}
       * @default false
       */
      isLoading: {
        type: Boolean,
        default: false,
      },

      /**
       * Type of loader to display when `isLoading` is true.
       * This is passed to the <app-skeleton-loader> component.
       * @type {string}
       * @default "default"
       */
      typeOfLoader: {
        type: String,
        default: "default",
      },

      /**
       * Number of skeleton loader items to display.
       * Useful for simulating multiple placeholders.
       * @type {number}
       * @default 10
       */
      numberOfLoaders: {
        type: Number,
        default: 10,
      },

      /**
       * Whether to display the skeleton loader in a vertical list format.
       * This is passed to the <app-skeleton-loader> component.
       * @type {boolean}
       * @default false
       */

      isVerticalList: {
        type: Boolean,
        default: false,
      },
    },
    setup() {
      return {}
    },
  })
</script>
