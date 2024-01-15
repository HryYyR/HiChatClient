<template>
    <HeaderVue />

    <div class="container" v-loading="data.loginloading" v-show="!data.islogin">
        <!-- 登录 -->
        <LoginVue :logindata="data.logindata" @login="login" />

        <!-- 注册 -->
        <div class="view_container register_container">
            <el-input class="view_input" v-model="data.registerdata.username" placeholder="用户名(由字母和数字组成,不能低于6位)"
                size="large" clearable></el-input>
            <el-input class="view_input" type="password" show-password v-model="data.registerdata.password"
                placeholder="密码(不能低于6位)" size="large" clearable></el-input>
            <el-input class="view_input" type="password" show-password v-model="data.registerdata.checkpassword"
                placeholder="确认密码" size="large" clearable></el-input>
            <el-input class="view_input" v-model="data.registerdata.email" placeholder="邮箱" size="large"
                clearable></el-input>
            <div class="view_input" style="display: flex;">
                <el-input placeholder="邮箱验证码" v-model="data.registerdata.emailcode" size="large"
                    style="margin-right: 10px;"></el-input><el-button type="success" size="large" @click="sendemailCode"
                    :disabled="data.registerdata.sendemailbtnvisible">{{ data.registerdata.sendcodebtn }}</el-button>


            </div>
            <div class="btn" @click="register">注册</div>
        </div>

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
    <div v-show="data.islogin" class="index" v-loading="data.wsconnecting">
        <div class="left_list">
            <UserInfoVue @edituserdata="edituserdata" @userdetaildialoghandleClose="userdetaildialoghandleClose"
                :UserDetailDialogVisible="data.userdetaildata.UserDetailDialogVisible" :userdata="data.userdata" />

            <!-- 群工具 -->
            <div class="group_tools">
                <el-input size="large" v-model="data.searchdata.searchinput" placeholder="搜索" clearable></el-input>
                <el-dropdown trigger="click" v-show="data.searchdata.searchinput.trim().length == 0">
                    <el-icon class="open_addgroup_dialog_btn">
                        <Plus />
                    </el-icon>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item>
                                <div @click="handlesearchfrienddialog">
                                    添加好友
                                </div>
                            </el-dropdown-item>
                            <el-dropdown-item>
                                <div @click="data.addgroupdata.addGroupDialogVisible = true">
                                    添加群聊
                                </div>
                            </el-dropdown-item>
                            <el-dropdown-item>
                                <div @click="data.creategroupdata.createGroupDialogVisible = true">
                                    创建群聊
                                </div>
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </div>

            <div class="search_result" v-if="data.searchdata.searchinput.trim().length != 0">
                <p v-for="(item) in data.searchdata.searchResult" :key="item.name" @click="ToSearchTarget(item)">
                    <img :src="`http://${fileurl}/${item.avatar}`" alt=""><span v-html="item.name"></span>(<span
                        v-html="item.number"></span>) ({{ item.type==1?'群聊':'好友' }})
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
                        :currentfrienddata="data.currentfrienddata" @setcurrentfriendlist="setcurrentfriendlist" />
                </div>
                <!-- 群列表 -->
                <div class="group_list list" :class="{ checkg: !data.currentSelectTab }">
                    <GroupItemVue v-for="(item) in data.grouplist" :key="item.GroupInfo.ID" :item="item"
                        :currentgroupdata="data.currentgroupdata" @setcurrentgrouplist="setcurrentgrouplist"
                        @openeditgroupmenu="openeditgroupmenu" />
                </div>
            </div>


            <div @click="outlogin" class="outlogin">
                <el-icon>
                    <ArrowLeftBold />
                </el-icon>退出登录
            </div>
        </div>

        <div class="right_list">

            <!-- friend标题栏 -->
            <div class="rightlist_option"
                v-if="data.currentSelectType == 2 && JSON.stringify(data.currentfrienddata) != '{}'">
                {{ data.currentfrienddata.NikeName || "" }}
            </div>

            <!-- friend消息列表 -->
            <div class="rightlist_container" ref="msglist" :style="{ opacity: data.loadingmessagelist ? 0 : 1 }"
                v-if="data.currentSelectType == 2 && JSON.stringify(data.currentfrienddata) != '{}'">
                <UserMessageItemVue v-for="(item, index) in data.currentfrienddata.MessageList" :item="item"
                    :userdata="data.userdata"
                    :pretime="(index != 0 && data.currentfrienddata.MessageList.length > 1) ? data.currentfrienddata.MessageList[index - 1] : data.currentfrienddata.MessageList[index]" />

                <div class="message_unread" @click="scrolltonew(0, true)" v-show="data.messageunreaddata.unreadnumber != 0">
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
                {{ JSON.stringify(data.currentgroupdata) != '{}' ? data.currentgroupdata.GroupInfo.GroupName : "" }} ({{
                    JSON.stringify(data.currentgroupdata) != '{}' ? data.currentgroupdata.GroupInfo.MemberCount : '' }})
            </div>

            <!-- group消息列表 -->
            <div class="rightlist_container" ref="msglist" :style="{ opacity: data.loadingmessagelist ? 0 : 1 }"
                v-if="data.currentSelectType == 1 && JSON.stringify(data.currentgroupdata) != '{}'">
                <MessageItemVue @changeHeaderDialog="changeHeaderDialog"
                    v-for="(item, index) in data.currentgroupdata.MessageList" :key="item.ID" :item="item"
                    :preitem="(index != 0 && data.currentgroupdata.MessageList.length > 1) ? data.currentgroupdata.MessageList[index - 1] : data.currentgroupdata.MessageList[index]"
                    :userdata="data.userdata" :currentgroupdata="data.currentgroupdata"
                    @openMsgHandleMenu="openMsgHandleMenu" @lookuserinfo="lookuserinfo" />

                <div class="message_unread" @click="scrolltonew(0, true)" v-show="data.messageunreaddata.unreadnumber != 0">
                    <span>
                        {{ data.messageunreaddata.unreadnumber }}条未读
                    </span>
                    <el-icon>
                        <ArrowDown />
                    </el-icon>
                </div>
            </div>


            <div class="rightlist_input" v-if="data.currentSelectType != 0">
                <div class="input_tool">
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
                <textarea v-show="!data.soundrecorddata.visible" cols="30" rows="10" v-model="data.input"></textarea>
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
            @uploadcreategroupheaderSuccess="uploadcreategroupheaderSuccess" />

        <!-- 确定退出(解散)群聊对话框 -->
        <el-dialog v-model="data.quitgroupdata.quitGroupDialogVisible" :title="data.quitgroupdata.title" width="30%">
            <p>退出后不会通知群聊中其他成员，且不会再接收此群消息</p>
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
            :targetuserdata="data.addUserdata.targetUserData" />

        <!-- 查看用户详情对话框 -->
        <UserDetailDialog :UserDetailDialogVisible="data.userinfodata.UserDetailDialogVisible"
            :userdata="data.userinfodata.userdata" :friendinfodata="data.userinfodata.friendinfodata"
            :isfriend="CurrentCheckUserIsFriend" @handlelookuserinfodialog="handlelookuserinfodialog"
            @setcurrentfriendlist="setcurrentfriendlist" />

        <!-- 搜索好友对话框 -->
        <SearchFriendDialog :searchinput="data.searchfrienddata.searchinput" :friendlist="data.searchfrienddata.friendlist"
            :visible="data.searchfrienddata.visible" :targetfrienddata="data.searchfrienddata.targetfrienddata"
            @handlesearchfrienddialog="handlesearchfrienddialog" @preapplyaddfriend="preapplyaddfriend"
            @searchfriend="searchfriend" @handlesearchfriendinput="handlesearchfriendinput" />

    </div>
