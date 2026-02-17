<script lang="ts">
  import { CldImage, configureCloudinary } from "svelte-cloudinary";
  import { cn } from "../utils/cn";
  import Lightbox from "./Lightbox.svelte";

  const cloudName = import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME as string;
  configureCloudinary({ cloudName });

  type Props = {
    year: string;
    imagePublicIds: string[];
  };

  const { year, imagePublicIds }: Props = $props();

  const galleryId = $derived(`gallery-${year}`);

  let lightboxOpen = $state(false);
  let lightboxIndex = $state(0);
  let loadedThumbnails = $state<Set<number>>(new Set());

  const isHigher = (
    index: number,
    pattern: number[],
    start?: number,
  ): boolean =>
    pattern.includes((index - (start ?? 0)) % (pattern.toReversed()[0] ?? 0));

  function openLightbox(index: number) {
    lightboxIndex = index;
    lightboxOpen = true;
  }

  function closeLightbox() {
    lightboxOpen = false;
  }

  function handleThumbnailLoad(index: number) {
    loadedThumbnails = new Set([...loadedThumbnails, index]);
  }
</script>

{#if imagePublicIds.length > 0}
  <div class="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3" id={galleryId}>
    {#each imagePublicIds as publicId, index (publicId)}
      <button
        type="button"
        class={cn(
          "relative rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity max-md:aspect-3/2 text-left p-0 border-0 bg-transparent block w-full",
          index === 0 && "md:col-start-2 md:col-span-2 md:row-span-2",
          index === 1 && "md:col-start-1 md:w-2/3 md:mt-auto md:ml-auto",
          index === 2 && "md:col-start-1",
          isHigher(index, [0, 6, 14], 4) && "md:col-span-2 md:row-span-2",
          isHigher(index, [0, 6, 9, 12, 14]) && "md:row-span-2",
          isHigher(index, [0, 5]) && "max-md:col-span-2",
        )}
        onclick={() => { openLightbox(index); }}
        aria-label="Open image {index + 1} in lightbox"
      >
        <CldImage
          src={publicId}
          width={2400}
          height={1600}
          alt=""
          loading="lazy"
          format="webp"
          sizes="(max-width: 640px) 50vw, 20vw"
          objectFit="cover"
          crop="auto"
          placeholder="blur"
          class={cn(
            "size-full max-w-full max-h-full object-cover transition-opacity duration-300",
            loadedThumbnails.has(index) ? "opacity-100" : "opacity-0",
          )}
          onload={() => { handleThumbnailLoad(index); }}
        />
      </button>
    {/each}
  </div>

  <Lightbox
    open={lightboxOpen}
    imagePublicIds={imagePublicIds}
    initialIndex={lightboxIndex}
    onclose={closeLightbox}
  />
{/if}
