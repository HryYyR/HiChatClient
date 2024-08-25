<template>
    <!-- 登录 -->
    <div class="view_container register_container">
        <el-input class="view_input" v-model="props.registerdata.username" placeholder="用户名(由字母和数字组成,不能低于6位)"
            size="large" clearable></el-input>
        <el-input class="view_input" type="password" show-password v-model="props.registerdata.password"
            placeholder="密码(不能低于6位)" size="large" clearable></el-input>
        <el-input class="view_input" type="password" show-password v-model="props.registerdata.checkpassword"
            placeholder="确认密码" size="large" clearable></el-input>
        <el-input class="view_input" v-model="props.registerdata.email" placeholder="邮箱" size="large"
            clearable></el-input>
        <div class="view_input" style="display: flex;">
            <el-input placeholder="邮箱验证码" v-model="props.registerdata.emailcode" size="large"
                style="margin-right: 10px;"></el-input><el-button type="success" size="large" @click="sendemailCode"
                :disabled="props.registerdata.sendemailbtnvisible">{{ props.registerdata.sendcodebtn }}</el-button>


        </div>
        <div class="btn" @click="register">注册</div>
    </div>
</template>

<script setup lang="ts">

const emit = defineEmits(['register','sendemailcode'])
let props = defineProps({
    registerdata: {
        type: Object,
        required: true,
    },
})

const register = ()=>{
    emit('register')
}
const sendemailCode = ()=>{
    emit('sendemailcode')
}

</script>

<style scoped lang="less">
@import url('./register.less');
</style>