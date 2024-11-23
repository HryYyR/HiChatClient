<template>
    <HeaderVue />

    <div class="container" v-loading="data.loginloading" v-show="!data.islogin">
        <!-- 登录 -->
        <LoginVue :logindata="data.logindata" @login="login" />

        <!-- 注册 -->
        <RegisterVue :registerdata="data.registerdata" @register="register" @sendemailcode="sendemailCode" />

        <!-- 公共组件 -->
        <div class="changeview" @click="toregister">{{ !data.logindata.offset ? "去注册" : "去登录" }}<el-icon
                v-if="!data.logindata.offset">
                <ArrowDownBold />
            </el-icon>
            <el-icon v-else>
                <ArrowUpBold />
            </el-icon>
        </div>

    </div>

    <!-- 主面板 -->
    <div v-show="data.islogin" class="index" :style="{ userSelect: isResizing ? 'none' : 'auto' }"
        v-loading.fullscreen.lock="data.loading" element-loading-text="加载中...">
        <div class="left_list" ref="resizableDiv" @mousedown="onMouseDownResizerX">
            <div class="resizer resizerX"></div>

            <UserInfoVue @edituserdata="edituserdata" @userdetaildialoghandleClose="userdetaildialoghandleClose"
                :UserDetailDialogVisible="data.userdetaildata.UserDetailDialogVisible" :userdata="data.userdata" />

            <!-- 群工具 -->
            <FuncBarVue :searchinput="data.searchdata.searchinput"
                @changeadd-group-dialog-visible="data.addgroupdata.addGroupDialogVisible = true"
                @changecreate-group-dialog-visible="data.creategroupdata.createGroupDialogVisible = true"
                @handlesearchfrienddialog="handlesearchfrienddialog"
                @changesearchinput="(searchinput) => { data.searchdata.searchinput = searchinput }" />

            <div class="search_result" v-if="data.searchdata.searchinput.trim().length != 0">
                <p v-for="(item) in data.searchdata.searchResult" :key="item.name" @click="ToSearchTarget(item)">
                    <img :src="`http://${fileurl}/${item.avatar}`" alt=""><span v-html="item.name"></span>(<span
                        v-html="item.number"></span>) ({{ item.type == 1 ? '群聊' : '好友' }})
                </p>
                <p v-show="data.searchdata.searchResult.length == 0">
                    暂无搜索结果
                </p>
            </div>

            <!-- 申请消息列表 -->
            <div class="apply_msg_list" v-show="data.searchdata.searchinput.trim().length == 0" v-if="data.islogin"
                @click="data.applymsgdata.applyMsgDialogVisible = true">
                <div class="apply_msg_list_left">
                    <p>消息通知</p>
                    <span v-show="filterapplyjoingrouplist != 0 || filterapplyadduserlist != 0">
                        {{
                            filterapplyjoingrouplist + filterapplyadduserlist
                        }}
                    </span>
                </div>
                <p class="apply_msg_list_right"><el-icon>
                        <ArrowRightBold />
                    </el-icon></p>
            </div>

            <!-- tab切换栏 -->
            <div class="change_tab" v-show="data.searchdata.searchinput.trim().length == 0">
                <div @click="data.currentSelectTab = true" :class="{ checktab: data.currentSelectTab }">

                    <el-badge :value="allfriendmsgnum" :hidden="allfriendmsgnum == 0" type="primary">
                        <el-icon>
                            <User />
                        </el-icon>
                    </el-badge>
                </div>
                <div @click="data.currentSelectTab = false" :class="{ checktab: !data.currentSelectTab }">
                    <el-badge :value="allgroupmsgnum" :hidden="allgroupmsgnum == 0" type="primary">
                        <el-icon>
                            <ChatRound />
                        </el-icon>
                    </el-badge>
                </div>
            </div>

            <div class="list_container" v-show="data.searchdata.searchinput.trim().length == 0">
                <!-- 好友列表 -->
                <div class="friend_list list" :class="{ checkf: data.currentSelectTab }">
                    <FriendItemVue v-for="(item) in data.userdata.FriendList" :key="item.Id" :item="item"
                        :currentfrienddata="data.currentfrienddata" @setcurrentfriendlist="setcurrentfriendlist"
                        @lookuserinfo="lookuserinfo" @deletefriend="deletefriend" />
                </div>
                <!-- 群列表 -->
                <div class="group_list list" :class="{ checkg: !data.currentSelectTab }">
                    <GroupItemVue v-for="(item) in data.grouplist" :key="item.GroupInfo.ID" :item="item"
                        :currentgroupdata="data.currentgroupdata" @setcurrentgrouplist="setcurrentgrouplist"
                        @openeditgroupmenu="openeditgroupmenu" />
                </div>
            </div>
            <div class="other_tool_group">
                <div @click="outlogin(false)" class="outlogin">
                    <QuitIconVue />
                </div>
                <div class="Ai_assistant" :username="data.userdata.UserName" :userheader="data.userdata.Avatar"
                    @click="changeAiAssistantDialogVisible">AI</div>
            </div>
        </div>

        <div class="right_list">
            <p v-if="data.currentSelectType == 0" class="rightlist_background">HiChat</p>

            <!-- friend标题栏 -->
            <div class="rightlist_option"
                v-if="data.currentSelectType == 2 && JSON.stringify(data.currentfrienddata) != '{}'">
                <p> {{ data.currentfrienddata.NikeName || "" }}</p>
                <div class="rightlist_option_tool">
                    <el-icon @click="startUserToUserVideoCall">
                        <VideoCamera />
                    </el-icon>
                    <el-icon>
                        <Phone />
                    </el-icon>
                </div>
            </div>

            <!-- friend消息列表 -->
            <div class="rightlist_container" ref="msglist" :style="{ opacity: data.loadingmessagelist ? 0 : 1 }"
                v-if="data.currentSelectType == 2 && JSON.stringify(data.currentfrienddata) != '{}'">
                <UserMessageItemVue v-for="(item, index) in data.currentfrienddata.MessageList" :item="item"
                    :userdata="data.userdata"
                    :pretime="(index != 0 && data.currentfrienddata.MessageList.length > 1) ? data.currentfrienddata.MessageList[index - 1] : data.currentfrienddata.MessageList[index]" />

                <div class="message_unread" @click="scrolltonew(0, true)"
                    v-show="data.messageunreaddata.unreadnumber != 0">
                    <span>
                        {{ data.messageunreaddata.unreadnumber }}条未读
                    </span>
                    <el-icon>
                        <ArrowDown />
                    </el-icon>
                </div>
            </div>


            <!-- group标题栏 -->
            <div class="rightlist_option"
                v-if="data.currentSelectType == 1 && JSON.stringify(data.currentgroupdata) != '{}'">
                <p>
                    {{ JSON.stringify(data.currentgroupdata) != '{}' ? data.currentgroupdata.GroupInfo.GroupName : "" }}
                    ({{
                        JSON.stringify(data.currentgroupdata) != '{}' ? data.currentgroupdata.GroupInfo.MemberCount : '' }})
                </p>
                <div class="rightlist_option_tool_list">
                    <div class="addicon">
                        <Vueaddicon />
                    </div>
                    <div>
                        <el-icon class="moregroupinfo" @click="changemoregroupinfodarwer">
                            <MoreFilled />
                        </el-icon>
                    </div>
                </div>

            </div>

            <!-- 群聊详细信息 -->
            <el-drawer v-model="data.moregroupinfo.moregroupinfodrawer"
                :title="data.currentgroupdata.GroupInfo ? data.currentgroupdata.GroupInfo.GroupName : ''"
                direction="rtl" size="300px" append-to-body>
                <MoreGroupInfoDrawerDetail :groupinfo="data.currentgroupdata"
                    :memberlistdetaildarwer="data.moregroupinfo.memberlistdetaildarwer" :userid="data.userdata.ID"
                    :memberlistdata="data.moregroupinfo.memberlistdata" @changequitgroupdialog="changequitgroupdialog"
                    @lookuserinfo="lookuserinfo" @changememberlistdetaildarwer="changememberlistdetaildarwer" />
            </el-drawer>


            <!-- group消息列表 -->
            <div class="rightlist_container" ref="msglist" :style="{ opacity: data.loadingmessagelist ? 0 : 1 }"
                v-if="data.currentSelectType == 1 && JSON.stringify(data.currentgroupdata) != '{}'">
                <MessageItemVue @changeHeaderDialog="changeHeaderDialog"
                    v-for="(item, index) in data.currentgroupdata.MessageList" :key="item.ID" :item="item"
                    :preitem="(index != 0 && data.currentgroupdata.MessageList.length > 1) ? data.currentgroupdata.MessageList[index - 1] : data.currentgroupdata.MessageList[index]"
                    :userdata="data.userdata" :currentgroupdata="data.currentgroupdata"
                    @openMsgHandleMenu="openMsgHandleMenu" @lookuserinfo="lookuserinfo" />

                <div class="message_unread" @click="scrolltonew(0, true)"
                    v-show="data.messageunreaddata.unreadnumber != 0">
                    <span>
                        {{ data.messageunreaddata.unreadnumber }}条未读
                    </span>
                    <el-icon>
                        <ArrowDown />
                    </el-icon>
                </div>


            </div>

            <div class="rightlist_input" v-if="data.currentSelectType != 0" ref="resizableDivY"
                @mousedown="onMouseDownResizerY">
                <div class="resizer resizerY"></div>

                <div class="input_tool">

                    <div class="tool_item">
                        <Vueemojiicon @click="data.displayemojilist = !data.displayemojilist" />
                        <Vue3EmojiPicker :static-texts="{ placeholder: '', skinTone: '' }"
                            v-show="data.displayemojilist" :theme='data.emojitheme' :hide-search="true"
                            :hide-group-icons="true" :hide-group-names="true" :disable-sticky-group-names="true"
                            :disable-skin-tones="true"
                            :disabled-groups="['food_drink', 'activities', 'travel_places', 'objects', 'symbols', 'flags', 'animals_nature', 'ghost', 'snowboarder', 'gem']"
                            class="emojipicker" :native="true" @select="selectemoji" />
                    </div>

                    <el-upload ref="uploadimg" method="POST" :headers="{ 'authorization': Store.token }"
                        :action="`http://${fileurl}/file/uploadfile`" :limit="10" :before-upload="beforeUploadImg"
                        :on-success="onSuccessUploadImg" :on-error="onErrorUploadImg" :auto-upload="true"
                        :show-file-list="false" multiple>
                        <template #trigger>
                            <el-icon class="tool_item">
                                <Picture />
                            </el-icon>
                        </template>
                    </el-upload>

                    <div class="tool_item">
                        <el-icon class="tool_item" :class="{ 'sound_record_active': data.soundrecorddata.visible }"
                            @click="handlesoundrecord">
                            <Microphone />
                        </el-icon>
                    </div>
                </div>
                <textarea ref="inputtestarea" @click="clickinputevent" v-show="!data.soundrecorddata.visible" cols="30"
                    rows="6" v-model="data.input"></textarea>
                <div class="tool_sound" v-show="data.soundrecorddata.visible">
                    <el-icon :class="{ 'sound_record_active': data.soundrecorddata.recordStatus }">
                        <Microphone />
                    </el-icon>
                    <p>按住空格开始录音，松开发送录音</p>
                </div>
                <div @click="send" class="sendbtn" :style="{ color: data.input ? 'white' : 'rgba(255,255,255,0.4)' }"
                    v-show="!data.soundrecorddata.visible">
                    发送
                </div>
                <!--                 <div @click="testsend" class="sendbtn"
                    :style="{ color: data.input ? 'white' : 'rgba(255,255,255,0.4)', 'right': '200px' }"
                    v-show="!data.soundrecorddata.visible">
                    性能测试
                </div>
                <div @click="closetest" class="sendbtn"
                    :style="{ color: data.input ? 'white' : 'rgba(255,255,255,0.4)', 'right': '400px' }"
                    v-show="!data.soundrecorddata.visible">
                    停止测试
                </div> -->
            </div>


        </div>

        <!-- 申请加入群聊对话框 -->
        <ApplyJoinGroupDialog :addgroupdata="data.addgroupdata" @preapplyentergroup="preapplyentergroup"
            @searchgroup="searchgroup" @beforeCloseAddGroupEvent="beforeCloseAddGroupEvent" />

        <!-- 填写申请加入群聊理由对话框 -->
        <el-dialog :close="beforeCloseAddGroupEvent" v-model="data.addgroupdata.preaddGroupDialogVisible" title="申请理由"
            width="40%">
            <el-input placeholder="申请理由" v-model="data.applyjoingroupdata.Msg" type="textarea" />
            <template #footer>
                <span class="dialog-footer">
                    <el-button type="primary" @click="applyentergroup">
                        提交
                    </el-button>
                </span>
            </template>
        </el-dialog>

        <!-- 创建群聊对话框 -->
        <CreateGroupDialog @closecreategroupdialog="closecreategroupdialog" :creategroupdata="data.creategroupdata"
            @changestep="changestep" @creategroup="creategroup"
            @uploadcreategroupheaderSuccess="uploadcreategroupheaderSuccess" @setLoading="setLoading" />

        <!-- 确定退出(解散)群聊对话框 -->
        <el-dialog v-model="data.quitgroupdata.quitGroupDialogVisible" :title="data.quitgroupdata.title" width="30%">
            <p>退出后会通知群聊中其他成员，且不会再接收此群消息</p>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="data.quitgroupdata.quitGroupDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="quitgroup">
                        确定
                    </el-button>
                </span>
            </template>
        </el-dialog>

        <!-- 消息通知对话框 -->
        <MessageNoticeDialog :userdata="data.userdata" :grouplist="data.grouplist" :applymsgdata="data.applymsgdata"
            :filterapplyjoingrouplist="filterapplyjoingrouplist" :filterapplyadduserlist="filterapplyadduserlist"
            @handleapplymsg="handleapplymsg" @handleapplyaddusermsg="handleapplyaddusermsg" />

        <!-- 申请添加好友对话框 -->
        <ApplyAddUserDialog :userdata="data.userdata" @changeHeaderDialog="changeHeaderDialog"
            :addUserDialogVisible="data.addUserdata.addUserDialogVisible"
            :targetuserdata="data.addUserdata.targetUserData" @setLoading="setLoading" />

        <!-- 查看用户详情对话框 -->
        <UserDetailDialog :UserDetailDialogVisible="data.userinfodata.UserDetailDialogVisible"
            :userdata="data.userinfodata.userdata" :friendinfodata="data.userinfodata.friendinfodata"
            :isfriend="CurrentCheckUserIsFriend" @handlelookuserinfodialog="handlelookuserinfodialog"
            @setcurrentfriendlist="setcurrentfriendlist" @addusertofriend="addusertofriend" />

        <!-- 搜索好友对话框 -->
        <SearchFriendDialog :searchinput="data.searchfrienddata.searchinput"
            :friendlist="data.searchfrienddata.friendlist" :visible="data.searchfrienddata.visible"
            :targetfrienddata="data.searchfrienddata.targetfrienddata"
            @handlesearchfrienddialog="handlesearchfrienddialog" @preapplyaddfriend="preapplyaddfriend"
            @searchfriend="searchfriend" @handlesearchfriendinput="handlesearchfriendinput" />

        <!-- ai助手对话框 -->
        <AiAssistantDialog :username="data.userdata.UserName" :userheader="data.userdata.Avatar"
            :aiAssistantDialogVisible="data.aiAssistantDialogData.aiAssistantDialogVisible"
            @changeAiAssistantDialogVisible="changeAiAssistantDialogVisible" />


    </div>
