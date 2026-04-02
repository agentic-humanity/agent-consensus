import { createRouter, createWebHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/consensus',
    },
    {
      path: '/consensus',
      component: () => import('./views/ConsensusView.vue'),
    },
    {
      path: '/consensus/new',
      component: () => import('./views/NewSessionView.vue'),
    },
    {
      path: '/consensus/:id',
      component: () => import('./views/SessionView.vue'),
    },
  ],
})
