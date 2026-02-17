<script lang="ts">
  import { configureCloudinary, getCldImageUrl } from "svelte-cloudinary";
  
const cloudName = import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME as string;
  configureCloudinary({ cloudName });

  function getFullImageUrl(publicId: string): string {
    return getCldImageUrl({
      src: publicId,
      width: 1920,
      height: 1280,
      format: "webp",
      crop: "fit",
    });
  }

  function prefetchImage(url: string): void {
    const img = new window.Image();
    img.src = url;
  }

  type Props = {
    open: boolean;
    imagePublicIds: string[];
    initialIndex: number;
    onclose: () => void;
  };

  const { open, imagePublicIds, initialIndex, onclose }: Props = $props();

  let currentIndex = $state(0);
  let loadedFullSize = $state<Set<number>>(new Set());
  let pointerStartX = $state<number | null>(null);

  function goPrev() {
    currentIndex =
      currentIndex <= 0 ? imagePublicIds.length - 1 : currentIndex - 1;
  }

  function goNext() {
    currentIndex =
      currentIndex >= imagePublicIds.length - 1 ? 0 : currentIndex + 1;
  }

  function handleFullSizeLoad(index: number) {
    loadedFullSize = new Set([...loadedFullSize, index]);
  }

  function handleBackdropClick() {
    onclose();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (!open) return;
    if (e.key === "Escape") onclose();
    if (e.key === "ArrowLeft") goPrev();
    if (e.key === "ArrowRight") goNext();
  }

  function handlePointerDown(e: PointerEvent) {
    pointerStartX = e.clientX;
  }

  function handlePointerUp(e: PointerEvent) {
    if (pointerStartX === null) return;
    const delta = e.clientX - pointerStartX;
    const threshold = 50;
    if (delta < -threshold) goNext();
    else if (delta > threshold) goPrev();
    pointerStartX = null;
  }

  $effect(() => {
    if (open) currentIndex = initialIndex;
  });

  $effect(() => {
    const fn = handleKeydown;
    window.addEventListener("keydown", fn);
    return () => {
      window.removeEventListener("keydown", fn);
    };
  });

  $effect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  });

  $effect(() => {
    if (!open || imagePublicIds.length === 0) return;
    const nextIndex =
      currentIndex >= imagePublicIds.length - 1 ? 0 : currentIndex + 1;
    const prevIndex =
      currentIndex <= 0 ? imagePublicIds.length - 1 : currentIndex - 1;
    const nextId = imagePublicIds[nextIndex];
    const prevId = imagePublicIds[prevIndex];
    if (nextId) prefetchImage(getFullImageUrl(nextId));
    if (prevId && prevId !== nextId) prefetchImage(getFullImageUrl(prevId));
  });
</script>

{#if open && imagePublicIds.length > 0}
  <div
    class="fixed inset-0 z-50 bg-white flex items-center justify-center touch-pan-y"
    role="dialog"
    aria-modal="true"
    aria-label="Image lightbox"
  >
    <div
      class="absolute inset-0 z-0 cursor-pointer"
      aria-hidden="true"
      onclick={handleBackdropClick}
    ></div>
    <button
      type="button"
      class="absolute top-4 right-4 z-10 p-2 bg-transparent border-none text-black cursor-pointer rounded flex items-center justify-center hover:bg-black/[0.06]"
      aria-label="Close"
      onclick={onclose}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </svg>
    </button>

    <button
      type="button"
      class="shrink-0 w-12 text-black bg-transparent border-none cursor-pointer flex items-center justify-center p-4 hover:bg-black/[0.06] relative mr-2 z-[1]"
      aria-label="Previous image"
      onclick={goPrev}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="m15 18-6-6 6-6" />
      </svg>
    </button>

    <div
      class="flex-1 min-w-0 h-full flex items-center justify-center p-8 box-border relative z-[1]"
      onpointerdown={handlePointerDown}
      onpointerup={handlePointerUp}
      onpointerleave={() => {
        pointerStartX = null;
      }}
    >
      <div
        class="relative max-w-full max-h-full w-full h-full flex items-center justify-center"
      >
        {#if imagePublicIds[currentIndex]}
          {@const publicId = imagePublicIds[currentIndex] ?? ""}
          {@const imageIndex = currentIndex}
          {@const imageUrl = getFullImageUrl(publicId)}
          <div
            class="absolute inset-0 m-auto max-w-full max-h-full w-auto h-auto flex items-center justify-center"
          >
            <img
              src={imageUrl}
              alt=""
              width={1920}
              height={1280}
              loading="eager"
              class="rounded-lg max-w-full max-h-full w-auto h-auto object-contain object-center"
              onload={() => { handleFullSizeLoad(imageIndex); }}
            />
          </div>
        {/if}
      </div>
    </div>

    <button
      type="button"
      class="shrink-0 w-12 text-black bg-transparent border-none cursor-pointer flex items-center justify-center p-4 hover:bg-black/[0.06] relative ml-2 z-[1]"
      aria-label="Next image"
      onclick={goNext}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="m9 18 6-6-6-6" />
      </svg>
    </button>
  </div>
{/if}
