<template>
  <div class="detail">

    <!-- Banner -->
    <section class="banner">
      <div class="banner-bg" />
      <div class="banner-content" v-if="manga">
        <div class="banner-tags">
          <span class="tag-status">{{ manga.status.toUpperCase() }}</span>
        </div>
        <h1 class="banner-title">{{ manga.title }}</h1>
        <div class="banner-meta">
          <div class="meta-item" v-if="manga.author">
            <span class="meta-label">AUTHOR</span>
            <span class="meta-value">{{ manga.author }}</span>
          </div>
        </div>
      </div>
    </section>
        <!-- Narrative + Stats -->
    <!--
    <section class="section">
    <div class="narrative-grid">
        <div class="narrative-left">
        <h2 class="section-label">THE NARRATIVE</h2>
        <p class="narrative-text">
            -----
        </p>
        <div class="narrative-details">
            <div class="detail-item">
            <span class="detail-label">ART STYLE</span>
            <span class="detail-value">Cinematic / Raw</span>
            </div>
            <div class="detail-item">
            <span class="detail-label">ORIGINAL RUN</span>
            <span class="detail-value">152+ Chapters</span>
            </div>
            <div class="detail-item">
            <span class="detail-label">PUBLISHER</span>
            <span class="detail-value">Shueisha</span>
            </div>
        </div>
        </div>
        <div class="narrative-right">
        <div class="stat-card">
            <span class="stat-icon">★</span>
            <span class="stat-value">9.1</span>
            <span class="stat-label">CRITICAL SCORE</span>
        </div>
        <div class="stat-row">
            <div class="stat-card-sm">
            <span class="stat-icon">👁</span>
            <span class="stat-value">2.4M</span>
            <span class="stat-label">TOTAL VIEWS</span>
            </div>
            <div class="stat-card-sm">
            <span class="stat-icon">♥</span>
            <span class="stat-value">840K</span>
            <span class="stat-label">FAVORITES</span>
            </div>
        </div>
        </div>
    </div>
    </section>
    -->
        <!-- Recent Releases -->
    <section class="section">
    <div class="section-header">
        <h2 class="section-label">RECENT RELEASES</h2>
    </div>

    <div class="chapter-list">
      <RouterLink
        v-for="chapter in store.currentChapters"
        :key="chapter.id"
        :to="`/reader/${chapter.id}`"
        class="chapter-item"
      >
        <span class="chapter-number">{{ chapter.number }}</span>
        <div class="chapter-info">
          <h4 class="chapter-title">{{ chapter.title }}</h4>
        </div>
        <span class="chapter-pages" v-if="chapter.read">READ</span>
      </RouterLink>
    </div>

    <div class="load-more">
        <button class="btn-ghost">LOAD MORE ARCHIVES</button>
    </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useLibraryStore } from '../stores/libraryStore'
import { getMangaById } from '../db/manga'
import type { Manga } from '../types'

const route = useRoute()
const store = useLibraryStore()

const mangaId = Number(route.params.id)
const manga = ref<Manga | null>(null)

onMounted(async () => {
  manga.value = await getMangaById(mangaId)
  await store.fetchChapters(mangaId)
})
</script>

<style scoped>
.detail {
  overflow-y: auto;
}

/* Banner */
.banner {
  position: relative;
  height: 380px;
  background-color: #1a1a1a;
  display: flex;
  align-items: flex-end;
}

.banner-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.3) 100%);
}

.banner-content {
  position: relative;
  z-index: 1;
  padding: 40px 48px;
  width: 100%;
}

.banner-tags {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}

.tag-status {
  padding: 4px 10px;
  background-color: #ff6b35;
  color: white;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  border-radius: 3px;
}

.tag-genre {
  font-size: 11px;
  color: #aaaaaa;
  letter-spacing: 1px;
  align-self: center;
}

.banner-title {
  font-size: 48px;
  font-weight: 900;
  margin-bottom: 20px;
  line-height: 1;
}

.banner-meta {
  display: flex;
  gap: 40px;
  margin-bottom: 24px;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-label {
  font-size: 10px;
  color: #555555;
  letter-spacing: 1px;
}

.meta-value {
  font-size: 14px;
  font-weight: 600;
}

.btn-primary {
  padding: 12px 28px;
  background-color: #ff6b35;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: #e55a24;
}

/* Sections */
.section {
  padding: 48px;
}

.section-label {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 2px;
  border-left: 3px solid #ff6b35;
  padding-left: 12px;
  margin-bottom: 20px;
}

/* Narrative */
.narrative-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 48px;
}

.narrative-text {
  font-size: 14px;
  color: #aaaaaa;
  line-height: 1.8;
  margin-bottom: 32px;
}

.narrative-details {
  display: flex;
  gap: 40px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  font-size: 10px;
  color: #555555;
  letter-spacing: 1px;
}

.detail-value {
  font-size: 13px;
  font-weight: 600;
}

/* Stats */
.narrative-right {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-card {
  background-color: #111111;
  border-radius: 8px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.stat-card-sm {
  background-color: #111111;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-icon {
  font-size: 16px;
  color: #ff6b35;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 800;
}

.stat-label {
  font-size: 10px;
  color: #555555;
  letter-spacing: 1px;
}
/* Chapter List */
.section-header {
  margin-bottom: 16px;
}

.chapter-list {
  display: flex;
  flex-direction: column;
  border: 1px solid #1e1e1e;
  border-radius: 8px;
  overflow: hidden;
}

.chapter-item {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 20px 24px;
  border-bottom: 1px solid #1a1a1a;
  cursor: pointer;
  transition: background-color 0.2s;
}

.chapter-item:last-child {
  border-bottom: none;
}

.chapter-item:hover {
  background-color: #111111;
}

.chapter-number {
  font-size: 18px;
  font-weight: 800;
  color: #333333;
  min-width: 40px;
}

.chapter-info {
  flex: 1;
}

.chapter-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}

.chapter-time {
  font-size: 11px;
  color: #555555;
  letter-spacing: 0.5px;
}

.chapter-pages {
  font-size: 11px;
  color: #444444;
  letter-spacing: 1px;
}

.load-more {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

.btn-ghost {
  padding: 12px 32px;
  background-color: transparent;
  color: #aaaaaa;
  border: 1px solid #333333;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-ghost:hover {
  color: white;
  border-color: #ffffff;
}

.chapter-item {
  text-decoration: none;
  color: inherit;
}

</style>