</template>

<script setup lang="ts">
// const { ipcRenderer } = require('electron')

import JSEncrypt from 'jsencrypt'
import { fileurl, wsurl } from './main'
import { toRef, onMounted, onUnmounted, reactive, ref, watch, computed } from 'vue';
import useCounter from './store/common'
import { ElMessageBox, UploadFile, UploadFiles, UploadProps, UploadRawFile } from 'element-plus';
import {
    encryptAes,
    decryptAes,
    arrayToBase64,
    generateAndStoreKey,
    tip,
    SendGroupResourceMsg,
    SendFriendResourceMsg,
    RegSearch,
    MatchingItem,
    convertISOToFormattedString
} from './utils/utils'
import HeaderVue from './components/header.vue'
import LoginVue from './components/login/login.vue'
import RegisterVue from './components/register/register.vue'

import FuncBarVue from './components/funcbar/funcbar.vue'

import UserInfoVue from './components/userinfo/userinfo.vue'
import GroupItemVue from './components/groupitem/groupitem.vue'
import FriendItemVue from './components/frienditem/friend_item.vue'
import MessageItemVue from './components/messageitem/message_item.vue'
import UserMessageItemVue from './components/usermessageitem/user_message_item.vue'

import CreateGroupDialog from './components/creategroupdialog/create_group_dialog.vue'
import MessageNoticeDialog from './components/messagenoticedialog/message_notice_dialog.vue'
import ApplyJoinGroupDialog from './components/applyjoingroupdialog/apply_join_group_dialog.vue'
import ApplyAddUserDialog from './components/adduserdialog/add_user_dialog.vue'
import UserDetailDialog from './components/userdetaildialog/user_detail_dialog.vue'
import SearchFriendDialog from './components/searchfrienddialog/search_friend_dialog.vue'
import MoreGroupInfoDrawerDetail from './components/moregroupinfodrawerdetail/moregroupinfodrawerdetail.vue'
import AiAssistantDialog from './components/ai_assistant_dialog/ai_assistant_dialog.vue'

import QuitIconVue from './components/icon-compoment/quit_icon.vue'

import Vueemojiicon from './icon/emoji.vue'
import Vueaddicon from "./icon/add-icon.vue"

