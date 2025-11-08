<template>
    <div class="w-full flex flex-col pb-48">
        <!-- Order Header Skeleton -->
        <div class="w-full flex flex-col px-4 mb-4">
            <div class="w-full h-32 bg-gradient-to-r from-gray-200 to-gray-100 animate-pulse rounded-[12px]"></div>
        </div>

        <!-- Market Delivery Chat Skeleton -->
        <div class="w-full flex flex-col px-4 mb-4">
            <div class="w-full h-20 bg-gray-100 animate-pulse rounded-lg border border-gray-200"></div>
        </div>

        <!-- Tabs Skeleton -->
        <div class="w-full flex flex-col px-4 mb-4">
            <div class="w-full h-12 bg-gray-100 animate-pulse rounded-full"></div>
        </div>

        <!-- Info Card Skeletons -->
        <div class="w-full flex flex-col px-4 space-y-3">
            <!-- Product Card Skeleton -->
            <div class="w-full bg-gray-50 animate-pulse rounded-[12px] border border-gray-200 h-32"></div>

            <!-- Time + Status Card Skeleton -->
            <div class="w-full bg-gray-50 animate-pulse rounded-[12px] border border-gray-200 h-24"></div>

            <!-- Customer Card Skeleton -->
            <div class="w-full bg-gray-50 animate-pulse rounded-[12px] border border-gray-200 h-16"></div>

            <!-- Delivery Rider + Contact Card Skeleton -->
            <div class="w-full bg-gray-50 animate-pulse rounded-[12px] border border-gray-200 h-24"></div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "AppOrderDetailsSkeletonLoader",
    setup() {
        return {};
    },
});
</script>

<style scoped>
.skeleton {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 37%, #f0f0f0 63%);
    background-size: 400% 100%;
    animation: shimmer 1.4s ease infinite;
}
</style>
