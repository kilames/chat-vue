<template>
  <div class='sidebar'>
    <div class="top">当前会话</div>
    <div class="bottom">
      <el-button @click="login">登录</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import router from '../../router';

// 登录操作
function login() {
  router.push('/login')
}
</script>

<style scoped lang='scss'>
.sidebar {
  position: relative;
}
.top {
  text-align: center;
}
.bottom  {
  text-align: center;
  position: absolute;
  bottom: 20px;
  right: 30px;
  cursor: pointer;
}
</style>
