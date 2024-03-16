import axios from 'axios'
import { Md5 } from 'ts-md5';

// const defaulturl = "http://localhost"
// const apifileurl = "http://localhost"


const defaulturl = "http://localhost"
const apifileurl = "http://localhost"
const apistaticurl = "http://localhost:3005"
axios.defaults.baseURL = "http://localhost:3004"

// const defaulturl = "http://192.168.137.1"
// const apifileurl = "http://192.168.137.1"
// const apistaticurl = "http://192.168.137.1:3005"
// axios.defaults.baseURL = "http://192.168.137.1:3004"

// 登录
export function loginapi(username: string, password: string) {
    const md5: Md5 = new Md5()
    md5.appendAsciiStr(password)
    const encryptionpassword = md5.end()
    let info = {
        username: username,
        password: encryptionpassword
    }
    return axios({
        url: defaulturl + "/login",
        method: "POST",
        data: info
    })
}

// 注册
export function registerapi(username: string, password: string, email: string, emailcode: string) {
    const md5: Md5 = new Md5()
    md5.appendAsciiStr(password)
    const encryptionpassword = md5.end()

    let registerinfo = {
        username: username,
        password: encryptionpassword,
        email: email,
        code: emailcode
    }

    return axios({
        url: apistaticurl + "/register",
        method: "POST",
        data: registerinfo
    })
}

// 发送邮箱验证码
export function emailcodeapi(email: string) {
    const msg = {
        email: email
    }

    return axios({
        url: apistaticurl + "/emailcode",
        method: "POST",
        data: msg
    })
}

// 刷新获取用户的群聊列表
export function RefreshGroupListapi(id: number) {
    let userinfo = {
        ID: id
    }
    return axios({
        url: apistaticurl + "/user/getusergrouplist",
        method: "POST",
        data: userinfo
    })
}

// 刷新获取用户的好友列表
export function RefreshFriendListapi(id: number) {
    let userinfo = {
        ID: id
    }
    return axios({
        url: apistaticurl + "/user/getuserfriendlist",
        method: "POST",
        data: userinfo
    })
}

// 刷新获取用户的群聊通知列表
export function RefreshApplyJoinGroupListapi(id: number) {
    let userinfo = {
        ID: id
    }
    return axios({
        url: apistaticurl + "/user/getuserapplyjoingrouplist",
        method: "POST",
        data: userinfo
    })
}

// 刷新获取用户的好友申请列表
export function RefreshApplyAddFriendListapi(id: number) {
    let userinfo = {
        ID: id
    }
    return axios({
        url: apistaticurl + "/user/getuserapplyaddfriendlist",
        method: "POST",
        data: userinfo
    })
}



// 搜索群聊
export function searchGroupapi(text: string) {
    const msg = {
        searchstr: text
    }
    return axios.post("/user/searchGroup", msg)
}

// 处理加入群聊
export function joingroupapi(applyid: number, status: number) {
    let msg = {
        ApplyID: applyid,
        HandleStatus: status
    }
    return axios.post("/user/handlejoingroup", msg)
}

// 申请加入群聊
export function applyjoingroupapi(applydata: any) {
    return axios.post("/user/applyjoingroup", applydata)
}

// 创建群聊
export function creategroupapi(creategroupinput: string, headerurl: string) {
    let msg = {
        GroupName: creategroupinput,
        Avatar: headerurl
    }
    return axios.post("/user/creategroup", msg)
}

// 退出群聊
export function exitgroupapi(id: number) {
    let msg = {
        ID: id
    }
    return axios.post("/user/exitgroup", msg)
}

// 修改用户信息
export function edituserdataapi(age: number, city: string, introduce: string) {
    let aage: any
    if (typeof age === "number") {
        aage = JSON.stringify(age)
    } else {
        aage = age
    }
    let msg = {
        age: aage,
        city: city,
        introduce: introduce
    }
    return axios({
        url: apistaticurl + "/user/edituserdata",
        method: "POST",
        data: msg
    })
}

// 获取用户信息
export function getuserdataapi(id: number) {
    let msg = {
        ID: id
    }
    return axios({
        url: apistaticurl + "/user/getuserdata",
        method: "POST",
        data: msg
    })
}

// 申请添加好友
export function applyadduserapi(PreApplyUserID: number, PreApplyUserName: string, ApplyUserID: number, ApplyUserName: string, ApplyMsg: string) {
    let msg = {
        ApplyUserID: ApplyUserID,  //申请人
        ApplyUserName: ApplyUserName,
        PreApplyUserID: PreApplyUserID, //被申请人
        PreApplyUserName: PreApplyUserName,
        ApplyMsg: ApplyMsg
    }
    return axios.post("/user/applyadduser", msg)
}

// 处理添加好友
export function adduserapi(applyid: number, status: number) {
    let msg = {
        ApplyID: applyid,
        HandleStatus: status
    }
    return axios.post("/user/handleadduser", msg)
}

// 检查指定用户登录状态
export function startusertouservideocall(userid: number) {
    let msg = {
        userid: userid,
    }
    return axios.post("/user/startusertouservideocall", msg)
}


// 上传资源
export function uploadresourceapi(file: FormData) {
    return axios({
        url: apifileurl + "/file/uploadfile",
        method: "POST",
        data: file,
        headers: {
            "Content-Type": "multipart/form-data"
        }
    })
}


// 搜索好友
export function searchfriendapi(str: string) {
    let msg = {
        Searchstr: str,
    }
    return axios({
        url: apistaticurl + "/user/searchuser",
        method: "POST",
        data: msg,
    })
}

// 获取指定群聊消息列表
export function getgroupmessagelist(groupid: Number, currentnum: Number) {
    let msg = {
        groupid: groupid,
        currentnum: currentnum
    }
    return axios({
        url: apistaticurl + "/group/getgroupmessagelist",
        method: "POST",
        data: msg,
    })
}

// 获取用户之间的消息列表
export function getgusermessagelist(targetuserid:number, currentnum: Number) {
    let msg = {
        targetuserid: targetuserid,
        currentnum: currentnum
    }
    return axios({
        url: apistaticurl + "/user/getusermessagelist",
        method: "POST",
        data: msg,
    })
}


// 获取图片源数据
export function getimgorigindataapi(imgurl: string) {
    return axios({
        url: apifileurl + "/" + imgurl,
        method: "get",
        responseType:'blob'
    })
}

