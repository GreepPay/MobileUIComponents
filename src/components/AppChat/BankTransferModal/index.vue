<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-end"
    @click="handleCancel"
  >
    <div
      class="w-full bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto border-t border-gray-200"
      @click.stop
    >
      <div class="px-4 pt-4">
        <!-- Header -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-2">
            <app-header-text> Bank Account Details </app-header-text>
          </div>

          <div class="w-[28px] h-[28px]">
            <app-icon name="close" custom-class="h-[22px]" />
          </div>
        </div>

        <!-- Saved Bank Accounts Section -->
        <div v-if="shouldShowSavedAccounts">
          <p class="modal-description">
            💳 Choose from your saved bank accounts
          </p>

          <div class="saved-accounts-list">
            <div
              v-for="account in savedBankAccounts"
              :key="account.uuid"
              @click="selectSavedAccount(account)"
              class="saved-account-item"
            >
              <div class="account-info">
                <div class="bank-name">{{ account.bank_name }}</div>
                <div class="account-details">
                  {{ account.account_number }} • {{ account.account_name }}
                </div>
                <div v-if="account.currency" class="account-currency">
                  {{ account.currency }}
                </div>
              </div>
              <div class="select-icon">→</div>
            </div>
          </div>

          <button @click="showAddNewForm = true" class="add-new-btn">
            + Add New Bank Account
          </button>
        </div>

        <!-- Add New Bank Account Form -->
        <div v-if="shouldShowForm">
          <app-normal-text class="!text-gray-600">
            {{
              savedBankAccounts && savedBankAccounts.length > 0
                ? "Add a new bank account"
                : "Enter your bank account details for the transfer"
            }}
          </app-normal-text>
          <div class="w-full flex flex-col py-4 pt-7">
            <div class="w-full flex flex-col pb-3">
              <app-text-field
                v-model="bankForm.bankName"
                :has-title="true"
                type="text"
                placeholder="Bank Name"
                ref="bankInputRef"
                name="Bank Name"
                use-floating-label
                :rules="[FormValidations.RequiredRule]"
                custom-class="!border-gray-300 focus:!border-primary"
              />
            </div>

            <div class="w-full flex flex-col pb-3">
              <app-text-field
                v-model="bankForm.accountNumber"
                :has-title="true"
                type="tel"
                placeholder="Account Number"
                ref="accountNumberRef"
                name="Account Number"
                use-floating-label
                :rules="[FormValidations.RequiredRule]"
                custom-class="!border-gray-300 focus:!border-primary"
              />
            </div>

            <div class="w-full flex flex-col pb-3">
              <app-text-field
                v-model="bankForm.accountName"
                :has-title="true"
                type="text"
                placeholder="Account Name"
                ref="accountNameRef"
                name="Account Name"
                use-floating-label
                :rules="[FormValidations.RequiredRule]"
                custom-class="!border-gray-300 focus:!border-primary"
              />
            </div>

            <div class="w-full flex flex-col pb-3">
              <app-select
                :placeholder="'Currency'"
                :hasTitle="false"
                :paddings="'py-4 !px-4'"
                :options="availableOptionForCurrency"
                name="Ad Type"
                customClass=" !font-[500]"
                ref="AdType"
                v-model="bankForm.currency"
              >
              </app-select>
            </div>

            <div
              v-if="savedBankAccounts && savedBankAccounts.length > 0"
              class="back-button-container"
            >
              <app-button class="w-full" @click="showAddNewForm = false">
                Back to Saved Accounts
              </app-button>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="w-full flex flex-col">
          <app-info-box class="!bg-red-100">
            {{ errorMessage }}
          </app-info-box>
        </div>
      </div>

      <div class="w-full grid grid-cols-2 gap-3 px-4 pb-6">
        <div class="col-span-1 flex flex-col">
          <app-button
            @click="handleCancel"
            class="w-full !py-4"
            outlined
            variant="secondary"
          >
            Cancel
          </app-button>
        </div>
        <div class="col-span-1 flex flex-col">
          <app-button
            @click="handleConfirm"
            class="w-full !py-4"
            :disabled="!canConfirm || isSubmitting"
            variant="secondary"
            :loading="createAccountIsLoading"
          >
            {{ confirmButtonText }}
          </app-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, watch, reactive } from "vue";
import { AppHeaderText, AppNormalText } from "../../AppTypography";
import AppIcon from "../../AppIcon";
import { AppTextField, AppSelect } from "../../AppForm";
import { Logic } from "../../../composable";
import { SelectOption } from "@/types";
import { availableCurrencies } from "../../../composable";
import AppButton from "../../AppButton";
import AppInfoBox from "../../AppInfoBox";

interface BankAccount {
  uuid: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  currency?: string;
  meta_data?: string;
}

interface BankForm {
  bankName: string;
  accountNumber: string;
  accountName: string;
  currency: string;
}

