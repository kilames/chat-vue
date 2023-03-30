<template>
  <div class="chat-box" ref="chatDialog">
      <div class="chat-dialog" >
        <div v-for="(item, idx) in list" :key="idx">
          <div v-if="item.type === 'answer'" class="dialog-answer">
            <img class="icon-ai" src="../assets/images/chat4.png" />
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
        <div class="send-btn" @click="sendHandel">
          <img src="@/assets/images/send.png" />
        </div>
      </div>
    <div class="tips">接入chatGpt接口, gpt-3.5-turbo模型</div>
    <el-dialog class="dlgContainer" v-model="showAbout" width="50%">
      <div class="dlgContent">
        <img class="img" src='https://txcos007-1315445886.cos.ap-nanjing.myqcloud.com/images/tmp_5282571fb6aa8c1059d8bf8aee9ef338e51aca696f0df62a.png' />
        <div class="descTitle">
            免费次数已用完～ 请长按识别图中二维码码
        </div>
        <div class="descPara">
            📱请欢迎联系我们充值，开启无限畅聊～
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import tools from './utils/tools'
import { EventSourcePolyfill } from 'event-source-polyfill'
import api from '../api';

const list:Array<{type:string,text:string, id:string}> = reactive([
  {
    type:'answer',
    text:'作为AI聊天机器人，我可以回答您的任何问题～\n\n1，回答百度问答，知乎提问等提供更高质量的答案 \n\n2，写论文，写脚本，写故事，写代码，文案润色翻译\n\n3，扮演面试官，扮演历史人物等多种角色\n\n 4，智能生成mj关键词。对话前缀加‘mj’\n\n（例：mj 一只大象 动漫风格 ）\n\n例①：我是行政助理，请帮我写一篇工作日报\n\n例②：将下面的内容翻译成英文：xxx\n\n例③：请用鲁迅先生的小说风格写一个故事\n\n例④：请写一个200字的科幻小说',
    id: ''
  }
])
const qText = ref('')

const chatDialog = ref<any>(null)
const url = window.location.href
let token = ref('')
if(url.indexOf('?') > 0) {
  token.value = url.split('?')[1].split('=')[1]
  tools.setStore('token', token.value)
}

const showAbout = ref(false)


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
const sendHandel = async function() {
  if(!qText.value) {
    return
  }
  const res = await api.user.getUserInfo(token.value)
  console.log('个人信息', res)
  if(res.data.times <= 0) {
    showAbout.value = true
    return
  }
  const baseUrl = 'https://www.xiaoxigo.top/openapi/chat/stream/chat'
  const SSE =  new EventSourcePolyfill(`${baseUrl}?message=${qText.value}`, {
    headers: {
      token: token.value
    }
  });
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
    if(chatDialog.value.scrollHeight > chatDialog.value.clientHeight) {
      scrollToBottom()
    }
  };

}

function scrollToBottom() {
  chatDialog.value.scrollTo(0, chatDialog.value.scrollHeight)
}


</script>

<style scoped lang="scss">
.chat-box {
  height: 100vh;
  width: 100%;
  background-color: #f2f2f2;
  overflow: hidden;
  overflow-y: scroll;
  .tips {
    width: 100%;
    text-align: center;
    font-size: pr(20);
    color: #a19f9f;
    padding: 0 0 10px 0;
    flex-direction: row;
    position: fixed;
    bottom: pr(80);
    background-color: #f2f2f2;
    z-index: 5;
  }

  .chat-dialog {
    width: 100%;
    box-sizing: border-box;
    background-color: #f2f2f2;
    padding: pr(24) pr(24) pr(100);
  }
  .dialog-answer {
    display: flex;
    flex-direction: row;
    margin-bottom: pr(24);
    font-size: pr(20);
    .icon-ai {
      width: pr(64);
      height: pr(64);
      margin-right: pr(12);
    }

    .dialog-box {
      padding: pr(24);
      width: 70%;
      background-color: #fff;
      border-radius: pr(8);
      :deep(.github-markdown-body) {
        padding: 0!important;
        p {
          margin: 0;
          font-size: 15px;
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
      font-size: 15px;
    }
  }

  .chat-input-box {
    position: fixed;
    bottom: 0;
    border-top: 1px soild #e2e2e2;
    background-color: #f8f8f8;
    height: pr(88);
    width: 100%;
    box-sizing: border-box;
    padding: pr(12) pr(24);
    display: flex;
    flex-direction: row;
    z-index: 5;
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
      border-radius: pr(8);
      padding: 0 pr(12);
      color: #fff;
      border: solid 1px #7F7F7F;
      cursor: pointer;
      img {
        height: 100%;
      }
    }
  }
}
:deep(.el-dialog){
  // position: fixed;
  // top: 0;
  // bottom: 0;
  // left: 0;
  // right: 0;
  // background: rgba(0,0,0,0.5);
  height: pr(0);
}
.dlgContent{
    // width: 80%;
    border-radius: pr(18);
    background-color: #fff;
    border:1px solid #eee;
    box-sizing: border-box;
    padding: pr(50);
}

.img{
    width: 100%;
}
.descTitle{
    font-size: pr(22);
    text-align: center;
}
.descPara{
    font-size: pr(22);
    text-align: center;
    margin: pr(60) pr(10) pr(10) pr(10);
    color: #666666;

}
</style>
