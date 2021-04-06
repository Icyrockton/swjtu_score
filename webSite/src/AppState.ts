import {makeAutoObservable, runInAction} from "mobx";
import {RankInfo, ScoreDetail, useApi} from "./api";


export interface AverageInfo {
    total: number
    count: number
    average: number
}

export class AppState {
    static readonly COURSE = ["编译原理", "操作系统", "操作系统实验", "程序语言综合课程设计", "大学物理BⅡ", "大学物理BI", "大学物理实验AⅠ", "大学物理实验AⅡ",
        "概率论与数理统计B", "高等数学BⅠ", "高等数学BⅡ", "高级语言程序设计", "高级语言程序设计实验", "计算机图形学", "计算机图形学实验", "计算机网络", "计算机网络工程实验",
        "计算机组成实验", "计算机组成原理", "离散数学A", "面向对象程序设计", "面向对象程序设计实验", "嵌入式系统设计与应用", "嵌入式系统设计与应用实验", "软件工程", "数据结构",
        "数据结构实验", "数据库原理与设计", "数据库原理与设计实验", "数字电子技术B", "数字电子技术实验B", "算法分析与设计", "微机与接口技术A", "微机与接口技术实验", "现代铁路信息技术导论", "线性代数B",
        "英语Ⅰ", "英语Ⅱ", "Java程序设计", "互联网搜索引擎", "网络编程技术"]

    imageBASE64: string = ""
    score: ScoreDetail[] | null = null
    sessionID: string | null = null
    errorMsg: string | null = null
    showInfo: boolean = false
    averageScore: AverageInfo | null = null;
    ranks: RankInfo[] | null = null
    private _studentID: string | null = null
    loading:boolean =false
    loadingMsg:string = ""

    constructor() {
        makeAutoObservable(this)
        this.getSessionID()
    }

    async getSessionID() {
        const session = await useApi.sessionID();
        runInAction(() => {
            this.sessionID = session
            this.refreshImage()
        })
    }

    async refreshImage() {
        if (this.sessionID) {
            const image = await useApi.fetchImageBase64(this.sessionID);
            runInAction(() => {
                this.imageBASE64 = image
            })
        } else {
            await this.getSessionID()
        }
    }


    async login(userName: string, password: string, verifyCode: string) { //登录
        this.loading  = true
        this.errorMsg = null
        this.loadingMsg ="登录中"
        if (this.sessionID) {
            const response = await useApi.login(this.sessionID, userName, password, verifyCode);
            console.log(response)
            if (response.loginStatus == "-2") {
                this.refreshImage()
                this.errorMsg = "验证码不正确"
            } else if (response.loginStatus == "2") {
                this.errorMsg = "用户不存在"
                this.refreshImage()
            } else if (response.loginStatus == "1") {  //登录成功
                this._studentID = userName
                this.loadingMsg="查询中"
                await this.insertLogin()
                await this.fetchScore()
                await this.fetchRank()
                runInAction(()=>{
                    this.showInfo =true
                })
            }
        } else {
            await this.getSessionID()
        }
        this.loading =false
    }

    async insertLogin(){
        if (this.sessionID){
            const promise =  await  useApi.insertToLoginDB(this.sessionID);
        }else {
            await this.getSessionID()
        }
    }

    async fetchScore() {
        if (this.sessionID) {
            const score = await useApi.score(this.sessionID);
            runInAction(() => {
                this.averageScore = this.calculateAverage(score)
                this.score = score
                this.showInfo = true
            })
        } else {
            await this.getSessionID()
        }
    }

    async fetchRank() {
        if (this.sessionID) {
            const rank = await useApi.rank(this.sessionID);
            runInAction(() => {
                this.ranks = rank
            })
        } else {
            await this.getSessionID()
        }
    }

    private calculateAverage(scores: ScoreDetail[]) {
        let sum = 0
        let count = 0
        scores.forEach(score => {
            const find = AppState.COURSE.find(value => score.course_name == value);
            if (find) {
                sum += Number(score.score)
                count++
            }
        })
        let data = {
            total: sum,
            count: count,
            average: Number((sum / count).toFixed(2))
        } as AverageInfo

        useApi.insertToRankDB(this.sessionID!, this._studentID!, data.average)
        return data
    }


}

const useAppState = new AppState()
export default useAppState