<template>
  <div
    :key="location.name || location.id"
    :class="` w-full !border-gray-200 !border rounded-lg p-4 cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors`"
  >
    <div class="flex items-center justify-between">
      <div class="w-[50px] mr-3">
        <app-icon
          :name="`${
            addressType.toLocaleLowerCase()?.includes('dropoff')
              ? 'pick_up_icon'
              : 'drop_off_icon'
          }`"
          customClass="h-[48px]"
        />
      </div>
      <div class="w-full flex flex-col">
        <div class="pb-[2px]">
          <app-normal-text class="font-semibold text-gray-900 mb-1">
            {{ location.name }}
          </app-normal-text>
        </div>
        <div class="pb-2">
          <app-normal-text class="text-gray-600 mb-1">
            {{ location.description }}
          </app-normal-text>
        </div>
        <div>
          <app-normal-text class="!text-primary !underline">
            <a :href="location.google_map_link" target="_blank"> See on map </a>
          </app-normal-text>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
/**
 * AppDeliveryCard
 *
 * A reusable delivery address card component.
 * Displays delivery address information with an icon indicating pickup or dropoff.
 */

import { defineComponent } from "vue";
import AppImageLoader from "../AppImageLoader";
import AppIcon from "../AppIcon";
import { AppHeaderText, AppNormalText } from "../AppTypography";
import { DeliveryAddress } from "@greep/logic/src/gql/graphql";

export default defineComponent({
  name: "AppDeliveryCard",
  components: {
    AppImageLoader,
    AppIcon,
    AppHeaderText,
    AppNormalText,
  },
  props: {
    location: {
      type: Object as () => DeliveryAddress,
      required: true,
    },
    addressType: {
      type: String,
      required: true,
    },
  },
  setup() {
    return {};
  },
});
</script>