import Vue3EmojiPicker from 'vue3-emoji-picker';


import {
    loginapi,
    registerapi,

    // RefreshAllapi,
    RefreshGroupListapi,
    RefreshFriendListapi,
    RefreshApplyJoinGroupListapi,
    RefreshApplyAddFriendListapi,

    searchGroupapi,
    applyjoingroupapi,
    joingroupapi,
    creategroupapi,
    exitgroupapi,

    adduserapi,
    getuserdataapi,
    getgusermessagelist,
    getgroupmemberlist,

    emailcodeapi,
    uploadresourceapi,

    searchfriendapi,
    getgroupmessagelist,
    getimgorigindataapi,
    startusertouservideocall,
    deletefriendapi,
} from './API/api'

import {
    Userdata,
    ApplyUserItem,
    ApplyItem,
    GroupList,
    Group,
    GroupinfoList,
    MessageListitem,
    Friend,
    FriendMessageListitem,
    UserShowData,
} from './models/models'


import ContextMenu from '@imengyu/vue3-context-menu'
import { isEmpty } from 'lodash';

const win: any = window  //子进程调用
let Store = useCounter()  //全局数据存储
const keyPair = new JSEncrypt()  //用于加密

const msglist: any = ref(null)
const uploadimg: any = ref(null)
const inputtestarea: any = ref(null)
const resizableDiv: any = ref(null);  //X轴布局更改元素
const resizableDivY: any = ref(null);  //Y轴布局更改元素
let reconnectnum = 0

onMounted(() => {
    win.api && win.api.settitle()

    initListener()

    if (data.logindata.autologin && data.logindata.username && data.logindata.password) {
        setTimeout(() => {
            login()
        }, 1000)
    }
})

onUnmounted(() => {
    // window.removeEventListener('mousedown', onMouseDownResizer);
});

const data = reactive({
    loading: false,
    ws: {
        wsconn: <WebSocket | null>null,  //ws连接
    },
    wsidentify: {
        publickey: "",
        aeskey: <CryptoKey>{},
        wsmsgindex: 0,
    },
    EncryptedSymmetricKey: <Uint8Array>new Uint8Array(),
    // AckFlag: 0,
    islogin: false, //是否登录
    isrelogin: false, //是否为断线重连,默认为false，ws断开为true，重连成功为false，重连失败为false
    loginloading: false, //登录注册页是否加载中
    loadingmessagelist: false, //加载消息列表
    loadingmsaageburial: true, //是否开启加载消息,在切换窗口时设为true

    userdata: <Userdata>{},  //用户信息
    grouplist: <Group>[],//群信息

    input: "hello!",  //聊天输入框
    inputfocusposition: 0, //输入框光标位置

    displayemojilist: false,
    emojitheme: <any>'dark',

    currentgroupdata: <GroupList>{},//当前群聊对话框
    currentfrienddata: <Friend>{},  //当前好友对话框
    currentSelectTab: true, //true:好友  false:群聊
    currentSelectType: <0 | 1 | 2>0,  // 0:未选中   1:群聊   2:好友
    searchdata: {
        searchinput: "", //搜索群输入框
        searchResult: [] as Array<MatchingItem>
    },
    userdetaildata: {  //自己的用户信息
        UserDetailDialogVisible: true
    },
    logindata: { //登录信息
        username: localStorage.getItem("username") || "",
        password: localStorage.getItem("password") || "",
        avatar: localStorage.getItem("avatar") || "",
        rememberpassword: localStorage.getItem("rememberpassword") == "1" ? true : false,
        autologin: localStorage.getItem("autologin") == "1" ? true : false,
        offset: false
    },
    registerdata: { //注册信息
        username: "",
        password: "",
        checkpassword: "",
        email: "",
        emailcode: "",
        sendcodebtn: "发送验证码",
        sendemailbtnvisible: false
    },
    messageunreaddata: {
        unreadnumber: 0
    },
    addUserdata: {
        addUserDialogVisible: false,
        targetUserData: <any>{}
    },
    addgroupdata: {
        addgroupinput: "",   //添加群输入框
        addgroupsearchlist: <GroupinfoList>[], //添加群搜索列表
        addGroupDialogVisible: false,  //是否展示添加群对话框
        preaddGroupDialogVisible: false,  //是否展示添加群理由对话框
    },
    creategroupdata: {
        headeruploadurl: `http://${fileurl}/file/uploadfile`,
        creategroupinput: "",   //添加群输入框
        createGroupDialogVisible: false,  //是否展示添加群对话框
        headerurl: "",
        createstep: 1
    },
    quitgroupdata: {
        quitGroupDialogVisible: false,
        title: "退出群聊",
        targetgroupdata: <GroupList>{}
    },
    applyjoingroupdata: {
        GroupName: "",
        GroupID: -1,
        Msg: "",
        ApplyWay: 1
    },
    soundrecorddata: {
        data: [] as Array<Blob>,
        visible: false,
        recordStatus: false,
        mediaRecorder: <MediaRecorder>{},
        targeturl: ""
    },
    applymsgdata: {
        applyMsgDialogVisible: false
    },
    userinfodata: { //点击查看别人的用户资料时
        UserDetailDialogVisible: false,
        userdata: <UserShowData>{},  //该用户的消息数据
        friendinfodata: <Friend>{}  //如果是好友,为好友数据
    },
    searchfrienddata: {
        searchinput: "",
        friendlist: [] as Array<Friend>,
        visible: false,
        targetfrienddata: <Friend>{}
    },
    moregroupinfo: {
        moregroupinfodrawer: false,
        memberlistdetaildarwer: false,
        memberlistdata: [] as Array<UserShowData>
    },

    aiAssistantDialogData: {
        aiAssistantDialogVisible: false
    }


})


watch(data, (nv) => {
    if (JSON.stringify(nv.currentfrienddata) == "{}" && JSON.stringify(nv.currentgroupdata) == "{}") {
        data.currentSelectType = 0
    }
})

watch(() => data.searchdata.searchinput, (nv) => {
    let matchingarr: Array<MatchingItem> = []
    data.grouplist.forEach(g => {
        matchingarr.push({ avatar: g.GroupInfo.Avatar, name: g.GroupInfo.GroupName, number: g.GroupInfo.ID.toString(), type: 1 })
    })
    data.userdata.FriendList.forEach(f => {
        matchingarr.push({ avatar: f.Avatar, name: f.UserName, number: f.Id.toString(), type: 2 })
    })
    let searcharr = RegSearch(nv.toString(), matchingarr)
    data.searchdata.searchResult = searcharr
})

const allgroupmsgnum = computed(() => {
    let num = 0
    if (JSON.stringify(data.grouplist) != '{}') {
        data.grouplist.forEach(item => {
            num += item.GroupInfo.UnreadMessage
        })
    }
    return num
})

const allfriendmsgnum = computed(() => {
    let num = 0
    if (JSON.stringify(data.userdata) != '{}') {
        data.userdata.FriendList.forEach(item => {
            num += item.UnreadMessage
        })
    }
    return num
})

const CurrentCheckUserIsFriend = computed(() => {
    return data.userdata?.FriendList?.filter(f => f.Id == data.userinfodata.userdata.ID).length != 0
})

const filterapplyjoingrouplist = computed(() => data.userdata.ApplyList ? data.userdata.ApplyList.filter(i => i.HandleStatus == 0 && i.ApplyUserID != data.userdata.ID).length : 0)
const filterapplyadduserlist = computed(() => data.userdata.ApplyUserList ? data.userdata.ApplyUserList.filter(i => i.HandleStatus == 0 && i.ApplyUserID != data.userdata.ID).length : 0)

let TobeConfirmedMessage: Array<MessageListitem> = reactive([])

/* let inn: NodeJS.Timer
const testsend = async () => {
    inn = setInterval(() => {
        for (let i = 0; i < JSON.parse(data.input); i++) {
            send()
        }
    }, 1000)
}
const closetest = () => {
    clearInterval(inn)
}
 */

// 发送消息
const send = async () => {
    data.displayemojilist = false

    if (data.input.replace(/ /g, "").length == 0) return
    if (data.input.length > 1000) {
        tip('warning', "内容超出文本限制")
        return
    }
    let msgstr
    switch (data.currentSelectType) {
        case 1:
            let message: MessageListitem = {
                UserID: data.userdata.ID,
                UserName: data.userdata.UserName,
                UserAvatar: data.userdata.Avatar == "" ? `http://${fileurl}/static/icon.png` : data.userdata.Avatar,
                UserCity: data.userdata.City,
                UserAge: data.userdata.Age,
                GroupID: data.currentgroupdata.GroupInfo.ID,
                Msg: data.input,
                MsgType: 1,
                IsReply: false,
                ReplyMsgID: 0,
                Context: [],
                CreatedAt: new Date().toISOString()
            }
            msgstr = JSON.stringify(message)
            scrolltonew(200, true)
            data.grouplist.forEach((m, index) => {
                if (m.GroupInfo.ID == message.GroupID) {
                    let mm = message

                    mm.MsgStatus = false
                    const reactmm = reactive(mm)
                    console.log("待确认的消息", reactmm);

                    TobeConfirmedMessage.push(reactmm)
                    data.grouplist[index].MessageList.push(reactmm)
                }
            })
            break;
        case 2:
            msgstr = SendFriendResourceMsg(data.input, 1001, data.userdata, data.currentfrienddata)
            break
    }
    // console.log("encryptedData",encryptedData);
    if (!isEmpty(msgstr)) {
        const encryptedData = await encryptAes(data.wsidentify.aeskey, msgstr)
        data.ws?.wsconn?.send(encryptedData)
    }
    data.input = ""
}

