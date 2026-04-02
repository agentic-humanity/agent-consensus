<script setup lang="ts">
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-semibold">Sessions</h2>
      <router-link
        to="/consensus/new"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        + New
      </router-link>
    </div>
    <div class="text-gray-500">No sessions yet. Create one to get started.</div>
  </div>
</template>
