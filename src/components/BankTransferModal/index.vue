<template>
  <app-modal
    :show="show"
    @close="handleCancel"
    custom-class="bank-transfer-modal"
  >
    <template #header>
      <div class="flex items-center space-x-2">
        <span class="text-xl">🏦</span>
        <span class="text-lg font-semibold text-gray-800">Bank Account Details</span>
      </div>
    </template>

    <template #content>
      <!-- Saved Bank Accounts Section -->
      <div v-if="shouldShowSavedAccounts">
        <p class="text-sm text-gray-600 mb-4">💳 Choose from your saved bank accounts</p>
        
        <div class="space-y-3 mb-6">
          <div 
            v-for="account in savedBankAccounts" 
            :key="account.uuid"
            @click="selectSavedAccount(account)"
            class="p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <div class="flex justify-between items-center">
              <div>
                <div class="font-medium text-gray-800">{{ account.bank_name }}</div>
                <div class="text-sm text-gray-600">{{ account.account_number }} • {{ account.account_name }}</div>
                <div v-if="account.currency" class="text-xs text-blue-600 font-medium">{{ account.currency }}</div>
              </div>
              <div class="text-blue-500">→</div>
            </div>
          </div>
        </div>

        <app-button
          @click="showAddNewForm = true"
          variant="outline"
          class="w-full"
        >
          + Add New Bank Account
        </app-button>
      </div>

      <!-- Add New Bank Account Form -->
      <div v-if="shouldShowForm">
        <p class="text-sm text-gray-600 mb-4">
          {{ savedBankAccounts && savedBankAccounts.length > 0 ? 'Add a new bank account' : 'Enter your bank account details for the transfer' }}
        </p>
        
        <app-form
          :fields="formFields"
          @input="handleFormInput"
          :values="bankForm"
        />

        <div v-if="savedBankAccounts && savedBankAccounts.length > 0" class="mt-4">
          <app-button
            @click="showAddNewForm = false"
            variant="outline"
            class="w-full"
          >
            ← Back to Saved Accounts
          </app-button>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex space-x-3">
        <app-button
          @click="handleCancel"
          variant="outline"
          class="flex-1"
        >
          Cancel
        </app-button>
        <app-button
          @click="handleConfirm"
          :disabled="!isFormValid"
          variant="primary"
          class="flex-1"
        >
          {{ isProcessing ? 'Processing...' : 'Confirm Bank Account' }}
        </app-button>
      </div>
    </template>
  </app-modal>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, reactive } from "vue";
import AppModal from "../AppModal/index.vue";
import AppButton from "../AppButton/index.vue";
import AppForm from "../AppForm/index.vue";

interface BankAccount {
  uuid: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  currency?: string;
}

interface BankForm {
  bankName: string;
  accountNumber: string;
  accountName: string;
  currency: string;
}

export default defineComponent({
  name: "BankTransferModal",
  components: {
    AppModal,
    AppButton,
    AppForm,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    savedBankAccounts: {
      type: Array as () => BankAccount[],
      default: () => [],
    },
    isProcessing: {
      type: Boolean,
      default: false,
    },
    onConfirm: {
      type: Function,
      required: true,
    },
    onCancel: {
      type: Function,
      required: true,
    },
  },
  emits: ['confirm', 'cancel'],
  setup(props, { emit }) {
    const showAddNewForm = ref(false);
    const selectedAccount = ref<BankAccount | null>(null);
    
    const bankForm = reactive<BankForm>({
      bankName: '',
      accountNumber: '',
      accountName: '',
      currency: 'NGN',
    });

    const formFields = computed(() => [
      {
        name: 'bankName',
        type: 'text',
        label: 'Bank Name',
        placeholder: 'e.g. First Bank of Nigeria',
        required: true,
      },
      {
        name: 'accountNumber',
        type: 'text',
        label: 'Account Number',
        placeholder: 'e.g. 1234567890',
        maxlength: 20,
        required: true,
      },
      {
        name: 'accountName',
        type: 'text',
        label: 'Account Holder Name',
        placeholder: 'e.g. John Doe',
        required: true,
      },
      {
        name: 'currency',
        type: 'select',
        label: 'Currency',
        options: [
          { title: 'TRY - Turkish Lira', value: 'TRY', icon: '' },
          { title: 'NGN - Nigerian Naira', value: 'NGN', icon: '' },
          { title: 'USD - US Dollar', value: 'USD', icon: '' },
          { title: 'GHS - Ghanaian Cedi', value: 'GHS', icon: '' },
          { title: 'KES - Kenyan Shilling', value: 'KES', icon: '' },
          { title: 'ZAR - South African Rand', value: 'ZAR', icon: '' },
        ],
        required: true,
      },
    ]);

    const shouldShowSavedAccounts = computed(() => {
      return props.savedBankAccounts && props.savedBankAccounts.length > 0 && !showAddNewForm.value;
    });

    const shouldShowForm = computed(() => {
      return !props.savedBankAccounts || props.savedBankAccounts.length === 0 || showAddNewForm.value;
    });

    const isFormValid = computed(() => {
      if (selectedAccount.value) return true;
      
      return bankForm.bankName.trim() !== '' &&
             bankForm.accountNumber.trim() !== '' &&
             bankForm.accountName.trim() !== '' &&
             bankForm.currency.trim() !== '';
    });

    const handleFormInput = (values: any) => {
      Object.keys(values).forEach(key => {
        if (key in bankForm) {
          (bankForm as any)[key] = values[key];
        }
      });
    };

    const selectSavedAccount = (account: BankAccount) => {
      selectedAccount.value = account;
    };

    const handleConfirm = () => {
      const accountData = selectedAccount.value || {
        bank_name: bankForm.bankName,
        account_number: bankForm.accountNumber,
        account_name: bankForm.accountName,
        currency: bankForm.currency,
      };

      props.onConfirm(accountData);
      emit('confirm', accountData);
      resetForm();
    };

    const handleCancel = () => {
      props.onCancel();
      emit('cancel');
      resetForm();
    };

    const resetForm = () => {
      showAddNewForm.value = false;
      selectedAccount.value = null;
      bankForm.bankName = '';
      bankForm.accountNumber = '';
      bankForm.accountName = '';
      bankForm.currency = 'NGN';
    };

    // Reset form when modal is closed
    watch(() => props.show, (newVal) => {
      if (!newVal) {
        resetForm();
      }
    });

    return {
      showAddNewForm,
      selectedAccount,
      bankForm,
      formFields,
      shouldShowSavedAccounts,
      shouldShowForm,
      isFormValid,
      handleFormInput,
      selectSavedAccount,
      handleConfirm,
      handleCancel,
      resetForm,
    };
  },
});
</script>

<style scoped>
.bank-transfer-modal {
  max-width: 500px;
}
</style>