// 设置监听当前窗口
const setcurrentlistener = async () => {
    const { scrollHeight, scrollTop, offsetHeight } = msglist.value
    if (scrollTop < 150 && data.loadingmsaageburial) {
        if (data.currentSelectType == 1) {
            let oldscrollHeight = msglist.value.scrollHeight

            data.loadingmsaageburial = false
            getgroupmessagelist(data.currentgroupdata.GroupInfo.ID, data.currentgroupdata.MessageList.length).then(res => {
                if (res.data.data != null && res.data.data.length != 0) {
                    // data.currentgroupdata.MessageList.unshift(...res.data.data)
                    data.grouplist.map(g => {
                        if (g.GroupInfo.ID == data.currentgroupdata.GroupInfo.ID) {
                            g.MessageList.unshift(...res.data.data)
                        }
                        return g
                    })
                }
                setTimeout(() => {
                    msglist.value.scrollTop += msglist.value.scrollHeight - oldscrollHeight
                }, 0);
            }).catch(err => {
                console.log(err);
                tip("error", "获取消息失败!")
            })
            setTimeout(() => {
                data.loadingmsaageburial = true
            }, 1000);
        }

        if (data.currentSelectType == 2) {
            let oldscrollHeight = msglist.value.scrollHeight

            data.loadingmsaageburial = false
            getgusermessagelist((data.currentfrienddata.Id), data.currentfrienddata.MessageList.length).then(res => {
                if (res.data.data != null && res.data.data.length != 0) {
                    data.userdata.FriendList.map(f => {
                        if (f.Id == data.currentfrienddata.Id) {
                            f.MessageList.unshift(...res.data.data)
                        }
                        return f
                    })
                    setTimeout(() => {
                        msglist.value.scrollTop += msglist.value.scrollHeight - oldscrollHeight
                    }, 0);
                    data.loadingmsaageburial = true
                }

            }).catch(err => {
                console.log(err);
                tip("error", "获取消息失败!")
                setTimeout(() => {
                    data.loadingmsaageburial = true
                }, 1000);
            })
        }

    }
    if (scrollHeight - scrollTop - 3 * 83.6 < offsetHeight
    ) {
        data.messageunreaddata.unreadnumber = 0
    }
}

// 设置选中群聊对话框,清除未读消息,监听滚动
const setcurrentgrouplist = (group: GroupList) => {
    if (data.currentgroupdata?.GroupInfo?.ID == group.GroupInfo.ID) {
        return
    }
    data.loadingmessagelist = true
    data.loadingmsaageburial = true //在滚动到顶部时,是否开启监听,获取消息
    data.currentgroupdata = group
    data.currentSelectTab = false
    // console.log(data.currentgroupdata);

    if (data.currentgroupdata.GroupInfo.UnreadMessage != 0) clearcurrentgroupmsg()
    data.messageunreaddata.unreadnumber = 0 //清空未读
    setTimeout(() => {
        scrolltonew(0)
    }, 200);
    setTimeout(() => {
        msglist.value.addEventListener("scroll", setcurrentlistener)
    }, 0);
    group.GroupInfo.UnreadMessage = 0

    data.currentfrienddata = <Friend>{}
    data.currentSelectType = 1
    setTimeout(() => {
        data.loadingmessagelist = false
    }, 250);
}

// 设置选中好友对话框,清除未读消息,监听滚动
const setcurrentfriendlist = (frienddata: Friend) => {
    if (data.currentfrienddata.Id == frienddata.Id) {
        return
    }

    data.moregroupinfo.moregroupinfodrawer = false
    data.moregroupinfo.memberlistdetaildarwer = false

    data.loadingmessagelist = true
    data.loadingmsaageburial = true //在滚动到顶部时,是否开启监听,获取消息
    data.currentfrienddata = frienddata
    data.currentSelectTab = true
    data.userinfodata.UserDetailDialogVisible = false
    if (data.currentfrienddata.UnreadMessage != 0) clearcurrentfriendmsg()
    // if (data.currentgroupdata.GroupInfo.UnreadMessage != 0) clearcurrentmsg()
    data.messageunreaddata.unreadnumber = 0 //清空未读
    frienddata.UnreadMessage = 0 //清空好友未读

    setTimeout(() => {
        scrolltonew(0)
    }, 200)
    setTimeout(() => {
        msglist.value.addEventListener("scroll", setcurrentlistener)
    }, 0);

    data.currentgroupdata = <GroupList>{}
    data.currentSelectType = 2

    setTimeout(() => {
        data.loadingmessagelist = false
    }, 250);
}

// 登录
const login = async () => {
    data.loginloading = true
    const { username, password } = data.logindata

    try {
        let res:any =await loginapi(username, password)

        console.log(res);

        // 数据处理
        if (res.data.userdata.GroupList == null) {
            res.data.userdata.GroupList = []
        }
        data.userdata = res.data.userdata
        // 时间处理
        data.userdata.LoginTime = data.userdata.LoginTime.slice(0, 19)
        data.userdata.CreatedTime = convertISOToFormattedString(data.userdata.CreatedTime)
        data.grouplist = res.data.userdata.GroupList.map((group: GroupList) => {
            if (group.MessageList == null) {
                group.MessageList = []
            }
            return group
        })

        // 数据保存
        Store.token = res.data.token
        localStorage.setItem("token", res.data.token)
        localStorage.setItem("username", data.logindata.username)
        localStorage.setItem("avatar", data.userdata.Avatar)
        if (localStorage.getItem("rememberpassword") == "1") {
            localStorage.setItem("password", data.logindata.password)
        } else {
            localStorage.removeItem("password")
        }
        connectws()

    } catch (err:any) {
        let errinfo = "发生了未知的错误: " + err
        console.log(err);
        if (err.status && err.status >= 500) {
            errinfo = "网络开了点小差,请稍后重试!"
        }
        if (err.response && err.response.data) {
            const data: any = err.response.data
            errinfo = data.msg
        }
        setTimeout(() => {
            tip("error", errinfo)
            data.loginloading = false
        }, 500);
    }
}

// 退出登录
const outlogin = (immediately: boolean = false) => {
    if (immediately) {
        loginOutAndClearInfo()
    } else {
        ElMessageBox.confirm("确认退出登陆吗?", "退出登陆", {
            confirmButtonText: '退出',
            cancelButtonText: '取消',
        }).then(() => {
            loginOutAndClearInfo()
        }).catch(() => {
        })
    }
    // ipcRenderer.send('backtologin')

}
const loginOutAndClearInfo = () => {
    win.api && win.api.backtologin()
    setTimeout(() => {
        data.islogin = false
        data.loginloading = false
        data.loading = false
    }, 50);
    data.wsidentify.wsmsgindex = 0
    data.wsidentify.publickey = ""
    data.ws?.wsconn?.close()
    data.currentgroupdata = <GroupList>{}
    data.currentSelectType = 0
    data.currentSelectTab = true
    data.currentfrienddata = <Friend>{}
    data.input = ""
    data.searchdata.searchinput = ""
    data.addgroupdata.addgroupinput = ""
    data.addgroupdata.addgroupsearchlist = <GroupinfoList>[]
    data.soundrecorddata.visible = false
    data.addUserdata.targetUserData = {}
    TodoMessagequeue.length = 0
}


