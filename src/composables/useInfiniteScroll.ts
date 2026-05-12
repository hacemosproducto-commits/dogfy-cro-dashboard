import { ref, computed, onMounted, onUnmounted, type Ref } from 'vue'

/**
 * Tracks how many items of an array should be displayed and grows that count
 * as the user scrolls a sentinel element into view.
 *
 * Usage:
 *   const { displayed, sentinel, hasMore } = useInfiniteScroll(mockLeads, 20)
 *   <DataTable :value="displayed">...</DataTable>
 *   <div ref="sentinel" />
 *
 * The closest ancestor with overflow-y: auto|scroll is auto-detected as the
 * IntersectionObserver root — which in this app is `.crm-content`.
 */
export function useInfiniteScroll<T>(
  items: Ref<T[]> | T[],
  batchSize = 20,
  rootMarginPx = 240,
) {
  const all = computed<T[]>(() =>
    Array.isArray(items) ? items : items.value
  )

  const count = ref(Math.min(batchSize, all.value.length))
  const displayed = computed(() => all.value.slice(0, count.value))
  const hasMore   = computed(() => count.value < all.value.length)

  const sentinel = ref<HTMLElement | null>(null)
  let observer: IntersectionObserver | null = null

  function loadMore() {
    if (hasMore.value) {
      count.value = Math.min(count.value + batchSize, all.value.length)
    }
  }

  function findScrollRoot(el: HTMLElement | null): Element | null {
    let cur: HTMLElement | null = el?.parentElement ?? null
    while (cur && cur !== document.body) {
      const oy = window.getComputedStyle(cur).overflowY
      if (oy === 'auto' || oy === 'scroll') return cur
      cur = cur.parentElement
    }
    return null
  }

  onMounted(() => {
    if (!sentinel.value) return
    const root = findScrollRoot(sentinel.value)
    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore()
      },
      { root, rootMargin: `0px 0px ${rootMarginPx}px 0px`, threshold: 0 }
    )
    observer.observe(sentinel.value)
  })

  onUnmounted(() => {
    observer?.disconnect()
    observer = null
  })

  return { displayed, sentinel, hasMore, loadMore }
}
