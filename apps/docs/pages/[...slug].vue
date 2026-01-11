<template>
  <div class="docs-container">
    <aside class="docs-sidebar">
      <nav class="docs-nav">
        <NuxtLink to="/docs/intro">Introduction</NuxtLink>
        <div class="nav-section">
          <h3>Design</h3>
          <NuxtLink to="/docs/design/overview">Overview</NuxtLink>
          <NuxtLink to="/docs/design/color-palette">Color Palette</NuxtLink>
        </div>
        <div class="nav-section">
          <h3>Architecture</h3>
          <NuxtLink to="/docs/architecture/overview">Overview</NuxtLink>
          <NuxtLink to="/docs/architecture/structure">Structure</NuxtLink>
          <NuxtLink to="/docs/architecture/state-management">State Management</NuxtLink>
        </div>
        <div class="nav-section">
          <h3>Development</h3>
          <NuxtLink to="/docs/development/getting-started">Getting Started</NuxtLink>
        </div>
        <div class="nav-section">
          <h3>Infrastructure</h3>
          <NuxtLink to="/docs/infrastructure/overview">Overview</NuxtLink>
          <NuxtLink to="/docs/infrastructure/terraform">Terraform</NuxtLink>
        </div>
      </nav>
    </aside>
    <main class="docs-content">
      <ContentDoc />
    </main>
  </div>
</template>

<script setup lang="ts">
// This page handles all /docs/* routes
// Nuxt Content automatically generates routes from content/docs/
</script>

<style scoped>
.docs-container {
  display: flex;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  gap: 2rem;
}

.docs-sidebar {
  width: 250px;
  flex-shrink: 0;
}

.docs-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: sticky;
  top: 2rem;
}

.docs-nav a {
  padding: 0.75rem 1rem;
  border-radius: 6px;
  text-decoration: none;
  color: var(--color-text);
  transition: background 0.2s;
}

.docs-nav a:hover,
.docs-nav a.router-link-active {
  background: var(--color-primary, #ff6b35);
  color: white;
}

.nav-section {
  margin-top: 1.5rem;
}

.nav-section h3 {
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #666;
  margin: 0 0 0.5rem 0;
  padding: 0 1rem;
}

.nav-section a {
  padding-left: 1.5rem;
  font-size: 0.9rem;
}

.docs-content {
  flex: 1;
  min-width: 0;
}

@media (max-width: 768px) {
  .docs-container {
    flex-direction: column;
  }

  .docs-sidebar {
    width: 100%;
  }

  .docs-nav {
    position: static;
    flex-direction: row;
    flex-wrap: wrap;
  }
}
</style>
