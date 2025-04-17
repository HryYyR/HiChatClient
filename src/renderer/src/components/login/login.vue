<template>
    <!-- 登录 -->
    <div class="view_container login_container" :style="{ marginTop: props.logindata.offset ? '-500px' : '0px' }">
        <div class="headericon">
            <el-icon size="30" color="white" v-if="props.logindata.username != data.localStorageusername">
                <Plus />
            </el-icon>
            <img :src="`http://${fileurl}/${props.logindata.avatar}`" class="login_header_img" v-else>
        </div>
        <el-input class="view_input" v-model="props.logindata.username" placeholder="账号" size="large"
            clearable></el-input>
        <el-input type="password" class="view_input" v-model="props.logindata.password" show-password placeholder="密码"
            size="large" clearable></el-input>
        <div class="option">
            <div class="option_item">
                <span>记住密码: <el-switch size="small" v-model="data.rememberpassword" :disabled="data.autologin && data.rememberpassword" /></span>
            </div>
            <div class="option_item">
                <span>自动登录: <el-switch size="small" v-model="data.autologin" /></span>
            </div>
        </div>
        <div class="btn" @click="login">登录</div>
    </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { fileurl } from "@renderer/main"
const emit = defineEmits(['login'])
let props = defineProps({
    logindata: {
        type: Object,
        required: true,
    },
})

let data = reactive({
    localStorageusername: localStorage.getItem("username"),
    rememberpassword: localStorage.getItem("rememberpassword")=="1"?true:false,
    autologin: localStorage.getItem("autologin")=="1"?true:false,
})

watch(data, (_, newvalue) => {
    localStorage.setItem("rememberpassword", newvalue.rememberpassword ? "1" : "0")

    if (newvalue.autologin) {
        localStorage.setItem("autologin", newvalue.autologin ? "1" : "0")
        localStorage.setItem("rememberpassword", newvalue.rememberpassword ? "1" : "0")
        data.rememberpassword = true
    }else{
        localStorage.setItem("autologin", newvalue.autologin ? "1" : "0")
    }
})


const login = () => {
    emit('login')
}


</script>

<style scoped lang="less">
@import url('./login.less');
</style>