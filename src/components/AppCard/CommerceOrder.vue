<template>
    <div class="bg-white flex items-center rounded-xl border p-4 gap-4" style="border-color: #E8E8E8">
        <!-- Icon -->
        <app-icon :name="order.icon || 'icon-circle'" custom-class="!h-12" />

        <!-- Content -->
        <div class="flex-1">
            <!-- Title -->
            <app-header-text customClass="leading-6 !text-base !text-black font-bold">
                {{ order.title }}
            </app-header-text>

            <!-- Status and Date -->
            <div class="flex items-center gap-2 mt-1">
                <app-normal-text customClass="leading-6 !text-sm font-medium"
                    :style="`color: ${order.statusColor || '#FF9500'}`">
                    {{ order.status }}
                </app-normal-text>

                <span class="text-gray-400 text-xs">●</span>

                <app-normal-text customClass="leading-6 !text-xs !text-gray-400">
                    {{ order.label }}
                </app-normal-text>
            </div>
        </div>

        <!-- Right side info -->
        <div class="flex-shrink-0 flex flex-col items-end gap-1">
            <!-- Price -->
            <app-header-text customClass="leading-6 !text-base !text-black font-bold">
                {{ order.price }}
            </app-header-text>

            <!-- Item count -->
            <app-normal-text customClass="leading-6 !text-xs !text-gray-400">
                {{ order.itemCount }}
            </app-normal-text>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue"
import AppIcon from "../AppIcon"
import { AppHeaderText, AppNormalText } from "../AppTypography"

interface Order {
    title: string
    label: string
    status: string
    icon?: string
    statusColor?: string
    price?: string
    itemCount?: string
}

export default defineComponent({
    name: "AppCommerceOrderCard",
    components: {
        AppIcon,
        AppHeaderText,
        AppNormalText,
    },
    props: {
        order: {
            type: Object as PropType<Order>,
            required: true,
        },
    },
})
</script>
