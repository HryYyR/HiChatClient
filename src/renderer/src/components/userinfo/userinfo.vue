<template>
    <div class="userinfo">

        <div class="userinfo_item">
            <div class="userinfo_header">
                <img :src="`http://${fileurl}/${props.userdata.Avatar}`" @click="userdetaildialoghandleClose">
            </div>
            <p class="userinfo_name">{{ props.userdata.UserName }}</p>
        </div>

        <el-drawer size="100%" v-model="data.UserDetailDialogVisible" title="个人信息" direction="ltr"
            :before-close="userdetaildialoghandleClose">

            <div class="userinfo_header">
                <div>
                    <p class="userinfo_Avatar">
                        <el-upload class="avatar-uploader" :action="`http://${fileurl}/file/uploadfile`"
                            :show-file-list="false" :before-upload="beforeupload" :on-success="uploadSuccess">
                            <img :src="`http://${fileurl}/${props.userdata.Avatar}`" alt="">

                        </el-upload>
                    </p>
                </div>
                <div class="userinfo_baseinfo">
                    <p><el-input v-model="props.userdata.ID" size="large" disabled>
                            <template #prepend>
                                ID:
                            </template>
                        </el-input>
                    </p>
                    <p><el-input v-model="props.userdata.NikeName" size="large" disabled>
                            <template #prepend>
                                昵称:
                            </template>
                        </el-input>
                    </p>
                </div>
            </div>




            <p><el-input v-model="props.userdata.Email" size="default" disabled>
                    <template #prepend>
                        邮箱:
                    </template>
                </el-input>
            </p>

            <p><el-input v-model="data.city" size="default" @change="">
                    <template #prepend>
                        城市:
                    </template>
                </el-input>
            </p>
            <p><el-input v-model="data.age" size="default" @change="">
                    <template #prepend>
                        年龄:
                    </template>

                </el-input>
            </p>
            <p><el-input v-model="data.introduce" size="default" @change="">
                    <template #prepend>
                        个人简介:
                    </template>

                </el-input>
            </p>
            <!-- <p><el-input v-model="props.userdata.CreatedTime" size="default" disabled>
                    <template #prepend>
                        注册时间:
                    </template>
                </el-input>
            </p>

            <p><el-input v-model="props.userdata.LoginTime" size="default" disabled>
                    <template #prepend>
                        登陆时间:
                    </template>

                </el-input>
            </p> -->
            <template #footer>
                <span class="dialog-footer">
                    <el-button type="primary" @click="edituserdata">
                        保存
                    </el-button>
                </span>
            </template>
        </el-drawer>
    </div>
</template>

<script setup lang="ts">
import { PropType, reactive } from 'vue';
import { fileurl } from '../../main'
import { edituserdataapi } from '../../API/api'
import { Userdata } from '../../models/models';
import { tip } from '../../utils/utils'
let emit = defineEmits(['userdetaildialoghandleClose', 'edituserdata'])
let props = defineProps({
    userdata: {
        type: Object as PropType<Userdata>,
        required: true
    },

    UserDetailDialogVisible: {
        type: Boolean,
        default: false
    }
})

const data = reactive({
    UserDetailDialogVisible: false,
    age: 0,
    city: "",
    introduce: "",
    Avatar: ""
})
const userdetaildialoghandleClose = () => {
    emit('userdetaildialoghandleClose')
    data.UserDetailDialogVisible = props.UserDetailDialogVisible
    data.city = props.userdata.City
    data.age = props.userdata.Age
    data.introduce = props.userdata.Introduce
}

const edituserdata = () => {
    console.log(data.city, data.age);
    if (data.age < 1 || data.age >= 200 || data.city.length == 0 || data.city.length > 100 || data.introduce.length == 0 || data.introduce.length > 200) {
        tip('error', "信息不能为空或者超出长度限制,请检查后重试!")
        return
    }
    edituserdataapi(data.age, data.city, data.introduce, data.Avatar).then(res => {
        tip('success', res.data.msg)
        emit('edituserdata', data.age, data.city, data.introduce, data.Avatar)
    }).catch((err) => {
        tip('error', err.response.data.msg)
    })
}



const uploadSuccess = (e) => {
    if (e.code == 0) {
        data.Avatar = e.fileurl
        edituserdata()
    } else {
        tip("error", "上传头像失败！")
    }
}

const beforeupload = (e) => {
    console.log(e);
    if (e.size > 5 * 1024 * 1014) {
        tip("warning", "头像大小不能超过5M")
        return false
    }
    return true
}

</script>

<style scoped lang="less">
@import url('./userinfo.less');
</style>
