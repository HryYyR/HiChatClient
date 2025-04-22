// 定义关于counter的store
import { defineStore } from "pinia"
import {Userdata} from "../models/models"
const useCounter = defineStore("counter", {
    state: () => {
        return {
            token: "",
            userdata: <Userdata>{}
        }
    }
})

// 将useCounter函数导出
export default useCounter

