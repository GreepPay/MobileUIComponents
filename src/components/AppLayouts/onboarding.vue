<template>
  <div
    :class="`w-full h-screen flex flex-col lg:text-sm mdlg:text-[12px] text-xs overflow-y-scroll !font-inter bg-white relative`"
  >
    <!-- Top section -->
    <app-image-loader
      :class="`w-full flex flex-col sticky top-0 left-0 !pb-2 px-4 space-y-2 z-50 ${topPadding} ${
        variant == 'default' ? '' : '!bg-white'
      }`"
      :photo-url="`${variant == 'default' ? '/images/green-bg.png' : ''}`"
    >
      <div
        class="w-full flex flex-row justify-between items-center"
        :style="`padding-top: calc(env(safe-area-inset-top) + ${
          currentPlatform == 'android' ? '45' : '16'
        }px) !important`"
      >
        <app-header-text
          :class="` ${
            variant == 'default' ? '!text-white' : '!text-black'
          } !text-left !font-semibold !text-[16px]`"
        >
          {{ pageSetting.main_title }}
        </app-header-text>

        <app-header-text
          v-if="variant == 'default'"
          :class="`!text-white !text-left !font-semibold opacity-80 !text-[16px]`"
        >
          {{ hideElements ? fallBackTitle : currentPage?.title }}
        </app-header-text>
        <div class="flex flex-col" v-else @click="Logic.Common.goBack()">
          <app-icon name="close-circle" custom-class="h-[24px]" />
        </div>
      </div>

      <div
        class="w-full flex flex-row items-center gap-x-2"
        v-if="!hideElements"
      >
        <div
          class="flex flex-col"
          v-for="(page, index) in pageSetting.pages"
          :key="index"
          :style="`width: ${
            (currentPageIndex + 1 / pageSetting.pages.length) * 100
          }%`"
        >
          <div
            :class="`rounded-[16px] ${
              variant == 'default' ? 'bg-white h-[6px]' : 'bg-[#0A141E] h-[3px]'
            } w-full ${
              index > currentPageIndex
                ? `${
                    variant == 'default' ? '!bg-opacity-30' : '!bg-opacity-20'
                  }`
                : ''
            }`"
          ></div>
        </div>
      </div>
    </app-image-loader>

    <!-- Content -->
    <slot />

    <!-- Bottom section -->
    <div
      class="w-full grid-cols-12 grid gap-3 px-4 fixed z-50 bottom-0 left-0 pt-4 bg-white"
      :style="`
        padding-bottom: calc(
          env(safe-area-inset-bottom) + ${
            currentPlatform == 'android' ? '45' : '16'
          }px
        ) !important;
      `"
    >
      <!-- Back btn -->
      <app-button
        variant="secondary"
        outlined
        class="!py-4 col-span-4"
        @click="prevPage"
      >
        Back
      </app-button>

      <!-- Next btn -->
      <app-button
        variant="secondary"
        :class="`!py-4 col-span-8 !border-secondary`"
        @click="nextPage"
        :disabled="
          hideElements
            ? fallBackPage?.action_btn.is_disabled
            : currentPage.action_btn.is_disabled
        "
        :loading="
          hideElements
            ? fallBackPage?.action_btn.loading
            : currentPage.action_btn.loading
        "
      >
        {{
          hideElements
            ? fallBackPage?.action_btn.label
            : currentPage.action_btn?.label
        }}
      </app-button>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import AppImageLoader from "../AppImageLoader/index";
import { AppNormalText, AppHeaderText } from "../AppTypography";
import AppButton from "../AppButton";
import { Logic } from "../../composable";
import AppIcon from "../AppIcon";
import { getPlatforms } from "@ionic/vue";

/**
 *  Onboarding layout component to create multi-step onboarding flows.
 *  It provides a consistent structure with a header image, progress bar, content area, and navigation buttons.
 */
export default defineComponent({
  name: "AppOnboardingLayout",
  components: {
    AppImageLoader,
    AppNormalText,
    AppHeaderText,
    AppButton,
    AppIcon,
  },
  emits: ["update:modelValue"],
  props: {
    /**
     *  Current page key.  Used to determine which page of the onboarding flow is currently displayed.
     */
    modelValue: {
      default: "",
      required: false,
    },
    /**
     *  An object defining the structure and content of the onboarding flow.
     *  @property {string} main_title - The main title displayed in the header.
     *  @property {Array<Object>} pages - An array of page objects, each defining a step in the onboarding flow.
     *  @property {string} pages[].title - The title of the page.
     *  @property {string} pages[].key -  A unique key identifying the page.
     *  @property {Object} pages[].action_btn - Configuration for the primary action button on the page.
     *  @property {string} pages[].action_btn.label - The label of the action button.
     *  @property {Function} pages[].action_btn.handler - The function to be executed when the action button is clicked.
     *  @property {boolean} [pages[].action_btn.is_disabled=false] - A boolean indicating whether the action button is disabled.
     */
    pageSetting: {
      type: Object as () => {
        main_title: string;
        pages: {
          title: string;
          key: string;
          action_btn: {
            label: string;
            handler: () => void;
            is_disabled?: boolean;
            loading?: boolean;
          };
        }[];
      },
      default: () => ({
        main_title: "Setup POS",
        pages: [
          {
            title: "Account Info",
            key: "account_info",
            action_btn: {
              label: "Next",
              is_disabled: false,
              handler: () => {},
            },
          },
          {
            title: "Verify Account",
            key: "verify_account",
            action_btn: {
              label: "Next",
              is_disabled: false,
              handler: () => {},
            },
          },
        ],
      }),
    },
    topPadding: {
      type: String,
      default: "",
    },
    variant: {
      type: String as () => "default" | "white",
      default: "default",
    },
    hideElements: {
      type: Boolean,
      default: false,
    },
    fallBackTitle: {
      type: String,
      default: "",
    },
    fallBackPage: {
      type: Object as () => {
        title: string;
        key: string;
        action_btn: {
          label: string;
          handler: () => void;
          is_disabled?: boolean;
          loading?: boolean;
        };
      },
    },
  },
  setup(props, context) {
    /**
     * Computed property that returns the current page object based on the `modelValue`.
     */
    const currentPage = computed(() => {
      return props.pageSetting.pages.find(
        (page) => page.key === props.modelValue
      );
    });

    /**
     * Computed property that returns the index of the current page in the `pageSetting.pages` array.
     */
    const currentPageIndex = computed(() => {
      return props.pageSetting.pages.findIndex(
        (page) => page.key === props.modelValue
      );
    });

    /**
     * Navigates to the next page in the onboarding flow.
     * It triggers the `handler` function of the current page's `action_btn` if available and not disabled.
     */
    const nextPage = () => {
      if (props.hideElements) {
        if (!props.fallBackPage.action_btn?.is_disabled) {
          props.fallBackPage.action_btn.handler();
        }
        return;
      }

      if (currentPageIndex.value < props.pageSetting.pages.length - 1) {
        if (!currentPage.value.action_btn?.is_disabled) {
          currentPage.value.action_btn.handler();
        }
      } else {
        currentPage.value?.action_btn?.handler?.();
      }
    };

    /**
     * Navigates to the previous page in the onboarding flow by emitting an `update:modelValue` event
     * with the key of the previous page.
     */
    const prevPage = () => {
      if (currentPageIndex.value > 0) {
        context.emit(
          "update:modelValue",
          props.pageSetting.pages[currentPageIndex.value - 1].key
        );
      } else {
        Logic.Common.goBack();
      }
    };

    const currentPlatform = computed(() => {
      return getPlatforms()[0];
    });

    return {
      currentPage,
      currentPageIndex,
      nextPage,
      prevPage,
      Logic,
      currentPlatform,
    };
  },
});
</script>
