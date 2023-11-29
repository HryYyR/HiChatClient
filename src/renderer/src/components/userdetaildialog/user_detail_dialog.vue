<template>
    <el-dialog class="user_detail_dialog" :modal="false" v-model="data.visible" title="" width="40%" :show-close="false"
        :before-close="beforeCloseEvent">

        <div class=" user_detail_dialog_option">
            <div>
                <img v-if="props.userdata.UserAvatar" :src="`http://${fileurl}/${props.userdata.UserAvatar}`" alt="">
            </div>
            <div style="margin: 0 20px;">
                <p class="user_detail_dialog_option_name">{{ props.userdata.UserName }} {{isfriend?"(好友)":""}} </p>
                <p class="user_detail_dialog_option_id">ID: {{ props.userdata.UserID }}</p>
            </div>

        </div>
        <div  class="user_detail_item " >
            <div>年龄:</div> <p>{{ props.userdata.UserAge }}</p>
        </div>
        <div class="user_detail_item ">
            <div>城市: </div> <p>{{ props.userdata.UserCity }}</p>
        </div>
        <div class="user_detail_item ">
            <div>注册时间:</div> <p> {{ data.createdAt }}</p>
        </div>
        <div class="change_tochat" v-show="isfriend" @click="emit('setcurrentfriendlist',friendinfodata)">
            <p>发消息</p>
        </div>

    </el-dialog>
</template>

<script setup lang="ts">
import { PropType, reactive, watch } from 'vue';
import { fileurl } from '../../main'
import { MessageListitem,Friend } from '../../models/models'

const emit = defineEmits(['handlelookuserinfodialog','setcurrentfriendlist'])
const data = reactive({
    visible: false,
    createdAt:""
})



const props = defineProps({
    userdata: {
        type: Object as PropType<MessageListitem>,
        required: true,
    },
    UserDetailDialogVisible: {
        type: Boolean,
        required: true,
    },
    isfriend:{
        type: Boolean,
        required: true,
    },
    friendinfodata:{
        type: Object as PropType<Friend>,
        required: true
    }
})

watch(props, (_, nv) => {
    // console.log(nv);
    data.visible = nv.UserDetailDialogVisible
    data.createdAt = nv.userdata.CreatedAt? nv.userdata.CreatedAt.toString().slice(0,10) :""
})


const beforeCloseEvent = () => {
    emit('handlelookuserinfodialog', false)
}

</script>

<style scoped lang="less">
@import url('./user_detail_dialog.less');
</style>