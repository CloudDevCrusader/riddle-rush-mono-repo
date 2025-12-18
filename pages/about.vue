<template>
  <div class="about">
    <h1>About Guess Game</h1>
    <p class="creators">
      Created by Tobias Wirl & Markus Wagner
    </p>

    <div class="info">
      <h2>How It Works</h2>
      <p>
        Guess Game uses Wikipedia's PetScan service to fetch real categories and
        challenges you to find words that match the category and start with a
        specific letter.
      </p>

      <h2>Progressive Web App</h2>
      <p>
        This application is a fully-featured PWA with offline support, installable
        on your device, and uses IndexedDB for local data storage.
      </p>

      <h2>Technologies Used</h2>
      <ul>
        <li>Nuxt 3</li>
        <li>Vue 3 Composition API</li>
        <li>Pinia for state management</li>
        <li>IndexedDB for local storage</li>
        <li>Vite PWA for Progressive Web App features</li>
        <li>TypeScript</li>
        <li>Playwright for e2e testing</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Guess Game - About',
  meta: [
    {
      name: 'description',
      content: 'Learn about the Guess Game PWA',
    },
  ],
})
</script>

<style scoped>
.about {
  padding: 40px 20px;
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  font-size: 2.5em;
  margin-bottom: 20px;
  color: #42b983;
}

.creators {
  font-size: 1.3em;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 40px;
}

.info {
  text-align: left;
  line-height: 1.8;
}

.info h2 {
  color: #42b983;
  margin-top: 30px;
  margin-bottom: 15px;
}

.info p {
  font-size: 1.1em;
  margin-bottom: 20px;
  color: #555;
}

.info ul {
  list-style: none;
  padding: 0;
}

.info li {
  padding: 10px;
  margin: 8px 0;
  background-color: #f5f5f5;
  border-left: 4px solid #42b983;
  border-radius: 4px;
}
</style>