// 处理消息
const handleMsg = (msg: any) => {
    const DefaultGroupMsg = async (msg: MessageListitem) => {
        if (msg.MsgType == 2) {
            msg.Msg = await imgurltolocalimg(msg.Msg)
        }
        data.grouplist.forEach((group, index) => {
            // console.log(group.GroupInfo.ID, msg.GroupID);
            if (group.GroupInfo.ID == msg.GroupID) {
                if (group.MessageList == null) { group.MessageList = [] }

                // 自己发的消息的ack消息,通过reactive来引用修改消息状态 
                if (msg.UserID == data.userdata.ID) {
                    console.log("用于确认的消息", msg);

                    let tempmsg = msg
                    tempmsg.MsgStatus = false
                    TobeConfirmedMessage.forEach(msg => {
                        if (tempmsg.CreatedAt == msg.CreatedAt && tempmsg.UserID == msg.UserID) {
                            setTimeout(() => {
                                msg.MsgStatus = true
                            }, 500);
                        }
                    })
                } else {
                    // 其他用户发的消息,添加至消息列表
                    group.MessageList.push(msg)
                }

                let temp = data.grouplist[index]
                data.grouplist[index] = data.grouplist[0]
                data.grouplist[0] = temp

                // notification 系统通知
                // TODO 123
                if (msg.UserID != data.userdata.ID) {
                    win.api && win.api.notification(group.GroupInfo.GroupName, msg.MsgType == 1 ? msg.Msg : "[媒体消息]") //系统通知
                }
            }
        })
    }

    const refreshGroupMsg = async () => {
        console.log("收到刷新消息");
        await refreshgrouplistdata()
        return
    }

    // 有用户退出群聊
    const QuitGroupMsg = async (msg: MessageListitem) => {
        let targetgroup = data.grouplist.find(group => group.GroupInfo.ID == msg.GroupID)
        if (typeof targetgroup != "undefined") {
            targetgroup.MessageList.push(msg)
            targetgroup.GroupInfo.MemberCount--
        }
        // data.grouplist.find(group => group.GroupInfo.ID == msg.GroupID)?.MessageList.push(msg)
    }

    const JoginGroupMsg = async (msg: MessageListitem) => {
        if (msg.UserID == data.userdata.ID) {
            return
        }
        // refreshgroupnoticedata()
        let targetgroup = data.grouplist.find(group => group.GroupInfo.ID == msg.GroupID)
        if (typeof targetgroup != "undefined") {
            targetgroup.MessageList.push(msg)
            targetgroup.GroupInfo.MemberCount++
        }
        // refreshgrouplistdata()
    }

    // 解散群聊
    const DissolveGroupMsg = async (msg: MessageListitem) => {
        if (JSON.stringify(data.currentgroupdata) != "{}") {
            if (msg.GroupID == data.currentgroupdata.GroupInfo.ID) {
                console.log("清空当前列表");
                tip('info', '当前群聊已解散')
                data.currentgroupdata = <GroupList>{}
            }
        }
        // await refreshgrouplistdata()
        data.grouplist = data.grouplist.filter(group => group.GroupInfo.ID !== msg.GroupID)
    }

    const DefaultFriendMsg = async (msg: FriendMessageListitem) => {
        if (msg.MsgType == 1002) {
            msg.Msg = await imgurltolocalimg(msg.Msg)
        }
        data.userdata.FriendList.forEach((friend: Friend, index: number) => {
            if (friend.Id == msg.UserID || friend.Id == msg.ReceiveUserID) {
                friend.MessageList.push(msg)

                // 交换位置
                let temp = data.userdata.FriendList[index]
                data.userdata.FriendList[index] = data.userdata.FriendList[0]
                data.userdata.FriendList[0] = temp
            }
        })

        // 处理未读和滚动
        // 自己发的不管
        if (msg.UserID == data.userdata.ID) {
            console.log("自己发的");

            scrolltonew(0, true)
            clearcurrentfriendmsg()
            return
        }
        // 当前选中的好友是否是消息接收者
        if (data.currentfrienddata.Id == msg.UserID) {
            console.log("当前选中的好友是消息接收者");
            clearcurrentfriendmsg()
            if (msglist.value == null) return
            const { scrollHeight, scrollTop, offsetHeight } = msglist.value
            if (scrollTop + offsetHeight + (3 * 83.6) > scrollHeight) {
                console.log("滚动到最新");

                scrolltonew(0, true)
            } else {
                console.log("未读加一");
                data.messageunreaddata.unreadnumber += 1
            }
        } else { //否则,收到一条好友消息,但是未读
            console.log("当前未选中好友");

            data.userdata.FriendList.forEach(i => {
                if (i.Id == msg.UserID) {
                    console.log("收到一条好友消息,但是未读");
                    i.UnreadMessage++
                }
            });
            win.api && win.api.notification(msg.UserName, msg.Msg) //系统通知
        }
        // console.log(data.userdata.FriendList);
        return
    }

    // 1v1视频通话
    const UserToUserRemoteVideoCallMsg = async (msg: FriendMessageListitem) => {
        console.log(msg);
        win.api && win.api.createRemoteVideo(data.userdata.ID, "receiver")
    }

    const typelist = {
        1: DefaultGroupMsg,
        2: DefaultGroupMsg,
        3: DefaultGroupMsg,
        200: refreshGroupMsg,
        201: QuitGroupMsg,
        202: JoginGroupMsg,
        204: DissolveGroupMsg,
        500: () => {
            refreshgrouplistdata()
            refreshgroupnoticedata()
        },
        502: refreshgroupnoticedata,
        1001: DefaultFriendMsg,
        1002: DefaultFriendMsg,
        1003: DefaultFriendMsg,
        1005: refreshfriendnoticedata,
        1006: refreshfriendlistdata,
        1007: () => { //刷新好友列表
            refreshfriendlistdata()
            refreshfriendnoticedata()
        },
        1501: UserToUserRemoteVideoCallMsg,
    }
    const msgtype = msg.MsgType
    let func = typelist[msgtype]
    if (typeof func == "function") {
        func(msg)
    }

    if (msg.UserID != data.userdata.ID && msg.MsgType < 500) { //如果不是自己发的消息并且不是刷新消息
        if (JSON.stringify(data.currentgroupdata) != "{}") { //当前是否选中了群聊
            if (data.currentgroupdata.GroupInfo.ID != msg.GroupID) {//并且选中的群聊不是消息的群聊
                data.grouplist.forEach(group => {
                    if (group.GroupInfo.ID == msg.GroupID) {
                        group.GroupInfo.UnreadMessage++ //未读加一
                    }
                })
            } else {
                clearcurrentgroupmsg() //清空未读
            }
        } else { //没选群聊,未读加一
            data.grouplist.forEach(group => {
                if (group.GroupInfo.ID == msg.GroupID) {
                    group.GroupInfo.UnreadMessage++

                }
            })
        }
    }

    if (msglist.value == null || JSON.stringify(data.currentgroupdata) == '{}') return
    const { scrollHeight, scrollTop, offsetHeight } = msglist.value
    if (msg.GroupID == data.currentgroupdata.GroupInfo.ID &&
        msg.UserID != data.userdata.ID
    ) {
        if (scrollTop + offsetHeight + (3 * 83.6) > scrollHeight) {
            setTimeout(() => {
                scrolltonew(0, true)
            }, 500);
        } else {
            data.messageunreaddata.unreadnumber += 1
        }
    }
}


// 消费消息
setInterval(async () => {
    if (TodoMessagequeue.length == 0) {
        return
    }
    let msgstr = TodoMessagequeue.shift()
    if (typeof msgstr == "undefined") return
    const regex = /\{([^}]+)\}/g;
    let match;
    while ((match = regex.exec(msgstr)) !== null) {
        const innerContent = match[1];
        try {
            // 使用 JSON.parse 将字符串解析成对象
            const encryptedData = JSON.parse(`{${innerContent}}`);
            // console.log("未解密消息", encryptedData);
            const DecryptedMsgStr = await decryptAes(data.wsidentify.aeskey, encryptedData.Message, encryptedData.Iv)
            // console.log("解密字符", DecryptedMsgStr);
            const DecryptedMsg = JSON.parse(DecryptedMsgStr);
            console.log("解密消息", DecryptedMsg);
            handleMsg(DecryptedMsg)
        } catch (error) {
            console.error('Error parsing JSON:', error);
        }
    }
}, 100)

// 处理密钥传递消息
const handlepublickeymsg = async (keymsg: any) => {
    let publicKey = keymsg.replace("-----BEGIN RSA PUBLIC KEY-----", "")
        .replace("-----END RSA PUBLIC KEY-----", "")
        .replace(/\r?\n|\r/g, "");
    keyPair.setKey(publicKey)

    let aeskey = await window.crypto.subtle.exportKey("raw", data.wsidentify.aeskey)
    // console.log("aeskey", aeskey);

    let aeskeybase64 = arrayToBase64(aeskey)
    let enkey = keyPair.encrypt(aeskeybase64)
    if (enkey != false) {
        data.ws?.wsconn?.send(enkey)
    }
}

// 去注册页面
const toregister = () => {
    data.logindata.offset = !data.logindata.offset
}

// 注册
const register = () => {
    data.loginloading = true

    let { username, password, checkpassword, email, emailcode } = data.registerdata

    var usernamereg = /^[a-zA-Z0-9_]+$/;
    if (username.length < 6 ||
        password.length < 6 ||
        password != checkpassword ||
        email.length == 0 ||
        emailcode.length == 0 ||
        !usernamereg.test(username) ||
        /\s/.test(username) ||
        /\s/.test(password)
    ) {
        tip("error", "信息有误,请检查后重试!")
        data.loginloading = false
        return
    }

    registerapi(username, password, email, emailcode)?.then(res => {
        console.log(res);
        if (res.status != 200) {
            tip("error", "注册失败,请稍后再试!")
        } else {
            tip("success", "注册成功!")
            data.logindata.offset = !data.logindata.offset
            data.logindata.username = username
            data.logindata.password = password
            data.registerdata = {
                username: "",
                password: "",
                checkpassword: "",
                email: "",
                emailcode: "",
                sendemailbtnvisible: false,
                sendcodebtn: "发送验证码"
            }
        }
    }).catch(err => {
        tip("error", err.response.data.msg)
    })
    data.loginloading = false

}

