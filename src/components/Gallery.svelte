<script lang="ts">
  import { CldImage, configureCloudinary } from "svelte-cloudinary";
  import { cn } from "../utils/cn";
  import {
    GalleryThumbnail,
    GalleryImage,
    LightboxGallery,
  } from "svelte-lightbox";

  const cloudName = import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME as string;

  configureCloudinary({
    cloudName,
  });

  type Props = {
    year: string;
    imagePublicIds: string[];
  };

  const { year, imagePublicIds }: Props = $props();

  const galleryId = $derived(`gallery-${year}`);

  const isHigher = (
    index: number,
    pattern: number[],
    start?: number,
  ): boolean =>
    pattern.includes((index - (start ?? 0)) % (pattern.toReversed()[0] ?? 0));

  let loadedImages = $state<Set<number>>(new Set());
  let loadedFullSizeImages = $state<Set<number>>(new Set());

  function handleImageLoad(index: number) {
    loadedImages = new Set([...loadedImages, index]);
  }

  function handleFullSizeImageLoad(index: number) {
    loadedFullSizeImages = new Set([...loadedFullSizeImages, index]);
  }

  function getPlaceholderUrl(publicId: string): string {
    return `https://res.cloudinary.com/${cloudName}/image/upload/w_40,h_40,q_auto:low,e_blur:300,f_webp/${publicId}`;
  }
</script>

{#if imagePublicIds.length > 0}
  <div class="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3" id={galleryId}>
    <LightboxGallery>
      <svelte:fragment slot="thumbnail">
        {#each imagePublicIds as publicId, index (publicId)}
          <GalleryThumbnail
            id={index}
            class={cn(
              "relative glightbox rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity max-md:aspect-3/2",
              index === 0 && "md:col-start-2 md:col-span-2 md:row-span-2",
              index === 1 && "md:col-start-1 md:w-2/3 md:mt-auto md:ml-auto",
              index === 2 && "md:col-start-1",
              isHigher(index, [0, 6, 14], 4) && "md:col-span-2 md:row-span-2",
              isHigher(index, [0, 6, 9, 12, 14]) && "md:row-span-2",
              isHigher(index, [0, 5]) && "max-md:col-span-2",
            )}
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
              class={cn(
                "size-full! max-w-full max-h-full object-cover relative z-10 transition-opacity duration-300",
                loadedImages.has(index) ? "opacity-100" : "opacity-0",
              )}
              data-image-index={index}
              onload={() => {
                handleImageLoad(index);
              }}
            />
          </GalleryThumbnail>
        {/each}
      </svelte:fragment>
      {#each imagePublicIds as publicId, index (publicId)}
        <GalleryImage id={index} class="h-[80vh] w-[80vw] relative">
          <div
            class={cn(
              "absolute inset-0 w-[80vw] h-[80vh] bg-cover bg-center transition-opacity duration-300",
              loadedFullSizeImages.has(index) ? "opacity-0" : "opacity-100",
            )}
            style={`background-image: url('${getPlaceholderUrl(publicId)}');`}
          ></div>
          <CldImage
            src={publicId}
            width={1920}
            height={1280}
            alt=""
            loading="lazy"
            format="webp"
            crop="fill"
            sizes="90vw"
            class={cn(
              "w-[80vw] h-[80vh] relative z-10 transition-opacity duration-300",
              loadedFullSizeImages.has(index) ? "opacity-100" : "opacity-0",
            )}
            onload={() => {
              handleFullSizeImageLoad(index);
            }}
          />
        </GalleryImage>
      {/each}
    </LightboxGallery>
  </div>
{/if}

<style>
  :global {
    .svelte-lightbox-body {
      width: 90vw !important;
      height: 90vh !important;
    }
    .svelte-lightbox-footer {
      display: none !important;
    }
  }
</style>
