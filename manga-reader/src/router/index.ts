import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/manga/:id', component: () => import('../views/MangaDetailView.vue') },
    { path: '/reader/:chapterId', component: () => import('../views/ReaderView.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ]
})

export default router