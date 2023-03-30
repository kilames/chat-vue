<template>
  <div class='indexContainer'>
    <Sidebar class="sidebar"></Sidebar>
    <router-view></router-view>
  </div>
</template>

<script setup lang="ts">
import Sidebar from './components/sidebar.vue'

</script>

<style scoped lang='scss'>
.sidebar {
  width: 20%;
  border: 1px solid #ccc;
  margin-right: 10px;
}
.indexContainer {
  display: flex;
  width: 100%;
}
</style>
