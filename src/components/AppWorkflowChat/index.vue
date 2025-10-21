<template>
  <app-wrapper>
    <div
      class="w-full flex flex-col lg:text-sm mdlg:text-[12px] relative text-xs font-poppins overflow-y-auto h-full"
      id="workflow-chat-page"
      :style="mobileFullHeight"
    >
      <!-- Top bar -->
      <chat-top-bar
        :conversation="conversationData"
        @back-click="handleBackClick"
      />

      <!-- WebSocket Connection Status -->
      <div
        v-if="!isConnected"
        class="w-full bg-yellow-50 border-b border-yellow-200 px-4 py-2"
      >
        <div class="flex items-center space-x-2">
          <div class="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
          <span class="text-yellow-700 text-xs">
            📡 Connecting to real-time messaging...
          </span>
        </div>
      </div>

      <!-- Chat content -->
      <div class="w-full flex flex-col px-4 pt-4 pb-4">
        <template
          v-for="(message, index) in messages"
          :key="`msg-${message.id}-${index}`"
        >
          <div
            class="mb-4"
            v-if="
              message.type != 'info' ||
              (message.type == 'info' &&
                conversationData?.participants[0]?.user_id?.toString() ==
                  Logic.Auth.AuthUser?.id?.toString())
            "
          >
            <chat-message
              :conversation="conversationData"
              :message="message"
              :show-actions="showMessageAction(message)"
              :authUser="Logic.Auth.AuthUser"
            />
          </div>
        </template>

        <!-- Payment Modal Flow - Different for each workflow type -->

        <!-- DELIVERY WORKFLOWS: 3-Modal Payment Flow -->
        <template v-if="workflowType === 'deliveries'">
          <!-- 1. Payment Summary Modal -->
          <div
            v-if="showPaymentConfirmation && !paymentConfirmed"
            class="fixed inset-0 z-50 flex items-end"
            @click="showPaymentConfirmation = false"
          >
            <div
              class="w-full bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
              @click.stop
            >
              <!-- Header -->
              <div
                class="sticky top-0 bg-white border-b border-gray-200 p-4 rounded-t-3xl"
              >
                <div class="flex items-center justify-between">
                  <h2 class="text-xl font-bold text-gray-900">Make Payment</h2>
                  <button
                    @click="showPaymentConfirmation = false"
                    class="p-2 hover:bg-gray-100 rounded-full text-gray-500 text-xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              <!-- Content -->
              <div class="p-6 space-y-6">
                <!-- Item Details -->
                <div class="space-y-4">
                  <div
                    class="flex justify-between items-center py-3 border-b border-gray-100"
                  >
                    <span class="text-gray-600">Item</span>
                    <span class="font-semibold text-gray-900">{{
                      deliveryDetails.itemDescription
                    }}</span>
                  </div>
                  <!-- <div class="flex justify-between items-center py-3 border-b border-gray-100">
                    <span class="text-gray-600">Item Size</span>
                    <span class="font-semibold text-gray-900">2KG</span>
                  </div> -->
                  <div
                    class="flex justify-between items-center py-3 border-b border-gray-100"
                  >
                    <span class="text-gray-600">Schedule</span>
                    <span class="font-semibold text-gray-900">Instant</span>
                  </div>
                  <div
                    class="flex justify-between items-center py-3 border-b border-gray-200"
                  >
                    <span class="text-gray-600">Delivery Fee</span>
                    <span class="font-bold text-gray-900"
                      >₦{{ deliveryDetails.deliveryPrice }}</span
                    >
                  </div>
                </div>

                <!-- Addresses -->
                <div class="space-y-4 py-4 border-b border-gray-200">
                  <!-- Pickup -->
                  <div class="flex items-start space-x-3">
                    <div
                      class="w-4 h-4 bg-purple-500 rounded-full mt-1 flex-shrink-0"
                    ></div>
                    <div>
                      <div class="font-semibold text-gray-900">Pickup</div>
                      <div class="text-gray-600 text-sm">
                        {{ deliveryDetails.pickupAddress }}
                      </div>
                    </div>
                  </div>

                  <!-- Connecting line -->
                  <div class="ml-2 w-0.5 h-6 bg-gray-300"></div>

                  <!-- Dropoff -->
                  <div class="flex items-start space-x-3">
                    <div
                      class="w-4 h-4 bg-teal-500 rounded-full mt-1 flex-shrink-0"
                    ></div>
                    <div>
                      <div class="font-semibold text-gray-900">Dropoff</div>
                      <div class="text-gray-600 text-sm">
                        {{ deliveryDetails.deliveryAddress }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Total -->
                <div class="flex justify-between items-center py-4">
                  <span class="text-xl font-bold text-gray-900">Total</span>
                  <span class="text-xl font-bold text-gray-900"
                    >₦{{ deliveryDetails.deliveryPrice }}</span
                  >
                </div>

                <!-- Continue Button -->
                <button
                  @click="handleContinueToPayment"
                  class="w-full bg-black text-white py-4 rounded-full font-semibold text-lg hover:bg-gray-800 transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>

          <!-- 2. Payment Details Modal -->
          <div
            v-if="showPaymentDetailsModal"
            class="fixed inset-0 z-50 flex items-end"
            @click="showPaymentDetailsModal = false"
          >
            <div
              class="w-full bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
              @click.stop
            >
              <!-- Header -->
              <div
                class="sticky top-0 bg-white border-b border-gray-200 p-4 rounded-t-3xl"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <button
                      @click="
                        showPaymentDetailsModal = false;
                        showPaymentConfirmation = true;
                      "
                      class="p-2 hover:bg-gray-100 rounded-full mr-2 text-gray-500 text-xl"
                    >
                      ←
                    </button>
                    <h2 class="text-xl font-bold text-gray-900">Payment</h2>
                  </div>
                  <button
                    @click="showPaymentDetailsModal = false"
                    class="p-2 hover:bg-gray-100 rounded-full text-gray-500 text-xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              <!-- Content -->
              <div class="p-6 space-y-6">
                <!-- Item Details -->
                <div class="space-y-4">
                  <div
                    class="flex justify-between items-center py-3 border-b-2 border-gray-200"
                  >
                    <span class="text-gray-600">Item</span>
                    <span class="font-semibold text-gray-900">{{
                      deliveryDetails.itemDescription
                    }}</span>
                  </div>
                  <div
                    class="flex justify-between items-center py-3 border-b-2 border-gray-200"
                  >
                    <span class="text-gray-600">Delivery Fee</span>
                    <span class="font-bold text-gray-900"
                      >${{ deliveryDetails.deliveryPrice }}</span
                    >
                  </div>
                  <div
                    class="flex justify-between items-center py-3 border-b-2 border-gray-300"
                  >
                    <span class="text-gray-600">Reward</span>
                    <div class="flex items-center">
                      <span class="font-bold text-gray-900">10</span>
                      <div
                        class="w-6 h-6 bg-green-500 rounded-full ml-2 flex items-center justify-center"
                      >
                        <span class="text-white text-xs font-bold">G</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Payment Method -->
                <div class="space-y-4">
                  <div class="flex justify-between items-center">
                    <h3 class="text-lg font-bold text-gray-900">
                      Payment Method
                    </h3>
                    <!-- <button class="text-green-600 font-semibold">Change</button> -->
                  </div>
                  <div
                    class="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div class="flex items-center">
                      <div
                        class="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center mr-3"
                      >
                        <svg
                          class="w-6 h-6 text-white"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"
                          />
                        </svg>
                      </div>
                      <div>
                        <div class="font-semibold text-gray-900">
                          Pay with Wallet
                        </div>
                        <!-- <div class="text-sm text-gray-600">₦5,000</div> -->
                      </div>
                    </div>
                    <div
                      class="w-6 h-6 border-2 border-green-500 rounded-full flex items-center justify-center"
                    >
                      <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                </div>

                <!-- Coupon -->
                <!-- <div class="flex justify-between items-center py-4 border-b-2 border-gray-300">
                  <span class="text-lg font-bold text-gray-900">Coupon</span>
                  <div class="flex items-center">
                    <span class="text-green-600 font-semibold mr-2">₦3 off</span>
                    <span class="text-gray-400">→</span>
                  </div>
                </div> -->

                <!-- Total and Pay Button Row -->
                <div class="flex items-center justify-between py-6">
                  <div class="flex flex-col">
                    <div class="text-gray-600 text-sm">Total</div>
                    <div class="text-2xl font-bold text-gray-900">
                      ${{ deliveryDetails.deliveryPrice }}
                    </div>
                  </div>
                  <div class="flex-1 ml-6">
                    <button
                      @click="handleFinalPayment"
                      class="w-full bg-black text-white py-4 rounded-full font-semibold text-lg hover:bg-gray-800 transition-colors"
                    >
                      Pay
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 3. Payment Success Modal -->
          <div
            v-if="showPaymentSuccessModal"
            class="fixed inset-0 z-50 flex items-end"
            @click="showPaymentSuccessModal = false"
          >
            <div
              class="w-full bg-white rounded-t-3xl shadow-2xl p-8"
              @click.stop
            >
              <!-- Success Icon -->
              <div class="flex justify-center mb-6">
                <div
                  class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center"
                >
                  <svg
                    class="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="3"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
              </div>

              <!-- Success Text -->
              <h2 class="text-2xl font-bold text-gray-900 text-center mb-8">
                Payment Successful
              </h2>

              <!-- Okay Button -->
              <button
                @click="handlePaymentSuccess"
                class="w-full bg-black text-white py-4 rounded-full font-semibold text-lg hover:bg-gray-800 transition-colors"
              >
                Okay
              </button>
            </div>
          </div>
        </template>

        <!-- P2P WORKFLOWS: Simple Payment Confirmation -->
        <template v-else>
          <payment-confirmation
            :isOpen="showPaymentConfirmation && !paymentConfirmed"
            :paymentConfirmed="paymentConfirmed"
            :isBusinessUser="isBusinessUser"
            :countdownSeconds="1800"
            :isProcessing="isProcessing"
            @confirm="confirmPayment"
            @close="showPaymentConfirmation = false"
          />
        </template>

        <!-- Loading indicator -->
        <div v-if="isProcessing" class="flex items-center justify-center py-4">
          <div class="animate-pulse text-gray-500">AI is typing...</div>
        </div>

        <!-- Countdown Timer -->
        <div
          v-if="isCountdownActive && !isBusinessUser && !businessJoined"
          class="flex items-center justify-center py-2"
        >
          <app-countdown-timer
            :duration="countdownTime"
            :customText="countdownText"
            customClass="!bg-orange-50 !border !border-orange-200 !text-orange-800 !py-2 !w-fit px-4"
            @expired="handleCountdownExpired"
          />
        </div>

        <!-- Delivery Complete Button (shown when business joins and delivery not completed) -->
        <div
          v-if="
            businessJoined &&
            workflowType === 'deliveries' &&
            !deliveryCompleted
          "
          class="w-full px-4 py-4"
        >
          <button
            @click="handleDeliveryComplete"
            class="w-full py-4 bg-white text-black rounded-full font-semibold text-lg hover:bg-green-600 transition-colors"
            style="
              background-color: #ffffff !important;
              color: green !important;
              border: 1px solid grey !important;
            "
          >
            Delivery Complete
          </button>
        </div>

        <div class="w-full h-[130px]" id="bottom-anchor"></div>
      </div>

      <!-- Bottom bar -->
      <chat-bottom-bar
        :conversation="conversationData"
        :send-message="sendMessage"
        :last-a-i-message="lastAIMessage"
        :is-processing="isProcessing"
        :authUser="Logic.Auth.AuthUser"
        :show-address-mode="false"
        :disabled="isProcessing"
        :order-confirmed="true"
        :proof-uploaded="proofUploaded"
        @click-address-input="() => {}"
        @upload-proof="showProofModal = true"
      />

      <!-- Address Input - Conditional based on workflow type -->
      <!-- For P2P workflows: Use original ChatAddressInput -->
      <chat-address-input
        v-if="activeModal === 'address' && workflowType !== 'deliveries'"
        :is-processing="isProcessing"
        :address-type="dynamicAddressType"
        @address-confirm="handleAddressSelection"
        @cancel="handleAddressCancel"
      />

      <!-- For Delivery workflows: Use new DeliveryAddressInput -->
      <delivery-address-input
        v-if="activeModal === 'address' && workflowType === 'deliveries'"
        :is-processing="isProcessing"
        :address-type="dynamicAddressType"
        @address-confirm="handleDeliveryAddressSelection"
        @cancel="handleAddressCancel"
      />

      <!-- Bank Transfer Modal -->
      <bank-transfer-modal
        v-if="activeModal === 'bank_transfer'"
        :show="true"
        :savedBankAccounts="savedBankAccounts"
        :isProcessing="isProcessing"
        @bank-details-submitted="handleBankDetailsSubmitted"
        @saved-account-selected="handleSavedAccountSelected"
        @cancel="handleBankTransferCancel"
      />

      <!-- Pickup Location Modal -->
      <pickup-location-modal
        v-if="activeModal === 'cash_pickup'"
        :isOpen="true"
        :savedLocations="businessStoreLocations"
        @confirm="handlePickupSelection"
        @close="handlePickupCancel"
      />

      <!-- Proof Upload Modal -->
      <proof-upload-modal
        :show="showProofModal"
        @cancel="handleProofCancel"
        @upload-success="handleProofUploadSuccess"
        @upload-error="handleProofUploadError"
      />
    </div>
  </app-wrapper>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  computed,
  onMounted,
  nextTick,
  watch,
  onUnmounted,
} from "vue";
import {
  useWorkflowEngine,
  WorkflowMessage,
} from "../../composable/useWorkflowEngine";
import { useWorkflowInput } from "../../composable/useWorkflowInput";
import { useWebSocket } from "../../composable/useWebSocket";
import { Logic } from "../../composable";
import {
  ChatTopBar,
  ChatBottomBar,
  ChatMessage,
  ChatAddressInput,
  DeliveryAddressInput,
  BankTransferModal,
  PaymentConfirmation,
  PickupLocationModal,
  ProofUploadModal,
} from "../AppChat";
import AppCountdownTimer from "../AppCountdownTimer";
import { Conversation } from "@greep/logic/src/gql/graphql";

