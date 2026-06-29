<template>
  <div class="reader">

    <!-- Top Bar -->
    <header class="reader-topbar">
      <div class="topbar-left">
        <span class="reading-now">READING NOW</span>
        <h2 class="chapter-title">{{ chapter?.title }}</h2>
      </div>
      <div class="topbar-center">
        <span class="page-info">📄 Page {{ currentPage }} of {{ pages.length }}</span>      </div>
      <div class="topbar-right">
        <button class="btn-fit">⊞ Fit to Width</button>
      </div>
    </header>

    <!-- Page Viewer -->
    <div class="viewer" @click="nextPage">
      <div class="page-container">
      <img
        v-if="pages.length"
        :src="pages[currentPage - 1]"
        class="page-image"
      />
    </div>

      <!-- Floating Controls -->
      <div class="floating-controls">
        <button class="ctrl-btn" @click.stop="toggleGrid">⊞</button>
        <button class="ctrl-btn" @click.stop="prevPage">⏮</button>
        <span class="ctrl-page">{{ currentPage }}</span>
        <span class="ctrl-sep">{{ pages.length }}</span>        <button class="ctrl-btn" @click.stop="nextPage">⏭</button>
        <button class="ctrl-btn" @click.stop>🔖</button>
      </div>
    </div>

    <!-- Bottom Panel -->
    <!--
    <div class="bottom-panel">
      <div class="panel-left">
        <h3 class="panel-title">| The Art of Stillness</h3>
        <p class="panel-desc">
          In this pivotal moment, Miyamoto Musashi reflects on the duality of the blade.
          The intricate cross-hatching emphasizes the texture of the weathered bamboo,
          mirroring the internal conflict of a man seeking peace through the path of violence.
        </p>
        <div class="panel-tags">
          <span class="tag">SEINEN</span>
          <span class="tag">HISTORICAL</span>
          <span class="tag">PHILOSOPHICAL</span>
        </div>
      </div>
      <div class="panel-right">
        <div class="quick-actions-label">QUICK ACTIONS</div>
        <button class="btn-continue">CONTINUE NEXT CHAPTER</button>
        <div class="settings">
          <div class="setting-row">
            <span class="setting-label">Layout Mode</span>
            <span class="setting-value">Vertical Scroll</span>
          </div>
          <div class="setting-row">
            <span class="setting-label">Background</span>
            <div class="bg-options">
              <button class="bg-btn active" />
              <button class="bg-btn light" />
            </div>
          </div>
          <div class="setting-row">
            <span class="setting-label">Double Page</span>
            <div class="toggle" :class="{ on: doublePage }" @click="doublePage = !doublePage">
              <div class="toggle-knob" />
            </div>
          </div>
        </div>
      </div>
    </div>
    -->

  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, watch } from 'vue'
  import { useRoute } from 'vue-router'
  import { readDir } from '@tauri-apps/plugin-fs'
  import { convertFileSrc } from '@tauri-apps/api/core'
  import { getChapterById, updateChapterProgress  } from '../db/chapter'
  import type { Chapter } from '../types'

  const route = useRoute()

  const pages = ref<string[]>([])
  const currentPage = ref(1)
  const doublePage = ref(false)
  const chapter = ref<Chapter | null>(null)

  onMounted(async () => {
    const chapterId = Number(route.params.chapterId)
    chapter.value = await getChapterById(chapterId)
    if (!chapter.value) return

    const entries = await readDir(chapter.value.folder_path)

    const images = entries
      .filter(e => e.name && /\.(jpg|jpeg|png|webp)$/i.test(e.name))
      .sort((a, b) => a.name!.localeCompare(b.name!))

    pages.value = images.map(img =>
      convertFileSrc(`${chapter.value!.folder_path}/${img.name}`)
    )
    const saved = chapter.value.last_page
      if (saved > 0 && saved <= pages.value.length) {
        currentPage.value = saved
      }
  })

  function nextPage() {
    if (currentPage.value < pages.value.length) currentPage.value++
  }

  function prevPage() {
    if (currentPage.value > 1) currentPage.value--
  }

  function toggleGrid() {}

  watch(currentPage, (page) => {
  if (chapter.value) {
    const isRead = page >= pages.value.length
    updateChapterProgress(chapter.value.id!, page, isRead)
  }
})
</script>

