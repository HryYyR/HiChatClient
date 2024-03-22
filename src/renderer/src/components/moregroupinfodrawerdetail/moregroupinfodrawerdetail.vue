<template>
    <div class="moregroupinfodrawerdetail">

        <div class="group_inf modal">
            <span>ID:</span> <span>{{ groupinfo.GroupInfo ? groupinfo.GroupInfo.ID : 0 }}</span><el-icon class="copybtn"
                @click="copyinfo(groupinfo.GroupInfo.ID)">
                <CopyDocument />
            </el-icon>
        </div>

        <div class="group_inf modal">
            <span>群聊名称:</span> <span>{{ groupinfo.GroupInfo ? groupinfo.GroupInfo.GroupName : "" }}</span><el-icon
                class="copybtn" @click="copyinfo(groupinfo.GroupInfo.GroupName)">
                <CopyDocument />
            </el-icon>
        </div>

        <div class="member_list modal">
            <div class="member_list_title" @click="emit('changememberlistdetaildarwer')">
                <p>群聊成员({{ props.memberlistdata?.length }})</p>
                <p class="moremember_btn">
                    <el-icon>
                        <Right />
                    </el-icon>
                </p>
            </div>
            <div class="member_list_body">
                <div v-for="(item) in  data.memberlist?.slice(0, 8)" :key="item.ID" class="member_list_item"
                    @click="emit('lookuserinfo', item.ID)">
                    <img :src="`http://${fileurl}/${item.Avatar}`" alt="">
                    <p>{{ item.NikeName }}</p>
                </div>
            </div>

        </div>


        <el-button type="danger" auto-insert-space style="width: 200px;" @click="emit('changequitgroupdialog', groupinfo)">
            {{ groupinfo.GroupInfo ? groupinfo.GroupInfo.CreaterID != userid ? '退出群聊' : '解散群聊' : '退出群聊' }}
        </el-button>


        <el-drawer :before-close="beforeclose" size="300px" :model-value="props.memberlistdetaildarwer" title="成员列表"
            direction="rtl" append-to-body>
            <el-input @input="seachmember" :prefix-icon="Search" v-model="data.input" style="width: 240px"
                placeholder="搜索" />

            <div class="memberdetail">
                <div v-for="(item) in data.memberlist" @click="emit('lookuserinfo', item.ID)" :key="item.ID"
                    class="memberdetail_item">
                    <img :src="`http://${fileurl}/${item.Avatar}`" alt="">
                    <p :class="{ green: item.ID == props.userid, blue: item.ID == props.groupinfo.GroupInfo.CreaterID }"> {{
                        item.NikeName }}</p>
                    <p class="groupcreater" v-if="item.ID == groupinfo.GroupInfo?.CreaterID">群主</p>
                    <p class="groupcreater greenbg" v-if="item.ID == props.userid">自己</p>
                </div>

            </div>
        </el-drawer>


    </div>
</template>

<script setup lang="ts">
import { PropType, reactive, watch } from 'vue'
import { tip } from '../../utils/utils'
import { Search } from '@element-plus/icons-vue'
import { UserShowData, GroupList } from '../../models/models'
import { fileurl } from '../../main'
const emit = defineEmits(['changequitgroupdialog', 'lookuserinfo', 'changememberlistdetaildarwer'])


const data = reactive({
    input: "",
    memberlist: [] as Array<UserShowData>,
})

const props = defineProps({
    groupinfo: {
        type: Object as PropType<GroupList>,
        required: true,

    },
    userid: {
        type: Number,
        required: true,
    },
    memberlistdetaildarwer: {
        type: Boolean
    },
    memberlistdata: {
        type: Array<UserShowData>,
    }
})

watch(props, (_, nv) => {
    data.memberlist = nv.memberlistdata || []
})

const copyinfo = (str: any) => {
    navigator.clipboard.writeText(JSON.stringify(str))
    tip('success', "复制成功!")
}
const beforeclose = () => {
    emit('changememberlistdetaildarwer')
    return
}

const seachmember = () => {
    if (data.input.length == 0) {
        data.memberlist = props.memberlistdata || []
        return
    }
    data.memberlist = data.memberlist.filter(member => {
        return member.NikeName.includes(data.input)
    })
}


</script>



<style scoped lang="less">
@import url('./moregroupinfodrawerdetail.less');
</style>