export default defineComponent({
  name: "AppWorkflowChat",
  components: {
    ChatTopBar,
    ChatBottomBar,
    ChatMessage,
    ChatAddressInput,
    DeliveryAddressInput,
    BankTransferModal,
    PickupLocationModal,
    ProofUploadModal,
    PaymentConfirmation,
    AppCountdownTimer,
  },
  props: {
    conversationId: {
      type: Number,
      required: true,
    },
    workflowType: {
      type: String as () => "p2p_withdrawal" | "deliveries",
      required: true,
    },
    initialMessages: {
      type: Array,
      default: () => [],
    },
    conversation: {
      type: Object,
      default: () => null,
    },
  },
  setup(props) {
    // Workflow engine with business user support
    const workflowEngine = useWorkflowEngine({
      conversationId: props.conversationId,
      workflowType: props.workflowType,
      enableDirectMessaging: true,
    });

    const {
      messages,
      isProcessing,
      currentStage,
      activeModal: computedActiveModal,
      sendMessage: engineSendMessage,
      sendDirectMessage,
      sendWorkflowMessage,
      addMessage,
      handleIncomingMessage,
      initializeFromConversation,
      getLastAIMessage,
      isBusinessUser,
      businessJoined,
      businessName, // ✅ Add businessName for header display
      directMessagingEnabled,
      handleBusinessJoined,
      createP2POrder,
      createDeliveryOrder,
      manualModalOverride,
      countdownType,
      countdownTime,
      stopCountdown,
      showPaymentConfirmation,
      deliveryCompleted,
      currentOrderId,
      currentOrderUuid,
      updateDeliveryStatus,
      handleProofUploadComplete,
    } = workflowEngine;

    // New reactive variables for proof upload modal
    const showProofModal = ref(false);
    const proofUploaded = ref(false);

    // ✅ Reactive computed properties for delivery data extraction
    const deliveryData = computed(() => {
      const conversationData = Logic.Messaging.SingleConversation;
      if (!conversationData) return null;

      // First, try to get accumulated delivery data from conversation metadata
      let data: any = {};
      try {
        const metadata = conversationData.metadata
          ? typeof conversationData.metadata === "string"
            ? JSON.parse(conversationData.metadata)
            : conversationData.metadata
          : {};

        // Check if we have accumulated delivery order data
        if (metadata.deliveryOrderData) {
          data = metadata.deliveryOrderData;
          console.log(
            "✅ Using accumulated delivery data from metadata:",
            data
          );
          return data;
        }
      } catch (e) {
        console.warn("⚠️ Could not parse conversation metadata");
      }

      // Fallback: Try to get data from conversation extras
      try {
        const extras = (conversationData as any)?.extras;
        if (extras) {
          data = typeof extras === "string" ? JSON.parse(extras) : extras;
        }
      } catch (e) {
        console.warn("⚠️ Could not parse conversation extras");
      }

      // If no accumulated data, extract from messages as fallback
      if (!data || Object.keys(data).length === 0) {
        console.log(
          "⚠️ No accumulated data found, extracting from messages..."
        );

        const metadata = conversationData.metadata
          ? typeof conversationData.metadata === "string"
            ? JSON.parse(conversationData.metadata)
            : conversationData.metadata
          : {};
        const fallbackMetadata = conversationData.metadata
          ? typeof conversationData.metadata === "string"
            ? JSON.parse(conversationData.metadata)
            : conversationData.metadata
          : {};
        data = { ...data, ...fallbackMetadata };

        // Extract values from messages if not in metadata
        const userMessages = messages.filter((m: any) => m.isUser);
        const aiMessages = messages.filter((m: any) => !m.isUser);

        // Extract item description from first user message
        if (
          !data.itemDescription &&
          !data.item_description &&
          userMessages.length > 0
        ) {
          // Find the first meaningful user input (not just "now", "1", etc.)
          const meaningfulMessage = userMessages.find(
            (m: any) =>
              m.content &&
              m.content.length > 2 &&
              !["now", "yes", "no", "1", "2", "skip"].includes(
                m.content.toLowerCase()
              )
          );
          data.itemDescription =
            meaningfulMessage?.content || userMessages[0]?.content || "Package";
        }

        // Extract addresses from address input messages
        if (!data.pickupAddress || !data.pickup_address) {
          // Look for the first address-like message after pickup question
          let pickupIndex = -1;
          const pickupQuestionIndex = aiMessages.findIndex(
            (ai: any) =>
              ai.content?.toLowerCase().includes("pickup") &&
              ai.content?.toLowerCase().includes("address")
          );

          if (pickupQuestionIndex >= 0) {
            // Find the first user message after the pickup question
            const pickupMsg = userMessages.find((m: any) => {
              const aiQuestion = aiMessages[pickupQuestionIndex];
              return (
                aiQuestion &&
                m.timestamp > aiQuestion.timestamp &&
                m.content?.includes(",") &&
                m.content?.length > 5
              );
            });
            if (pickupMsg) {
              data.pickupAddress = pickupMsg.content;
              data.pickup_address = pickupMsg.content;
              pickupIndex = userMessages.indexOf(pickupMsg);
            }
          }
        }

        if (!data.deliveryAddress || !data.delivery_address) {
          // Look for the first address-like message after delivery question
          const deliveryQuestionIndex = aiMessages.findIndex(
            (ai: any) =>
              ai.content?.toLowerCase().includes("delivery") &&
              ai.content?.toLowerCase().includes("address")
          );

          if (deliveryQuestionIndex >= 0) {
            // Find the first user message after the delivery question
            const deliveryMsg = userMessages.find((m: any) => {
              const aiQuestion = aiMessages[deliveryQuestionIndex];
              return (
                aiQuestion &&
                m.timestamp > aiQuestion.timestamp &&
                m.content?.includes(",") &&
                m.content?.length > 5
              );
            });
            if (deliveryMsg) {
              data.deliveryAddress = deliveryMsg.content;
              data.delivery_address = deliveryMsg.content;
            }
          }
        }

        // Extract timing from timing-related messages
        if (!data.timing) {
          const timingMessage = userMessages.find((m: any) =>
            ["now", "instant", "today", "tomorrow", "later"].includes(
              m.content?.toLowerCase()
            )
          );
          if (timingMessage) {
            data.timing =
              timingMessage.content?.toLowerCase() === "now"
                ? "Instant"
                : "Scheduled";
            data.urgency =
              timingMessage.content?.toLowerCase() === "now"
                ? "IMMEDIATE"
                : "NORMAL";
          }
        }

        // Extract price from bill messages
        if (!data.price && !data.deliveryPrice) {
          const billMessage = aiMessages.find(
            (m: any) =>
              m.content?.includes("₦") &&
              (m.content?.toLowerCase().includes("bill") ||
                m.content?.toLowerCase().includes("accept"))
          );
          if (billMessage) {
            const priceMatch = billMessage.content.match(/₦(\d+)/);
            if (priceMatch) {
              data.price = parseInt(priceMatch[1]);
              data.deliveryPrice = parseInt(priceMatch[1]);
            }
          }
        }
      }

      // Extract values from messages if not in metadata
      const userMessages = messages.filter((m: any) => m.isUser);
      const aiMessages = messages.filter((m: any) => !m.isUser);

      // Extract item description from first user message
      if (
        !data.itemDescription &&
        !data.item_description &&
        userMessages.length > 0
      ) {
        // Find the first meaningful user input (not just "now", "1", etc.)
        const meaningfulMessage = userMessages.find(
          (m: any) =>
            m.content &&
            m.content.length > 2 &&
            !["now", "yes", "no", "1", "2", "skip"].includes(
              m.content.toLowerCase()
            )
        );
        data.itemDescription =
          meaningfulMessage?.content || userMessages[0]?.content || "Package";
      }

      // Extract addresses from address input messages
      if (!data.pickupAddress || !data.pickup_address) {
        // Look for the first address-like message after pickup question
        let pickupIndex = -1;
        const pickupQuestionIndex = aiMessages.findIndex(
          (ai: any) =>
            ai.content?.toLowerCase().includes("pickup") &&
            ai.content?.toLowerCase().includes("address")
        );

        if (pickupQuestionIndex >= 0) {
          // Find the first user message after the pickup question
          const pickupMsg = userMessages.find((m: any) => {
            const aiQuestion = aiMessages[pickupQuestionIndex];
            return (
              aiQuestion &&
              m.timestamp > aiQuestion.timestamp &&
              m.content?.includes(",") &&
              m.content?.length > 5
            );
          });
          if (pickupMsg) {
            data.pickupAddress = pickupMsg.content;
            data.pickup_address = pickupMsg.content;
            pickupIndex = userMessages.indexOf(pickupMsg);
          }
        }
      }

      if (!data.deliveryAddress || !data.delivery_address) {
        // Look for the first address-like message after delivery question
        const deliveryQuestionIndex = aiMessages.findIndex(
          (ai: any) =>
            ai.content?.toLowerCase().includes("delivery") &&
            ai.content?.toLowerCase().includes("address")
        );

        if (deliveryQuestionIndex >= 0) {
          // Find the first user message after the delivery question
          const deliveryMsg = userMessages.find((m: any) => {
            const aiQuestion = aiMessages[deliveryQuestionIndex];
            return (
              aiQuestion &&
              m.timestamp > aiQuestion.timestamp &&
              m.content?.includes(",") &&
              m.content?.length > 5
            );
          });
          if (deliveryMsg) {
            data.deliveryAddress = deliveryMsg.content;
            data.delivery_address = deliveryMsg.content;
          }
        }
      }

      // Extract timing from timing-related messages
      if (!data.timing) {
        const timingMessage = userMessages.find((m: any) =>
          ["now", "instant", "today", "tomorrow", "later"].includes(
            m.content?.toLowerCase()
          )
        );
        if (timingMessage) {
          data.timing =
            timingMessage.content?.toLowerCase() === "now"
              ? "Instant"
              : "Scheduled";
          data.urgency =
            timingMessage.content?.toLowerCase() === "now"
              ? "IMMEDIATE"
              : "NORMAL";
        }
      }

      // Extract price from bill messages
      if (!data.price && !data.deliveryPrice) {
        const billMessage = aiMessages.find(
          (m: any) =>
            m.content?.includes("₦") &&
            (m.content?.toLowerCase().includes("bill") ||
              m.content?.toLowerCase().includes("accept"))
        );
        if (billMessage) {
          const priceMatch = billMessage.content.match(/₦(\d+)/);
          if (priceMatch) {
            data.price = parseInt(priceMatch[1]);
            data.deliveryPrice = parseInt(priceMatch[1]);
          }
        }
      }

      console.log("🔍 Extracted delivery data:", data);
      return data;
    });

    // ✅ Reactive computed for delivery details with fallbacks
    const deliveryDetails = computed(() => {
      const data = deliveryData.value || {};

      return {
        itemDescription:
          data.itemDescription || data.item_description || "Package",
        pickupAddress:
          data.pickupAddress || data.pickup_address || "Pickup Location",
        deliveryAddress:
          data.deliveryAddress || data.delivery_address || "Delivery Location",
        deliveryPrice: data.price || data.deliveryPrice || 10,
        timing: data.timing || "Standard",
        urgency:
          data.urgency || (data.timing === "Instant" ? "IMMEDIATE" : "NORMAL"),
      };
    });

    // ✅ NEW: Use the input handling composable
    const workflowInput = useWorkflowInput(
      {
        workflowType: props.workflowType,
        conversationId: props.conversationId,
        conversation: props.conversation,
      },
      engineSendMessage,
      manualModalOverride
    );

    const {
      savedBankAccounts,
      businessStoreLocations,
      loadSavedBankAccounts,
      handleAddressSelection,
      handleAddressCancel,
      handleBankDetailsSubmitted,
      handleSavedAccountSelected,
      handleBankTransferCancel,
      handlePickupSelection,
      handlePickupCancel,
      handleUploadProof,
      handleProofUploadFiles,
      handleProofCancel,
    } = workflowInput;

    // Handle the new upload success event from the modal
    const handleProofUploadSuccess = async (uploadData: {
      fileUrl: string;
      fileName: string;
      fileType: string;
    }) => {
      console.log("📤 Proof upload successful:", uploadData);

      // Show success notification
      Logic.Common.showAlert({
        show: true,
        message: `Proof uploaded successfully: ${uploadData.fileName}`,
        type: "success",
      });

      // Include the file URL so ChatMessage can automatically detect and display the media
      const proofMessageForUser = `📸 Proof of payment uploaded: ${uploadData.fileName} - ${uploadData.fileUrl}`;

      try {
        await engineSendMessage(proofMessageForUser);

        console.log("✅ Proof message sent to user successfully");
      } catch (error) {
        console.error("❌ Failed to send proof message to user:", error);
        Logic.Common.showAlert({
          show: true,
          message:
            "Proof uploaded but failed to notify user. Please contact support.",
          type: "error",
        });
      }

      // Mark proof as uploaded to hide upload button and disable bottom box
      proofUploaded.value = true;

      // Mark proof as uploaded and trigger workflow continuation
      await handleProofUploadComplete([
        { name: uploadData.fileName, type: uploadData.fileType },
      ] as File[]);

      showProofModal.value = false;
      await scrollToBottom();
    };

    // ✅ Countdown visibility logic
    const isCountdownActive = computed(() => {
      return (
        countdownTime.value > 0 &&
        countdownType.value !== null &&
        !businessJoined.value
      );
    });

    // Mark proof as uploaded to hide upload button and disable bottom box
    proofUploaded.value = true;

    // ✅ Countdown text
    const countdownText = computed(() => {
      if (countdownType.value === "waiting_business") {
        return "Waiting for business to join";
      }
      return "Countdown";
    });

    // ✅ Payment confirmation state (from workflowEngine)
    const paymentConfirmed = ref(false);

    // ✅ 3-Modal payment flow state
    const showPaymentDetailsModal = ref(false);
    const showPaymentSuccessModal = ref(false);

    // ✅ Payment confirmation method - workflow-specific behavior
    const confirmPayment = async () => {
      try {
        console.log("💰 Payment confirmation clicked for:", props.workflowType);

        if (props.workflowType === "deliveries") {
          // For deliveries: Just acknowledge the Make Payment modal is shown
          console.log("✅ Delivery workflow - Make Payment modal is displayed");
        } else {
          // For P2P workflows: Process payment immediately (original behavior)
          console.log("💳 P2P workflow - processing payment directly");

          // Optimistic UI
          paymentConfirmed.value = true;
          showPaymentConfirmation.value = false;

          // Use handleActionClick to properly trigger workflow transition
          const action = {
            value: "confirm_payment",
            label: "Payment confirmed",
            content: "Payment confirmed",
          };

          const success = await handleActionClick(action);

          if (!success) {
            paymentConfirmed.value = false;
            showPaymentConfirmation.value = true;
            console.error("❌ Failed to send payment confirmation");
            return;
          }

          console.log("✅ P2P payment confirmation sent successfully");
        }
      } catch (error) {
        console.error("❌ Payment confirmation error:", error);
        if (props.workflowType !== "deliveries") {
          paymentConfirmed.value = false;
          showPaymentConfirmation.value = true;
        }
      }
    };

    // ✅ Handle continue from Make Payment modal to Payment Details modal
    const handleContinueToPayment = () => {
      console.log("▶️ Continue to Payment Details modal");
      showPaymentConfirmation.value = false;
      showPaymentDetailsModal.value = true;
    };

    // ✅ Handle final payment action (from Payment Details Modal)
    const handleFinalPayment = async () => {
      try {
        console.log("💳 Final payment processing...");
        console.log(
          "🔍 Using extracted delivery details:",
          deliveryDetails.value
        );

        // Close payment details modal
        showPaymentDetailsModal.value = false;

        // ✅ Use the extracted delivery details directly
        const result = await createDeliveryOrder();
        console.log("✅ Delivery order result:", result);

        if (result) {
          console.log("🎉 Delivery order created successfully!");
          showPaymentSuccessModal.value = true;

          // Store the created order data for the payment success handler
          (window as any).currentDeliveryOrder = result;

          console.log("✅ Payment processed successfully");
        } else {
          console.error("❌ Failed to create delivery order - result was null");
          Logic.Common.showAlert({
            show: true,
            type: "error",
            message: "Failed to process your delivery order. Please try again.",
            action: {
              text: "OK",
              handler: () => {
                Logic.Common.alertSetup.show = false;
              },
            },
          });
        }
      } catch (error) {
        console.error("❌ Final payment error:", error);

        Logic.Common.showAlert({
          show: true,
          type: "error",
          message:
            "An error occurred while processing your request. Please try again.",
          action: {
            text: "OK",
            handler: () => {
              Logic.Common.alertSetup.show = false;
            },
          },
        });

        // Reset modals on error
        showPaymentDetailsModal.value = false;
        showPaymentSuccessModal.value = false;
      }
    };

    // ✅ Handle payment success completion
    const handlePaymentSuccess = async (orderData?: any) => {
      try {
        console.log("🎉 Payment success acknowledged");

        // Close success modal
        showPaymentSuccessModal.value = false;

        // Mark payment as confirmed
        paymentConfirmed.value = true;
        showPaymentConfirmation.value = false;

        // ✅ The createDeliveryOrder function already handled:
        // - Adding order summary message
        // - Adding business waiting messages
        // - Starting countdown timer
        // - Setting up business partner coordination

        console.log(
          "✅ Payment success handling complete - workflow engine handled business coordination"
        );
      } catch (error) {
        console.error("❌ Payment success handling error:", error);
        showPaymentSuccessModal.value = false;
      }
    };

    // ✅ Handle countdown expiration
    const handleCountdownExpired = () => {
      console.log("⏰ Countdown expired for type:", countdownType.value);

      if (countdownType.value === "waiting_business") {
        const timeoutMessage = {
          id: `timeout_${Date.now()}`,
          type: "text" as const,
          content:
            "⚠️ Business join timeout reached. This transaction may be cancelled.",
          text_content:
            "⚠️ Business join timeout reached. This transaction may be cancelled.",
          user_uuid: "greep_ai",
          user_name: "GreepPay AI",
          isUser: false,
          timestamp: new Date(),
          info_icon: "",
          actions: [],
          orderSummary: null,
          isOrderSummary: false,
        };

        messages.push(timeoutMessage);
        scrollToBottom();
      }

      stopCountdown();
    };

    // WebSocket integration
    const {
      echoChannel,
      isConnected,
      setupWebSocketListeners,
      cleanup: cleanupWebSocket,
      getUserDisplayName,
    } = useWebSocket();

    // Setup WebSocket for real-time messaging and business user joining
    const setupChatWebSocket = () => {
      if (!props.conversation?.uuid) {
        console.log("❌ No conversation UUID available for WebSocket");
        return;
      }

      const conversationUuid = props.conversation.uuid;
      console.log(
        "🔧 Setting up WebSocket for conversation:",
        conversationUuid
      );

      setupWebSocketListeners(conversationUuid, {
        onUserJoining: (user) => {
          console.log("🔧 User joining detected:", user);

          const currentUserId = parseInt(Logic.Auth.AuthUser?.id || "0");
          console.log(
            "🔧 Current user ID:",
            currentUserId,
            "Joining user ID:",
            user.id || user.user_id
          );

          const isBusiness =
            user.user_type === "business" ||
            user.participant_type === "business" ||
            user.is_business === true ||
            (user.id && user.id !== currentUserId && user.id !== 0) ||
            (user.user_id &&
              user.user_id !== currentUserId &&
              user.user_id !== 0);

          console.log("🔧 Business detection result:", isBusiness, {
            user_type: user.user_type,
            participant_type: user.participant_type,
            is_business: user.is_business,
            different_user:
              user.id && user.id !== currentUserId && user.id !== 0,
            businessJoined: businessJoined.value,
          });

          if (isBusiness && !businessJoined.value) {
            console.log(
              "🎉 Business user detected! Calling handleBusinessJoined"
            );
            handleBusinessJoined(user);

            // ✅ CRITICAL: Refresh conversation data to update participants in header
            console.log(
              "🔧 Forcing conversation refresh after business joined..."
            );
            refreshConversationData();

            // Also schedule a delayed refresh to ensure it updates
            setTimeout(async () => {
              console.log("🔧 Executing delayed conversation refresh...");
              await refreshConversationData();
            }, 1000);
          } else if (businessJoined.value) {
            console.log("⚠️ Business already joined, skipping");
          } else {
            console.log("❌ Not a business user");
          }
        },
        onUserLeaving: (user) => {
          const displayName = getUserDisplayName(user);

          const leaveMessage = {
            id: `leave_${Date.now()}`,
            content: `${displayName} left the conversation`,
            isUser: false,
            timestamp: new Date(),
            sender: {
              uuid: "greep_ai",
              name: "Greep AI",
            },
            metadata: {
              type: "info" as const,
              extras: {
                info_icon: "user-minus",
                system_message: true,
              },
            },
          };
          addMessage(leaveMessage);
        },
        onMessageCreated: (data) => {
          console.log("📨 WorkflowChat received WebSocket message:", data);
          handleIncomingMessage(data);
        },
        onBusinessJoined: (data) => {
          console.log("🔧 Business joined handler called");
          console.log("🔧 Business joined data:", data);
          console.log("🔧 Current conversation:", props.conversation);
          console.log(
            "🔧 Current participant count:",
            props.conversation?.participant_count
          );

          console.log("🎉 Business joined - stopping countdown");
          stopCountdown();

          handleBusinessJoined(data);

          // Force immediate refresh + delayed refresh
          console.log("🔧 Forcing immediate conversation refresh...");
          refreshConversationData();

          console.log(
            "🔧 Scheduling additional conversation refresh in 2 seconds..."
          );
          setTimeout(async () => {
            console.log("🔧 Executing scheduled conversation refresh...");
            await refreshConversationData();
          }, 2000);
        },
      });
    };

    // Computed
    const activeModal = computed(() => {
      return manualModalOverride.value || computedActiveModal.value;
    });

    // Dynamic address type based on last AI message
    const dynamicAddressType = computed(() => {
      const lastAI = getLastAIMessage();
      if (!lastAI?.metadata?.extras) return "Delivery Address";

      const extras =
        typeof lastAI.metadata.extras === "string"
          ? JSON.parse(lastAI.metadata.extras)
          : lastAI.metadata.extras;

      // Check if it's a pickup address based on content or input name
      const content = lastAI.content?.toLowerCase() || "";
      const inputName = extras.input_name?.toLowerCase() || "";

      if (content.includes("pickup") || inputName.includes("pickup")) {
        return "Pickup Address";
      }

      return "Delivery Address";
    });

    // Watch for bank transfer modal activation to load saved accounts
    watch(activeModal, (newModal) => {
      if (newModal === "bank_transfer") {
        loadSavedBankAccounts();
      }
    });

    const lastAIMessage = computed(() => {
      const lastAI = getLastAIMessage();
      if (!lastAI) return undefined;

      return {
        ...lastAI,
        metadata:
          typeof lastAI.metadata === "object"
            ? JSON.stringify(lastAI.metadata)
            : lastAI.metadata,
      };
    });

    const conversationData = computed(() => {
      const fullConversation = Logic.Messaging?.SingleConversation;
      const baseConversation = props.conversation ||
        fullConversation || {
          id: props.conversationId,
          participants: [],
        };

      // ✅ Keep title as "Delivery Request" like P2P keeps "P2P Trade Chat"
      // Business name will show in participants list only
      return baseConversation;
    });

    const mobileFullHeight = computed(() => {
      return "height: 100vh;";
    });

    // Methods
    const refreshConversationData = async () => {
      try {
        console.log("🔄 Refreshing conversation data after business joined...");

        const conversationUuid =
          conversationData.value?.uuid || props.conversation?.uuid;
        if (!conversationUuid) {
          console.log("❌ No conversation UUID to refresh");
          return;
        }

        console.log(
          "🔧 Current participants before refresh:",
          conversationData.value?.participants
        );

        const updatedConversation = await Logic.Messaging.GetSingleConversation(
          conversationUuid
        );

        if (updatedConversation) {
          Logic.Messaging.SingleConversation = updatedConversation;
          console.log(
            "✅ Conversation data refreshed - participant names updated"
          );
          console.log(
            "🔧 New participants after refresh:",
            updatedConversation.participants
          );

          // Force reactivity update
          await nextTick();

          console.log("🔧 Topbar should now show updated participant names");
          console.log(
            "🔧 ConversationData computed value after refresh:",
            conversationData.value?.participants
          );
        } else {
          console.log("❌ No updated conversation data received");
        }
      } catch (error) {
        console.error("❌ Error refreshing conversation:", error);
      }
    };

    const sendMessage = async (content: string, metadata?: any) => {
      const success = await engineSendMessage(content, metadata);
      if (success) {
        await scrollToBottom();
      }
      return success;
    };

    // Handle upload error
    const handleProofUploadError = (error: any) => {
      console.error("❌ Proof upload failed:", error);
      Logic.Common.showAlert({
        show: true,
        message: "Failed to upload proof. Please try again.",
        type: "error",
      });
    };

    const handleBackClick = () => {
      window.history.back();
    };

    const handleActionClick = async (action: any) => {
      try {
        console.log("🔧 Action clicked:", action.value, action.label);

        // ✅ Handle special local actions that don't need backend workflow
        if (action.value === "details") {
          console.log("📋 Handling Details action locally");
          await handleViewDeliveryDetails();
          return true;
        } else if (action.value === "receipt") {
          console.log("🧾 Handling Receipt action locally");
          await handleViewReceipt();
          return true;
        }

        // ✅ For all other actions, send to backend workflow
        const success = await sendWorkflowMessage(action.label, {
          selected_option: action.value,
        });
        if (success) {
          await scrollToBottom();
        }
        return success;
      } catch (error) {
        console.error("❌ Error in handleActionClick:", error);
        return false;
      }
    };

    // ✅ NEW: Delivery Address Handler for DeliveryAddressInput component
    const handleDeliveryAddressSelection = async (
      addressData: any
    ): Promise<boolean> => {
      try {
        console.log("🚚 Delivery address selection:", addressData);

        // Extract the address data from the new component format
        const { area, mapsLink, details, fullAddress } = addressData;

        // Determine if this is pickup or delivery address
        const addressType = getAddressType();

        // Create enhanced metadata for delivery addresses
        const metadata: any = {
          selected_option: "string",
          address_type: addressType,
          area: area,
          google_maps_link: mapsLink || null,
          address_details: details || null,
        };

        // Set the correct field based on address type
        if (addressType === "pickup") {
          metadata.pickup_address = fullAddress;
          metadata.pickup_area = area;
          metadata.pickup_maps_link = mapsLink;
          metadata.pickup_details = details;
        } else {
          metadata.delivery_address = fullAddress;
          metadata.delivery_area = area;
          metadata.delivery_maps_link = mapsLink;
          metadata.delivery_details = details;
        }

        // Store area information for later cost calculation
        try {
          const conversationData = Logic.Messaging.SingleConversation;
          if (conversationData) {
            const currentMetadata = conversationData.metadata
              ? typeof conversationData.metadata === "string"
                ? JSON.parse(conversationData.metadata)
                : conversationData.metadata
              : {};

            // Update the stored areas
            if (addressType === "pickup") {
              currentMetadata.pickup_area_key = area;
            } else {
              currentMetadata.delivery_area_key = area;
            }

            // Update conversation metadata
            conversationData.metadata = JSON.stringify(currentMetadata);
            console.log(
              "🔧 Updated conversation metadata with area:",
              currentMetadata
            );
          }
        } catch (error) {
          console.error("❌ Error updating conversation metadata:", error);
        }

        console.log("🚚 Sending delivery address with metadata:", metadata);

        // Send the formatted address to the workflow
        const success = await sendMessage(fullAddress, metadata);

        if (success) {
          manualModalOverride.value = null;
        }
        return success;
      } catch (error) {
        console.error("❌ Error handling delivery address selection:", error);
        return false;
      }
    };

    // Helper function to determine address type (copied from useWorkflowInput)
    const getAddressType = () => {
      try {
        // Try to get the current conversation and last AI message
        const conversation = Logic.Messaging.SingleConversation;
        if (!conversation?.messages) return "delivery";

        const lastAIMessage = conversation.messages
          .slice()
          .reverse()
          .find(
            (msg: any) => msg.user_id === 0 || msg.user_uuid === "greep_ai"
          );

        if (!lastAIMessage?.metadata) return "delivery";

        // Handle metadata that might be a string or object
        let metadata = lastAIMessage.metadata;
        if (typeof metadata === "string") {
          try {
            metadata = JSON.parse(metadata);
          } catch {
            return "delivery";
          }
        }

        const extras = (metadata as any)?.extras;
        if (!extras) return "delivery";

        // Handle extras that might be a string or object
        let extrasObj = extras;
        if (typeof extras === "string") {
          try {
            extrasObj = JSON.parse(extras);
          } catch {
            return "delivery";
          }
        }

        // Check if it's a pickup address based on content or input name
        const content = lastAIMessage.content?.toLowerCase() || "";
        const inputName = extrasObj?.input_name?.toLowerCase() || "";

        if (content.includes("pickup") || inputName.includes("pickup")) {
          return "pickup";
        }

        return "delivery";
      } catch (error) {
        console.error("Error determining address type:", error);
        return "delivery";
      }
    };

    // Business action handlers
    const handleCompleteOrder = async () => {
      try {
        const success = await sendDirectMessage(
          "Order has been completed successfully. Payment has been processed."
        );
        if (success) {
          await sendDirectMessage(
            "✅ **ORDER COMPLETED** - Transaction finalized by business partner"
          );
          await scrollToBottom();
        }
      } catch (error) {
        console.error("❌ Error completing order:", error);
      }
    };

    const handleDeliveryComplete = async () => {
      try {
        // Show confirmation dialog before completing delivery
        const confirmationMessage = {
          id: `delivery_confirmation_${Date.now()}`,
          content: "Are you sure that the delivery has been made?",
          text_content: "Are you sure that the delivery has been made?",
          user_uuid: "greep_ai",
          user_name: "Greep AI",
          type: "text" as const,
          info_icon: "",
          isUser: false,
          timestamp: new Date(),
          metadata: {
            type: "options",
            options: [
              {
                value: "no",
                content: "No",
                type: "danger",
                message: "No",
              },
              {
                value: "yes",
                content: "Yes",
                type: "success",
                message: "Yes",
              },
            ],
          },
          actions: [
            {
              label: "No",
              value: "no",
              type: "danger" as const,
              message: "No",
              disabled: false,
              handler: () => {
                console.log("❌ Delivery completion cancelled");
                // No action needed, just cancel
              },
            },
            {
              label: "Yes",
              value: "yes",
              type: "success" as const,
              message: "Yes",
              disabled: false,
              handler: async () => {
                console.log("✅ Delivery completion confirmed");
                await confirmDeliveryCompletion();
              },
            },
          ],
          sender: { uuid: "greep_ai", name: "Greep AI" },
        };

        addMessage(confirmationMessage);
        await scrollToBottom();
      } catch (error) {
        console.error("❌ Error showing delivery confirmation:", error);
      }
    };

    const showMessageAction = (message: WorkflowMessage) => {
      const isAIMessage = message.sender?.uuid == "user";

      if (!isAIMessage) {
        return false;
      }

      let isLastAIMessage = false;

      const allAIMessages = messages?.filter(
        (item) => item.sender?.uuid == "user"
      );

      const lastAIMessage = allAIMessages[allAIMessages.length - 1];

      if (message.id == lastAIMessage?.id) {
        isLastAIMessage = true;
      }

      if (isLastAIMessage) {
        const indexOfAIMessage = messages?.indexOf(lastAIMessage);

        const previousNonAIMessages = messages?.filter(
          (item, index) =>
            index < indexOfAIMessage && item.sender?.uuid != "user"
        );

        if (previousNonAIMessages.length) {
          const latestNonAIMessage =
            previousNonAIMessages[previousNonAIMessages.length - 1];

          // Only show action if the last human message is from the current user
          return latestNonAIMessage?.sender?.uuid == Logic.Auth.AuthUser?.uuid;
        }
      }

      return isLastAIMessage;
    };

    const confirmDeliveryCompletion = async () => {
      try {
        console.log(
          "✅ Confirming delivery completion - sending to backend workflow"
        );

        // Get the current order/delivery ID from workflow engine first, then conversation metadata
        let deliveryId = null;

        // ✅ PRIORITY 1: Use currentOrderId from workflow engine (this should be the actual delivery order ID)
        if (currentOrderId.value) {
          deliveryId = currentOrderId.value;
          console.log(
            "🎯 Using currentOrderId from workflow engine:",
            deliveryId
          );
        } else {
          // ✅ PRIORITY 2: Get delivery ID from conversation metadata
          const conversationData: Conversation =
            Logic.Messaging.SingleConversation;
          deliveryId = props.conversationId.toString(); // Use conversation ID as fallback

          try {
            const metadata = conversationData?.metadata
              ? typeof conversationData.metadata === "string"
                ? JSON.parse(conversationData.metadata)
                : conversationData.metadata
              : {};

            // Check for actual delivery order ID first (this is the correct field)
            if (metadata.delivery_order_id) {
              deliveryId = metadata.delivery_order_id.toString();
              console.log(
                "🎯 Using delivery_order_id from metadata:",
                deliveryId
              );
            } else if (metadata.delivery_order_uuid) {
              deliveryId = metadata.delivery_order_uuid;
              console.log(
                "🎯 Using delivery_order_uuid from metadata:",
                deliveryId
              );
            } else if (metadata.delivery_uuid) {
              deliveryId = metadata.delivery_uuid;
              console.log("🎯 Using delivery_uuid from metadata:", deliveryId);
            } else if (metadata.order_uuid) {
              deliveryId = metadata.order_uuid;
              console.log("🎯 Using order_uuid from metadata:", deliveryId);
            } else {
              console.warn(
                "⚠️ No delivery order ID found in metadata, using conversation ID as fallback"
              );
            }
          } catch (e) {
            console.warn(
              "⚠️ Could not parse conversation metadata for delivery ID:",
              e
            );
          }
        }

        console.log(
          "🔧 Using delivery ID:",
          deliveryId,
          "(type:",
          typeof deliveryId,
          ")"
        );

        // ✅ CRITICAL: Use sendWorkflowMessage to trigger backend workflow step transition
        // This will trigger the delivery_confirmation workflow step with "yes" option
        const success = await sendWorkflowMessage("Yes", {
          selected_option: "yes",
          workflow_action: "delivery_complete_confirmation",
        });

        if (success) {
          console.log("✅ Backend workflow triggered successfully");
          const updateSuccess = await updateDeliveryStatus(
            deliveryId,
            "delivered"
          );

          if (updateSuccess) {
            console.log("✅ Delivery status updated successfully");
          } else {
            console.error("❌ Failed to update delivery status");
          }

          await scrollToBottom();
        } else {
          console.error("❌ Failed to trigger backend workflow");
        }
      } catch (error) {
        console.error("❌ Error confirming delivery completion:", error);
      }
    };

    const handleSendReceipt = async () => {
      try {
        const orderSummary = workflowEngine.extractOrderSummary();

        let receiptContent = "📄 **TRANSACTION RECEIPT**\n\n";
        receiptContent += `🆔 Order ID: ${props.conversationId}\n`;
        receiptContent += `📅 Date: ${new Date().toLocaleDateString()}\n`;

        const summary = orderSummary as any;
        if (summary?.amount) {
          receiptContent += `💰 Amount: ₦${summary.amount}\n`;
        }

        if (summary?.method) {
          const methodName = summary.method
            .replace("_", " ")
            .replace(/\b\w/g, (l: string) => l.toUpperCase());
          receiptContent += `🏦 Method: ${methodName}\n`;
        }

        receiptContent += `✅ Status: Completed\n`;
        receiptContent += `🏪 Processed by: Business Partner\n\n`;
        receiptContent += `Thank you for using Greep! 🙏`;

        const success = await sendDirectMessage(receiptContent);
        if (success) {
          await scrollToBottom();
        }
      } catch (error) {
        console.error("❌ Error sending receipt:", error);
      }
    };

    const handleViewDeliveryDetails = async () => {
      try {
        const data = deliveryData.value || {};

        let detailsContent = "📋 **DELIVERY DETAILS**\n\n";
        detailsContent += `🆔 Order ID: ${props.conversationId}\n`;
        detailsContent += `📅 Date: ${new Date().toLocaleDateString()}\n`;

        if (data.itemDescription || data.item_description) {
          detailsContent += `📦 Item: ${
            data.itemDescription || data.item_description
          }\n`;
        }

        if (data.pickupAddress || data.pickup_address) {
          detailsContent += `📍 Pickup: ${
            data.pickupAddress || data.pickup_address
          }\n`;
        }

        if (data.deliveryAddress || data.delivery_address) {
          detailsContent += `🏠 Delivery: ${
            data.deliveryAddress || data.delivery_address
          }\n`;
        }

        if (data.timing) {
          detailsContent += `⏰ Timing: ${data.timing}\n`;
        }

        if (data.price || data.deliveryPrice) {
          detailsContent += `💰 Price: ₦${data.price || data.deliveryPrice}\n`;
        }

        if (data.deliveryNote || data.note) {
          detailsContent += `📝 Note: ${data.deliveryNote || data.note}\n`;
        }

        detailsContent += `✅ Status: Delivered Successfully\n`;
        detailsContent += `🚚 Delivered by: Business Partner`;

        const success = await sendDirectMessage(detailsContent);
        if (success) {
          await scrollToBottom();
        }
      } catch (error) {
        console.error("❌ Error showing delivery details:", error);
      }
    };

    const handleViewReceipt = async () => {
      try {
        const data = deliveryData.value || {};

        let receiptContent = "🧾 **DELIVERY RECEIPT**\n\n";
        receiptContent += `🆔 Order ID: ${props.conversationId}\n`;
        receiptContent += `📅 Date: ${new Date().toLocaleDateString()}\n`;
        receiptContent += `🕐 Time: ${new Date().toLocaleTimeString()}\n\n`;

        receiptContent += `📦 Service: Delivery Service\n`;

        if (data.itemDescription || data.item_description) {
          receiptContent += `📋 Item: ${
            data.itemDescription || data.item_description
          }\n`;
        }

        if (data.price || data.deliveryPrice) {
          receiptContent += `💰 Delivery Fee: ₦${
            data.price || data.deliveryPrice
          }\n`;
        }

        receiptContent += `💳 Payment Status: Completed\n`;
        receiptContent += `✅ Delivery Status: Successfully Delivered\n\n`;
        receiptContent += `🏪 Service Provider: GreepPay Business Partner\n`;
        receiptContent += `📞 Support: Contact customer service for any issues\n\n`;
        receiptContent += `Thank you for using Greep Delivery Services! 🙏`;

        const success = await sendDirectMessage(receiptContent);
        if (success) {
          await scrollToBottom();
        }
      } catch (error) {
        console.error("❌ Error showing receipt:", error);
      }
    };

    const scrollToBottom = async () => {
      await nextTick();
      const bottomAnchor = document.getElementById("bottom-anchor");
      if (bottomAnchor) {
        bottomAnchor.scrollIntoView({ behavior: "smooth" });
      }
    };

    // Initialize
    onMounted(async () => {
      console.log("🚀 WorkflowChat mounted");
      console.log("🔍 Initial state:", {
        isBusinessUser: isBusinessUser.value,
        showPaymentConfirmation: showPaymentConfirmation.value,
        paymentConfirmed: paymentConfirmed.value,
        workflowType: props.workflowType,
      });

      if (props.initialMessages?.length) {
        props.initialMessages.forEach((msg) => addMessage(msg));
      }

      await initializeFromConversation(props.conversation);
      setupChatWebSocket();
      await scrollToBottom();
    });

    // Cleanup
    onUnmounted(() => {
      console.log("👋 WorkflowChat unmounting - cleaning up WebSocket...");
      cleanupWebSocket();
    });

    // Auto-scroll when new messages arrive
    watch(
      messages,
      async () => {
        await scrollToBottom();
      },
      { deep: true }
    );

    // ✅ Watch for businessJoined changes
    watch(businessJoined, (newValue, oldValue) => {
      console.log("🔔 businessJoined changed:", {
        from: oldValue,
        to: newValue,
        workflowType: props.workflowType,
        shouldShowButton: newValue && props.workflowType === "deliveries",
      });
    });

    // ✅ Watch for proof upload messages to trigger payment confirmation
    watch(
      messages,
      (newMessages) => {
        console.log(
          "👀 Message watcher triggered, total messages:",
          newMessages.length
        );
        console.log("🔍 Current states:", {
          isBusinessUser: isBusinessUser.value,
          paymentConfirmed: paymentConfirmed.value,
          showPaymentConfirmation: showPaymentConfirmation.value,
        });

        // Only check for user-side and when not already confirmed
        if (
          isBusinessUser.value ||
          paymentConfirmed.value ||
          showPaymentConfirmation.value
        ) {
          console.log(
            "❌ Early return - conditions not met for payment confirmation"
          );
          return;
        }

        // Check the last few messages for proof upload
        const recentMessages = newMessages.slice(-5);

        const hasProofUpload = recentMessages.some((msg) => {
          const content = (msg.content || msg.text_content || "").toLowerCase();
          const metadata = msg.metadata || {};

          // More comprehensive proof detection patterns
          const proofPatterns = [
            "proof uploaded",
            "proof upload",
            "uploaded proof",
            "payment proof",
            "proof of payment",
            "📸",
            "📷",
            "📄",
            "proof",
            "uploaded",
            "receipt",
            "screenshot",
            "evidence",
          ];

          const hasProof = proofPatterns.some((pattern) =>
            content.includes(pattern)
          );

          // Also check metadata for file uploads (safe type checking)
          const hasFileMetadata =
            metadata &&
            ((metadata as any).file_type ||
              (metadata as any).attachment_type ||
              (metadata as any).type === "file" ||
              (metadata as any).type === "image");

          return hasProof || hasFileMetadata;
        });

        if (hasProofUpload) {
          console.log(
            "🔔 Proof upload detected - showing payment confirmation"
          );
          showPaymentConfirmation.value = true;

          // Also add a slight delay to ensure UI updates
          setTimeout(() => {
            console.log(
              "⏰ Delayed check - showPaymentConfirmation:",
              showPaymentConfirmation.value
            );
          }, 100);
        }
      },
      { deep: true }
    );

    return {
      messages,
      isProcessing,
      activeModal,
      dynamicAddressType,
      lastAIMessage,
      conversationData,
      mobileFullHeight,
      manualModalOverride,
      businessStoreLocations,
      savedBankAccounts,
      loadSavedBankAccounts,
      isBusinessUser,
      businessJoined,
      directMessagingEnabled,
      isConnected,
      echoChannel,
      workflowType: props.workflowType,
      deliveryData,
      deliveryDetails,
      sendMessage,
      handleBackClick,
      handleActionClick,
      handleAddressSelection,
      handleDeliveryAddressSelection,
      handleAddressCancel,
      handleBankDetailsSubmitted,
      handleSavedAccountSelected,
      handleBankTransferCancel,
      handlePickupSelection,
      handlePickupCancel,
      handleCompleteOrder,
      handleDeliveryComplete,
      handleSendReceipt,
      handleViewDeliveryDetails,
      handleViewReceipt,
      handleUploadProof,
      handleProofUploadFiles,
      handleProofCancel,
      showProofModal,
      setupChatWebSocket,
      countdownType,
      countdownTime,
      isCountdownActive,
      countdownText,
      handleCountdownExpired,
      showPaymentConfirmation,
      paymentConfirmed,
      confirmPayment,
      deliveryCompleted,
      handleContinueToPayment,
      showPaymentDetailsModal,
      showPaymentSuccessModal,
      handleFinalPayment,
      handlePaymentSuccess,
      Logic,
      showMessageAction,
      handleProofUploadSuccess,
      handleProofUploadError,
      proofUploaded,
    };
  },
});
</script>

<style scoped>
/* Use existing styles from original chat component */
</style>
