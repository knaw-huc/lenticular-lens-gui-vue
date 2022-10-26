<template>
  <div v-if="inline" class="spinner-border spinner-border-sm text-secondary" role="status">
    <span class="fa-sr-only">Loading...</span>
  </div>

  <div v-else class="d-flex justify-content-center">
    <div class="spinner-border text-secondary" role="status">
      <span class="fa-sr-only">Loading...</span>
    </div>
  </div>
</template>

<script>
    export default {
        props: {
            inline: false,
        },
    }
</script>
