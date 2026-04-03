<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  Scale, 
  Users, 
  Plus, 
  Trash2, 
  Play, 
  ChevronDown,
  Sparkles,
  Loader2
} from 'lucide-vue-next'
import { useConsensusStore } from '../stores/consensus'

const route = useRoute()
const router = useRouter()
const store = useConsensusStore()

const mode = ref<'proposal' | 'roundtable'>('proposal')
const topic = ref('')
const budget = ref(1.0)
const maxRounds = ref(5)
const threshold = ref(7)
const isStarting = ref(false)

// Model selections
const selectedProposer = ref('')
const selectedReviewers = ref<string[]>([])
const selectedParticipants = ref<string[]>([])
const selectedSummarizer = ref('')
const selectedOtherModel = ref('')

onMounted(async () => {
  await store.fetchModels()
  
  // Set defaults from featured models
  if (store.featuredModels.length > 0) {
    selectedProposer.value = store.featuredModels[0]?.id || ''
    selectedSummarizer.value = store.featuredModels[0]?.id || ''
    selectedReviewers.value = store.featuredModels.slice(1, 3).map(m => m.id).filter(Boolean)
    selectedParticipants.value = store.featuredModels.slice(0, 3).map(m => m.id).filter(Boolean)
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

function addOtherModel() {
  if (!selectedOtherModel.value) return
  
  if (mode.value === 'proposal') {
    if (!selectedReviewers.value.includes(selectedOtherModel.value)) {
      selectedReviewers.value.push(selectedOtherModel.value)
    }
  } else {
    if (!selectedParticipants.value.includes(selectedOtherModel.value)) {
      selectedParticipants.value.push(selectedOtherModel.value)
    }
  }
  selectedOtherModel.value = ''
}

function formatPrice(price: number) {
  return price < 1 ? `$${(price * 100).toFixed(2)}¢` : `$${price}`
}

async function startSession() {
  if (isStarting.value) return
  
  try {
    isStarting.value = true
    
    const config = {
      budgetLimit: budget.value,
      maxRounds: maxRounds.value,
      threshold: mode.value === 'proposal' ? threshold.value : undefined,
      proposerModel: mode.value === 'proposal' ? selectedProposer.value : undefined,
      reviewerModels: mode.value === 'proposal' ? selectedReviewers.value : undefined,
      participantModels: mode.value === 'roundtable' ? selectedParticipants.value : undefined,
      summarizerModel: mode.value === 'roundtable' ? selectedSummarizer.value : undefined,
    }
    
    // Create session
    const session = await store.createSession({
      mode: mode.value,
      topic: topic.value,
      config,
    })
    
    // Start the discussion
    const response = await fetch(`/api/sessions/${session.id}/start`, {
      method: 'POST',
    })
    
    if (!response.ok) {
      throw new Error('Failed to start session')
    }
    
    // Navigate to session detail
    router.push(`/consensus/${session.id}`)
  } catch (error) {
    alert('Failed to start session: ' + (error instanceof Error ? error.message : 'Unknown error'))
  } finally {
    isStarting.value = false
  }
}
</script>