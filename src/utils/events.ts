import { Logic } from "@greep/logic";
import { Product, ProductVariantInput } from "@greep/logic/src/gql/graphql";
import { formatRichText } from "./utils";

interface EventTicket {
  ticket_name: string;
  name: string;
  price: string;
  color: string;
  time: string;
  date: string;
}

interface Event {
  images: { url: string }[];
  name: string;
  event_date: string;
  event_time: string;
  location: string;
  place: string;
  tickets: EventTicket[];
  description: string;
}

interface EventCard {
  image_url: string;
  title: string;
  sub_titles: string[];
  location: string;
  description: string;
  uuid: string | number;
}

const mapProductToEventCard = (
  product: Product,
  currencies: { code: string; symbol: string }[]
): EventCard | null => {
  const productImages: {
    url: string;
    alt: string;
  }[] = JSON.parse(product.images);
  const image = productImages?.find((img) => true);

  const currencySymbol =
    currencies.find((c) => c.code === product.currency)?.symbol || "";

  const productVariants: ProductVariantInput[] = JSON.parse(product.variants);

  if (productVariants.length === 0) {
    return null; // No variants available, return null
  }
  const variantWithLowestPrice = productVariants.reduce(
    (acc: ProductVariantInput, variant: ProductVariantInput) => {
      if (!acc || variant.priceAdjustment < acc.priceAdjustment) return variant;
      return acc;
    }
  ).priceAdjustment;

  const lowestPrice = variantWithLowestPrice;

  const start = product?.eventStartDate || "";
  const end = product?.eventEndDate || "";
  const location = product.eventOnlineUrl ? "Online" : product?.venueName || "";

  return {
    image_url: image?.url || "",
    title: product.name,
    sub_titles: [
      `From ${currencySymbol}${lowestPrice}`,
      start ? Logic.Common.fomartDate(start, "ddd, MMM DD") : "N/A",
      end ? Logic.Common.fomartDate(end, "ddd, MMM DD") : "N/A",
    ],
    location,
    uuid: product.id,
    description: formatRichText(product.description),
  };
};

//
export { mapProductToEventCard, EventCard };