// 打开录音窗口
const handlesoundrecord = () => {
    data.soundrecorddata.visible = !data.soundrecorddata.visible
}

// 刷新群聊列表
const refreshgrouplistdata = async () => {
    RefreshGroupListapi(data.userdata.ID).then(res => {
        console.log(res.data);
        if (res.data.data == null) {
            data.currentgroupdata = <GroupList>{}

            data.grouplist = []
            return
        }
        data.grouplist = res.data.data.map(group => {
            if (group.MessageList == null) {
                group.MessageList = []
            }
            return group
        })

        // 解决当有人退出然后重进后,发送消息丢失响应式的bug
        if (JSON.stringify(data.currentgroupdata) != "{}") {
            const currentid = data.currentgroupdata.GroupInfo.ID
            data.grouplist.forEach(group => {
                if (group.GroupInfo.ID == currentid) {
                    data.currentgroupdata = group
                }
            })
            // 判断选中的群聊是否存在,不存在就关闭群聊聊天列表
            const hasID = data.grouplist.some(group => group.GroupInfo.ID = currentid)
            if (!hasID) {
                data.currentgroupdata = <GroupList>{}
                if (data.currentSelectType == 1) {
                    data.currentSelectType = 0
                }
                return
            }
            scrolltonew(0, true)
        }

    }).catch(err => {
        tip('error', err.response)
    })
}

// 刷新群聊通知列表
const refreshgroupnoticedata = async () => {
    RefreshApplyJoinGroupListapi(data.userdata.ID).then(res => {
        console.log(res.data);
        data.userdata.ApplyList = res.data.data
        console.log(data.userdata);

    }).catch(err => {
        tip('error', err.response)
    })
}

// 刷新好友列表
const refreshfriendlistdata = async () => {
    RefreshFriendListapi(data.userdata.ID).then(res => {
        console.log(res.data);
        data.userdata.FriendList = res.data.data

        let flist = data.userdata.FriendList.filter(f => f.Id == data.currentfrienddata.Id)
        if (flist.length == 0) {
            data.currentSelectType = 0
            data.currentfrienddata = <Friend>{}
        }

        console.log(data.userdata);
    }).catch(err => {
        tip('error', err.response)
    })
}

// 刷新好友通知列表
const refreshfriendnoticedata = async () => {
    RefreshApplyAddFriendListapi(data.userdata.ID).then(res => {
        console.log(res.data);
        data.userdata.ApplyUserList = res.data.data
        console.log(data.userdata);
    }).catch(err => {
        tip('error', err.response)
    })
}

// 关闭添加群聊对话框之前
const beforeCloseAddGroupEvent = () => {
    data.addgroupdata.addgroupsearchlist = <GroupinfoList>{}
    data.addgroupdata.addgroupinput = ""
}

// 填写添加群聊理由前(绑定当前选择数据)
const preapplyentergroup = (group: GroupInfo) => {
    data.applyjoingroupdata.GroupID = group.ID
    data.applyjoingroupdata.GroupName = group.GroupName
    data.addgroupdata.preaddGroupDialogVisible = true
}

// 申请加入群聊
const applyentergroup = async () => {
    data.loading = true
    console.log(data.applyjoingroupdata);

    try {
        let res = await applyjoingroupapi(data.applyjoingroupdata)
        console.log(res);
        tip("success", "申请成功")
        data.addgroupdata.addgroupinput = ""
        data.applyjoingroupdata.Msg = ""
        data.addgroupdata.preaddGroupDialogVisible = false
        data.addgroupdata.addGroupDialogVisible = false
        data.addgroupdata.addgroupsearchlist = <GroupinfoList>{}
        refreshgroupnoticedata()
    } catch (err: any) {
        tip("error", err.response.data.msg)
    }
    data.loading = false


}

// 创建群聊
const creategroup = async () => {
    data.loading = true
    const { creategroupinput, headerurl } = data.creategroupdata
    try {
        let res = await creategroupapi(creategroupinput, headerurl)
        if (res.status == 200) {
            let newgrouplist = [toRef(res.data.data).value].concat(data.grouplist)
            data.grouplist = newgrouplist
            tip('success', "创建成功")
            // refreshgrouplist()
            data.creategroupdata = {
                headeruploadurl: `http://${fileurl}/file/uploadfile`,
                creategroupinput: "",
                createGroupDialogVisible: false,
                headerurl: "",
                createstep: 1
            }
        } else {
            throw "创建失败,请稍后重试"
        }
    } catch (err) {
        tip('error', "创建失败,请稍后重试")
    }
    data.loading = false

}

// 切换创建群聊的步骤
const changestep = (i: number) => {
    i == 0 ? (data.creategroupdata.createstep--) : (data.creategroupdata.createstep++)
}

// 切换退出群聊对话框的显示
const changequitgroupdialog = (item: GroupList) => {
    data.quitgroupdata.title = item.GroupInfo.CreaterID == data.userdata.ID ? "解散群聊" : "退出群聊"
    data.quitgroupdata.targetgroupdata = item
    data.quitgroupdata.quitGroupDialogVisible = true
}

// 退出群聊
const quitgroup = async () => {
    data.loading = true

    const GroupInfo = data.quitgroupdata.targetgroupdata.GroupInfo
    // console.log(GroupInfo);

    try {
        let res = await exitgroupapi(GroupInfo.ID)
        if (res.status == 200) {
            data.quitgroupdata.quitGroupDialogVisible = false
            data.moregroupinfo.moregroupinfodrawer = false
            if (JSON.stringify(data.currentgroupdata) != '{}') {
                if (data.currentgroupdata.GroupInfo.ID == GroupInfo.ID) {
                    data.currentSelectType = 0
                    data.currentgroupdata = <GroupList>{}
                }
            }
            data.grouplist = data.grouplist.filter(group => group.GroupInfo.ID !== GroupInfo.ID)
            tip("success", GroupInfo.CreaterID == data.userdata.ID ? "解散成功!" : "退出成功!")
        } else {
            throw "操作失败"
        }
    } catch (err) {
        console.log(err);
        tip("error", "操作失败")
    }

    data.loading = false
    // data.currentgroupdata = <GroupList>{
    //     GroupInfo: <GroupInfo>{},
    //     MessageList: [] as Array<MessageListitem>
    // }
}

// 搜索群聊
const searchgroup = async () => {
    if (data.addgroupdata.addgroupinput.trim().length == 0) {
        tip("error", "关键词不能为空!")
        data.loading = false
        return
    }
    
    data.loading = true

    try {
        let res = await searchGroupapi(data.addgroupdata.addgroupinput)
        if (res.status != 200) {
            tip("error", "搜索失败！")
        } else {
            // console.log(res.data.grouplist);
            data.addgroupdata.addgroupsearchlist = res.data.grouplist == null ? [] : res.data.grouplist
        }
    } catch (err) {
        tip("error", "搜索失败,请稍后重试")
    }

    data.loading = false
}

// 处理添加群聊通知
const handleapplymsg = async (apply: ApplyItem, status: number) => {
    data.loading = true

    try {
        let res = await joingroupapi(apply.ID, status)
        if (res.status == 200) {
            tip("success", "操作成功")
            apply.HandleStatus = status
        } else {
            tip("error", "操作失败,请稍后重试")
        }
    } catch (err) {
        tip("error", "操作失败,请稍后重试")
    }
    data.loading = false

}

// 处理添加好友通知
const handleapplyaddusermsg = async (apply: ApplyUserItem, status: number) => {
    data.loading = true

    apply.HandleStatus = status

    try {
        let res = await adduserapi(apply.ID, status)
        if (res.status = 200) {
            tip("success", "操作成功")
        } else {
            throw "操作失败,请稍后重试"
        }
    } catch (err) {
        // console.log(err);
        tip("error", "操作失败,请稍后重试")
    }
    data.loading = false

}

// 打开群聊右键菜单
const openeditgroupmenu = (e: any, item: GroupList) => {
    if (e.type == "contextmenu") {
        ContextMenu.showContextMenu({
            x: e.clientX,
            y: e.clientY,
            items: [
                {
                    label: "详细信息",
                    onClick: () => {
                        setcurrentgrouplist(item)
                        changemoregroupinfodarwer()
                    }
                },
                {
                    label: "复制群号",
                    onClick: () => {
                        navigator.clipboard.writeText(item.GroupInfo.ID.toString())
                        tip("success", "复制成功!")
                    }
                },
                {
                    label: item.GroupInfo.CreaterID == data.userdata.ID ? "解散群聊" : "退出群聊",
                    onClick: () => {
                        changequitgroupdialog(item)
                    }
                }
            ]
        });
    }

}

