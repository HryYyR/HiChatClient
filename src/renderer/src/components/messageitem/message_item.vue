<template>
    <div class="msg_item"
        :style="{ justifyContent: (item.MsgType == 1 || item.MsgType == 2) ? item.UserID == props.userdata.ID ? 'flex-end' : 'flex-start' : 'center' }">
        <MessageTimeVue 
        :time="item.CreatedAt"
        :pretime="preitem.CreatedAt"
        />
        <!-- 左头像 -->
        <div class="msg_header" v-if="item.UserID != props.userdata.ID && (item.MsgType == 1 || item.MsgType == 2)">
            <img :src="`http://${fileurl}/${item.UserAvatar}`" alt="">
        </div>

        <!-- 内容 -->
        <pre style="text-wrap: wrap;" v-if="item.MsgType == 1 || item.MsgType == 2" class="msg_text"
            :style="{ alignItems: item.UserID == props.userdata.ID ? 'flex-end' : 'flex-start' }">
        <p>{{ item.UserName }}</p>

        <el-image
        class="msg_info" 
        :src="`http://${fileurl}/${item.Msg}`"
        :zoom-rate="1.1"
        :max-scale="1"
        :min-scale="0.2"
        v-if="item.MsgType == 2"
        :class="item.UserID == props.userdata.ID ? 'selfinfo' : ''" 
        :preview-src-list="[`http://${fileurl}/${item.Msg}`]"
        fit="cover"
        hide-on-click-modal
        />


        <p 
        v-if="item.MsgType == 1"
        @contextmenu.prevent.stop="openMsgHandleMenu($event, item)"  
        class="msg_info" 
        :class="item.UserID == props.userdata.ID ? 'selfinfo' : ''" 
        v-text="item.Msg"></p>
        </pre>



        <!-- 右头像 -->
        <div class="msg_header" v-if="item.UserID == props.userdata.ID && (item.MsgType == 1 || item.MsgType == 2)">
            <img :src="`http://${fileurl}/${item.UserAvatar}`" alt="">
        </div>

        <!-- 用户退出消息 -->
        <div class="msg_quit" v-if="item.MsgType == 201 || item.MsgType == 202">
            {{ item.Msg }}
        </div>

    </div>
</template>

<script setup lang="ts">
import { fileurl } from '../../main'
import MessageTimeVue from './messagetime/message_time.vue'
const emit = defineEmits(['openMsgHandleMenu'])
let props = defineProps({
    item: {
        type: Object,
        required: true,
    },
    preitem: {
        type: Object,
        required: true,

    },
    currentgroupdata: {
        type: Object,
        required: true,
    },
    userdata: {
        type: Object,
        required: true,
    }
})

const openMsgHandleMenu = (e, item) => {
    emit('openMsgHandleMenu', e, item)
}

</script>

<style scoped lang="less">
@import url('./message_item.less');
</style> 