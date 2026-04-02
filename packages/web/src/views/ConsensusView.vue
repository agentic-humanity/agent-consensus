<script setup lang="ts">
import { ref } from 'vue'
import { Scale, Users, Plus, Clock, ArrowRight } from 'lucide-vue-next'

const sessions = ref([
  { 
    id: '1', 
    title: 'Design a user authentication system', 
    mode: 'proposal', 
    status: 'completed', 
    rounds: 3,
    cost: 0.42,
    models: ['Claude 3.5 Sonnet', 'GPT-4o', 'Gemini Pro'],
    time: '2h ago' 
  },
  { 
    id: '2', 
    title: 'Microservices vs Monolithic architecture', 
    mode: 'roundtable', 
    status: 'completed', 
    rounds: 1,
    cost: 0.18,
    models: ['Claude 3.5', 'GPT-4o', 'Llama 3.1', 'Gemini'],
    time: '15m ago' 
  },
])
</script>

<template>
  <div class="min-h-full bg-background">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-foreground mb-2">Sessions</h1>
        <p class="text-muted-foreground">Manage and review your multi-model discussions</p>
      </div>

      <!-- Empty State -->
      <div v-if="sessions.length === 0" class="flex flex-col items-center justify-center py-20 text-center">
        <div class="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <Scale class="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 class="text-lg font-medium text-foreground mb-2">No sessions yet</h3>
        <p class="text-muted-foreground max-w-sm mb-6">Create your first session to start a multi-model discussion</p>
        <router-link to="/consensus/new" class="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors">
          <Plus class="w-4 h-4" />
          New Session
        </router-link>
      </div>

      <!-- Sessions List -->
      <div v-else class="space-y-4">
        <router-link
          v-for="session in sessions"
          :key="session.id"
          :to="`/consensus/${session.id}`"
          class="block p-6 rounded-2xl bg-muted/30 border border-border/50 hover:border-violet-500/30 hover:bg-muted/50 transition-all group"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-3 mb-2">
                <div :class="[
                  'w-8 h-8 rounded-lg flex items-center justify-center',
                  session.mode === 'proposal' ? 'bg-amber-500/10' : 'bg-blue-500/10'
                ]">
                  <Scale v-if="session.mode === 'proposal'" class="w-4 h-4 text-amber-600" />
                  <Users v-else class="w-4 h-4 text-blue-600" />
                </div>
                <h3 class="font-semibold text-foreground group-hover:text-violet-600 transition-colors">{{ session.title }}</h3>
                <span :class="[
                  'px-2 py-0.5 rounded-full text-xs font-medium',
                  session.status === 'completed' ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'
                ]">
                  {{ session.status }}
                </span>
              </div>
              
              <div class="flex items-center gap-4 text-sm text-muted-foreground">
                <span class="flex items-center gap-1">
                  <Clock class="w-3.5 h-3.5" />
                  {{ session.time }}
                </span>
                <span>{{ session.rounds }} {{ session.rounds === 1 ? 'round' : 'rounds' }}</span>
                <span>${{ session.cost.toFixed(2) }}</span>
                <span class="capitalize">{{ session.mode }}</span>
              </div>

              <div class="mt-3 flex items-center gap-2">
                <span class="text-xs text-muted-foreground">Models:</span>
                <span class="text-xs text-foreground">{{ session.models.join(', ') }}</span>
              </div>
            </div>

            <ArrowRight class="w-5 h-5 text-muted-foreground group-hover:text-violet-600 transition-colors" />
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>