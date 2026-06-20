<template>
  <div class="home">
    <!-- Hero -->
    <section class="hero">
      <div class="hero-bg" />
        <div class="hero-content">
            <span class="hero-label">MASTERPIECE SELECTION</span>
            <h1 class="hero-title">VAGABOND</h1>
            <p class="hero-desc">
                A fictionalized account of the life of Japanese swordsman
                Musashi Miyamoto, based on Eiji Yoshikawa's novel Musashi.
            </p>
            <div class="hero-actions">
                <button class="btn-primary">READ VOLUME 01</button>
                <button class="btn-ghost">ADD TO LIBRARY</button>
                <ImportManga />
            </div>
        </div>
    </section>
        <!-- Trending Now -->
    <section class="section">
    <div class="section-header">
        <div>
        <h2 class="section-title">Trending Now</h2>
        <p class="section-sub">The most discussed works in the gallery this week.</p>
        </div>
        <span class="section-link">VIEW ARCHIVE</span>
    </div>

    <div class="trending-grid">
        <div class="trending-main">
        <div class="trending-main-bg" />
        <div class="trending-main-info">
            <span class="badge">ONGOING</span>
            <h3>BERSERK</h3>
            <p>Kentaro Miura / Dark Fantasy</p>
        </div>
        </div>
        <div class="trending-side">
        <div class="trending-side-item">
            <div class="trending-side-cover" />
            <div>
            <span class="badge-small">HOT THIS MONTH</span>
            <h4>CHAINSAW MAN</h4>
            <p class="author">TATSUKI FUJIMOTO</p>
            </div>
        </div>
        <div class="trending-side-item">
            <div class="trending-side-cover" />
            <div>
            <span class="badge-small">LEGENDARY</span>
            <h4>VINLAND SAGA</h4>
            <p class="author">MAKOTO YUKIMURA</p>
            </div>
        </div>
        </div>
    </div>
    </section>
        <!-- Recently Updated -->
    <section class="section">
    <div class="section-header">
        <div>
        <h2 class="section-title">Recently Updated</h2>
        </div>
    </div>

    <div class="recent-grid">
        <div class="recent-item" v-for="item in recentItems" :key="item.title">
        <div class="recent-cover" />
        <h4 class="recent-title">{{ item.title }}</h4>
        <p class="recent-time">{{ item.time }}</p>
        </div>
    </div>
    </section>
    <!-- New Arrivals -->
    <section class="section">
    <div class="section-header">
        <h2 class="section-title">New Arrivals</h2>
    </div>

    <div class="arrivals-grid">
        <div class="arrival-card">
        <div class="arrival-bg" />
        <div class="arrival-content">
            <h3 class="arrival-title">CYBERNETIC SOUL</h3>
            <p class="arrival-desc">Explore the neon-drenched streets of Neo-Tokyo in this groundbreaking new sci-fi epic.</p>
            <button class="btn-primary">BEGIN THE JOURNEY</button>
        </div>
        </div>
        <div class="arrival-card">
        <div class="arrival-bg" />
        <div class="arrival-content">
            <h3 class="arrival-title">SILENT GARDEN</h3>
            <p class="arrival-desc">A meditative journey through feudal Japan, focusing on the quiet moments between great historical battles.</p>
            <button class="btn-primary">EXPLORE GALLERY</button>
        </div>
        </div>
    </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useLibraryStore } from '../stores/libraryStore'
import ImportManga from '../components/library/ImportManga.vue'

const store = useLibraryStore()

onMounted(async () => {
  await store.fetchMangas()
})

const recentItems = [
  { title: 'OYASUMI PUNPUN', time: '3 HOURS AGO' },
  { title: 'MONSTER', time: '4 HOURS AGO' },
  { title: '20TH CENTURY B...', time: '6 HOURS AGO' },
  { title: 'SLAM DUNK', time: 'YESTERDAY' },
  { title: 'STEELBALL RUN', time: '1 DAY AGO' },
  { title: 'KINGDOM', time: '2 DAYS AGO' },
]
</script>