// 打开消息的右键菜单
const openMsgHandleMenu = (e: any, item: MessageListitem) => {
    if (e.type == "contextmenu") {
        ContextMenu.showContextMenu({
            x: e.clientX,
            y: e.clientY,
            items: [
                {
                    label: "复制",
                    onClick: () => {
                        let text = window.getSelection()?.toString() || ""
                        if (text.length == 0) {
                            navigator.clipboard.writeText(item.Msg)
                        } else {
                            navigator.clipboard.writeText(text)

                        }
                    }
                }
            ]
        });
    }
}

// 初始化键盘监听
const initListener = () => {
    window.addEventListener('keydown', (event) => {
        if (event.key == "Enter") {
            event.preventDefault()
            if (event.ctrlKey == true) {
                data.input += "\n"
                return
            } else {
                if (!data.aiAssistantDialogData.aiAssistantDialogVisible) {
                    send()
                }
            }

        }
        if (event.code == "Space" && data.soundrecorddata.visible == true && data.soundrecorddata.recordStatus != true) {
            data.soundrecorddata.recordStatus = true
            const constraints = { audio: true };
            navigator.mediaDevices.getUserMedia(constraints).then(
                stream => {
                    console.log("授权成功！");
                    data.soundrecorddata.mediaRecorder = new MediaRecorder(stream);
                    data.soundrecorddata.mediaRecorder.start()
                    data.soundrecorddata.mediaRecorder.ondataavailable = function (e) {
                        data.soundrecorddata.data.push(e.data);
                    };
                    data.soundrecorddata.mediaRecorder.onstop = () => {
                        var blob = new Blob(data.soundrecorddata.data, { type: "audio/mp3; codecs=opus" });
                        let file = new File([blob], 'audio.mp3', { type: 'application/octet-stream' });

                        let formData = new FormData();
                        formData.append('file', file);
                        uploadresourceapi(formData).then(async res => {
                            let msg = ""
                            if (data.currentSelectType == 1) {
                                msg = SendGroupResourceMsg(res.data.fileurl, 3, data.userdata, data.currentgroupdata.GroupInfo.ID)
                            } else {
                                msg = SendFriendResourceMsg(res.data.fileurl, 1003, data.userdata, data.currentfrienddata)
                            }
                            let encryptedData = await encryptAes(data.wsidentify.aeskey, msg)
                            data.ws?.wsconn?.send(encryptedData)
                            scrolltonew(500, true)
                        }).catch(err => {
                            tip('error', err.response.data.msg)
                        })
                        data.soundrecorddata.data = [];
                        var audioURL = window.URL.createObjectURL(blob);
                        data.soundrecorddata.targeturl = audioURL;
                    };
                }
            );
        }
    })

    window.addEventListener('keyup', (event) => {
        if (data.soundrecorddata.visible == true && event.code == "Space") {
            console.log("结束录音");
            data.soundrecorddata.recordStatus = false
            data.soundrecorddata.mediaRecorder.stop()
        }

    })

    // window.addEventListener('mousedown', onMouseDownResizer);

}

// 发送邮箱验证码
const sendemailCode = () => {
    data.loginloading = true

    const email = data.registerdata.email

    var reg = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;
    if (!reg.test(email)) {
        tip("error", "邮箱格式不正确!")
        data.loginloading = false
        return
    }

    data.registerdata.sendemailbtnvisible = true
    let i = 59
    data.registerdata.sendcodebtn = `60s`
    let downtime = setInterval(() => {
        data.registerdata.sendcodebtn = `${i}s`
        i--
    }, 1000)

    emailcodeapi(email).then(res => {
        console.log(res);
        tip("success", res.data.msg)
        setTimeout(() => {
            clearInterval(downtime)
            data.registerdata.sendcodebtn = "发送验证码"
            data.registerdata.sendemailbtnvisible = false
        }, 60000);

    }).catch(err => {
        tip("error", "验证码发送失败!")
        console.log(err);

    })
    data.loginloading = false

}

//  上传群头像
const uploadcreategroupheaderSuccess: UploadProps['onSuccess'] = (response) => {
    console.log(response);

    if (response.code == 1) {
        tip("error", response.msg)
        return
    }
    tip("success", response.msg)
    data.creategroupdata.headerurl = response.fileurl
}

// 滚动到最新
const scrolltonew = (delay: number = 0, smooth: boolean = false) => {
    data.messageunreaddata.unreadnumber = 0
    if (!msglist) {
        return
    }
    setTimeout(() => {
        let h = 0
        if (data.currentSelectType == 1) h = data.currentgroupdata.MessageList.length * 300
        if (data.currentSelectType == 2) h = data.currentfrienddata.MessageList.length * 300
        // console.log(h);
        msglist.value.scrollTo({ top: h, behavior: smooth ? "smooth" : "instant" })
    }, delay);
}

// 清除当前群聊消息
const clearcurrentgroupmsg = async () => {
    let message = {
        UserID: data.userdata.ID,
        UserName: data.userdata.UserName,
        GroupID: data.currentgroupdata.GroupInfo.ID,
        MsgType: 401,
        CreatedAt: new Date()
    }
    let encryptedData = await encryptAes(data.wsidentify.aeskey, JSON.stringify(message))
    data.ws?.wsconn?.send(encryptedData)
}

// 清除当前好友消息
const clearcurrentfriendmsg = async () => {
    let message = SendFriendResourceMsg("", 1401, data.userdata, data.currentfrienddata)
    let encryptedData = await encryptAes(data.wsidentify.aeskey, message)
    data.ws?.wsconn?.send(encryptedData)
}

// 上传图片之前
const beforeUploadImg = (rawFile: UploadRawFile) => {
    console.log(rawFile);
}
// 上传图片成功
const onSuccessUploadImg = async (response: any, uploadFile: any) => {
    console.log(response, uploadFile);
    uploadimg.value.clearFiles(["success"])
    let msg
    if (data.currentSelectType == 1) {
        msg = SendGroupResourceMsg(uploadFile.response.fileurl, 2, data.userdata, data.currentgroupdata.GroupInfo.ID)
    } else if (data.currentSelectType == 2) {
        msg = SendFriendResourceMsg(uploadFile.response.fileurl, 1002, data.userdata, data.currentfrienddata)
    }
    let encryptedData = await encryptAes(data.wsidentify.aeskey, msg)
    data.ws?.wsconn?.send(encryptedData)
    scrolltonew(500, true)

}
// 上传图片失败
const onErrorUploadImg = (response: any, uploadFile: UploadFile, uploadFiles: UploadFiles) => {
    console.log(response, uploadFile, uploadFiles);
    uploadimg.value.clearFiles(["success"])
    tip('error', "发送失败!")
}


let TodoMessagequeue: Array<string> = []
// 连接ws
const connectws = async () => {
    data.wsidentify.aeskey = await generateAndStoreKey()
    const token = localStorage.getItem("token") || ""
    // 连接ws
    data.ws.wsconn = new WebSocket(`ws://${wsurl}/ws?token=${token}`),

        data.ws.wsconn.onopen = function () {
            // 设置显示
            setTimeout(() => {
                data.loginloading = false
                if (!data.isrelogin && win.api) {
                    win.api.changWindowSize()
                    win.api.setMainWindowPosition()
                }
                data.islogin = true
            }, 1000);

            console.log("connect success!");
            data.isrelogin = false
            data.loading = false
            reconnectnum = 0
        }

    data.ws.wsconn.onclose = function (evt: any) {
        data.loading = true
        data.isrelogin = true
        data.wsidentify = {
            publickey: "string",
            wsmsgindex: 0,
            aeskey: <CryptoKey>{}
        }

        // console.log(evt);
        console.log("connect close!");

        if (evt.code == 1005) return
        tip('error', "网络连接超时,尝试重连中...")
        if (reconnectnum >= 3) {
            outlogin(true)
            data.loading = false
            data.loginloading = false
            data.isrelogin = false
            reconnectnum = 0
            return
        }
        setTimeout(() => {
            console.log("尝试重连1...");
            reconnectnum++
            connectws()
        }, 3000);
    }
    // 接收消息 
    data.ws.wsconn.onmessage = function (evt: any) {
        // 身份校验,交换密钥
        if (data.wsidentify.wsmsgindex == 0) {
            handlepublickeymsg(evt.data)
            data.wsidentify.wsmsgindex++
            return
        }
        data.wsidentify.wsmsgindex++
        var msgstr = evt.data.split('\n');
        setTimeout(() => {
            TodoMessagequeue.push(msgstr)
        }, 0);
    }

    data.ws.wsconn.onerror = function (evt: any) {
        console.log(evt);
    }
}

// 打开自己的用户详情对话框
const userdetaildialoghandleClose = () => {
    data.userdetaildata.UserDetailDialogVisible = !data.userdetaildata.UserDetailDialogVisible
}

// 修改用户信息
const edituserdata = (age: number, city: string, introduce: string) => {
    data.userdata.Age = age
    data.userdata.City = city
    data.userdata.Introduce = introduce
}

