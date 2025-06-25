<template>
  <div :class="` ${customClass} `">
    <swiper
      :slides-per-view="slidePerView"
      :space-between="spaceBetween"
      @swiper="onSwiper"
      @slideChange="onSlideChange"
      :class="swiperClass"
      :direction="direction"
      :autoplay="autoPlay"
      :loop="loop"
      ref="swiperRef"
      :id="`swiperRef${tabIndex}`"
    >
      <slot />
    </swiper>
    <div
      v-if="showPagination"
      class="w-full pt-3 flex flex-row items-center space-x-1 justify-center cursor-pointer"
    >
      <span
        :class="`rounded w-[25px] h-[3px] ${
          activeSlide == index ? 'bg-primary-400' : 'bg-grey-200 bg-opacity-60'
        }`"
        v-for="(slide, index) in slideCount"
        @click="swiperInstance?.slideTo(index)"
        :key="index"
      >
      </span>
    </div>
  </div>
</template>
<script lang="ts">
// Import Swiper Vue.js components
import { Swiper } from "swiper/vue";

// Import Swiper styles
import "swiper/css";

// import required modules
// import { Autoplay } from "swiper";
import {
  defineComponent,
  onBeforeUnmount,
  onMounted,
  ref,
  toRef,
  watch,
} from "vue";

/**
 * AppSwiper Component
 *
 * This component is a wrapper around the Swiper.js library, providing a flexible and customizable
 * carousel or slider component for Vue.js applications.  It simplifies the integration of Swiper.js
 * and offers several options for controlling the behavior and appearance of the slider.
 */
export default defineComponent({
  components: {
    Swiper,
  },
  props: {
    /**
     *  A custom CSS class to apply to the main container of the swiper.
     *  Allows for easy styling and customization of the swiper's appearance.
     */
    customClass: {
      type: String,
      default: "",
    },
    /**
     * The total number of slides to display. Used primarily for pagination indicators.
     */
    slideCount: {
      type: Number,
      default: 3,
    },
    /**
     *  A boolean indicating whether to display pagination indicators (dots) below the swiper.
     */
    showPagination: {
      type: Boolean,
      default: false,
    },
    /**
     *  The number of slides to display per view. Can be a number or 'auto' to fit slides based on their width.
     */
    slidePerView: {
      type: Number as () => any,
      default: "auto",
    },
    /**
     *  The space (in pixels) between each slide.
     */
    spaceBetween: {
      type: Number,
      default: 15,
    },
    /**
     *  A boolean indicating whether to enable free mode, allowing the user to freely swipe through the slides.
     */
    freeMode: {
      type: Boolean,
      default: true,
    },
    /**
     *  A boolean indicating whether the swiper should loop back to the beginning after the last slide.
     */
    loop: {
      type: Boolean,
      default: false,
    },
    /**
     *  A custom CSS class to apply to the swiper container itself.
     */
    swiperClass: {
      type: String,
      default: "pr-6",
    },
    /**
     * The index of the slide to initially display. Useful for programmatically setting the starting slide.
     */
    currentSlidePosition: {
      type: Number,
      default: 0,
    },
    /**
     * The direction of the swiper.  Can be 'vertical' or 'horizontal'.
     */
    direction: {
      type: String as () => "vertical" | "horizontal",
      default: "horizontal",
    },
    /**
     * Configuration for the autoplay feature.  See Swiper.js documentation for options. If delay is set, autoplay is enabled.
     */
    autoPlay: {
      type: Object as () => any,
      default: {},
    },
  },
  name: "AppSwiper",
  emits: ["update:modelValue"],
  setup(props, context: any) {
    const activeSlide = ref(0);
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const tabIndex = Math.floor(Math.random() * 10000); //Generate a random tabIndex to ensure id uniqueness

    const swiperRef = ref();
    const observer = ref();

    const swiperInstance = ref<any>();
    const onSwiper = (swiper: any) => {
      // if (!props.autoPlay.delay) {
      //   swiper.autoplay.stop();
      // }
      swiperInstance.value = swiper;
    };

    const updateSwiper = () => {
      swiperInstance.value.update();
    };

    const onSlideChange = (swiper: any) => {
      activeSlide.value = swiper.activeIndex;
      context.emit("update:modelValue", activeSlide.value);
    };

    const handleIntersect = (entries: any) => {
      if (entries.length) {
        swiperInstance.value.autoplay.start();
      }
      entries.forEach((entry: any) => {
        //
      });
    };

    const goToNextSlide = () => {
      swiperInstance.value?.slideNext();
    };

    const goToPrevSlide = () => {
      swiperInstance.value?.slidePrev();
    };

    const createObserver = () => {
      const options = {
        root: null, // Use the viewport as the root
        threshold: 0.1, // Trigger when 10% of the target is visible
      };

      observer.value = new IntersectionObserver(handleIntersect, options);
      const targetElement = document.getElementById(`swiperRef${tabIndex}`);
      observer.value.observe(targetElement);
    };

    const currentSlidePositionRef = toRef(props, "currentSlidePosition");

    watch(currentSlidePositionRef, () => {
      swiperInstance.value.slideTo(currentSlidePositionRef.value);
    });

    onMounted(() => {
      if (props.autoPlay.delay) {
        setTimeout(() => {
          createObserver();
        }, 500);
      }
      // Set slider position
      if (props.currentSlidePosition != 0) {
        swiperInstance.value.slideTo(currentSlidePositionRef.value);
      }
    });

    onBeforeUnmount(() => {
      if (props.autoPlay.delay) {
        observer.value.disconnect();
      }
    });

    return {
      onSwiper,
      onSlideChange,
      updateSwiper,
      goToNextSlide,
      goToPrevSlide,
      swiperInstance,
      // modules: [Autoplay],
      activeSlide,
      swiperRef,
      tabIndex,
    };
  },
});
</script>
