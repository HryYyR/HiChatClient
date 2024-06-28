<template>
    <div class="list_item" @click="emit('setcurrentfriendlist',item)"
    @contextmenu.prevent.stop="openeditfriendmenu($event,item)"
    :class="{ checkfriend: JSON.stringify(props.item) == '{}' ? false : props.item.Id == props.currentfrienddata.Id }"
    >
        <div class="list_item_header">
            <img :src="`http://${fileurl}/${item.Avatar}`" alt="">
        </div>
        <div>
            <p>{{ props.item.NikeName }}</p>
            <p class="list_lastmsg" v-if="props.item.MessageList.length != 0">
                <span v-if="props.item.MessageList.at(-1)?.MsgType == 1001">
                    {{ `${props.item.MessageList.at(-1)?.Msg}` }}
                </span>
                <span v-if="props.item.MessageList.at(-1)?.MsgType == 1002">
                    [图片]
                </span>
                <span v-if="props.item.MessageList.at(-1)?.MsgType == 1003">
                    [语音]
                </span>

            </p>
        </div>
        <div class="list_msginfo">
            <div>{{ props.item.MessageList.length != 0 ? props.item.MessageList.at(-1)?.CreatedAt.toString().slice(11, 16) : '' }}
            </div>
            <div v-show="props.item.UnreadMessage != 0">{{ props.item.MessageList.length != 0 ?
                props.item.UnreadMessage : '' }}</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Friend } from '../../models/models'
import { fileurl } from '../../main'
import { PropType } from 'vue'
import { tip } from "../../utils/utils";
import  ContextMenu from '@imengyu/vue3-context-menu';

const emit =defineEmits(['setcurrentfriendlist','lookuserinfo','deletefriend'])

const props = defineProps({
    item: {
        type: Object as PropType<Friend>,
        required: true
    },
    currentfrienddata:{
        type: Object as PropType<Friend>,
        required: true
    }
})


const openeditfriendmenu = (e,item:Friend)=>{
    if (e.type == "contextmenu") {
        ContextMenu.showContextMenu({
            x: e.clientX,
            y: e.clientY,
            items: [
                {
                    label: "复制ID",
                    onClick: () => {
                        navigator.clipboard.writeText(item.Id.toString())
                        tip("success","复制成功!")
                    }
                },
                {
                    label: "查看资料",
                    onClick: () => {
                        emit("lookuserinfo",item.Id)
                    }
                },
                {
                    label: "删除好友",
                    onClick: () => {
                        emit("deletefriend",item.Id)
                    }
                }
            ]
        });
    }
}

</script>

<style scoped lang="less">
@import url('../groupitem//groupitem.less');

@import url('./friend_item.less');
</style>