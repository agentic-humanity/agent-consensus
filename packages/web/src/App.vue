<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Scale, Plus, MessageSquare, Clock, Settings } from 'lucide-vue-next'

const route = useRoute()
const sessions = ref([
  { id: '1', title: '设计认证系统', mode: 'proposal', status: 'completed', time: '2h ago' },
  { id: '2', title: 'API 架构讨论', mode: 'roundtable', status: 'running', time: '5m ago' },
])

const isDark = ref(false)

onMounted(() => {
  isDark.value = document.documentElement.classList.contains('dark')
})
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <!-- Header -->
    <header class="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="mx-auto w-full h-14 px-4 flex items-center">
        <div class="relative flex w-full items-center">
          <!-- Logo -->
          <router-link to="/" class="flex items-center gap-2">
            <Scale class="w-5 h-5 text-primary" />
            <span class="font-semibold text-lg">Consensus</span>
          </router-link>
          
          <!-- Nav Links -->
          <nav class="hidden md:flex ml-6 gap-1">
            <router-link to="/consensus/new" 
              :class="['px-3 py-1.5 rounded-md text-sm font-medium transition-colors', 
                route.path === '/consensus/new' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground']">
              New Session
            </router-link>
            <router-link to="/consensus"
              :class="['px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                route.path === '/consensus' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground']">
              History
            </router-link>
          </nav>

          <!-- Right Actions -->
          <div class="ml-auto flex items-center gap-2">
            <button class="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <Settings class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Layout -->
    <div class="flex h-[calc(100vh-3.5rem)]">
      <!-- Sidebar -->
      <aside class="w-64 border-r bg-muted/30 hidden md:flex flex-col">
        <div class="p-4">
          <router-link to="/consensus/new"
            class="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md px-4 text-sm font-medium transition-colors">
            <Plus class="w-4 h-4" />
            New Session
          </router-link>
        </div>
        
        <div class="flex-1 overflow-auto px-3">
          <div class="text-xs font-medium text-muted-foreground mb-2 px-2">Recent Sessions</div>
          <div class="space-y-1">
            <router-link v-for="session in sessions" :key="session.id"
              :to="`/consensus/${session.id}`"
              :class="['flex items-start gap-3 p-2.5 rounded-lg text-sm transition-colors hover:bg-accent group',
                route.params.id === session.id ? 'bg-accent' : '']">
              <div class="mt-0.5">
                <MessageSquare v-if="session.mode === 'roundtable'" class="w-4 h-4 text-blue-500" />
                <Scale v-else class="w-4 h-4 text-amber-500" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="font-medium truncate">{{ session.title }}</div>
                <div class="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  <span :class="['w-1.5 h-1.5 rounded-full', session.status === 'running' ? 'bg-green-500 animate-pulse' : 'bg-gray-400']"></span>
                  <span class="capitalize">{{ session.mode }}</span>
                  <span>·</span>
                  <Clock class="w-3 h-3" />
                  <span>{{ session.time }}</span>
                </div>
              </div>
            </router-link>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 overflow-auto">
        <router-view />
      </main>
    </div>
  </div>
</template>
