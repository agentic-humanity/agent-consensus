<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  Scale, 
  Users, 
  Plus, 
  Trash2, 
  Play, 
  DollarSign,
  RotateCcw,
  ChevronDown,
  Sparkles
} from 'lucide-vue-next'

const mode = ref<'proposal' | 'roundtable'>('proposal')
const topic = ref('')
const budget = ref(1.0)
const maxRounds = ref(5)
const threshold = ref(7)

// 示例模型数据
const availableModels = [
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', inputPrice: 3, outputPrice: 15, contextLength: 200000 },
  { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'OpenAI', inputPrice: 5, outputPrice: 15, contextLength: 128000 },
  { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5', provider: 'Google', inputPrice: 1.25, outputPrice: 5, contextLength: 1000000 },
  { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B', provider: 'Meta', inputPrice: 0.52, outputPrice: 0.75, contextLength: 128000 },
  { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', provider: 'Anthropic', inputPrice: 0.25, outputPrice: 1.25, contextLength: 200000 },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', inputPrice: 0.15, outputPrice: 0.6, contextLength: 128000 },
]

const selectedProposer = ref(availableModels[0].id)
const selectedReviewers = ref<string[]>([availableModels[1].id, availableModels[2].id])
const selectedParticipants = ref<string[]>([availableModels[0].id, availableModels[1].id, availableModels[2].id])
const selectedSummarizer = ref(availableModels[0].id)

const groupedModels = computed(() => {
  const groups: Record<string, typeof availableModels> = {}
  availableModels.forEach(model => {
    if (!groups[model.provider]) {
      groups[model.provider] = []
    }
    groups[model.provider].push(model)
  })
  return groups
})

const estimatedCost = computed(() => {
  if (mode.value === 'proposal') {
    // Proposal mode: proposer + reviewers per round
    const proposer = availableModels.find(m => m.id === selectedProposer.value)
    const reviewers = selectedReviewers.value.map(id => availableModels.find(m => m.id === id))
    const avgPrice = reviewers.reduce((sum, r) => sum + (r?.inputPrice || 0), 0) / reviewers.length
    return ((proposer?.inputPrice || 0) + avgPrice) * maxRounds.value / 1000
  } else {
    // Roundtable mode: participants + summarizer
    const participants = selectedParticipants.value.map(id => availableModels.find(m => m.id === id))
    const summarizer = availableModels.find(m => m.id === selectedSummarizer.value)
    const avgPrice = participants.reduce((sum, p) => sum + (p?.inputPrice || 0), 0) / participants.length
    return (avgPrice + (summarizer?.inputPrice || 0)) / 1000
  }
})

function toggleReviewer(modelId: string) {
  const index = selectedReviewers.value.indexOf(modelId)
  if (index > -1) {
    selectedReviewers.value.splice(index, 1)
  } else {
    selectedReviewers.value.push(modelId)
  }
}

function toggleParticipant(modelId: string) {
  const index = selectedParticipants.value.indexOf(modelId)
  if (index > -1) {
    selectedParticipants.value.splice(index, 1)
  } else {
    selectedParticipants.value.push(modelId)
  }
}

function formatPrice(price: number) {
  return price < 1 ? `$${(price * 100).toFixed(2)}¢` : `$${price}`
}
</script>

<template>
  <div class="min-h-full bg-background">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Sparkles class="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 class="text-2xl font-bold text-foreground">New Session</h1>
            <p class="text-sm text-muted-foreground">Run multiple models side-by-side and fuse into the best result</p>
          </div>
        </div>
      </div>

      <!-- Mode Tabs -->
      <div class="flex gap-2 mb-8 p-1 bg-muted/50 rounded-xl w-fit">
        <button
          @click="mode = 'proposal'"
          :class="[
            'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
            mode === 'proposal' 
              ? 'bg-background text-foreground shadow-sm ring-1 ring-border' 
              : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
          ]"
        >
          <Scale class="w-4 h-4" />
          <span>Proposal-Review</span>
          <span v-if="mode === 'proposal'" class="ml-1 text-xs text-violet-500 font-semibold">Scoring</span>
        </button>
        <button
          @click="mode = 'roundtable'"
          :class="[
            'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
            mode === 'roundtable' 
              ? 'bg-background text-foreground shadow-sm ring-1 ring-border' 
              : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
          ]"
        >
          <Users class="w-4 h-4" />
          <span>Roundtable</span>
          <span v-if="mode === 'roundtable'" class="ml-1 text-xs text-violet-500 font-semibold">Summarize</span>
        </button>
      </div>

      <!-- Topic Input -->
      <div class="mb-8">
        <label class="block text-sm font-medium text-foreground mb-2">Topic / Question</label>
        <textarea
          v-model="topic"
          placeholder="Enter a topic for discussion, e.g., 'Design a user authentication system with multi-factor authentication'"
          class="w-full min-h-[120px] p-4 rounded-xl bg-muted/30 border border-border/50 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50 transition-all resize-y"
        />
      </div>

      <!-- Model Selection -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-medium text-foreground">
            {{ mode === 'proposal' ? 'Models' : 'Participants' }}
          </h3>
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            <DollarSign class="w-4 h-4" />
            <span>Est. cost: ${{ estimatedCost.toFixed(3) }}</span>
          </div>
        </div>

        <!-- Proposal Mode -->
        <div v-if="mode === 'proposal'" class="space-y-6">
          <!-- Proposer -->
          <div>
            <label class="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Proposer</label>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <button
                v-for="model in availableModels"
                :key="model.id"
                @click="selectedProposer = model.id"
                :class="[
                  'relative p-4 rounded-xl border-2 text-left transition-all duration-200',
                  selectedProposer === model.id
                    ? 'border-violet-500 bg-violet-500/5'
                    : 'border-border/50 bg-muted/30 hover:border-border hover:bg-muted/50'
                ]"
              >
                <div class="flex items-start justify-between">
                  <div>
                    <div class="font-medium text-sm text-foreground">{{ model.name }}</div>
                    <div class="text-xs text-muted-foreground mt-0.5">{{ model.provider }}</div>
                  </div>
                  <div v-if="selectedProposer === model.id" class="w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center">
                    <Scale class="w-3 h-3 text-white" />
                  </div>
                </div>
                <div class="mt-3 flex items-center gap-2 text-xs">
                  <span class="text-muted-foreground">{{ formatPrice(model.inputPrice) }} / {{ formatPrice(model.outputPrice) }}</span>
                  <span class="text-muted-foreground/50">·</span>
                  <span class="text-muted-foreground">{{ model.contextLength.toLocaleString() }} ctx</span>
                </div>
              </button>
            </div>
          </div>

          <!-- Reviewers -->
          <div>
            <label class="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Reviewers</label>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <button
                v-for="model in availableModels"
                :key="model.id"
                @click="toggleReviewer(model.id)"
                :class="[
                  'relative p-4 rounded-xl border-2 text-left transition-all duration-200',
                  selectedReviewers.includes(model.id)
                    ? 'border-amber-500 bg-amber-500/5'
                    : 'border-border/50 bg-muted/30 hover:border-border hover:bg-muted/50'
                ]"
              >
                <div class="flex items-start justify-between">
                  <div>
                    <div class="font-medium text-sm text-foreground">{{ model.name }}</div>
                    <div class="text-xs text-muted-foreground mt-0.5">{{ model.provider }}</div>
                  </div>
                  <div v-if="selectedReviewers.includes(model.id)" class="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                    <svg class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div class="mt-3 flex items-center gap-2 text-xs">
                  <span class="text-muted-foreground">{{ formatPrice(model.inputPrice) }} / {{ formatPrice(model.outputPrice) }}</span>
                  <span class="text-muted-foreground/50">·</span>
                  <span class="text-muted-foreground">{{ model.contextLength.toLocaleString() }} ctx</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- Roundtable Mode -->
        <div v-else class="space-y-6">
          <!-- Participants -->
          <div>
            <label class="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Participants</label>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <button
                v-for="model in availableModels"
                :key="model.id"
                @click="toggleParticipant(model.id)"
                :class="[
                  'relative p-4 rounded-xl border-2 text-left transition-all duration-200',
                  selectedParticipants.includes(model.id)
                    ? 'border-blue-500 bg-blue-500/5'
                    : 'border-border/50 bg-muted/30 hover:border-border hover:bg-muted/50'
                ]"
              >
                <div class="flex items-start justify-between">
                  <div>
                    <div class="font-medium text-sm text-foreground">{{ model.name }}</div>
                    <div class="text-xs text-muted-foreground mt-0.5">{{ model.provider }}</div>
                  </div>
                  <div v-if="selectedParticipants.includes(model.id)" class="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                    <svg class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div class="mt-3 flex items-center gap-2 text-xs">
                  <span class="text-muted-foreground">{{ formatPrice(model.inputPrice) }} / {{ formatPrice(model.outputPrice) }}</span>
                  <span class="text-muted-foreground/50">·</span>
                  <span class="text-muted-foreground">{{ model.contextLength.toLocaleString() }} ctx</span>
                </div>
              </button>
            </div>
          </div>

          <!-- Summarizer -->
          <div>
            <label class="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Summarizer</label>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <button
                v-for="model in availableModels"
                :key="model.id"
                @click="selectedSummarizer = model.id"
                :class="[
                  'relative p-4 rounded-xl border-2 text-left transition-all duration-200',
                  selectedSummarizer === model.id
                    ? 'border-emerald-500 bg-emerald-500/5'
                    : 'border-border/50 bg-muted/30 hover:border-border hover:bg-muted/50'
                ]"
              >
                <div class="flex items-start justify-between">
                  <div>
                    <div class="font-medium text-sm text-foreground">{{ model.name }}</div>
                    <div class="text-xs text-muted-foreground mt-0.5">{{ model.provider }}</div>
                  </div>
                  <div v-if="selectedSummarizer === model.id" class="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                    <Users class="w-3 h-3 text-white" />
                  </div>
                </div>
                <div class="mt-3 flex items-center gap-2 text-xs">
                  <span class="text-muted-foreground">{{ formatPrice(model.inputPrice) }} / {{ formatPrice(model.outputPrice) }}</span>
                  <span class="text-muted-foreground/50">·</span>
                  <span class="text-muted-foreground">{{ model.contextLength.toLocaleString() }} ctx</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Configuration -->
      <div class="mb-8 p-6 rounded-2xl bg-muted/30 border border-border/50">
        <h3 class="text-sm font-medium text-foreground mb-4">Configuration</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label class="block text-xs text-muted-foreground mb-2">Budget Limit ($)</label>
            <div class="flex items-center gap-2">
              <DollarSign class="w-4 h-4 text-muted-foreground" />
              <input
                v-model.number="budget"
                type="number"
                step="0.1"
                min="0.1"
                class="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              />
            </div>
          </div>
          <div>
            <label class="block text-xs text-muted-foreground mb-2">Max Rounds</label>
            <input
              v-model.number="maxRounds"
              type="number"
              min="1"
              max="10"
              class="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            />
          </div>
          <div v-if="mode === 'proposal'">
            <label class="block text-xs text-muted-foreground mb-2">Score Threshold (1-10)</label>
            <input
              v-model.number="threshold"
              type="number"
              min="1"
              max="10"
              class="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            />
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-between">
        <button class="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <RotateCcw class="w-4 h-4" />
          Reset
        </button>
        <button
          :disabled="!topic.trim()"
          class="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all shadow-lg shadow-violet-600/20 hover:shadow-violet-600/30"
        >
          <Play class="w-4 h-4" />
          Start Session
        </button>
      </div>
    </div>
  </div>
</template>