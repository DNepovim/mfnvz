<script lang="ts">
  import { getCldImageUrl } from "astro-cloudinary/helpers";

  type Props = {
    image: string;
    title: string;
    subtitle?: string;
    subsubtitle?: string;
  };

  const { image, title, subtitle, subsubtitle }: Props = $props();

  const imageUrl = $derived(getCldImageUrl({
    src: image,
    width: 1088,
    height: 725,
  }));

  const alt = $derived(subtitle ? `${title} ${subtitle}` : title);

  let scrollY = $state(0);
  let viewportHeight = $state(0);

  const maxBlur = 20;
  const minThreshold = 50;

  // Blur starts when scrolled past 1/3 of viewport, fully blurred at 2/3
  const blurStart = $derived(viewportHeight / 3);
  const blurEnd = $derived(viewportHeight * 2 / 3);

  const blur = $derived(() => {
    if (scrollY <= blurStart) return 0;
    if (scrollY >= blurEnd) return maxBlur;
    return ((scrollY - blurStart) / (blurEnd - blurStart)) * maxBlur;
  });

  const opacity = $derived(() => {
    if (scrollY <= blurStart) return 1;
    if (scrollY >= blurEnd - minThreshold) return 0;
    return 1 - (scrollY - blurStart) / (blurEnd - minThreshold - blurStart);
  });

  const titleColor = $derived(() => {
    const midpoint = (blurStart + blurEnd) / 2;
    if (scrollY <= midpoint) return "rgb(255, 255, 255)";
    return "rgb(0, 0, 0)";
  });

  $effect(() => {
    viewportHeight = window.innerHeight;

    function handleScroll() {
      scrollY = window.scrollY;
    }

    function handleResize() {
      viewportHeight = window.innerHeight;
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  });
</script>

<img
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
