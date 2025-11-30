<template>
  <div :class="`flex flex-col space-y-2 ${defaultSize} `">
    <template v-if="isWrapper">
      <div class="w-full flex flex-col" @click="ShowSelectModal = true">
        <slot />
      </div>
    </template>
    <template v-else>
      <app-normal-text v-if="hasTitle">
        <!--
      @slot title
      Slot for the title of the select component.
    -->
        <slot name="title" />
      </app-normal-text>
      <div
        :class="`flew-grow w-full [box-shadow:0_0_0_1.5px_#E0E2E4] space-x-1 flex-row flex items-center justify-between bg-white rounded-[10px] relative ${
          isFocused ? 'border-primary' : ''
        } ${customClass} ${paddings}`"
        :id="'container' + tabIndex"
        @focus="
          showOption = true;
          isFocused = true;
          ShowSelectModal = true;
        "
        @blur="
          isFocused = false;
          showOption = false;
        "
        :tabindex="tabIndex"
        @click="ShowSelectModal = true"
      >
        <!-- Floating label -->
        <template v-if="useFloatingLabel && valueData.length > 0">
          <app-normal-text
            class="absolute left-4 top-[-24%] px-1 py-[2px] bg-white !text-veryLightGray z-10"
          >
            {{ placeholder }}
          </app-normal-text>
        </template>
        <template v-if="usePermanentFloatingLabel">
          <app-normal-text
            class="absolute left-4 top-[-24%] px-1 py-[2px] bg-white !text-[#616161] !font-[500] z-10"
          >
            {{ name }}
          </app-normal-text>
        </template>
        <input
          ref="select"
          :value="withKey ? valueData : textValue"
          :placeholder="placeholder"
          disabled
          :class="` text-gray-900 grow bg-transparent placeholder-veryLightGray focus input w-full focus:outline-hidden  focus:border-primary`"
        />
        <app-icon
          @click="
            showOption = true;
            isFocused = true;
          "
          name="show-more"
          custom-class="md:h-[7px] h-[6px] cursor-pointer"
        />
      </div>
    </template>
  </div>
  <app-modal
    :canClose="true"
    custom-class="mdlg:hidden!"
    :close="
      () => {
        ShowSelectModal = false;
      }
    "
    v-if="ShowSelectModal"
  >
    <div
      @click.stop="true"
      class="rounded-t-2xl flex flex-col space-y-2 bg-white w-full absolute overflow-y-auto min-h-[300px] max-h-[600px] bottom-0 left-0 pb-3 px-3 lg:text-sm! mdlg:text-[12px]! text-xs"
    >
      <div
        class="flex items-center justify-center sticky top-0 bg-white w-full pt-3"
      >
        <span class="bg-gray-700 rounded-full w-[30px] h-[4px]"></span>
      </div>
      <div class="w-full pt-1 sticky top-[18px] bg-white" v-if="autoComplete">
        <app-text-field placeholder="Search" v-model="searchValue">
        </app-text-field>
      </div>
      <app-radio
        :options="selectOptions"
        v-model="selectedKey"
        @click.stop="true"
      />

      <div
        class="!h-full w-full flex flex-row items-center justify-center flex-grow"
        v-if="selectOptions.length == 0 && hasSearch"
      >
        <app-normal-text
          :customClass="'text-center -mt-[30px]'"
          :color="'text-gray-400'"
        >
          {{ searchIsLoading ? "Searching..." : searchMessage }}
        </app-normal-text>
      </div>
    </div>
  </app-modal>
</template>

<script lang="ts">
import { Logic } from "../../composable";
import { SelectOption } from "../../types";
import { capitalize, defineComponent, onMounted, ref, toRef, watch } from "vue";
import AppIcon from "../AppIcon/index.vue";
import AppModal from "../AppModal";
import AppNormalText from "../AppTypography/normalText.vue";
import AppTextField from "./textField.vue";
import AppRadio from "./radio.vue";

/**
 * AppSelect component for selecting options from a dropdown.
 */
export default defineComponent({
  name: "AppSelect",
  components: {
    AppIcon,
    AppNormalText,
    AppModal,
    AppTextField,
    AppRadio,
  },
  props: {
    /**
     * Determines whether to display the key along with the value in the input field.
     */
    withKey: {
      type: Boolean,
      default: false,
    },
    /**
     * The placeholder text for the input field.
     */
    placeholder: {
      type: String,
      default: "",
    },
    /**
     * An array of options to display in the select dropdown.
     */
    options: {
      type: Array as () => SelectOption[],
    },
    /**
     * Custom padding for the select container.
     */
    paddings: {
      type: String,
      default: "py-4 px-3",
    },
    /**
     * Custom CSS classes to apply to the select container.
     */
    customClass: {
      type: String,
      default: "",
    },
    name: {
      type: String,
      default: "",
    },
    /**
     * An array of default keys to select when the component is initialized (for multi-select).
     */
    defaultValues: {
      required: false,
      default: [],
    },
    /**
     * The currently selected value (or array of values for multi-select).  Use with `v-model`.
     */
    modelValue: {
      type: String || Array,
      default: false,
    },
    /**
     * Determines if the select allows multiple selections.
     */
    isMultiple: {
      type: Boolean,
      default: false,
    },
    /**
     * Determines whether to display a title above the select.
     */
    hasTitle: {
      type: Boolean,
      default: false,
    },
    /**
     *  Default size classes for the component (e.g., width).
     */
    defaultSize: {
      type: String,
      default: "w-full",
    },
    /**
     * Determines whether to enable auto-complete functionality with a search field.
     */
    autoComplete: {
      type: Boolean,
      default: false,
    },
    /**
     * Determines whether the input is floating label.
     */
    useFloatingLabel: {
      type: Boolean,
      default: false,
      required: false,
    },
    /**
     * Determines whether the input is permanent floating label.
     */
    usePermanentFloatingLabel: {
      type: Boolean,
      default: false,
      required: false,
    },
    /**
     * Determines whether the input is wrapped.
     */
    isWrapper: {
      type: Boolean,
      default: false,
    },
    /**
     * Determines whether the input has a search field.
     */
    hasSearch: {
      type: Boolean,
      default: false,
    },
    /**
     * Message to display when searching.
     */
    searchMessage: {
      type: String,
      default: "",
    },
    /**
     * Determines whether the search is loading.
     */
    searchIsLoading: {
      type: Boolean,
      default: false,
    },
  },
  emits: [
    /**
     * Emitted when the `modelValue` changes.
     */
    "update:modelValue",
    /**
     * Emitted when an option is selected.
     */
    "OnOptionSelected",
    /**
     * Emitted when the search value changes.
     */
    "OnSearch",
  ],
  setup(props: any, context: any) {
    const isFocused = ref(false);
    const showOption = ref(false);

    const tabIndex = Math.random();

    const ShowSelectModal = ref(false);

    const OptionRef = ref<SelectOption[]>([]);

    const searchResult = ref<SelectOption[]>([]);

    const selectedKey = ref();

    const valueData = ref("");

    const textValue = ref("");

    const searchValue = ref("");

    const selectOptions = ref<any[]>([]);

    const prepareSelectOptions = () => {
      selectOptions.value.length = 0;

      if (Array.isArray(searchResult.value)) {
        searchResult.value.forEach((item: any) => {
          selectOptions.value.push({
            key: item.key,
            value: `${item.value}${props.withKey ? ` (${item.key})` : ""}`,
            altValue: item.altValue ? item.altValue : null,
            hasIcon: item.hasIcon ? item.hasIcon : false,
            extras: item.extras ? item.extras : "",
            isImage: item.isImage ? item.isImage : false,
            extraInfo: item.extraInfo ? item.extraInfo : null,
          });
        });
      }
    };

    watch(selectedKey, () => {
      if (selectedKey.value != 0) {
        const selectedOption = searchResult.value.filter((eachItem: any) => {
          return eachItem.key == selectedKey.value;
        });
        selectValue(selectedOption[0]);
        ShowSelectModal.value = false;
      }
    });

    const selectedItems = ref<any>([]);

    watch(props, () => {
      if (props.options) {
        OptionRef.value = props.options;
        searchOption();
      }
      prepareSelectOptions();
    });

    onMounted(() => {
      if (props.defaultValues.length > 0) {
        selectedItems.value = props.defaultValues;
      }
      if (props.options) {
        OptionRef.value = props.options;
        searchResult.value = props.options;
      }

      if (props.modelValue) {
        const selectedOption = searchResult.value.filter((eachItem: any) => {
          return eachItem.key == props.modelValue;
        });
        selectedKey.value = props.modelValue;
        if (selectedOption.length > 0) {
          selectValue(selectedOption[0]);
        }
      }
      prepareSelectOptions();
    });

    const itemIsSelected = (inputKey: string) => {
      const item = selectedItems.value.filter((key: any) => {
        return key == inputKey;
      });

      return item.length > 0;
    };

    const selectValue = (option: any) => {
      if (!option) {
        return;
      }

      if (props.autoComplete) {
        context.emit("OnOptionSelected", option);

        isFocused.value = false;
        showOption.value = false;

        if (props.withKey) {
          valueData.value = option.key;
        } else {
          if (option) {
            valueData.value = option.value;
            textValue.value = option.value;
          }
        }

        context.emit("update:modelValue", option.key);

        document.getElementById("container" + tabIndex)?.blur();
        return;
      }
      if (props.isMultiple) {
        if (itemIsSelected(option.key)) {
          selectedItems.value = selectedItems.value.filter((key: any) => {
            return key != option.key;
          });

          return;
        }
        selectedItems.value.push(option.key);
        context.emit("update:modelValue", selectedItems.value);
        context.emit("OnOptionSelected", option);
      } else {
        context.emit("update:modelValue", option.key);
        context.emit("OnOptionSelected", option);
        if (props.withKey) {
          valueData.value = option.key;
        } else {
          valueData.value = option.value;
          textValue.value = option.value;
        }
        isFocused.value = false;
        showOption.value = false;

        document.getElementById("container" + tabIndex)?.blur();
      }
    };

    const getSelectedOption = (keyValue: any) => {
      const option = searchResult.value.filter((eachItem: any) => {
        return eachItem.key == keyValue;
      });

      return option[0].value;
    };

    const searchOption = () => {
      if (props.autoComplete) {
        searchResult.value = Logic.Common.searchArray(
          OptionRef.value,
          capitalize(searchValue.value)
        );
      }
    };

    watch(searchValue, () => {
      if (props.hasSearch) {
        context.emit("OnSearch", searchValue.value);
      } else {
        if (props.handleSearch) {
          props.handleSearch(searchValue.value, ...props.extraSearchParams);
        } else {
          searchOption();
        }
      }
    });

    watch(OptionRef, () => {
      searchOption();
    });

    watch(searchResult, () => {
      prepareSelectOptions();
    });

    watch(
      () => props.options,
      (newOptions) => {
        if (newOptions) {
          OptionRef.value = newOptions;
          searchResult.value = newOptions;
          prepareSelectOptions();
        }
      },
      { immediate: true, deep: true }
    );

    return {
      showOption,
      valueData,
      isFocused,
      selectValue,
      tabIndex,
      textValue,
      itemIsSelected,
      selectedItems,
      getSelectedOption,
      ShowSelectModal,
      selectOptions,
      selectedKey,
      searchValue,
      searchResult,
    };
  },
});
</script>
