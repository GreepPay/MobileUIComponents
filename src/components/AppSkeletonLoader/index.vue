<template>
  <div>
    <template v-if="type === 'product'">
      <div
        v-for="n in numberOfLoaders"
        :key="n"
        class="mb-2"
        :class="customClass"
      >
        <app-product-skeleton-loader />
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

    <template v-else-if="type === 'delivery-address'">
      <div
        v-for="n in numberOfLoaders"
        :key="n"
        class="mb-2"
        :class="customClass"
      >
        <app-delivery-address-skeleton-loader />
      </div>
    </template>

    <template v-else-if="type === 'order'">
      <div
        v-for="n in numberOfLoaders"
        :key="n"
        class="mb-2"
        :class="customClass"
      >
        <app-order-skeleton-loader />
      </div>
    </template>

    <template v-else-if="type === 'transaction'">
      <div
        v-for="n in numberOfLoaders"
        :key="n"
        class="mb-2"
        :class="customClass"
      >
        <app-transaction-skeleton-loader />
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
import { defineComponent, onMounted, ref, toRef } from "vue";

type SkeletonType =
  | "product"
  | "variant"
  | "shop"
  | "ticket"
  | "order"
  | "notification"
  | "message"
  | "transaction"
  | "event-card"
  | "event-list"
  | "delivery-address"
  | "default";

import {
  AppProductSkeletonLoader,
  AppNotificationSkeletonLoader,
  AppSkeletonDefaultLoader,
  AppTicketSkeletonLoader,
  AppDeliveryAddressSkeletonLoader,
  AppOrderSkeletonLoader,
  AppTransactionSkeletonLoader,
} from "./";

export default defineComponent({
  name: "AppSkeletonLoaderIndex",
  components: {
    AppProductSkeletonLoader,
    AppNotificationSkeletonLoader,
    AppTicketSkeletonLoader,
    AppDeliveryAddressSkeletonLoader,
    AppOrderSkeletonLoader,
    AppTransactionSkeletonLoader,
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
});
</script>
