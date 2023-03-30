<template>
  <div class="chat-box">
    <div class="chat-dialog">
      <div v-for="(item, idx) in list" :key="idx">
        <div v-if="item.type === 'answer'" class="dialog-answer">
          <img class="icon-ai" src="//www.xiaoxigo.top/xiaoxigo.jpeg" />
          <v-md-preview class="dialog-box" :text="item.text"></v-md-preview>
          <!-- <div >{{ item.text }}</div> -->
        </div>
        <div v-else class="dialog-question">
          <div class="dialog-box">{{ item.text }}</div>
          <img class="icon-user" src="../assets/images/icon-ai.jpeg" />
        </div>
      </div>
    </div>
    <div class="chat-input-box">
      <div class="chat-input"><input type="text" v-model="qText" /></div>
      <div class="send-btn" @click="sendHandel">发送</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';

const list:Array<{type:string,text:string, id:string}> = reactive([
  {
    type:'answer',
    text:'我是chatGPT人工智能，我们可以交流一下吗～',
    id: ''
  }
])
const qText = ref('')




// 消息相关操作
function uuid() {
  var s:Array<string> = [];
  var hexDigits = "0123456789abcdef";
  for (var i = 0; i < 36; i++) {
      s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((Number(s[19]) & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = "-";

  var uuid = s.join("");
  return uuid;
}
let sse:EventSource
let text = ref('');
const sendHandel = function() {
  if(!qText.value) {
    return
  }
  const baseUrl = 'https://www.xiaoxigo.top/openapi/chat/stream/chat'
  const SSE =  new EventSource(`${baseUrl}?message=${qText.value}`);
  const uuid_str = uuid()

  SSE.onopen = (event:any) => {
    console.log("onopen", event.target, sse);
    sse = event.target
    // 把问题添加到消息队列里
    list.push({
      type:'question',
      text: qText.value,
      id: uuid_str
    })
    text.value = ''
    qText.value = ''
  }


  SSE.onerror = (event:any) => {
    console.log('错误了', event)
    alert("服务异常请重试并联系开发者！")
    if (event.readyState === EventSource.CLOSED) {
        console.log('connection is closed');
    } else {
        console.log("Error occured", event);
    }
    event.target.close();
  }


  SSE.onmessage = (event:any) => {
    console.log('什么是markdown格式文件', event)
    if (event.data == "[DONE]") {
      if (sse) {
        sse.close();
      }
      return;
    }
    let json_data = JSON.parse(event.data)
    if (json_data.content == null || json_data.content == 'null') {
        text.value = '';
        return;
    }
    text.value = `${text.value}${json_data.content}`;
    let isFlag = false
    list.forEach(item => {
      if(item.id === uuid_str && item.type === 'answer') {
        isFlag = true
        item.text = text.value
      }
    })
    if(!isFlag) {
      list.push({
        type:'answer',
        text: text.value,
        id: uuid_str
      })
    }
  };

}

</script>

<style scoped lang="scss">
.chat-box {
  min-height: 100vh;
  background-color: #f2f2f2;
  width: calc(80% - 12px);

  .chat-dialog {
    width: 100%;
    box-sizing: border-box;
    padding: pr(24) pr(24) pr(90);
  }
  .dialog-answer {
    display: flex;
    flex-direction: row;
    margin-bottom: pr(24);
    .icon-ai {
      width: pr(64);
      height: pr(64);
      margin-right: pr(12);
    }

    .dialog-box {
      padding: pr(24);
      width: 60%;
      background-color: #fff;
      border-radius: pr(8);
      :deep(.github-markdown-body) {
        padding: 0!important;
        p {
          margin: 0;
        }
      }

    }
  }
  .dialog-question {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    margin-bottom: pr(24);
    .icon-user {
      width: pr(64);
      height: pr(64);
      margin-left: pr(12);
    }
    .dialog-box {
      width: 60%;
      padding: pr(24);
      background-color: #51aa51;
      border-radius: pr(8);
    }
  }

  .chat-input-box {
    position: fixed;
    bottom: 0;
    border-top: 1px soild #e2e2e2;
    background-color: #f8f8f8;
    height: pr(88);
    width: calc(80% - 12px);
    box-sizing: border-box;
    padding: pr(12) pr(24);
    display: flex;
    flex-direction: row;
    .chat-input {
      flex: 1;
      margin-right: pr(24);
      display: flex;
      input {
        flex: 1;
        border: 1px soild #e2e2e2;
      }
    }
    .send-btn {
      height: pr(64);
      line-height: pr(64);
      background-color: #51aa51;
      border-radius: pr(8);
      padding: 0 pr(12);
      color: #fff;
      cursor: pointer;
    }
  }
}
</style>