</template>

<script setup lang="ts">
// const { ipcRenderer } = require('electron')
import { fileurl, wsurl } from './main'
import { toRef, onMounted, reactive, ref, watch, computed } from 'vue';
import useCounter from './store/common'
import { UploadFile, UploadFiles, UploadProps, UploadRawFile } from 'element-plus';
import { tip, SendGroupResourceMsg, SendFriendResourceMsg, RegSearch, MatchingItem } from './utils/utils'
import HeaderVue from './components/header.vue'
import LoginVue from './components/login/login.vue'


import UserInfoVue from './components/userinfo/userinfo.vue'
import GroupItemVue from './components/groupitem/groupitem.vue'
import FriendItemVue from './components/frienditem/friend_item.vue'
import MessageItemVue from './components/messageitem/message_item.vue'
import UserMessageItemVue from './components/usermessageitem/user_message_item.vue'

import CreateGroupDialog from './components/creategroupdialog/create_group_dialog.vue'
import MessageNoticeDialog from './components/messagenoticedialog/message_notice_dialog.vue'
import ApplyJoinGroupDialog from './components/applyjoingroupdialog/apply_join_group_dialog.vue'
import ApplyAddUserDialog from './components/adduserdialog/add_user_dialog.vue'
import UserDetailDialog from './components/userdetaildialog/user_detail_dialog.vue';
import SearchFriendDialog from './components/searchfrienddialog/search_friend_dialog.vue'

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

    emailcodeapi,
    uploadresourceapi,

    searchfriendapi,
    getgroupmessagelist,
    getimgorigindataapi
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

} from './models/models'