<style scoped>
.reader {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background-color: #0d0d0d;
}

/* Top Bar */
.reader-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background-color: #111111;
  border-bottom: 1px solid #1e1e1e;
  flex-shrink: 0;
}

.reading-now {
  display: block;
  font-size: 9px;
  color: #555555;
  letter-spacing: 2px;
  margin-bottom: 2px;
}

.chapter-title {
  font-size: 15px;
  font-weight: 700;
}

.page-info {
  font-size: 13px;
  color: #888888;
}

.btn-fit {
  padding: 8px 16px;
  background-color: #1a1a1a;
  color: #aaaaaa;
  border: 1px solid #2a2a2a;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

/* Viewer */
.viewer {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.page-container {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-placeholder {
  width: 480px;
  height: 100%;
  max-height: 600px;
  background-color: #1a1a1a;
  border-radius: 4px;
}

/* Floating Controls */
.floating-controls {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: rgba(0,0,0,0.85);
  padding: 10px 20px;
  border-radius: 30px;
  backdrop-filter: blur(8px);
}

.ctrl-btn {
  background: none;
  border: none;
  color: #aaaaaa;
  font-size: 16px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: color 0.2s;
}

.ctrl-btn:hover {
  color: white;
}

.ctrl-page {
  font-size: 14px;
  font-weight: 700;
  color: white;
  min-width: 20px;
  text-align: center;
}

.ctrl-sep {
  font-size: 14px;
  color: #555555;
}

/* Bottom Panel */
.bottom-panel {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 32px;
  padding: 28px 48px;
  background-color: #0d0d0d;
  border-top: 1px solid #1a1a1a;
  flex-shrink: 0;
}

.panel-title {
  font-size: 16px;
  font-weight: 700;
  border-left: 3px solid #ff6b35;
  padding-left: 12px;
  margin-bottom: 12px;
}

.panel-desc {
  font-size: 13px;
  color: #888888;
  line-height: 1.7;
  margin-bottom: 16px;
}

.panel-tags {
  display: flex;
  gap: 8px;
}

.tag {
  padding: 6px 14px;
  border: 1px solid #333333;
  border-radius: 20px;
  font-size: 10px;
  color: #aaaaaa;
  letter-spacing: 1px;
}

/* Panel Right */
.quick-actions-label {
  font-size: 10px;
  color: #555555;
  letter-spacing: 1px;
  margin-bottom: 12px;
}

.btn-continue {
  width: 100%;
  padding: 14px;
  background-color: #ff6b35;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
  cursor: pointer;
  margin-bottom: 20px;
}

.settings {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.setting-label {
  color: #888888;
}

.setting-value {
  color: white;
  font-size: 12px;
}

.bg-options {
  display: flex;
  gap: 8px;
}

.bg-btn {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid #444444;
  background-color: #1a1a1a;
  cursor: pointer;
}

.bg-btn.active {
  border-color: #ff6b35;
}

.bg-btn.light {
  background-color: #ffffff;
}

/* Toggle */
.toggle {
  width: 36px;
  height: 20px;
  background-color: #333333;
  border-radius: 10px;
  cursor: pointer;
  position: relative;
  transition: background-color 0.2s;
}

.toggle.on {
  background-color: #ff6b35;
}

.toggle-knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  background-color: white;
  border-radius: 50%;
  transition: left 0.2s;
}

.toggle.on .toggle-knob {
  left: 18px;
}

.page-image {
  max-height: 100%;
  max-width: 100%;
  object-fit: contain;
  border-radius: 4px;
}
</style>