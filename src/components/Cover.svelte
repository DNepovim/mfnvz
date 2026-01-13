<script lang="ts">
  import { getCldImageUrl } from "astro-cloudinary/helpers";

  type Props = {
    image: string;
    title: string;
    subtitle?: string;
    subsubtitle?: string;
  };

  const props = $props<Props>() as Props;
  const { image, title, subtitle, subsubtitle } = props;

  const imageUrl = getCldImageUrl({
    src: image,
    width: 1088,
    height: 725,
  });

  const alt: string = subtitle ? `${title} ${subtitle}` : title;

  let imageElement: HTMLImageElement;
  let imageBottomDistance = $state<number | null>(null);
  let initialImageBottom = $state<number | null>(null);

  const maxBlur = 20;
  const threshold = 50;

  const opacity = $derived(() => {
    if (imageBottomDistance === null || initialImageBottom === null) return 1;
    if (imageBottomDistance >= initialImageBottom) return 1;
    if (imageBottomDistance <= threshold) return 0;
    return (imageBottomDistance - threshold) / (initialImageBottom - threshold);
  });

  const blur = $derived(() => {
    if (imageBottomDistance === null || initialImageBottom === null) return 0;
    if (imageBottomDistance >= initialImageBottom) return 0;
    if (imageBottomDistance <= threshold) return maxBlur;
    return (1 - (imageBottomDistance - threshold) / (initialImageBottom - threshold)) * maxBlur;
  });

  const titleColor = $derived(() => {
    if (imageBottomDistance === null || initialImageBottom === null) return "rgb(255, 255, 255)";
    const midpoint = (initialImageBottom + threshold) / 2;
    if (imageBottomDistance >= midpoint) return "rgb(255, 255, 255)";
    return "rgb(0, 0, 0)";
  });

  function updateImagePosition() {
    const rect = imageElement.getBoundingClientRect();
    imageBottomDistance = rect.bottom;
    initialImageBottom ??= rect.bottom;
  }

  $effect(() => {
    function handleScroll() {
      updateImagePosition();
    }

    function handleResize() {
      updateImagePosition();
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });

    window.requestAnimationFrame(() => {
      updateImagePosition();
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  });

  $effect(() => {
    updateImagePosition();
  });
</script>

<img
  bind:this={imageElement}
  src={imageUrl}
  alt={alt}
  class="w-full h-full rounded-lg"
  sizes="(min-width: 1150px) 1088px, calc(100vw - 4rem)"
  width={1088}
  height={725}
  style="opacity: {opacity()}; filter: blur({blur()}px); transition: opacity 0.1s, filter 0.1s;"
/>

<h1 class="font-head -mt-[13vw] sm:-mt-[8rem] z-20 pl-4 relative">
  <span class="text-[9vw] sm:text-[5rem]" style="color: {titleColor()}; transition: color 700ms;">{title}</span>
  {#if subtitle}
    <span class="font-head text-[5vw] sm:text-[3rem] mb-4 block relative overflow-hidden">
      {subtitle}
    </span>
  {/if}
</h1>

<p class="text-lg sm:text-xl font-thin px-4 gap-4 flex items-center mb-4">
  {#if subsubtitle}
    <span>{subsubtitle}</span>
  {/if}
</p>