import ContextMenu from '@imengyu/vue3-context-menu'

const win: any = window
let Store = useCounter()

const msglist: any = ref(null)
const uploadimg: any = ref(null)
let reconnectnum = 0

onMounted(() => {
    win.api.settitle()
    initListener()

    data.logindata.username = localStorage.getItem("username") || ""
    data.logindata.password = localStorage.getItem("password") || ""
    if (localStorage.getItem("autologin") == "1" && data.logindata.username && data.logindata.password) {
        setTimeout(() => {
            login()
        }, 1000)
    }
})

const data = reactive({
    ws: {
        wsconn: <any>null,  //ws连接
    },
    wsconnecting: true,
    islogin: false, //是否登录
    loginloading: false, //是否加载中
    loadingmessagelist: false, //加载消息列表
    loadingmsaageburial: true, //加载消息冷却

    userdata: <Userdata>{},  //用户信息
    grouplist: <Group>[],//群信息

    input: "hello!",  //聊天输入框

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
        username: "",
        password: "",
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
        userdata: <MessageListitem>{},  //该用户的消息数据
        friendinfodata: <Friend>{}  //如果是好友,为好友数据
    },
    searchfrienddata: {
        searchinput: "",
        friendlist: [] as Array<Friend>,
        visible: false,
        targetfrienddata: <Friend>{}
    }

})

watch(data.logindata, (newValue, _) => {
    localStorage.setItem("rememberpassword", newValue.rememberpassword ? "1" : "0")
    localStorage.setItem("autologin", newValue.autologin ? "1" : "0")
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
    return data.userdata?.FriendList?.filter(f => f.Id == data.userinfodata.userdata.UserID).length != 0
})

const filterapplyjoingrouplist = computed(() => data.userdata.ApplyList ? data.userdata.ApplyList.filter(i => i.HandleStatus == 0 && i.ApplyUserID != data.userdata.ID).length : 0)
const filterapplyadduserlist = computed(() => data.userdata.ApplyUserList ? data.userdata.ApplyUserList.filter(i => i.HandleStatus == 0 && i.ApplyUserID != data.userdata.ID).length : 0)

// 发送消息
const send = () => {
    if (data.input.replace(/ /g, "").length == 0) return
    if (data.currentSelectType == 1) {
        let message: MessageListitem = {
            UserID: data.userdata.ID,
            UserName: data.userdata.UserName,
            UserAvatar: data.userdata.Avatar == "" ? `http://${fileurl}/static/icon.png` : data.userdata.Avatar,
            UserCity: data.userdata.City,
            UserAge: JSON.stringify(data.userdata.Age),
            GroupID: data.currentgroupdata.GroupInfo.ID,
            Msg: data.input,
            MsgType: 1,
            IsReply: false,
            ReplyUserID: 0,
            Context: [],
            CreatedAt: new Date().toISOString()
        }
        data.ws.wsconn.send(JSON.stringify(message))
        scrolltonew(200, true)
    }
    if (data.currentSelectType == 2) {
        let message: string = SendFriendResourceMsg(data.input, 1001, data.userdata, data.currentfrienddata)
        data.ws.wsconn.send(message)
    }
    data.input = ""
    // console.log(msglist);


}

