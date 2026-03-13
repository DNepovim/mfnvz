import type {
  MusicEvent,
  MusicGroup,
  Offer,
  Person,
  Place,
  PostalAddress,
  WithContext,
} from "schema-dts";
import type { CollectionEntry } from "astro:content";

type Band = NonNullable<CollectionEntry<"seasons">["data"]["bands"]>[number];
type Member = NonNullable<Band["member"]>[number];

type PostalAddressArgs = {
  streetAddress: string;
  addressLocality: string;
  postalCode: string;
  addressCountry: string;
};

type PlaceArgs = {
  name: string;
  address: PostalAddressArgs;
};

type OrganizerArgs = {
  name: string;
  email: string;
  url: URL;
};

type OfferArgs = {
  price: number;
  priceCurrency: string;
  name: string;
  description?: string;
};

export const buildPostalAddressSchema = (
  args: PostalAddressArgs,
): PostalAddress => ({
  "@type": "PostalAddress",
  ...args,
});

export const buildPlaceSchema = (args: PlaceArgs): Place => ({
  "@type": "Place",
  name: args.name,
  address: buildPostalAddressSchema(args.address),
});

export const buildPersonSchema = (member: Member): Person => ({
  "@type": "Person",
  ...member,
});

export const buildOrganizerSchema = (args: OrganizerArgs): Person => ({
  "@type": "Person",
  name: args.name,
  url: new URL("/", args.url).href,
  email: args.email,
});

export const buildOfferSchema = (args: OfferArgs): Offer => ({
  "@type": "Offer",
  ...args,
  availability: "https://schema.org/InStock",
});

export const buildMusicGroupSchema = (band: Band): MusicGroup => ({
  "@type": "MusicGroup",
  ...band,
  foundingDate: band.foundingDate?.toISOString(),
  member: (band.member ?? []).map(buildPersonSchema),
});

export const buildMusicEventSchema = (
  post: CollectionEntry<"seasons">,
  seasonNumber: number,
  url: URL,
): WithContext<MusicEvent> => ({
  "@context": "https://schema.org",
  "@type": "MusicEvent",
  name: `${String(seasonNumber)}. ročník Malého festivalu na velké zahradě`,
  startDate: post.data.startDate.toISOString(),
  endDate: post.data.endDate.toISOString(),
  ...{ doorTime: post.data.door.toISOString() },
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  url: url.href,
  location: buildPlaceSchema({
    name: "Velká zahrada v Řevnicích",
    address: {
      streetAddress: "Žižkova 257",
      addressLocality: "Řevnice",
      postalCode: "25230",
      addressCountry: "CZ",
    },
  }),
  image: post.data.images,
  ...(post.data.claim && { description: post.data.claim }),
  ...(post.data.bands && {
    performer: post.data.bands.map(buildMusicGroupSchema),
  }),
  offers: buildOfferSchema({
    name: "Vstupné dobrovolné",
    price: 0,
    priceCurrency: "CZK",
    description:
      "Vstupné, stravné a ubytné… dobrovolné. Máte moc? Dejte moc. Máte málo? Dejte málo. Nemáte nic? Nedávejte nic. Tak jednoduché to je.",
  }),
  ...(post.data.fbEventLink && { sameAs: post.data.fbEventLink }),
  organizer: buildOrganizerSchema({
    name: "Dominik Bláha",
    email: "principal@mfnvz.cz",
    url,
  }),
});
