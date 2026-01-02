<template>
  <div class="docs-home">
    <div class="docs-hero">
      <h1>Riddle Rush Documentation</h1>
      <p>Complete guide to design, architecture, development, and infrastructure</p>
    </div>
    <div class="docs-grid">
      <NuxtLink
        to="/docs/intro"
        class="docs-card"
      >
        <h2>Introduction</h2>
        <p>Get started with Riddle Rush</p>
      </NuxtLink>
      <NuxtLink
        to="/docs/design/overview"
        class="docs-card"
      >
        <h2>Design</h2>
        <p>Design system, colors, typography</p>
      </NuxtLink>
      <NuxtLink
        to="/docs/architecture/overview"
        class="docs-card"
      >
        <h2>Architecture</h2>
        <p>System design and patterns</p>
      </NuxtLink>
      <NuxtLink
        to="/docs/development/getting-started"
        class="docs-card"
      >
        <h2>Development</h2>
        <p>Development guide and patterns</p>
      </NuxtLink>
      <NuxtLink
        to="/docs/infrastructure/overview"
        class="docs-card"
      >
        <h2>Infrastructure</h2>
        <p>Terraform and AWS setup</p>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
// Documentation home page
</script>

<style scoped>
.docs-home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.docs-hero {
  text-align: center;
  margin-bottom: 3rem;
}

.docs-hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #FF6B35 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.docs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.docs-card {
  padding: 2rem;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s;
  background: white;
}

.docs-card:hover {
  border-color: #FF6B35;
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.docs-card h2 {
  margin: 0 0 0.5rem 0;
  color: #FF6B35;
}

.docs-card p {
  margin: 0;
  color: #666;
}
</style>
