<template>
  <button
    class="image-button tap-highlight no-select"
    :class="{ 'image-button--disabled': disabled }"
    :disabled="disabled"
    @click="handleClick"
  >
    <NuxtImg
      :src="imageSrc"
      :alt="alt"
      class="btn-image"
      loading="lazy"
      format="webp"
      quality="85"
      preset="thumbnail"
    />
    <NuxtImg
      v-if="hoverImageSrc"
      :src="hoverImageSrc"
      :alt="`${alt} hover`"
      class="btn-image-hover"
      loading="lazy"
      format="webp"
      quality="85"
      preset="thumbnail"
    />
  </button>
</template>

<script setup lang="ts">
interface Props {
  imageSrc: string
  hoverImageSrc?: string
  alt: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  hoverImageSrc: undefined,
  disabled: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('click', event)
  }
}
</script>

<style scoped>
.image-button {
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  width: 100%;
  transition: transform var(--transition-base);
}

.image-button:active:not(.image-button--disabled) {
  opacity: 0.8;
  transform: scale(0.98);
}

.image-button--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-image {
  width: 100%;
  height: auto;
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.3));
  transition: opacity var(--transition-base);
}

.btn-image-hover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: auto;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.4));
  opacity: 0;
  transition: opacity var(--transition-base);
  pointer-events: none;
}

.image-button:hover:not(.image-button--disabled) .btn-image {
  opacity: 0;
}

.image-button:hover:not(.image-button--disabled) .btn-image-hover {
  opacity: 1;
}
</style>
