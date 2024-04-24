<template>
    <div class="ai_assistant_container">
        <el-dialog v-model="data.DialogVisible" title="AI小助手" width="700" :before-close="handleClose">
            <div class="ai_msg_list" ref="aimsglist">
                <div class="ai_msg_item" :class="{ 'ai_user': item.Role == 1 }" v-for="(item) in data.msglist"
                    :key="item.ID">
                    <div class="ai_header" v-if="item.Role == 0">
                        <div v-if="item.Role == 0">
                            <svg t="1713959213575" class="icon" viewBox="0 0 1024 1024" version="1.1"
                                xmlns="http://www.w3.org/2000/svg" p-id="23436" width="32" height="32">
                                <path
                                    d="M160 809.6c12.8-9.6 28.8-16 44.8-16h742.4V76.8H76.8v793.6L160 809.6z m44.8 60.8L0 1024V0h1024v870.4H204.8z m128-460.8h153.6V230.4h76.8V640h-76.8v-153.6h-153.6V640H256V230.4h76.8v179.2z m358.4-25.6H768v256h-76.8v-256z m0-153.6H768v102.4h-76.8V230.4z"
                                    fill="#5C5CE6" p-id="23437"></path>
                            </svg>
                        </div>

                    </div>
                    <div class="ai_context">
                        <div class="ai_username" :style="{ textAlign: item.Role == 1 ? 'right' : 'left' }">{{ item.UserName
                        }}</div>
                        <div class="ai_msg" v-html="item.message"></div>
                    </div>
                    <div class="ai_header ">
                        <div v-if="item.Role == 1">
                            <img :src="`http://${fileurl}/${item.UserHeader}`">
                        </div>
                    </div>
                </div>
            </div>
            <template #footer>
                <div class="dialog-footer">
                    <div class="ai_send">
                        <input v-model="data.inputText" class="ai_input" placeholder="请输入您想询问的问题!" />
                        <div class="ai_btn" @click="sendmsg">{{ data.loading ? "···" : "提问" }}</div>
                    </div>

                </div>
            </template>
        </el-dialog>
    </div>
</template>



<script setup lang="ts">
import { reactive, ref, watch, onMounted } from 'vue';
import { aimessageapi } from '../../API/api'
import { tip } from '@renderer/utils/utils';
import { fileurl } from '@renderer/main';

let aimsglist: any = ref(null)

let emit = defineEmits(["changeAiAssistantDialogVisible"])

let props = defineProps({
    aiAssistantDialogVisible: {
        type: Boolean,
        required: true,
        default: false
    },
    username: {
        type: String,
        default: "用户"
    },
    userheader: {
        type: String,
        default: ""
    }
})

onMounted(() => {
    initListener()
})

watch(props, (nv, _) => {
    console.log(nv);

    data.DialogVisible = nv.aiAssistantDialogVisible
    if (nv.aiAssistantDialogVisible && data.msglist.length == 0) {
        const defaultmsg: AiMessageListitem = {
            ID: 1,
            UserName: data.AiName,
            UserHeader: '',
            Role: 0,
            message:
                '你好呀,请问有什么需要帮忙的吗?',
            messageType: 0,
            CreateTime: '',
        }
        data.msglist.push(defaultmsg)
    }
})

const data = reactive({
    DialogVisible: false,
    inputText: "",
    AiName: "智能助手",
    msglist: [] as Array<AiMessageListitem>,
    loading: false,
})

const handleClose = () => {
    emit('changeAiAssistantDialogVisible')
}

const sendmsg = () => {
    if (data.inputText.length == 0) {
        return
    }
    if (data.loading) {
        tip('warning', "内容生成中...请耐心等待!")
        return
    }
    data.loading = true
    let message = data.inputText
    data.inputText = ""
    const msg: AiMessageListitem = {
        ID: data.msglist.length + 1,
        UserName: props.username,
        UserHeader: props.userheader,
        Role: 1,
        message: message,
        messageType: 0,
        CreateTime: ''
    }
    data.msglist.push(msg)
    scrolltonew()
    aimessageapi(message, 0).then(res => {
        data.loading = false
        if (res.status != 200) {
            tip('error', "获取消息失败!请稍后重试")
        } else {
            const msg: AiMessageListitem = {
                ID: data.msglist.length + 1,
                UserName: data.AiName,
                UserHeader: '',
                Role: 0,
                message: res.data.msg,
                messageType: 0,
                CreateTime: ''
            }
            data.msglist.push(msg)
            scrolltonew()
        }
    }).catch(e => {
        console.log(e);
        tip('error', "获取消息失败!请稍后重试")

        data.loading = false
    })
}

const scrolltonew = () => {
    if (aimsglist.value) {
        setTimeout(() => {
            aimsglist.value.scrollTo({ top: data.msglist.length * 200, behavior: "smooth" })
        }, 80);
    }
}

const initListener = () => {
    window.addEventListener('keydown', (event) => {
        if (event.key == "Enter") {
            sendmsg()
        }
    })
}

type AiMessageListitem = {
    ID: number
    UserName: string
    UserHeader: string
    Role: number
    message: string
    messageType: number
    CreateTime: string

}

</script>

<style scoped lang="less">
.ai_assistant_container {
    font-family: "华文琥珀" !important;
}

.ai_user {
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
}

.ai_msg_list {
    border: 2px solid rgb(106, 106, 248);
    border-radius: 15px;
    height: 330px;
    overflow: scroll;
    padding: 10px;

    .ai_msg_item {
        display: flex;
        margin-bottom: 30px;

        .ai_header {
            margin: 0 10px;

            img {
                width: 45px;
                height: 45px;
                border-radius: 50%;
            }
        }

        .ai_context {
            max-width: 81%;

            .ai_username {
                font-size: 1rem;
            }

            .ai_msg {
                line-height: 1.4rem;
                font-family: "微软雅黑";
                margin-top: 5px;
                font-size: 1rem;
                color: white;
                padding: 5px 10px;
                background-color: rgb(106, 106, 248);
                border-radius: 7px;
            }

        }
    }

}

.ai_send {
    display: flex;

    .ai_input {
        flex: 1;
        margin-right: 20px;
        outline: none;
        border-radius: 10px;
        border: 3px solid rgb(172, 172, 255);
        transition: 0.2s;
        font-family: "华文琥珀" !important;
        padding-left: 5px;
        background-color: rgb(236, 239, 248);
        font-size: 0.7rem;

        &:focus,
        &:hover {
            border: 3px solid rgb(106, 106, 248);
            font-size: 0.9rem;
        }
    }

    .ai_btn {
        width: 50px;
        height: 40px;
        display: flex;
        justify-content: center;
        align-items: center;
        transition: 0.2s;
        background-color: rgb(141, 141, 255);
        padding: 0 10px;
        color: white;
        border-radius: 8px;
        cursor: pointer;

        &:hover {
            background-color: rgb(106, 106, 248);
        }
    }
}

/* 滚动条整体 */
::-webkit-scrollbar {
    display: none;
}
</style>