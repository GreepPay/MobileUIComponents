<template>
  <div class="w-full h-full flex flex-col">
    <div :class="`w-full h-full flex flex-col   ${containerClass}`">
      <slot
        name="item-content"
        v-for="(item, index) in data"
        :item="item"
        :index="index"
      />

      <slot v-if="contentLoading" name="skeleton-loaders" />

      <div
        class="h-[40px] w-fullz-50"
        :id="`sideAnchor-${uniqueId}`"
        v-if="direction === 'horizontal'"
      ></div>
    </div>

    <div
      class="h-[40px] w-fullz-50"
      :id="`bottomAnchor-${uniqueId}`"
      v-if="direction === 'vertical'"
    ></div>
  </div>
</template>
<script lang="ts">
  import { defineComponent, onMounted, ref, toRef } from "vue"
  import { Logic } from "../../composable"
  import { PaginatorInfo } from "@greep/logic/src/gql/graphql"

  export default defineComponent({
    components: {},
    props: {
      data: {
        type: Array as () => any[],
        required: true,
      },
      pagination: {
        type: Object as () => PaginatorInfo | undefined,
        required: true,
      },
      fetchMore: {
        type: Function as unknown as () => (
          nextPage: number
        ) => Promise<boolean | undefined>,
        required: true,
      },
      fetchNew: {
        type: Function as unknown as () => () => Promise<boolean | undefined>,
        required: false,
      },
      containerClass: {
        type: String as () => string,
        default: "",
      },
      direction: {
        type: String as () => "horizontal" | "vertical",
        default: "vertical",
      },
    },
    emits: ["update:modelValue"],
    name: "AppVirtualScroller",
    setup(props, context) {
      // State
      const uniqueId = Logic.Common.makeid(16)
      const contentLoading = ref(false)
      const muteFetchMore = ref(false)

      // Methods
      /**
       * Handles infinite scrolling logic when the user reaches the end of the list.
       *
       * Triggered automatically by the IntersectionObserver when the
       * bottom or side "anchor" element enters the viewport.
       *
       * - Checks if more data can be fetched based on pagination info.
       * - Prevents duplicate requests when already loading (`contentLoading`)
       *   or when further fetches are muted (`muteFetchMore`).
       * - Calls the `fetchMore` function prop with the next page number.
       * - Resets the loading state once new data is loaded.
       *
       * @param {IntersectionObserverEntry[]} event - Array containing observer entries.
       */
      const onScrolledToEnd = (event: [IntersectionObserverEntry]) => {
        if (muteFetchMore.value || contentLoading.value) return

        const observer = event[0]
        if (!observer?.isIntersecting) return
        const currentPage = props.pagination?.currentPage || 0
        const totalPage = props.pagination?.lastPage || 0

        let nextPage = currentPage

        if (currentPage < totalPage) nextPage += 1
        else nextPage = -1

        if (nextPage > 1) {
          if (contentLoading.value) return
          contentLoading.value = true

          if (props.fetchMore) {
            props
              .fetchMore(nextPage)
              .then((responseData) => {
                if (responseData) contentLoading.value = false
              })
              .finally(() => (contentLoading.value = false))
          }
        }
      }

      const createObserver = () => {
        const options = {
          root: null, // Use the viewport as the root
          rootMargin: "0px",
          threshold: 0.1, // Trigger when 10% of the target is visible
        }

        const observer = new IntersectionObserver(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          onScrolledToEnd,
          options
        )
        const targetElement = document.getElementById(
          `bottomAnchor-${uniqueId}`
        )
        if (targetElement) {
          observer.observe(targetElement)
        }
      }

      const createHorizontalObserver = () => {
        const options = {
          root: null, // Use the viewport as the root
          rootMargin: "0px",
          threshold: 0.1, // Trigger when 10% of the target is visible
        }

        const observer = new IntersectionObserver(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          onScrolledToEnd,
          options
        )
        const targetElement = document.getElementById(`sideAnchor-${uniqueId}`)
        if (targetElement) {
          observer.observe(targetElement)
        }
      }

      const resetList = () => {
        contentLoading.value = true
        muteFetchMore.value = true
        if (props.fetchNew) {
          props.fetchNew().then((responseData) => {
            if (responseData) {
              contentLoading.value = false
              muteFetchMore.value = false
            }
          })
        }
      }

      onMounted(() => {
        setTimeout(() => {
          createObserver()
          createHorizontalObserver()
        }, 400)
      })

      return {
        uniqueId,
        contentLoading,
        resetList,
      }
    },
  })
</script>
