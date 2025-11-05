<template>
  <div class="flex w-full flex-col space-y-2">
    <template v-if="isWrapper">
      <div class="flex flex-row relative">
        <input
          type="file"
          style="
            opacity: 0;
            width: 100%;
            height: 100%;
            left: 0;
            overflow: hidden;
            position: absolute;
            z-index: 10;
          "
          :accept="accept"
          :multiple="isMultiple"
          @change="uploadHandler"
        />
        <!--
          @slot content
          This slot allows you to place custom content within the file input wrapper when `isWrapper` is true.
          Use this to create custom visual representations for your file upload area.
        -->
        <slot name="content" />
      </div>
    </template>
    <template v-else>
      <div
        class="rounded-xs flex flex-row items-center justify-start relative space-x-2 px-1 py-4 bg-grayBackground border-dashed"
      >
        <input
          type="file"
          style="
            opacity: 0;
            width: 100%;
            height: 100%;
            left: 0;
            overflow: hidden;
            position: absolute;
            z-index: 10;
          "
          :accept="accept"
          :multiple="isMultiple"
          @change="uploadHandler"
        />
        <app-icon :name="`${iconName}`" :customClass="'h-[15px]'" />
        <app-normal-text
          color="text-paragraphTextLight"
          customClass="w-full text-left line-clamp-1"
        >
          {{ selectedFileName != "" ? selectedFileName : placeholder }}
        </app-normal-text>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from "vue";
import AppNormalText from "../AppTypography/normalText.vue";
import AppIcon from "../AppIcon/index.vue";
import { Logic } from "../../composable";

/**
 *  A file attachment component that provides a visually customizable way to handle file uploads.
 *  It supports single or multiple file selection, custom placeholders, icons, and allows for wrapping custom content around the file input.
 */
export default defineComponent({
  components: {
    AppNormalText,
    AppIcon,
  },
  props: {
    /**
     * The placeholder text to display when no file is selected.
     */
    placeholder: {
      type: String,
      default: "Upload File",
    },
    /**
     * The name of the icon to display.
     */
    iconName: {
      type: String,
      default: "upload",
    },
    /**
     * The accept attribute for the file input, specifying the allowed file types.
     */
    accept: {
      type: String,
      default: "*",
    },
    /**
     * The model value for the selected file(s).
     * This is a two-way binding property. It can be a single `File` object or an array of `File` objects depending on `isMultiple`.
     */
    modelValue: {
      required: false,
    },
    /**
     *  Determines whether to use the wrapper style. If true, the component will render without the default visual style,
     *  allowing you to provide your own content via the `content` slot.
     */
    isWrapper: {
      type: Boolean,
      default: false,
    },
    /**
     *  Determines whether multiple files can be selected.
     */
    isMultiple: {
      type: Boolean,
      default: false,
    },
    autoUploadToCloud: {
      type: Boolean,
      default: false,
    },
  },
  emits: [
    /**
     * Emitted when the file(s) are selected.
     * @param {File | File[]} value - The selected file(s). If `isMultiple` is true, it will be an array of `File` objects; otherwise, it will be a single `File` object.
     */
    "update:modelValue",
    /**
     * Emitted when a single file is selected (when `isMultiple` is false).
     * Provides a local file URL for preview purposes.
     * @param {string} url - The local file URL as a string.
     */
    "update:localFileUrl",
    /**
     *  Emitted when a single file is selected (when `isMultiple` is false).
     *  Provides the file content as a base64 data URL.
     *  @param {string} data - The base64 data URL representing the file content.
     */
    "update:base64Data",
    /**
     *  Emitted when a single file is selected (when `isMultiple` is false).
     *  Provides the file content as a base64 data URL.
     *  @param {string} data - The base64 data URL representing the file content.
     */
    "update:filesAndUrl",

    "update:cloudFileUrl",
  ],
  name: "AppFileAttachment",
  setup(props: any, context: any) {
    const files = ref<FileList>();

    const selectedFileName = ref("");

    const fileListArray = ref<any[]>([]);

    const toDataURL = (url: string, callback: any) => {
      var xhr = new XMLHttpRequest();
      xhr.onload = function () {
        var reader = new FileReader();
        reader.onloadend = function () {
          callback(reader.result);
        };
        reader.readAsDataURL(xhr.response);
      };
      xhr.open("GET", url);
      xhr.responseType = "blob";
      xhr.send();
    };

    const uploadHandler = (e: any) => {
      const input = e.target;

      files.value = input.files;

      selectedFileName.value = input.files[0].name;

      // create readable url
      const fr = new FileReader();
      if (files.value) {
        if (files.value.length == 0) {
          fr.readAsDataURL(files.value[0]);
          fr.addEventListener("load", () => {
            context.emit(
              "update:localFileUrl",
              fr.result?.toString() ? fr.result?.toString() : ""
            );
            toDataURL(fr.result?.toString() || "", (dataUrl: any) => {
              context.emit("update:base64Data", dataUrl);
            });
          });
        } else {
          const allDataLocalUrl = ref<string[]>([]);
          const allDataBase64 = ref<string[]>([]);
          let completedCount = 0;

          for (let i = 0; i < files.value.length; i++) {
            const file = files.value[i];
            const reader = new FileReader();

            reader.onload = (event: any) => {
              const localFileUrl = event.target.result as string;
              allDataLocalUrl.value.push(localFileUrl);
              toDataURL(localFileUrl || "", (dataUrl: any) => {
                allDataBase64.value.push(dataUrl);
                completedCount++;

                if (completedCount === files.value.length) {
                  context.emit("update:localFileUrl", allDataLocalUrl.value);
                  context.emit("update:base64Data", allDataBase64.value);

                  if (props.autoUploadToCloud) {
                    Logic.User.UploadFile(files.value[0]).then((response) => {
                      context.emit("update:cloudFileUrl", response);
                    });
                  }

                  const allFilesAndUrl: {
                    url: string;
                    rawValue: File;
                  }[] = [];
                  allDataBase64.value.forEach((url, index) => {
                    allFilesAndUrl.push({ url, rawValue: files.value[index] });
                  });

                  context.emit("update:filesAndUrl", allFilesAndUrl);
                }
              });
            };

            reader.readAsDataURL(file);
          }
        }
      }
    };

    watch(files, () => {
      if (files.value) {
        fileListArray.value = [];
        for (let index = 0; index < files.value.length; index++) {
          const file = files.value?.item(index);
          fileListArray.value.push(file);
        }
        context.emit(
          "update:modelValue",
          props.isMultiple ? fileListArray.value : fileListArray.value[0]
        );
      }
    });

    watch(props, () => {
      if (props.placeholder) {
        selectedFileName.value = "";
      }
    });

    onMounted(() => {
      if (props.modelValue) {
        fileListArray.value = props.modelValue;
      }
    });

    const removeFile = (index: number) => {
      fileListArray.value = fileListArray.value.filter((file, fileIndex) => {
        return fileIndex != index;
      });
      context.emit(
        "update:modelValue",
        props.isMultiple ? fileListArray.value : fileListArray.value[0]
      );
    };

    return {
      uploadHandler,
      fileListArray,
      removeFile,
      selectedFileName,
    };
  },
});
</script>
