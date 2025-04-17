<template>
    <div class="group_tools">
        <el-input size="default" v-model="data.searchinput" placeholder="搜索" clearable></el-input>
        <el-dropdown trigger="click" v-show="props.searchinput.trim().length == 0">
            <el-icon class="open_addgroup_dialog_btn">
                <Plus />
            </el-icon>
            <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item @click="emit('handlesearchfrienddialog')">
                        <div >
                            添加好友
                        </div>
                    </el-dropdown-item>
                    <el-dropdown-item @click="emit('changeaddGroupDialogVisible')">
                        <div >
                            添加群聊
                        </div>
                    </el-dropdown-item>
                    <el-dropdown-item @click="emit('changecreateGroupDialogVisible')">
                        <div >
                            创建群聊
                        </div>
                    </el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown>
    </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';


const emit = defineEmits(['changecreateGroupDialogVisible','changeaddGroupDialogVisible','handlesearchfrienddialog','changesearchinput'])

const data = reactive({
    searchinput:""
})

let props = defineProps({
    searchinput: {
        type: String,
        required: true,
    },
})
watch(props,(_,newvalue)=>{
    data.searchinput = newvalue.searchinput
})
watch(data,(_,newvalue)=>{
    emit('changesearchinput',newvalue.searchinput)
})


</script>

<style scoped lang="less">
@import url('./funcbar.less');
</style>