// 设置监听当前窗口
const setcurrentlistener = () => {
    const { scrollHeight, scrollTop, offsetHeight } = msglist.value
    // console.log(scrollHeight, scrollTop, offsetHeight);

    if (scrollTop < 150 && data.loadingmsaageburial) {

        if (data.currentSelectType == 1) {
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
    data.loadingmsaageburial = true
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
    data.loadingmessagelist = true
    data.loadingmsaageburial = true
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
const login = () => {
    data.loginloading = true
    const { username, password } = data.logindata
    loginapi(username, password).then(res => {
        console.log(res);
        // 数据处理
        if (res.data.userdata.GroupList == null) {
            res.data.userdata.GroupList = []
        }
        data.userdata = res.data.userdata
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
        if (data.logindata.rememberpassword) {
            localStorage.setItem("password", data.logindata.password)
        } else {
            localStorage.removeItem("password")
        }

        connectws()
        // 设置显示

        setTimeout(() => {
            data.loginloading = false
            win.api.changWindowSize()
            data.islogin = true
        }, 1000);

    }).catch((err) => {
        console.log(err);

        setTimeout(() => {
            tip("error", "账号或密码错误!")
            data.loginloading = false
        }, 1000);
        return
    })
}

// 退出登录
const outlogin = () => {
    // ipcRenderer.send('backtologin')
    win.api.backtologin()
    setTimeout(() => {
        data.islogin = false
    }, 50);
    data.ws.wsconn.close()
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
                group.MessageList.push(msg)
                let temp = data.grouplist[index]
                data.grouplist[index] = data.grouplist[0]
                data.grouplist[0] = temp
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
        }
        // console.log(data.userdata.FriendList);
        return
    }

    const typelist = {
        1: DefaultGroupMsg,
        2: DefaultGroupMsg,
        3: DefaultGroupMsg,
        200: refreshGroupMsg,
        201: QuitGroupMsg,
        202: JoginGroupMsg,
        204: DissolveGroupMsg,
        500: refreshgrouplistdata,
        501: () => { //刷新好友列表
            refreshfriendlistdata()
            refreshfriendnoticedata()
        },
        502: refreshgroupnoticedata,
        503: refreshfriendnoticedata,

        1001: DefaultFriendMsg,
        1002: DefaultFriendMsg,
        1003: DefaultFriendMsg,
    }
    const msgtype = msg.MsgType
    typelist[msgtype](msg)

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

// 去注册页面
const toregister = () => {
    data.logindata.offset = !data.logindata.offset
}

// 注册
const register = () => {
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
        return
    }

    registerapi(username, password, email, emailcode).then(res => {
        console.log(res);
        if (res.status != 200) {
            tip("error", "注册失败,请稍后再试!")
            return
        }
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
    }).catch(err => {
        tip("error", err.response.data.msg)
    })
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
    console.log(data.applyjoingroupdata);

    applyjoingroupapi(data.applyjoingroupdata).then(res => {
        console.log(res);
        tip("success", res.data.msg)
        refreshgroupnoticedata()
    }).catch(err => {
        tip("error", err.response.data.msg)
    })
    data.addgroupdata.addgroupinput = ""
    data.addgroupdata.preaddGroupDialogVisible = false
    data.addgroupdata.addGroupDialogVisible = false
    data.addgroupdata.addgroupsearchlist = <GroupinfoList>{}

}

// 创建群聊
const creategroup = async () => {
    const { creategroupinput, headerurl } = data.creategroupdata
    creategroupapi(creategroupinput, headerurl).then(res => {
        let newgrouplist = [toRef(res.data.data).value].concat(data.grouplist)
        data.grouplist = newgrouplist

        console.log(data.grouplist);

        tip('success', res.data.msg)
        // refreshgrouplist()
        data.creategroupdata = {
            headeruploadurl: `http://${fileurl}/file/uploadfile`,
            creategroupinput: "",
            createGroupDialogVisible: false,
            headerurl: "",
            createstep: 1
        }
    }).catch(err => {
        tip('error', err.response.data.msg)
    })
}

// 切换创建群聊的步骤
const changestep = (i: number) => {
    i == 0 ? (data.creategroupdata.createstep--) : (data.creategroupdata.createstep++)
}

// 退出群聊
const quitgroup = async () => {
    const GroupInfo = data.quitgroupdata.targetgroupdata.GroupInfo
    console.log(GroupInfo);

    exitgroupapi(GroupInfo.ID).then(() => {
        data.quitgroupdata.quitGroupDialogVisible = false
        if (JSON.stringify(data.currentgroupdata) != '{}') {
            if (data.currentgroupdata.GroupInfo.ID == GroupInfo.ID) {
                data.currentSelectType = 0
                data.currentgroupdata = <GroupList>{}
            }
        }
        data.grouplist = data.grouplist.filter(group => group.GroupInfo.ID !== GroupInfo.ID)

        tip("success", GroupInfo.CreaterID == data.userdata.ID ? "解散成功!" : "退出成功!")

    })
    // .catch(err => {
    //     console.log(err);
    //     tip("error", err)
    // })

    // data.currentgroupdata = <GroupList>{
    //     GroupInfo: <GroupInfo>{},
    //     MessageList: [] as Array<MessageListitem>
    // }
}

// 搜索群聊
const searchgroup = () => {
    if (data.addgroupdata.addgroupinput.trim().length == 0) {
        tip("error", "关键词不能为空!")
        return
    }

    searchGroupapi(data.addgroupdata.addgroupinput).then((res) => {
        if (res.status != 200) {
            tip("error", res.data.msg)
            return
        }
        console.log(res.data.grouplist);

        data.addgroupdata.addgroupsearchlist = res.data.grouplist == null ? [] : res.data.grouplist

    }).catch(err => {
        tip("error", err.response.data.msg)
    })
}

// 处理添加群聊通知
const handleapplymsg = (apply: ApplyItem, status: number) => {
    joingroupapi(apply.ID, status).then(res => {
        console.log(res.data);
        tip("success", res.data.msg)
        apply.HandleStatus = status
    }).catch(error => {
        console.log(error);
        tip("error", error.response.data.msg)
    })
}

// 处理添加好友通知
const handleapplyaddusermsg = (apply: ApplyUserItem, status: number) => {
    apply.HandleStatus = status
    adduserapi(apply.ID, status).then(res => {
        tip("success", res.data.msg)
    }).catch(err => {
        console.log(err);
        tip("error", err.response.data.msg)
    })
}

// 打开群聊右键菜单
const openeditgroupmenu = (e: any, item: GroupList) => {
    if (e.type == "contextmenu") {
        ContextMenu.showContextMenu({
            x: e.clientX,
            y: e.clientY,
            items: [
                {
                    label: item.GroupInfo.CreaterID == data.userdata.ID ? "解散群聊" : "退出群聊",
                    onClick: () => {
                        data.quitgroupdata.title = item.GroupInfo.CreaterID == data.userdata.ID ? "解散群聊" : "退出群聊"
                        data.quitgroupdata.targetgroupdata = item
                        data.quitgroupdata.quitGroupDialogVisible = true
                    }
                }, {
                    label: "复制群号",
                    onClick: () => {
                        navigator.clipboard.writeText(item.GroupInfo.ID.toString())
                        tip("success", "复制成功!")
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
                send()
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
                        uploadresourceapi(formData).then(res => {
                            let msg = {}
                            if (data.currentSelectType == 1) {
                                msg = SendGroupResourceMsg(res.data.fileurl, 3, data.userdata, data.currentgroupdata.GroupInfo.ID)

                            } else {
                                msg = SendFriendResourceMsg(res.data.fileurl, 1003, data.userdata, data.currentfrienddata)
                            }
                            data.ws.wsconn.send(msg)
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

}

// 发送邮箱验证码
const sendemailCode = () => {
    const email = data.registerdata.email

    var reg = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;
    if (!reg.test(email)) {
        tip("error", "邮箱格式不正确!")
        return
    }

    data.registerdata.sendemailbtnvisible = true
    let i = 59
    data.registerdata.sendcodebtn = `60s`
    let downtime = setInterval(() => {
        data.registerdata.sendcodebtn = `${i}s`
        i--
    }, 1000)
    setTimeout(() => {
        clearInterval(downtime)
        data.registerdata.sendcodebtn = "发送验证码"
        data.registerdata.sendemailbtnvisible = false
    }, 60000);

    emailcodeapi(email).then(res => {
        console.log(res);
        tip("success", res.data.msg)

    }).catch(err => {
        tip("error", "验证码发送失败!")
        console.log(err);

    })
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
const clearcurrentgroupmsg = () => {
    let message = {
        UserID: data.userdata.ID,
        UserName: data.userdata.UserName,
        GroupID: data.currentgroupdata.GroupInfo.ID,
        MsgType: 401,
        CreatedAt: new Date()
    }
    data.ws.wsconn.send(JSON.stringify(message))
}

// 清除当前好友消息
const clearcurrentfriendmsg = () => {
    let message = SendFriendResourceMsg("", 1401, data.userdata, data.currentfrienddata)
    data.ws.wsconn.send(message)
}

// 上传图片之前
const beforeUploadImg = (rawFile: UploadRawFile) => {
    console.log(rawFile);
}
// 上传图片成功
const onSuccessUploadImg = (response: any, uploadFile: any) => {
    console.log(response, uploadFile);
    uploadimg.value.clearFiles(["success"])
    let msg = ""
    if (data.currentSelectType == 1) {
        msg = SendGroupResourceMsg(uploadFile.response.fileurl, 2, data.userdata, data.currentgroupdata.GroupInfo.ID)

    } else if (data.currentSelectType == 2) {
        msg = SendFriendResourceMsg(uploadFile.response.fileurl, 1002, data.userdata, data.currentfrienddata)

    }
    data.ws.wsconn.send(msg)
    scrolltonew(500, true)

}
// 上传图片失败
const onErrorUploadImg = (response: any, uploadFile: UploadFile, uploadFiles: UploadFiles) => {
    console.log(response, uploadFile, uploadFiles);
    uploadimg.value.clearFiles(["success"])
    tip('error', "发送失败!")
}


const TodoMessagequeue: Array<string> = []
// 连接ws
const connectws = () => {
    // 连接ws
    data.ws.wsconn = new WebSocket(`ws://${wsurl}/ws?token=${localStorage.getItem("token")}`),

        data.ws.wsconn.onopen = function () {
            console.log("connect success!");
            data.wsconnecting = false
            reconnectnum = 0
        }
    data.ws.wsconn.onclose = function (evt: any) {
        data.wsconnecting = true
        // console.log(evt);
        console.log("connect close!");

        if (evt.code == 1005) return
        tip('error', "网络连接超时,尝试重连中...")
        if (reconnectnum >= 3) {
            outlogin()
            tip('error', "网络连接失败,请检查网络后重试!")
            data.wsconnecting = false
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
        var msgstr = evt.data.split('\n');
        setTimeout(() => {
            TodoMessagequeue.push(msgstr)
        }, 0);
    }

    data.ws.wsconn.onerror = function (evt: any) {
        console.log(evt);
    }
}

// 消费消息
setInterval(() => {
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
            const msg = JSON.parse(`{${innerContent}}`);
            console.log("消费了一条消息", msg);
            handleMsg(msg)
        } catch (error) {
            console.error('Error parsing JSON:', error);
        }
    }

    // let msg = JSON.parse(msgstr)
    // console.log("消费了一条消息", msg);
    // handleMsg(msg)


}, 100)

// 打开用户详情对话框
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

// 关闭创建群聊对话框
const closecreategroupdialog = () => {
    data.creategroupdata.createstep = 1
    data.creategroupdata.headerurl = ""
    data.creategroupdata.creategroupinput = ""
    data.creategroupdata.createGroupDialogVisible = false
}

// 点击查看资料时触发
const lookuserinfo = (item: MessageListitem) => {
    data.userinfodata.userdata = item
    if (CurrentCheckUserIsFriend) {
        data.userinfodata.friendinfodata = data.userdata.FriendList.filter(f => f.Id == item.UserID)[0] || <Friend>{}
    }
    data.userinfodata.UserDetailDialogVisible = true
}

// 切换查看资料的对话框
const handlelookuserinfodialog = (visible: boolean) => {
    data.userinfodata.userdata = <MessageListitem>{}
    data.userinfodata.UserDetailDialogVisible = visible
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
const searchfriend = () => {
    searchfriendapi(data.searchfrienddata.searchinput).then(res => {
        data.searchfrienddata.friendlist = res.data.data
    }).catch(err => {
        console.log(err);
        tip('error', "搜索失败!")
    })
}

// 搜索好友之前
const preapplyaddfriend = (item: Friend) => {
    data.searchfrienddata.targetfrienddata = item
    data.addUserdata.targetUserData = item
    data.addUserdata.addUserDialogVisible = true
}

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
<style  lang="less">
@import url('./index.less');
</style>