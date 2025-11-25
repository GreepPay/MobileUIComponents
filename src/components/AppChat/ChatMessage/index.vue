<template>
  <div
    :class="`w-full flex flex-row ${
      isUserMessage ? 'justify-end' : 'justify-start'
    }  ${message?.type == 'info' ? 'justify-center !items-center' : ''}`"
  >
    <!-- For Info Message Type -->
    <template v-if="message?.type == 'info'">
      <div class="w-full flex flex-row justify-center items-center">
        <div class="w-[24px] mr-1">
          <app-icon :name="message.info_icon" class="h-[24px]" />
        </div>
        <app-normal-text
          class="!text-[#999999]"
          is-html
          :html-content="message.text_content"
        >
        </app-normal-text>
      </div>
    </template>

    <!-- For Text Message Type -->
    <template v-if="message?.type == 'text'">
      <div class="min-w-[100px] max-w-[90%] flex flex-col">
        <!-- Message box -->
        <div
          :class="`w-full flex flex-col rounded-[12px] px-3 py-3 ${
            !isUserMessage
              ? 'bg-light-gray-one !rounded-tl-none'
              : '!bg-[linear-gradient(269.64deg,_#0D965E_0.31%,_#00683F_89.75%)]  !rounded-br-none'
          }`"
        >
          <app-normal-text
            :class="`!text-left !font-semibold pb-1 ${
              message.user_uuid == 'greep_ai' || message.user_uuid == 'user'
                ? '!text-primary'
                : ''
            }`"
            v-if="!isUserMessage"
          >
            {{
              message.user_name?.toLowerCase() == "user"
                ? "GreepPay AI"
                : message.user_name
            }}
          </app-normal-text>

          <!-- ORDER SUMMARY DISPLAY -->
          <div
            v-if="message.isOrderSummary && message.orderSummary"
            class="flex flex-col w-full"
          >
            <!-- Delivery-specific summary -->
            <template v-if="message.orderSummary.itemDescription">
              <!-- Delivery order header -->
              <div class="w-full flex flex-row items-center mb-4">
                <div class="w-[24px] h-[24px] mr-2">
                  <span class="text-lg">📦</span>
                </div>
                <app-normal-text
                  class="!text-base !font-semibold !text-[#333333]"
                >
                  Delivery Order Summary
                </app-normal-text>
              </div>

              <!-- Delivery details -->
              <div class="order-summary-details">
                <!-- Item -->
                <div
                  class="w-full flex flex-row justify-between items-center mb-2"
                >
                  <app-normal-text class="!text-[#666666]"
                    >• Item</app-normal-text
                  >
                  <app-normal-text class="!font-semibold">{{
                    message.orderSummary.itemDescription
                  }}</app-normal-text>
                </div>

                <!-- Weight -->
                <div
                  class="w-full flex flex-row justify-between items-center mb-2"
                  v-if="message.orderSummary.weight"
                >
                  <app-normal-text class="!text-[#666666]"
                    >• Weight</app-normal-text
                  >
                  <app-normal-text class="!font-semibold">{{
                    message.orderSummary.weight
                  }}</app-normal-text>
                </div>

                <!-- Delivery cost -->
                <div
                  class="w-full flex flex-row justify-between items-center mb-2"
                >
                  <app-normal-text class="!text-[#666666]"
                    >• Delivery cost</app-normal-text
                  >
                  <app-normal-text class="!font-semibold !text-green-600">{{
                    message.orderSummary.deliveryFee
                  }}</app-normal-text>
                </div>

                <!-- Payment method -->
                <div
                  class="w-full flex flex-row justify-between items-center mb-2"
                >
                  <app-normal-text class="!text-[#666666]"
                    >• Payment method</app-normal-text
                  >
                  <app-normal-text class="!font-semibold">{{
                    message.orderSummary.paymentType
                  }}</app-normal-text>
                </div>

                <!-- Tracking number -->
                <div
                  class="w-full flex flex-row justify-between items-center mb-2"
                  v-if="message.orderSummary.trackingNumber"
                >
                  <app-normal-text class="!text-[#666666]"
                    >• Tracking number</app-normal-text
                  >
                  <app-normal-text class="!font-semibold !text-blue-600">{{
                    message.orderSummary.trackingNumber
                  }}</app-normal-text>
                </div>

                <!-- Order ID -->
                <div
                  class="w-full flex flex-row justify-between items-center mb-2"
                  v-if="message.orderSummary.orderId"
                >
                  <app-normal-text class="!text-[#666666]"
                    >• Order ID</app-normal-text
                  >
                  <app-normal-text class="!font-semibold">{{
                    message.orderSummary.orderId
                  }}</app-normal-text>
                </div>

                <!-- Status -->
                <div
                  class="w-full flex flex-row justify-between items-center pt-3 mt-3 order-summary-total"
                  v-if="message.orderSummary.status"
                >
                  <app-normal-text class="!text-[#333333] !font-medium"
                    >• Status</app-normal-text
                  >
                  <app-normal-text
                    class="!font-bold !text-lg !text-orange-600"
                    >{{ message.orderSummary.status }}</app-normal-text
                  >
                </div>

                <!-- Pickup and delivery addresses -->
                <div class="w-full flex flex-col mt-3">
                  <app-normal-text class="!text-[#666666] mb-2"
                    >• Delivery route</app-normal-text
                  >
                  <div class="order-summary-address">
                    <app-normal-text class="!text-[#333333] !font-medium">{{
                      message.orderSummary.deliveryAddress
                    }}</app-normal-text>
                  </div>
                </div>
              </div>
            </template>

            <!-- P2P trading summary (existing) -->
            <template v-else>
              <!-- Delivery fee notice -->
              <app-normal-text class="pt-1">
                Confirm your order details to move forward with the trade;
              </app-normal-text>

              <ul class="pl-6 pt-2 space-y-1 pb-2">
                <li class="list-disc">
                  You sell
                  <span class="font-semibold">{{
                    message.orderSummary.youSell
                  }}</span>
                </li>
                <li class="list-disc">
                  You get
                  <span class="font-semibold">{{
                    message.orderSummary.youGet
                  }}</span>
                </li>
                <li class="list-disc">
                  Transaction fee is
                  <span class="font-semibold">{{
                    message.orderSummary.fee
                  }}</span>
                </li>
                <li class="list-disc">
                  You pay
                  <span class="font-semibold">{{
                    message.orderSummary.youPay
                  }}</span>
                  in total
                </li>
                <li class="list-disc">
                  Payment type is
                  <span class="font-semibold">{{
                    message.orderSummary.paymentType
                  }}</span>
                </li>
                <li class="list-disc" v-if="message.orderSummary.payoutOption">
                  Payout Option is
                  <span class="font-semibold">{{
                    message.orderSummary.payoutOption
                  }}</span>
                </li>

                <template v-if="message.orderSummary.payoutOption">
                  <li
                    class="list-disc"
                    v-if="message.orderSummary.payoutOption != 'Bank Transfer'"
                  >
                    {{
                      message.orderSummary.payoutOption === "Pickup"
                        ? "Pickup location - "
                        : "We deliver cash to you at - "
                    }}
                    <span
                      class="font-semibold"
                      v-html="message.orderSummary.deliveryAddress"
                    ></span>
                  </li>
                </template>
              </ul>
            </template>
          </div>

          <!-- REGULAR MESSAGE CONTENT (when not order summary) -->
          <template
            v-else-if="
              message.text_content &&
              !message.text_content.includes('{order_summary_text}') &&
              !message.text_content.includes('{payment_method_summary}') &&
              !message.text_content.includes('{delivery_order_summary}') &&
              !clickableImageUrl &&
              !derivedPdfUrl
            "
          >
            <app-normal-text
              is-html
              :html-content="
                capitalize(message.text_content?.replaceAll('_', ' '))
              "
              :class="`prose prose-sm !text-xs !leading-relaxed ${
                isUserMessage ? '!text-white' : ''
              }`"
            >
            </app-normal-text>
          </template>

          <template
            v-else-if="
              message.text_content.includes('{payment_method_summary}')
            "
          >
            <app-normal-text :class="`${isUserMessage ? '!text-white' : ''}`">
              Hello, please complete the payment using the details below:
            </app-normal-text>

            <div class="w-full flex flex-col mt-2">
              <div
                v-for="(value, key) in getPaymentMethodMetadata(message)"
                :key="key"
                class="w-full flex flex-row mb-3 justify-between items-center"
              >
                <div class="text-left">
                  <app-normal-text
                    :class="`${isUserMessage ? '!text-white' : ''}`"
                  >
                    {{ value.title }}:
                    <span class="font-semibold capitalize">{{
                      value.content
                    }}</span>
                  </app-normal-text>
                </div>
                <div class="text-right">
                  <app-icon
                    v-if="value.can_copy"
                    :name="`${isUserMessage ? 'copy-white' : 'copy'}`"
                    custom-class="h-[16px] cursor-pointer"
                    @click="Logic.Common.copytext(value.content)"
                  />
                </div>
              </div>
            </div>
          </template>

          <!-- Delivery Order Summary -->
          <template
            v-else-if="
              message.text_content.includes('{delivery_order_summary}')
            "
          >
            <app-normal-text :class="`${isUserMessage ? '!text-white' : ''}`">
              Hello, here are the details of your delivery order:
            </app-normal-text>

            <div class="w-full flex flex-col mt-2">
              <div
                v-for="(value, key) in getOrderSummaryMetadata(message)"
                :key="key"
                class="w-full flex flex-col space-y-[2px] mb-3"
              >
                <div class="text-left">
                  <app-normal-text
                    :class="` !font-semibold ${
                      isUserMessage ? '!text-white' : ''
                    }`"
                  >
                    {{ value.title }}:
                  </app-normal-text>
                </div>

                <div class="w-full flex flex-row justify-between items-center">
                  <app-normal-text
                    class="capitalize"
                    :class="`${isUserMessage ? '!text-white' : ''}`"
                    is-html
                    :html-content="value.content"
                  ></app-normal-text>
                  <app-icon
                    v-if="value.can_copy"
                    :name="`${isUserMessage ? 'copy-white' : 'copy'}`"
                    custom-class="h-[16px] cursor-pointer"
                    @click="Logic.Common.copytext(value.content)"
                  />
                </div>
              </div>
            </div>
          </template>
          <!-- Media: show image clickable; opens original file in a new tab -->
          <template v-if="clickableImageUrl">
            <app-image-loader
              :photo-url="clickableImageUrl"
              class="h-[250px] w-[250px] rounded-[12px] mt-2 cursor-pointer"
              can-show-full-image
            />
          </template>

          <!-- PDF: render a neat clickable chip with filename -->
          <template v-else-if="derivedPdfUrl">
            <a
              :href="derivedPdfUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="pdf-chip mt-2 inline-flex items-center"
            >
              <span class="mr-2">📄</span>
              <span class="truncate max-w-[220px]">{{ pdfFileName }}</span>
            </a>
          </template>
        </div>

        <!-- Actions -->
        <div
          class="w-full flex flex-row flex-wrap gap-2 mt-3"
          v-if="message.actions && showActions"
        >
          <template v-for="(item, index) in message.actions" :key="index">
            <app-button
              @click="item.handler"
              :custom-class="`!px-5 !py-2 !border-[2px] rounded-full ${getActionClass(
                item.type
              )}`"
              variant="primary"
              outlined
              :ignoreButtonClass="true"
            >
              {{ item.label }}
            </app-button>
          </template>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, capitalize, onMounted } from "vue";
import AppNormalText from "../../AppTypography/normalText.vue";
import AppIcon from "../../AppIcon/index.vue";
import AppImageLoader from "../../AppImageLoader/index.vue";
import AppButton from "../../AppButton/index.vue";
import { get } from "lodash";
import { Logic } from "../../../composable";

export default defineComponent({
  name: "ChatMessage",
  components: {
    AppNormalText,
    AppIcon,
    AppImageLoader,
    AppButton,
  },
  props: {
    message: {
      type: Object,
      required: true,
    },
    showActions: {
      type: Boolean,
      default: true,
    },
    conversation: {
      type: Object,
      default: () => ({}),
    },
    authUser: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props) {
    const isUserMessage = computed(() => {
      return props.authUser?.uuid == props.message?.user_uuid;
    });

    const getActionClass = (type: string) => {
      switch (type) {
        case "success":
          return "!border-[#00683F] !text-[#00683F] ";
        case "info":
          return "!border-blue !text-blue ";
        case "danger":
          return "!border-red !text-red-500 ";
        case "warning":
          return "!border-orange !text-orange-500 ";
        case "primary":
          return "!border-purple !text-purple-500";
      }
    };

    const getPaymentMethodMetadata = (message: any) => {
      const textContent: string = (
        message?.text_content ||
        message?.content ||
        ""
      ).toString();

      if (!textContent.includes("{payment_method_summary}")) return null;

      const metadata = message.metadata || {};

      const paymentMethodData = metadata.merchant_payment_method || null;

      if (paymentMethodData) {
        if (typeof paymentMethodData.meta_data === "string") {
          paymentMethodData.meta_data = JSON.parse(
            JSON.parse(paymentMethodData.meta_data)
          );
        }
      }

      const accountType = paymentMethodData
        ? paymentMethodData.meta_data.type || "N/A"
        : "N/A";

      const listItems = [
        {
          title: "Payment Method",
          content: paymentMethodData
            ? paymentMethodData.meta_data.type.replaceAll("_", " ")
            : "N/A",
        },
        {
          title:
            accountType == "bank_account"
              ? "Bank Name"
              : "Mobile Money Provider",
          content: paymentMethodData
            ? paymentMethodData.bank_name || "N/A"
            : "N/A",
          can_copy: true,
        },
        {
          title:
            accountType == "bank_account" ? "Account Number" : "Phone Number",
          content: paymentMethodData
            ? paymentMethodData.account_number || "N/A"
            : "N/A",
          can_copy: true,
        },
        {
          title: "Account Name",
          content: paymentMethodData
            ? paymentMethodData.account_name || "N/A"
            : "N/A",
          can_copy: true,
        },
      ];

      return listItems;
    };

    const getOrderSummaryMetadata = (message: any) => {
      const textContent: string = (
        message?.text_content ||
        message?.content ||
        ""
      ).toString();

      if (!textContent.includes("{delivery_order_summary}")) return null;

      const metadata = message.metadata || {};

      const deliveryOrder =
        metadata.delivery_order || metadata.delivery_order_data;

      const listItems = [
        {
          title: "Items to deliver",
          content: metadata.item_description || "N/A",
        },
        {
          title: "Pickup Address(es)",
          content: metadata?.deliveryOrderData?.pickupAddress || "N/A",
        },
        {
          title: "Delivery Address(es)",
          content: metadata?.deliveryOrderData?.deliveryAddress || "N/A",
        },
        {
          title: "Tracking Number",
          content: deliveryOrder?.trackingNumber || "N/A",
          can_copy: true,
        },
        {
          title: "Delivery Fee",
          content: `${metadata.delivery_currency_symbol || ""}${
            metadata.delivery_cost_formated ||
            metadata.delivery_cost_formatted ||
            "N/A"
          }`,
        },
        {
          title: "Created At",
          content: Logic.Common.fomartDate(
            deliveryOrder?.createdAt || "",
            "DD MMM YYYY, h:mm A"
          ),
        },
        {
          title: "Status",
          content: capitalize(
            deliveryOrder?.status?.replaceAll("_", " ") || "N/A"
          ),
        },
      ];

      return listItems;
    };

    // Try to derive an image URL from the message content if media is not explicitly provided
    const derivedImageUrl = computed(() => {
      // Prefer explicit media
      if (props.message?.media && props.message.media.url) return "";

      // Check common fields for a URL
      const content: string = (
        props.message?.text_content ||
        props.message?.content ||
        ""
      ).toString();
      if (!content) return "";

      // Simple regex to find image URLs (png|jpg|jpeg|webp|gif)
      const regex = /(https?:\/\/[^\s]+\.(?:png|jpe?g|webp|gif))/i;
      const match = content.match(regex);
      return match ? match[1] : "";
    });

    const clickableImageUrl = computed(() => {
      const mediaUrl =
        props.message?.media && props.message.media.url
          ? props.message.media.url
          : "";
      return mediaUrl || derivedImageUrl.value || "";
    });

    // Detect PDF URL inside the message content
    const derivedPdfUrl = computed(() => {
      // Prefer explicit media if it indicates a PDF
      const explicit =
        props.message?.media && props.message.media.url
          ? props.message.media.url
          : "";
      if (explicit && /\.pdf($|\?)/i.test(explicit)) return explicit;

      // Fallback: parse from text content
      const content: string = (
        props.message?.text_content ||
        props.message?.content ||
        ""
      ).toString();
      const regex = /(https?:\/\/[^\s]+\.pdf(?:\?[^\s]*)?)/i;
      const match = content.match(regex);
      return match ? match[1] : "";
    });

    const pdfFileName = computed(() => {
      if (!derivedPdfUrl.value) return "";
      try {
        const url = new URL(derivedPdfUrl.value);
        const pathname = url.pathname;
        const name =
          pathname.substring(pathname.lastIndexOf("/") + 1) || "document.pdf";
        return name;
      } catch {
        const parts = derivedPdfUrl.value.split("/");
        return parts[parts.length - 1] || "document.pdf";
      }
    });

    return {
      isUserMessage,
      derivedImageUrl,
      clickableImageUrl,
      derivedPdfUrl,
      pdfFileName,
      getActionClass,
      capitalize,
      getPaymentMethodMetadata,
      getOrderSummaryMetadata,
      Logic,
    };
  },
});
</script>
