<template>
  <div>
    <app-product-card-skeleton />
    <template v-if="type === 'product'">
      <div
        v-for="n in numberOfLoaders"
        :key="n"
        class="mb-2"
        :class="customClass"
      >
        <app-product-card-skeleton-loader />
      </div>
    </template>

    <template v-else-if="type === 'notification'">
      <div
        v-for="n in numberOfLoaders"
        :key="n"
        class="mb-2"
        :class="customClass"
      >
        <app-notification-skeleton-loader />
      </div>
    </template>

    <template v-else-if="type === 'shop'">
      <div
        v-for="n in numberOfLoaders"
        :key="n"
        class="mb-2"
        :class="customClass"
      >
        <app-shop-skeleton-loader />
      </div>
    </template>

    <template v-else-if="type === 'ticket'">
      <div
        v-for="n in numberOfLoaders"
        :key="n"
        class="mb-2"
        :class="customClass"
      >
        <app-ticket-skeleton-loader />
      </div>
    </template>

    <template v-else>
      <div
        v-for="n in numberOfLoaders"
        :key="n"
        class="mb-2"
        :class="customClass"
      >
        <app-skeleton-default-loader />
      </div>
    </template>
  </div>
</template>
<script lang="ts">
  import { defineComponent, onMounted, ref, toRef } from "vue"

  type SkeletonType =
    | "product"
    | "variant"
    | "shop"
    | "ticket"
    | "order"
    | "notification"
    | "message"
    | "event-card"
    | "event-list"
    | "default"

  import {
    AppProductCardSkeletonLoader,
    AppNotificationSkeletonLoader,
    AppSkeletonDefaultLoader,
    AppTicketSkeletonLoader,
  } from "./"

  export default defineComponent({
    name: "AppSkeletonLoaderIndex",
    components: {
      AppProductCardSkeletonLoader,
      AppNotificationSkeletonLoader,
      AppNotificationSkeletonLoader,
      AppTicketSkeletonLoader,
    },
    props: {
      type: {
        type: String as () => SkeletonType,
        default: "default",
      },
      numberOfLoaders: {
        type: Number,
        default: 10,
      },
      customClass: {
        type: String,
        default: "",
      },
    },
  })
</script>
