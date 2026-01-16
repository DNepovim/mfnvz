<script lang="ts">
  import { getCldImageUrl } from "astro-cloudinary/helpers";
  import { cn } from "../utils/cn";

  type Props = {
    year: string;
    imagePublicIds: string[];
  };

  const { year, imagePublicIds }: Props = $props();

  const lightboxImages = $derived(imagePublicIds.map((publicId) => {
    return getCldImageUrl({
      src: publicId,
      width: 1920,
      quality: 90,
      format: "auto",
    });
  }));

  const galleryId = $derived(`gallery-${year}`);

  const isHigher = (index: number, pattern: number[], start?: number): boolean =>
    pattern.includes((index - (start ?? 0)) % (pattern.toReversed()[0] ?? 0));

  const getImageUrl = (publicId: string, width: number, height: number) => {
    return getCldImageUrl({
      src: publicId,
      width,
      height,
      crop: "fill",
      quality: 80,
      format: "auto",
    });
  };

  const getImageSrcSet = (publicId: string) => {
    const widths = [320, 640, 1088];
    return widths
      .map((w) => `${getImageUrl(publicId, w, Math.round(w * 725 / 1088))} ${String(w)}w`)
      .join(", ");
  };

  let loadedImages = $state<Set<number>>(new Set());

  function handleImageLoad(index: number) {
    loadedImages = new Set([...loadedImages, index]);
  }
</script>

{#if imagePublicIds.length > 0}
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4" id={galleryId}>
    {#each imagePublicIds as publicId, index (publicId)}
      <a
        href={lightboxImages[index]}
        class={cn(
          "relative glightbox rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity",
          index === 0 && "col-start-2 col-span-2 row-span-2",
          index === 1 && "col-start-1 w-2/3 mt-auto ml-auto",
          index === 2 && "col-start-1",
          isHigher(index, [0, 6, 14], 4) && "col-span-2 row-span-2",
          isHigher(index, [0, 6, 9, 12, 14]) && "row-span-2",
        )}
        data-gallery={galleryId}
        data-image-index={index}
      >
        <div
          class={cn(
            "absolute inset-0 w-full h-full z-0 bg-gray-300 animate-pulse rounded-lg",
            loadedImages.has(index) && "hidden"
          )}
          aria-label="Loading..."
        ></div>
        <img
          src={getImageUrl(publicId, 1088, 725)}
          srcset={getImageSrcSet(publicId)}
          sizes="(max-width: 640px) 50vw, 20vw"
          alt=""
          loading="lazy"
          class={cn(
            "w-full h-full object-cover relative z-10 transition-opacity duration-300",
            loadedImages.has(index) ? "opacity-100" : "opacity-0"
          )}
          width={1088}
          height={725}
          data-image-index={index}
          onload={() => { handleImageLoad(index); }}
        />
      </a>
    {/each}
  </div>
{/if}
