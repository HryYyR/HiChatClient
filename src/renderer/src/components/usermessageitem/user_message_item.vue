<template>
    <div class="msg_item"
        :style="{ justifyContent: (item.MsgType == 1001 || item.MsgType == 1002|| item.MsgType==1003) ? item.UserID == props.userdata.ID ? 'flex-end' : 'flex-start' : 'center' }">
        <MessageTimeVue :time="item.CreatedAt.toString()" :pretime="pretime.CreatedAt"/>
        <!-- 左头像 -->
        <div class="msg_header" 
            v-if="item.UserID != props.userdata.ID && (item.MsgType == 1001 || item.MsgType == 1002|| item.MsgType==1003)">
            <img :src="`http://${fileurl}/${item.UserAvatar}`" alt="">
        </div>

        <!-- 内容 -->
        <pre style="text-wrap: wrap;" v-if="item.MsgType == 1001 || item.MsgType == 1002 || item.MsgType==1003 " class="msg_text"
            :style="{ alignItems: item.UserID == props.userdata.ID ? 'flex-end' : 'flex-start' }">
        <p>{{ item.UserName }}</p>

        <el-image
        class="msg_info" 
        :src="item.Msg.includes('blob')?item.Msg:`http://${fileurl}/${item.Msg}`"
        :zoom-rate="1.1"
        :max-scale="1"
        :min-scale="0.2"
        v-if="item.MsgType == 1002"
        :class="item.UserID == props.userdata.ID ? 'selfinfo' : ''" 
        :preview-src-list="[item.Msg.includes('blob')?item.Msg:`http://${fileurl}/${item.Msg}`]"
        fit="cover"
        hide-on-click-modal
        />

        <audio v-if="item.MsgType == 1003" :src="`http://${fileurl}/${item.Msg}`" controls ></audio>

        <p 
        v-if="item.MsgType == 1001"
        class="msg_info" 
        @contextmenu.prevent.stop="openFriendMsgHandleMenu($event, item)"  
        :class="item.UserID == props.userdata.ID ? 'selfinfo' : ''" 
        v-text="item.Msg"></p>
        </pre>



        <!-- 右头像 -->
        <div class="msg_header" v-if="item.UserID == props.userdata.ID && (item.MsgType == 1001 || item.MsgType == 1002 || item.MsgType == 1003)"
            >
            <img :src="`http://${fileurl}/${item.UserAvatar}`" alt="">
        </div>

        <!-- 用户退出消息 -->
        <div class="msg_quit" v-if="item.MsgType == 201 || item.MsgType == 202">
            {{ item.Msg }}
        </div>

    </div>
</template>

<script setup lang="ts">
import MessageTimeVue from '../messageitem/messagetime/message_time.vue'


import { PropType } from 'vue'
import { FriendMessageListitem,Userdata } from '../../models/models'
import {fileurl} from '../../main'
import ContextMenu from '@imengyu/vue3-context-menu';

const props = defineProps({
    item: {
        type: Object as PropType<FriendMessageListitem>,
        required: true
    },
    userdata: {
        type: Object as PropType<Userdata>,
        required: true,
    },
    pretime: {
        type: Object,
        required: true,

    },
})

const openFriendMsgHandleMenu=(e,item)=>{
    if (e.type == "contextmenu") {
        ContextMenu.showContextMenu({
            x: e.clientX,
            y: e.clientY,
            items: [
                {
                    label: "复制",
                    onClick: () => {
                        let text = window.getSelection()?.toString() || ""
                        if (text.length == 0) {
                            navigator.clipboard.writeText(item.Msg)
                        } else {
                            navigator.clipboard.writeText(text)

                        }
                    }
                }
            ]
        });
    }
}

</script>

<style scoped lang="less">
@import url('./user_message_item.less');
</style>