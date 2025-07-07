import { Logic } from "@greep/logic"
import { Product } from "@greep/logic/src/gql/graphql"
import { formatRichText } from "./utils"

interface EventTicket {
  ticket_name: string
  name: string
  price: string
  color: string
  time: string
  date: string
}

interface Event {
  images: { url: string }[]
  name: string
  event_date: string
  event_time: string
  location: string
  place: string
  tickets: EventTicket[]
  description: string
}

interface EventCard {
  image_url: string
  title: string
  sub_titles: string[]
  location: string
  description: string
  uuid: string | number
}

const mapProductToEventCard = (product: Product): Event | null => {
  const productImages: {
    url: string
    alt: string
  }[] = JSON.parse(product.images)

  // const currencySymbol =
  //   currencies.find((c) => c.code === product.currency)?.symbol || ""

  const productVariants = product.variants || []
  const lowestPrice =
    productVariants.reduce((acc, variant) => {
      return acc === null || variant.priceAdjustment < acc.priceAdjustment
        ? variant
        : acc
    }, null as Product["variants"][number] | null)?.priceAdjustment ?? 1

  const eventDetails = product.event?.eventDetails
  const start = eventDetails?.startDate || ""
  const end = eventDetails?.endDate || ""
  const location =
    eventDetails && eventDetails?.onlineUrl
      ? "Online"
      : eventDetails?.venueName || ""

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
  }
}

//
export { mapProductToEventCard, EventCard }
