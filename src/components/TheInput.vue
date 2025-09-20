<script setup lang="ts">
const { modelValue } = defineModels<{
  modelValue: string
}>()
</script>

<template>
  <input
    id="input"
    v-model="modelValue"
    v-bind="$attrs"
    type="text"
    p="x-4 y-2"
    w="450px"
    text="center"
    bg="transparent"
    border="~ rounded"
    style="border-color: #00f7ff"
    outline="none active:none"
  >
</template>
