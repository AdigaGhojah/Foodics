<template>
  <div class="app">
    <header class="header">
      <h1>My App</h1>
      <slot name="test">something</slot>
    </header>

    <main class="content">
      <slot />
    </main>

    <footer class="footer">© 2025 My App</footer>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr auto;
}
.header {
  padding: 16px;
  background: #fff;
  color: #000;
}
.content {
  padding: 24px;
  background-color: #eff3f6;
}
.footer {
  padding: 12px;
  background: #f2f2f2;
  text-align: center;
}
</style>