interface Props {
  show: boolean;
  savedBankAccounts?: BankAccount[];
  isProcessing?: boolean;
  onConfirm?: Function;
  onCancel?: Function;
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  savedBankAccounts: () => [],
  isProcessing: false,
});

const availableOptionForCurrency = reactive<SelectOption[]>([]);
const createAccountIsLoading = ref(false);

const FormValidations = Logic.Form;

const emit = defineEmits<{
  "bank-details-submitted": [bankDetails: BankForm, savedAccount?: BankAccount];
  "saved-account-selected": [account: BankAccount];
  cancel: [];
  confirm: [data: any];
}>();

// Reactive data
const showAddNewForm = ref(false);
const isSubmitting = ref(false);
const errorMessage = ref("");
const bankInputRef = ref<HTMLInputElement>();

// Watch for saved accounts and ensure we show the list first
watch(
  () => props.savedBankAccounts,
  (newAccounts) => {
    if (newAccounts && newAccounts.length > 0) {
      showAddNewForm.value = false; // Always show saved accounts first
    }
  },
  { immediate: true }
);

const bankForm = ref<BankForm>({
  bankName: "",
  accountNumber: "",
  accountName: "",
  currency: "NGN",
});

// Computed properties
const hasSavedAccounts = computed(() => {
  const hasAccounts =
    props.savedBankAccounts && props.savedBankAccounts.length > 0;
  console.log(
    "🔧 BankTransferModal hasSavedAccounts:",
    hasAccounts,
    "showAddNewForm:",
    showAddNewForm.value
  );
  return hasAccounts;
});

const shouldShowSavedAccounts = computed(() => {
  return hasSavedAccounts.value && !showAddNewForm.value;
});

const shouldShowForm = computed(() => {
  return showAddNewForm.value || !hasSavedAccounts.value;
});

const canConfirm = computed(() => {
  return (
    bankForm.value.bankName.trim() &&
    bankForm.value.accountNumber.trim() &&
    bankForm.value.accountName.trim() &&
    bankForm.value.currency
  );
});

const confirmButtonText = computed(() => {
  if (isSubmitting.value) return "Saving...";
  return props.savedBankAccounts && props.savedBankAccounts.length > 0
    ? "Save & Continue"
    : "Continue";
});

// Methods
const handleConfirm = async () => {
  if (!canConfirm.value) return;

  isSubmitting.value = true;
  errorMessage.value = "";

  try {
    // Just create the bank account object from form data
    const bankAccount: BankAccount = {
      uuid: "", // Will be set by the API in parent component
      bank_name: bankForm.value.bankName,
      account_number: bankForm.value.accountNumber,
      account_name: bankForm.value.accountName,
      currency: bankForm.value.currency,
    };

    // Emit the form data - let parent handle the API call
    emit("bank-details-submitted", bankForm.value, bankAccount);

    // Also emit confirm for backward compatibility
    emit("confirm", bankAccount);

    // Call prop function if provided (for backward compatibility)
    if (props.onConfirm) {
      props.onConfirm(bankAccount);
    }
  } catch (error) {
    console.error("Failed to process bank account:", error);
    errorMessage.value = "Failed to process bank account. Please try again.";
  } finally {
    isSubmitting.value = false;
  }
};

const selectSavedAccount = (account: BankAccount) => {
  console.log("🏦 Selecting saved account:", account);

  // Emit the saved account selection
  emit("saved-account-selected", account);

  // Also emit confirm for backward compatibility
  emit("confirm", account);

  // Call prop function if provided (for backward compatibility)
  if (props.onConfirm) {
    props.onConfirm(account);
  }
};

const handleCancel = () => {
  console.log("🏦 BankTransferModal: Cancelling");

  // Reset form
  resetForm();

  // Emit cancel event
  emit("cancel");

  // Call prop function if provided (for backward compatibility)
  if (props.onCancel) {
    props.onCancel();
  }
};

const resetForm = () => {
  showAddNewForm.value = false;
  bankForm.value = {
    bankName: "",
    accountNumber: "",
    accountName: "",
    currency: "NGN",
  };
  errorMessage.value = "";
};

// Reset form when modal is closed
watch(
  () => props.show,
  (newVal) => {
    if (!newVal) {
      resetForm();
    }
  }
);

// Initialize on mount
onMounted(() => {
  nextTick(() => {
    // If no saved accounts, show add new form
    if (!props.savedBankAccounts || props.savedBankAccounts.length === 0) {
      showAddNewForm.value = true;
      nextTick(() => {
        if (bankInputRef.value) {
          bankInputRef.value.focus();
        }
      });
    }
  });

  availableOptionForCurrency.length = 0;
  availableCurrencies
    ?.filter((item) => !item.is_crypto)
    .forEach((item) => {
      availableOptionForCurrency.push({
        key: item.code,
        value: item.name,
      });
    });
});
</script>
