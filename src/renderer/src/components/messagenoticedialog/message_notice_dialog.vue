<template>
    <!-- 消息通知对话框 -->
    <el-dialog style="background-color: rgb(229,229,229);" v-model="props.applymsgdata.applyMsgDialogVisible" title="消息通知"
        width="60%">

        <div class="apply_msg_list_dialog">
            <div v-for="item in props.userdata.ApplyList" :key="item.ID">
                <p>
                <p style="display: flex;">
                    <span> {{ item.ApplyUserName }} </span>
                <p style="margin: 0 5px;">申请加入群聊</p> <span> {{ props.grouplist.filter(i => i.GroupInfo.ID ==
                    item.GroupID)[0].GroupInfo.GroupName
                }}</span>
                <p style="font-size: 0.8rem;line-height: 1.2rem;margin-left: 10px;color: rgb(168, 168, 168);">{{
                    item.CreatedAt.slice(11, 19) }}</p>
                </p>
                <p>
                    留言:{{ item.ApplyMsg }}
                </p>
                </p>
                <div v-show="item.HandleStatus == 0">
                    <el-button type="primary" size="default" @click="handleapplymsg(item, 1)">同意</el-button>
                    <el-button type="danger" size="default" @click="handleapplymsg(item, -1)">拒绝</el-button>
                </div>
                <div v-show="item.HandleStatus == 1">已同意</div>
                <div v-show="item.HandleStatus == -1">已拒绝</div>
            </div>
        </div>
    </el-dialog>
</template>

<script setup lang="ts">
import {GroupList} from'../../App.vue'

const emit = defineEmits(['handleapplymsg'])
let props = defineProps({
    userdata: {
        type: Object,
        required: true,
    },
    grouplist: {
        type: Array<GroupList>,
        required: true,
    },
    applymsgdata: {
        type: Object,
        required: true,
    }
})
const handleapplymsg = (item, num) => {
    emit('handleapplymsg', item, num)
}                                
</script>

<style scoped lang="less">
@import url('./message_notice_dialog.less');
</style>