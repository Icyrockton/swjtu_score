import axios from "axios";
import {HTMLElement, parse} from 'node-html-parser';
import * as mysql from "mysql2/promise";

export class Api {

    private _axios = axios.create({
        baseURL: "http://jwc.swjtu.edu.cn/",
        withCredentials: true,
        // proxy: {
        //     host: "localhost",
        //     port: 8888,
        // }
    })

    private _mysqlConnection = mysql.createPool({
        host: "bgmysql",
        user: "root",
        database: "swjtucs",
        password: "swjtucs!!!"

    });

    constructor() {
        this._axios.defaults.headers.common["Referer"] = "http://jwc.swjtu.edu.cn/service/login.html"

        //this.setUpInterceptors() //设置拦截器
    }

    private _jsessionIDLoaded: boolean = false


    async requestNewSessionID() {   //申请一个新的SESSION ID
        const response = await this._axios.get("service/login.html");
        let sessionID: string = response.headers["set-cookie"][0];
        sessionID = sessionID.split(";")[0];
        return `${sessionID};`
    }

    private setUpInterceptors() {
        this._axios.interceptors.response.use((response) => {
            if (!this._jsessionIDLoaded) {
                console.log('初始化jsessionID')
                //let jsessionID: string = response.headers["set-cookie"];
                let jsessionID: string = response.headers["set-cookie"][0];
                jsessionID = jsessionID.split(";")[0];
                console.log(this._axios.defaults.headers)
                this._axios.defaults.headers.common["Cookie"] = `${jsessionID};` //设置jsessionID
                this._axios.defaults.headers.common["Referer"] = "http://jwc.swjtu.edu.cn/service/login.html"
                console.log(this._axios.defaults.headers)
                this._jsessionIDLoaded = true
                console.log(jsessionID)
            }
            return response;
        })
    }

    async getLoginSESSION() {
        await this._axios.get("service/login.html");
    }


    async getVerifyImage(sessionID: string) { //获取验证码
        const axiosResponse = await this._axios.get("vatuu/GetRandomNumberToJPEG", {
            responseType: "arraybuffer",
            params: {
                currentTime: Date.now()
            },
            headers: {
                "Cookie": sessionID,
            }
        });

        return Buffer.from(axiosResponse.data, 'binary').toString('base64')
    }

    async login(sessionID: string, userName: string, password: string, verifyCode: string) { //登录
        let postData = new URLSearchParams();
        postData.append("username", userName)
        postData.append("password", password)
        postData.append("ranstring", verifyCode)
        postData.append("url", "http://jwc.swjtu.edu.cn/index.html")
        postData.append("returnUrl", "")
        postData.append("area", "")
        postData.append("returnType", "")
        const axiosResponse = await this._axios.post<LoginResponse>("vatuu/UserLoginAction", postData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                "Cookie": sessionID,
            }
        })
        //返回的数据
        const data = axiosResponse.data;
        await this.afterLogin(sessionID)
        return data
    }

    async afterLogin(sessionID: string) {  //登录之后需要进入该网页，才能进行下一步操作
        let postData = new URLSearchParams();
        postData.append("url", "")
        postData.append("returnUrl", "")
        postData.append("loginMsg", "")
        const axiosResponse = await this._axios.post<LoginResponse>("vatuu/UserLoadingAction", postData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                "Referer": "http://jwc.swjtu.edu.cn/service/login.html",
                "Cookie": sessionID,
            }
        })
        //返回的数据
        const data = axiosResponse.data;
        return data
    }

    async getAllScore(sessionID: string) {

        const axiosResponse = await this._axios.get("vatuu/StudentScoreInfoAction", {
            params: {
                "setAction": "studentScoreQuery",
                "viewType": "studentScore",
                "orderType": "submitDate",
                "orderValue": "desc",
            },
            headers: {
                "Cookie": sessionID,
            }
        });

        const html = axiosResponse.data as string;
        const root = parse(html);
        try {
            const selector = root.querySelector("#table3").querySelectorAll("tr");
            const data: ScoreDetail [] = []
            for (let i = 1; i < selector.length; i++) {
                const row = selector[i];
                const col = row.querySelectorAll("td") as HTMLElement[];
                data.push(Api.parseRow(col))
            }
            return data
        } catch (e) {
            return []
        }

    }

    private static parseRow(col: HTMLElement[]) {
        return {
            code: col[1].innerText.trim(),
            course_name: col[2].innerText.trim(),
            class_number: col[3].innerText.trim(),
            property: col[4].innerText.trim(),
            score: col[5].innerText.trim(),
            final_exam: col[6].innerText.trim(),
            daily_score: col[7].innerText.trim(),
            credit: col[9].innerText.trim(),
            teacher_name: col[10].innerText.trim(),
            academic_year: col[12].innerText.trim(),
            semester: col[13].innerText.trim(),
        } as ScoreDetail
    }

    async queryRank(sessionID: string) {
        const isLogin = await this.checkLogin(sessionID);
        if (!isLogin) {
            return {}
        }

        let sqlData = await this._mysqlConnection.query('select * from `score` order by `averageScore` desc ');
        return sqlData[0]
    }

    async insertRankToDB(sessionID: string, studentID: string, averageScore: string) {
        await this.checkLogin(sessionID)
        let numberScore = Number(averageScore)
        try {
            const data = await this._mysqlConnection.query('insert ignore into `score` values (?,?)', [studentID, numberScore]);
            return data
        } catch (e) {
            if (e.code == 1062) {
                console.log(`${studentID}重复插入`)
            }
        }
    }

    async insertLoginSessionID(sessionID: string){
        const data = await this._mysqlConnection.query('insert ignore into `login` values (?)', [sessionID]);
        return data
    }

    async checkLogin(sessionID: string) {

        const data = await this._mysqlConnection.query('select * from `login` where `sessionID` = ?', [sessionID]);
        return !((data[0] as []).length == 0)
    }
}


interface ScoreDetail {
    code: String,//代码
    course_name: String,//课程名称
    class_number: String,//班号
    property: String,//性质 必修/选修
    score: String,//成绩
    final_exam: String,//期末
    daily_score: String,//平时
    credit: String,//学分
    teacher_name: String,//教师
    academic_year: String,//学年
    semester: String//学期
}

interface LoginResponse {
    loginMsg: string
    loginStatus: string
}
