<script lang="ts">
  import { CldImage, configureCloudinary } from "svelte-cloudinary";
  import { cn } from "../utils/cn";
  import {
    GalleryImage,
    GalleryThumbnail,
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

  function handleImageLoad(index: number) {
    loadedImages = new Set([...loadedImages, index]);
  }
</script>

{#if imagePublicIds.length > 0}
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4" id={galleryId}>
    <LightboxGallery >
      <svelte:fragment slot="thumbnail">
        {#each imagePublicIds as publicId, index (publicId)}
          <div
            class={cn(
              "relative glightbox rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity",
              index === 0 && "col-start-2 col-span-2 row-span-2",
              index === 1 && "col-start-1 w-2/3 mt-auto ml-auto",
              index === 2 && "col-start-1",
              isHigher(index, [0, 6, 14], 4) && "col-span-2 row-span-2",
              isHigher(index, [0, 6, 9, 12, 14]) && "row-span-2",
            )}
          >
            <GalleryThumbnail id={index}>
              <CldImage
                src={publicId}
                width={1088}
                height={725}
                alt=""
                loading="lazy"
                crop="fill"
                sizes="(max-width: 640px) 50vw, 20vw"
                class={cn(
                  "w-full h-full object-cover relative z-10 transition-opacity duration-300",
                  loadedImages.has(index) ? "opacity-100" : "opacity-0",
                )}
                data-image-index={index}
                onload={() => {
                  handleImageLoad(index);
                }}
              />
            </GalleryThumbnail>
          </div>
        {/each}
      </svelte:fragment>
      {#each imagePublicIds as publicId, index (publicId)}
        <GalleryImage id={index}>
          <CldImage
            src={publicId}
            width={1920}
            height={1280}
            alt=""
            loading="lazy"
            crop="fill"
            sizes="90vw"
          />
        </GalleryImage>
      {/each}
    </LightboxGallery>
  </div>
{/if}
