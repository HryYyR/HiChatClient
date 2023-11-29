<template>
    <el-dialog @close="beforeCloseEvent" v-model="data.isvisible" title="添加好友" width="40%">
        <div style="display: flex;">
            <el-input style="margin-right: 3px;" v-model="data.input" placeholder="支持模糊搜索" size="default" clearable
                @change=""></el-input>
            <el-button type="primary" size="default" @click="searchfriend">搜索</el-button>
        </div>
        <div>
            <div v-for="item in props.friendlist" :key="item.Id" class="apply_join_geoup_dialog_grouplist_item">
                <img :src="`http://${fileurl}/${item.Avatar}`" alt="">
                <p>{{ item.NikeName }}</p>
                <el-button type="primary" size="default" @click="preapplyaddfriend(item)">申请</el-button>

            </div>

        </div>
    </el-dialog>
</template>

<script setup lang="ts">
import { Friend } from '@renderer/models/models';
import { reactive, PropType, watch } from 'vue';
import { fileurl } from '../../main'
const data = reactive({
    isvisible: false,
    input: ""
})

const emit = defineEmits(['handlesearchfrienddialog','searchfriend','preapplyaddfriend','handlesearchfriendinput'])
let props = defineProps({
    searchinput: {
        type: String,
        required: true,
    },
    friendlist: {
        type: Array as PropType<Array<Friend>>,
        required: true,
    },
    visible: {
        type: Boolean,
        required: true,
    },
    targetfrienddata: {
        type: Object as PropType<Friend>,
        required: true,
    }

})
watch(props, (_, nv) => {
    data.input = nv.searchinput
    data.isvisible = nv.visible
})
watch(data, (_, nv) => {
    emit('handlesearchfriendinput',nv.input)
})
const preapplyaddfriend = (item) => {
    emit('preapplyaddfriend', item)
}
const searchfriend = () => {
    emit('searchfriend')
}
const beforeCloseEvent = () => {
    emit('handlesearchfrienddialog')
}
</script>

<style scoped lang="less">
@import url('./search_friend_dialog.less');
</style>