<template>
  <div ref="wrapRef" class="itip-wrap" @mouseenter="open" @mouseleave="queueClose">
    <slot />
    <Teleport to="body">
      <div
        v-if="visible"
        ref="tipRef"
        class="itip-box"
        :style="tipStyle"
        @mouseenter="cancelClose"
        @mouseleave="queueClose"
      >
        <slot name="content" />
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick } from 'vue'

const wrapRef = ref<HTMLElement | null>(null)
const tipRef  = ref<HTMLElement | null>(null)
const visible = ref(false)
const tipStyle = reactive<Record<string, string>>({ position: 'fixed', top: '0px', left: '0px', zIndex: '9000' })

let closeTimer: ReturnType<typeof setTimeout> | null = null

async function open() {
  cancelClose()
  visible.value = true
  await nextTick()
  if (!wrapRef.value || !tipRef.value) return
  const r = wrapRef.value.getBoundingClientRect()
  const tH = tipRef.value.offsetHeight
  const tW = tipRef.value.offsetWidth
  // prefer above trigger; fall back to below if not enough room
  const spaceAbove = r.top - 8
  const top = spaceAbove >= tH ? r.top - tH - 8 : r.bottom + 8
  // align to left edge; clamp so it doesn't overflow viewport right
  const left = Math.min(r.left, window.innerWidth - tW - 12)
  tipStyle.top  = top + 'px'
  tipStyle.left = Math.max(8, left) + 'px'
}

function queueClose() {
  closeTimer = setTimeout(() => { visible.value = false }, 150)
}
function cancelClose() {
  if (closeTimer) { clearTimeout(closeTimer); closeTimer = null }
}
</script>

<!-- NOT scoped — rendered into <body> via Teleport -->
<style>
.itip-wrap { position: relative; display: inline-flex; }

.itip-box {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.13);
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  max-width: 260px;
  pointer-events: auto;
}

/* Shared type styles — usable in any tooltip content */
.itip-title         { font-size: 12px; font-weight: 700; margin: 0; }
.itip-title--error  { color: #c8452a; }
.itip-title--warn   { color: #b45309; }
.itip-row           { font-size: 11px; line-height: 1.5; color: #4b5563; margin: 0; }
.itip-row strong    { color: #111827; }
.itip-link {
  font-size: 11px; font-weight: 600; color: #2563eb;
  margin-top: 2px; text-decoration: none; display: inline-block;
}
.itip-link:hover { text-decoration: underline; }
.itip-sep { border: none; border-top: 1px solid #f3f4f6; margin: 2px 0; }
.itip-code {
  font-family: 'SF Mono', Menlo, Consolas, monospace;
  font-size: 10px; padding: 1px 5px; border-radius: 4px;
  background: #f3f4f6; color: #374151;
  vertical-align: middle; margin-left: 4px;
}
</style>
