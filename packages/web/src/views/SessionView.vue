<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { 
  ArrowLeft, 
  Scale, 
  Users, 
  Clock, 
  DollarSign, 
  MessageSquare,
  CheckCircle2,
  RotateCcw,
  Download
} from 'lucide-vue-next'

const route = useRoute()
const sessionId = route.params.id as string

const session = ref({
  id: sessionId,
  title: 'Design a user authentication system',
  mode: 'proposal',
  status: 'completed',
  totalCost: 0.42,
  currentRound: 3,
  maxRounds: 5,
  createdAt: '2h ago'
})

const rounds = ref([
  {
    roundNum: 1,
    avgScore: 5.5,
    decision: 'continue',
    events: [
      { role: 'proposer', model: 'Claude 3.5 Sonnet', output: 'I propose using JWT tokens with refresh token rotation...', score: null },
      { role: 'reviewer', model: 'GPT-4o', output: 'Good foundation but lacks MFA support. Score: 6/10', score: 6 },
      { role: 'reviewer', model: 'Gemini Pro', output: 'Decent approach but security concerns remain. Score: 5/10', score: 5 }
    ]
  },
  {
    roundNum: 2,
    avgScore: 8.0,
    decision: 'completed',
    events: [
      { role: 'proposer', model: 'Claude 3.5 Sonnet', output: 'Updated proposal: Added TOTP-based MFA, OAuth2 integration...', score: null },
      { role: 'reviewer', model: 'GPT-4o', output: 'Much improved! Comprehensive security measures. Score: 8/10', score: 8 },
      { role: 'reviewer', model: 'Gemini Pro', output: 'Excellent revision. Meets enterprise standards. Score: 8/10', score: 8 }
    ]
  }
])

const getRoleColor = (role: string) => {
  switch (role) {
    case 'proposer': return 'text-violet-600 bg-violet-500/10'
    case 'reviewer': return 'text-amber-600 bg-amber-500/10'
    case 'summarizer': return 'text-emerald-600 bg-emerald-500/10'
    default: return 'text-blue-600 bg-blue-500/10'
  }
}

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'proposer': return Scale
    case 'reviewer': return MessageSquare
    case 'summarizer': return Users
    default: return MessageSquare
  }
}
</script>

<template>
  <div class="min-h-full bg-background">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <router-link to="/consensus" class="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft class="w-4 h-4" />
          Back to Sessions
        </router-link>
        
        <div class="flex items-start justify-between">
          <div>
            <div class="flex items-center gap-3 mb-2">
              <div :class="[
                'w-10 h-10 rounded-xl flex items-center justify-center',
                session.mode === 'proposal' ? 'bg-amber-500/10' : 'bg-blue-500/10'
              ]">
                <Scale v-if="session.mode === 'proposal'" class="w-5 h-5 text-amber-600" />
                <Users v-else class="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 class="text-2xl font-bold text-foreground">{{ session.title }}</h1>
                <div class="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                  <span class="flex items-center gap-1">
                    <Clock class="w-3.5 h-3.5" />
                    {{ session.createdAt }}
                  </span>
                  <span class="capitalize">{{ session.mode }}</span>
                  <span :class="[
                    'px-2 py-0.5 rounded-full text-xs font-medium',
                    session.status === 'completed' ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'
                  ]">
                    {{ session.status }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button class="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
              <RotateCcw class="w-4 h-4" />
              Retry
            </button>
            <button class="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
              <Download class="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        <!-- Stats -->
        <div class="flex items-center gap-6 mt-6 p-4 rounded-xl bg-muted/30 border border-border/50">
          <div class="flex items-center gap-2">
            <DollarSign class="w-4 h-4 text-muted-foreground" />
            <span class="text-sm text-muted-foreground">Total Cost:</span>
            <span class="font-medium">${{ session.totalCost.toFixed(2) }}</span>
          </div>
          <div class="flex items-center gap-2">
            <Clock class="w-4 h-4 text-muted-foreground" />
            <span class="text-sm text-muted-foreground">Rounds:</span>
            <span class="font-medium">{{ session.currentRound }} / {{ session.maxRounds }}</span>
          </div>
        </div>
      </div>

      <!-- Rounds -->
      <div class="space-y-6">
        <div v-for="round in rounds" :key="round.roundNum" class="rounded-2xl bg-muted/30 border border-border/50 overflow-hidden">
          <!-- Round Header -->
          <div class="px-6 py-4 border-b border-border/50 flex items-center justify-between bg-muted/50">
            <div class="flex items-center gap-3">
              <span class="text-sm font-medium">Round {{ round.roundNum }}</span>
              <span v-if="round.avgScore" class="flex items-center gap-1 text-sm">
                <span class="text-muted-foreground">Avg Score:</span>
                <span :class="[
                  'font-semibold',
                  round.avgScore >= 7 ? 'text-green-600' : round.avgScore >= 5 ? 'text-yellow-600' : 'text-red-600'
                ]">
                  {{ round.avgScore }}/10
                </span>
              </span>
            </div>
            <span :class="[
              'px-2 py-1 rounded-full text-xs font-medium',
              round.decision === 'completed' ? 'bg-green-500/10 text-green-600' : 'bg-blue-500/10 text-blue-600'
            ]">
              {{ round.decision === 'completed' ? 'Completed' : 'Continue' }}
            </span>
          </div>

          <!-- Events -->
          <div class="divide-y divide-border/50">
            <div v-for="(event, index) in round.events" :key="index" class="p-6">
              <div class="flex items-start gap-4">
                <div :class="[
                  'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                  getRoleColor(event.role)
                ]">
                  <component :is="getRoleIcon(event.role)" class="w-4 h-4" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-sm font-medium capitalize">{{ event.role }}</span>
                    <span class="text-sm text-muted-foreground">({{ event.model }})</span>
                    <span v-if="event.score" :class="[
                      'ml-auto px-2 py-0.5 rounded-full text-xs font-medium',
                      event.score >= 7 ? 'bg-green-500/10 text-green-600' : 
                      event.score >= 5 ? 'bg-yellow-500/10 text-yellow-600' : 
                      'bg-red-500/10 text-red-600'
                    ]">
                      Score: {{ event.score }}/10
                    </span>
                  </div>
                  <p class="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{{ event.output }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Final Result -->
      <div class="mt-8 p-6 rounded-2xl bg-gradient-to-br from-violet-500/5 to-purple-500/5 border border-violet-500/20">
        <div class="flex items-center gap-2 mb-3">
          <CheckCircle2 class="w-5 h-5 text-violet-600" />
          <h3 class="font-semibold text-foreground">Final Result</h3>
        </div>
        <p class="text-sm text-muted-foreground leading-relaxed">
          The proposal achieved an average score of 8.0/10 across reviewers after 2 rounds of iteration. 
          Key improvements included TOTP-based MFA, OAuth2 integration, and rate limiting mechanisms. 
          The solution is now ready for implementation.
        </p>
      </div>
    </div>
  </div>
</template>
