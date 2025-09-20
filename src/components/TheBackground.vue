<template>
  <div class="background-container">
    <div class="grid-pattern" />
  </div>
</template>

<style scoped>
.background-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: -1;
  pointer-events: none;
  contain: layout style paint; /* 提高CSS containment性能 */
}

/* 优化网格背景 - 使用CSS变量方便调整 */
.grid-pattern {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: var(--grid-size, 40px 40px);
  background-image: linear-gradient(to right, rgba(0, 247, 255, 0.08) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0, 247, 255, 0.08) 1px, transparent 1px);
  will-change: background-position;
  transform: translateZ(0); /* 提升到单独的图层 */
}
</style>