<style scoped>
.home {
  overflow-y: auto;
}

/* Hero */
.hero {
  position: relative;
  height: 500px;
  background-color: #1a1a1a;
  display: flex;
  align-items: flex-end;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, rgba(0,0,0,0.85) 40%, transparent 100%);
}

.hero-content {
  position: relative;
  z-index: 1;
  padding: 48px;
  max-width: 520px;
}

.hero-label {
  display: block;
  font-size: 11px;
  letter-spacing: 2px;
  color: #ff6b35;
  border-left: 3px solid #ff6b35;
  padding-left: 10px;
  margin-bottom: 16px;
}

.hero-title {
  font-size: 52px;
  font-weight: 900;
  letter-spacing: 2px;
  margin-bottom: 16px;
  line-height: 1;
}

.hero-desc {
  font-size: 14px;
  color: #aaaaaa;
  line-height: 1.6;
  margin-bottom: 28px;
}

.hero-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

.btn-primary {
  padding: 12px 24px;
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

.btn-ghost {
  padding: 12px 24px;
  background-color: transparent;
  color: white;
  border: 1px solid #444444;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.btn-ghost:hover {
  border-color: #ffffff;
}
/* Sections */
.section {
  padding: 48px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.section-title {
  font-size: 22px;
  font-weight: 700;
}

.section-sub {
  font-size: 13px;
  color: #666666;
  margin-top: 4px;
}

.section-link {
  font-size: 11px;
  color: #ff6b35;
  letter-spacing: 1px;
  cursor: pointer;
}

/* Trending */
.trending-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.trending-main {
  position: relative;
  height: 220px;
  background-color: #1a1a1a;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
}

.trending-main-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 60%);
}

.trending-main-info {
  position: relative;
  z-index: 1;
  padding: 20px;
}

.trending-main-info h3 {
  font-size: 20px;
  font-weight: 800;
  margin: 6px 0 4px;
}

.trending-main-info p {
  font-size: 12px;
  color: #888888;
}

.trending-side {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.trending-side-item {
  display: flex;
  gap: 16px;
  align-items: center;
  background-color: #111111;
  border-radius: 8px;
  padding: 16px;
  flex: 1;
}

.trending-side-cover {
  width: 60px;
  height: 80px;
  background-color: #2a2a2a;
  border-radius: 4px;
  flex-shrink: 0;
}

.trending-side-item h4 {
  font-size: 14px;
  font-weight: 700;
  margin: 4px 0;
}

.badge {
  display: inline-block;
  padding: 3px 8px;
  background-color: #ff6b35;
  color: white;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  border-radius: 3px;
}

.badge-small {
  font-size: 9px;
  color: #ff6b35;
  letter-spacing: 1px;
}

.author {
  font-size: 11px;
  color: #666666;
}

/* Recently Updated */
.recent-grid {
  display: flex;
  gap: 16px;
}

.recent-item {
  flex: 1;
  cursor: pointer;
}

.recent-cover {
  width: 100%;
  aspect-ratio: 3/4;
  background-color: #1a1a1a;
  border-radius: 6px;
  margin-bottom: 10px;
  transition: opacity 0.2s;
}

.recent-item:hover .recent-cover {
  opacity: 0.8;
}

.recent-title {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.recent-time {
  font-size: 10px;
  color: #555555;
}

/* New Arrivals */
.arrivals-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.arrival-card {
  position: relative;
  height: 200px;
  background-color: #1a1a1a;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
}

.arrival-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.3) 100%);
}

.arrival-content {
  position: relative;
  z-index: 1;
  padding: 20px;
  width: 100%;
}

.arrival-title {
  font-size: 16px;
  font-weight: 900;
  letter-spacing: 1px;
  margin-bottom: 8px;
}

.arrival-desc {
  font-size: 12px;
  color: #aaaaaa;
  line-height: 1.5;
  margin-bottom: 16px;
}

</style>