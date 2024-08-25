<template>
    <div class="group_tools">
        <el-input size="large" v-model="props.searchinput" placeholder="搜索" clearable></el-input>
        <el-dropdown trigger="click" v-show="props.searchinput.trim().length == 0">
            <el-icon class="open_addgroup_dialog_btn">
                <Plus />
            </el-icon>
            <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item>
                        <div @click="emit('handlesearchfrienddialog')">
                            添加好友
                        </div>
                    </el-dropdown-item>
                    <el-dropdown-item>
                        <div @click="emit('changeaddGroupDialogVisible')">
                            添加群聊
                        </div>
                    </el-dropdown-item>
                    <el-dropdown-item>
                        <div @click="emit('changecreateGroupDialogVisible')">
                            创建群聊
                        </div>
                    </el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown>
    </div>
</template>

<script setup lang="ts">

const emit = defineEmits(['changecreateGroupDialogVisible','changeaddGroupDialogVisible','handlesearchfrienddialog'])
let props = defineProps({
    searchinput: {
        type: String,
        required: true,
    },
})



</script>

<style scoped lang="less">
@import url('./funcbar.less');
</style>