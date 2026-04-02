<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
const sessionId = route.params.id as string
</script>

<template>
  <div>
    <router-link to="/consensus" class="text-blue-600 hover:underline mb-4 block">&larr; Back</router-link>
    <h2 class="text-2xl font-semibold mb-6">Session {{ sessionId }}</h2>
    <p class="text-gray-500">Detail view coming soon...</p>
  </div>
</template>
