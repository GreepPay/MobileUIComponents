<template>
  <div :class="['flex items-center w-full space-x-3 rounded', customClass]">
    <div
      class="relative w-full flex items-center space-x-2 bg-white border border-gray-300 rounded-3xl px-4 py-2 focus-within:ring-[1.5px] focus-within:ring-green-500"
    >
      <app-icon name="search-normal" class="text-gray-500" />

      <input
        v-model="searchQuery"
        :placeholder="placeholder"
        class="w-full text-gray-700 text-sm py-2 border-none outline-none"
      />

      <button
        v-if="searchQuery"
        @click="clearSearch"
        class="text-gray-500 hover:text-gray-700"
      >
        ✕
      </button>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent, ref, watch } from "vue"
  import AppIcon from "../AppIcon/index.vue"

  export default defineComponent({
    name: "SearchComponent",
    components: { AppIcon },
    props: {
      placeholder: {
        type: String,
        default: "Search...",
      },
      customClass: {
        type: String,
        default: "",
      },
    },
    setup(_, { emit }) {
      const searchQuery = ref("")

      watch(searchQuery, (newValue) => {
        emit("update:search", newValue)
      })

      const clearSearch = () => {
        searchQuery.value = ""
      }

      return { searchQuery, clearSearch }
    },
  })
</script>