// 打开添加用户对话框
const changeHeaderDialog = (item: Userdata = <Userdata>{}) => {
    data.addUserdata.targetUserData = item
    data.addUserdata.addUserDialogVisible = !data.addUserdata.addUserDialogVisible
}

// 在群聊中点击其他用户头像里点击 "添加好友" 时触发
const addusertofriend = (usermsgdata: UserShowData) => {
    const userdata: Userdata = {
        ID: usermsgdata.ID,
        NikeName: usermsgdata.UserName,
        UserName: usermsgdata.UserName,
        CreatedTime: usermsgdata.CreatedAt,
        Avatar: usermsgdata.Avatar,
        Age: usermsgdata.Age,
        City: usermsgdata.City,
        Introduce: "",
        Email: '',
        LoginTime: '',
        GroupList: [],
        ApplyList: [],
        ApplyUserList: [],
        FriendList: []
    }
    data.userdetaildata.UserDetailDialogVisible = false
    changeHeaderDialog(userdata)
}


// 关闭创建群聊对话框
const closecreategroupdialog = () => {
    data.creategroupdata.createstep = 1
    data.creategroupdata.headerurl = ""
    data.creategroupdata.creategroupinput = ""
    data.creategroupdata.createGroupDialogVisible = false
}

// 点击群聊信息里的,群成员查看资料时触发
const lookuserinfo = async (userid: number) => {
    if (userid == data.userdata.ID) {
        data.userdetaildata.UserDetailDialogVisible = true
        return
    }
    data.loading = true

    try {
        let res = await getuserdataapi(userid)
        if (res.status != 200) {
            tip('error', "获取信息失败,请稍后重试!")
        } else {
            data.userinfodata.userdata = res.data.data
            if (CurrentCheckUserIsFriend) {
                data.userinfodata.friendinfodata = data.userdata.FriendList.filter(f => f.Id == userid)[0] || <Friend>{}
            }
            data.userinfodata.UserDetailDialogVisible = true
        }
    } catch (err) {
        tip('error', "获取信息失败,请稍后重试!")
    }

    data.loading = false

}

// 切换查看资料的对话框
const handlelookuserinfodialog = (visible: boolean) => {
    data.userinfodata.userdata = <UserShowData>{}
    data.userinfodata.UserDetailDialogVisible = visible
}

// 删除好友
const deletefriend = async (targetuserid: number) => {
    ElMessageBox.confirm("确认删除此好友吗?", "删除好友", {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
    }).then(async () => {
        data.loading = true
        try {
            let res = await deletefriendapi(targetuserid)
            if (res.status = 200) {
                tip("success", "删除成功")
            } else {
                throw "删除失败,请稍后再试"
            }
        } catch (err) {
            tip("error", "删除失败,请稍后再试")
        }
        data.loading = false

    })
}

// 切换搜索好友的对话框
const handlesearchfrienddialog = () => {
    data.searchfrienddata.friendlist = [] as Array<Friend>
    data.searchfrienddata.searchinput = ""
    data.searchfrienddata.targetfrienddata = <Friend>{}
    data.searchfrienddata.visible = !data.searchfrienddata.visible
}

// vmodel搜索好友的输入框
const handlesearchfriendinput = (str: string) => {
    data.searchfrienddata.searchinput = str
}

// 发起请求搜索好友
const searchfriend = async () => {
    data.loading = true
    try {
        let res = await searchfriendapi(data.searchfrienddata.searchinput)
        if (res.status == 200) {
            data.searchfrienddata.friendlist = res.data.data
        } else {
            throw "搜索失败!"
        }
    } catch (err) {
        // console.log(err);
        tip('error', "搜索失败!")
    }
    data.loading = false
}

// 搜索好友之前
const preapplyaddfriend = (item: Friend) => {
    data.searchfrienddata.targetfrienddata = item
    data.addUserdata.targetUserData = item
    data.addUserdata.addUserDialogVisible = true
}

// 把图片地址转为本地地址
const imgurltolocalimg = async (url: string) => {
    let res = await getimgorigindataapi(url)
    // console.log(res.data);
    if (res.status == 200) {
        let bloburl = URL.createObjectURL(res.data)
        return bloburl
    } else {
        return url
    }
}

// 进入搜索结果的详情
const ToSearchTarget = (item: MatchingItem) => {

    if (item.type == 1) {
        let targetdata = data.grouplist.find(g => {
            return g.GroupInfo.ID == parseInt(item.originnumber || '0')
        })
        targetdata ? setcurrentgrouplist(targetdata) : ''
    } else {
        let targetdata = data.userdata.FriendList.find(g => {
            return g.Id == parseInt(item.originnumber || '0')
        })
        targetdata ? setcurrentfriendlist(targetdata) : ''
    }
    data.searchdata.searchinput = ''
    data.searchdata.searchResult = []
}

// 发起用户对用户的视频聊天请求
const startUserToUserVideoCall = async () => {
    data.loading = true

    try {
        let res = await startusertouservideocall(data.currentfrienddata.Id)
        console.log(res);
        win.api && win.api.createRemoteVideo(data.userdata.ID, "starter")
    } catch (err: any) {
        if (err.response.status == 400) {
            tip("error", "对方不在线")
        }
        if (err.response.status == 500) {
            tip("error", "服务器发生了错误")
        }
    }
    data.loading = false
}

// 切换群聊详情里,成员列表的显示
const changememberlistdetaildarwer = () => {
    data.moregroupinfo.memberlistdetaildarwer = !data.moregroupinfo.memberlistdetaildarwer
}

// 切换群聊详情里,成员列表的显示
const changemoregroupinfodarwer = () => {
    getmoregroupinfo()
    data.moregroupinfo.moregroupinfodrawer = !data.moregroupinfo.moregroupinfodrawer
}

// 获取群聊成员信息
const getmoregroupinfo = () => {
    getgroupmemberlist(data.currentgroupdata.GroupInfo.ID).then(res => {
        console.log(res);
        if (res.status != 200) {
            tip('error', "获取群成员列表失败!")
            return
        }
        data.moregroupinfo.memberlistdata = res.data.data
    }).catch(() => {
        tip('error', "获取群成员列表失败!")
    })
}

const changeAiAssistantDialogVisible = () => {
    data.aiAssistantDialogData.aiAssistantDialogVisible = !data.aiAssistantDialogData.aiAssistantDialogVisible
}

// 点击testarea(input)触发
const clickinputevent = () => {
    data.inputfocusposition = inputtestarea.value.selectionStart
}

// 选择emoji时触发
const selectemoji = async (emoji) => {
    const cursorPos = inputtestarea.value.selectionStart
    if (inputtestarea != null) {
        data.input = data.input.slice(0, cursorPos) + emoji.i + data.input.slice(cursorPos, data.input.length);
    } else {
        data.input += emoji.i
    }

    await inputtestarea.value.focus()
    data.inputfocusposition += 2
    inputtestarea.value.selectionStart = data.inputfocusposition
    inputtestarea.value.selectionEnd = data.inputfocusposition
}


//  监听更改布局X轴的鼠标事件
let isResizing = ref(false)
const onMouseDownResizerX = (e) => {
    if (e.target.classList.contains('resizer')) {
        console.log("开始监听X");
        isResizing.value = true;
        document.addEventListener('mousemove', onMouseMoveX);
        document.addEventListener('mouseup', onMouseUp);
    }
};

//  监听更改布局Y轴的鼠标事件
const onMouseDownResizerY = (e) => {
    if (e.target.classList.contains('resizer')) {
        console.log("开始监听Y");

        isResizing.value = true;
        document.addEventListener('mousemove', onMouseMoveY);
        document.addEventListener('mouseup', onMouseUp);
    }
};

// 更改布局X轴
const onMouseMoveX = (e: MouseEvent) => {

    if (isResizing.value) {
        const resizable = resizableDiv.value;
        let offset = Math.abs(e.clientX + 1)
        resizable.style.width = offset + 'px';
    }
};

// 更改布局Y轴
const onMouseMoveY = (e: MouseEvent) => {
    if (isResizing.value) {
        const resizable = resizableDivY.value;
        let offset = window.innerHeight - e.clientY + 1
        resizable.style.height = offset + 'px';
    }
};

// 取消监听更改布局事件
const onMouseUp = () => {
    isResizing.value = false;
    document.removeEventListener('mousemove', onMouseMoveX);
    document.removeEventListener('mousemove', onMouseMoveY);
    document.removeEventListener('mouseup', onMouseUp);
};

const setLoading = (bool: boolean) => {
    data.loading = bool
}

export type GroupInfo = {
    Avatar: string
    CreatedAt: string
    CreaterID: number
    CreaterName: string
    DeletedAt: string
    Grade: number
    MemberCount: number
    UnreadMessage: number
    GroupName: string
    ID: number
    UUID: string
    UpdatedAt: string
}

</script>
<style lang="less">
@import url('./index.less');
</style>