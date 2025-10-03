<template>
  <!-- Proof Upload Bottom Sheet -->
  <div v-if="isOpen" class="fixed inset-0 bg-white bg-opacity-60 z-50 flex items-end" @click="handleClose">
    <div class="w-full bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto shadow-2xl border-t border-gray-200"
      @click.stop>
      <div class="p-4 pb-8">
        <!-- Handle bar -->
        <div class="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>

        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center space-x-2">
            <span class="text-xl">📸</span>
            <div>
              <h2 class="text-lg font-semibold text-gray-800">Upload Proof</h2>
              <p class="text-sm text-gray-600">Upload proof of payment or delivery</p>
            </div>
          </div>
          <button @click="handleClose"
            class="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="space-y-4">
          <!-- File Upload Area -->
          <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input ref="fileInputRef" type="file" class="hidden" accept="image/*,.pdf" @change="handleFileSelect"
              multiple />

            <div v-if="!selectedFiles.length" class="text-gray-500">
              <app-icon name="camera" class="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p class="text-lg font-medium mb-2">Upload Files</p>
              <p class="text-sm">Drop files here or click to select</p>
              <p class="text-xs mt-2">Supports: Images (JPG, PNG) and PDF files</p>
            </div>

            <div v-else class="space-y-3">
              <div v-for="(file, index) in selectedFiles" :key="index"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center space-x-3">
                  <app-icon :name="getFileIcon(file.type)" class="w-6 h-6 text-blue-500" />
                  <div>
                    <p class="text-sm font-medium">{{ file.name }}</p>
                    <p class="text-xs text-gray-500">{{ formatFileSize(file.size) }}</p>
                  </div>
                </div>
                <button @click="removeFile(index)" class="text-red-500 hover:text-red-700 p-1">
                  <app-icon name="x" class="w-4 h-4" />
                </button>
              </div>
            </div>

            <app-button @click="openFileSelector" variant="primary-white" class="mt-4">
              {{ selectedFiles.length ? 'Add More Files' : 'Select Files' }}
            </app-button>
          </div>

          <!-- Notes/Comments -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea v-model="notes" placeholder="Add any additional notes or comments..."
              class="w-full p-3 border border-gray-300 rounded-lg resize-none" rows="3" />
          </div>
        </div>

        <!-- Footer -->
        <div class="flex space-x-3 pt-4 border-t border-gray-200">
          <app-button @click="handleClose" variant="secondary" class="flex-1">
            Cancel
          </app-button>
          <app-button @click="handleUpload" variant="primary" class="flex-1"
            :disabled="!selectedFiles.length || isUploading">
            {{ isUploading ? 'Uploading...' : 'Upload Proof' }}
          </app-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue'
import AppButton from '../../AppButton/index.vue'
import AppIcon from '../../AppIcon/index.vue'

interface UploadedFile {
  name: string
  type: string
  size: number
  url?: string
}

interface Props {
  isOpen: boolean
  type?: 'payment' | 'delivery'
}

interface Emits {
  (e: 'close'): void
  (e: 'upload', files: File[], notes: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const fileInputRef = ref<HTMLInputElement>()
const selectedFiles = ref<File[]>([])
const notes = ref('')
const isUploading = ref(false)

const openFileSelector = () => {
  fileInputRef.value?.click()
}

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files) {
    const newFiles = Array.from(input.files)
    selectedFiles.value.push(...newFiles)
  }
}

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1)
}

const getFileIcon = (fileType: string): string => {
  if (fileType.startsWith('image/')) {
    return 'image'
  } else if (fileType === 'application/pdf') {
    return 'document'
  }
  return 'document'
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const handleClose = () => {
  selectedFiles.value = []
  notes.value = ''
  isUploading.value = false
  emit('close')
}

const handleUpload = async () => {
  if (!selectedFiles.value.length) return

  isUploading.value = true
  try {
    emit('upload', selectedFiles.value, notes.value)
    handleClose()
  } catch (error) {
    console.error('Upload failed:', error)
  } finally {
    isUploading.value = false
  }
}
</script>