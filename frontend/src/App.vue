<template>
  <div>
    <header class="navbar">
      <div class="container">
        <h1>TP02 Dashboard</h1>
        <nav>
          <router-link to="/receipts">Receipts</router-link>
          <router-link to="/orders">Orders</router-link>
        </nav>
      </div>
    </header>
    <main class="container">
      <router-view />
    </main>
  </div>
</template>
