"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Api = void 0;
const axios_1 = __importDefault(require("axios"));
const node_html_parser_1 = require("node-html-parser");
const mysql = __importStar(require("mysql2/promise"));
class Api {
    constructor() {
        this._axios = axios_1.default.create({
            baseURL: "http://jwc.swjtu.edu.cn/",
            withCredentials: true,
            // proxy: {
            //     host: "localhost",
            //     port: 8888,
            // }
        });
        this._mysqlConnection = mysql.createPool({
            host: "bgmysql",
            user: "root",
            database: "swjtucs",
            password: "swjtucs!!!"
        });
        this._jsessionIDLoaded = false;
        console.log('version-1.0');
        this._axios.defaults.headers.common["Referer"] = "http://jwc.swjtu.edu.cn/service/login.html";
        //this.setUpInterceptors() //设置拦截器
    }
    async requestNewSessionID() {
        const response = await this._axios.get("service/login.html");
        let sessionID = response.headers["set-cookie"][0];
        sessionID = sessionID.split(";")[0];
        return `${sessionID};`;
    }
    setUpInterceptors() {
        this._axios.interceptors.response.use((response) => {
            if (!this._jsessionIDLoaded) {
                console.log('初始化jsessionID');
                //let jsessionID: string = response.headers["set-cookie"];
                let jsessionID = response.headers["set-cookie"][0];
                jsessionID = jsessionID.split(";")[0];
                console.log(this._axios.defaults.headers);
                this._axios.defaults.headers.common["Cookie"] = `${jsessionID};`; //设置jsessionID
                this._axios.defaults.headers.common["Referer"] = "http://jwc.swjtu.edu.cn/service/login.html";
                console.log(this._axios.defaults.headers);
                this._jsessionIDLoaded = true;
                console.log(jsessionID);
            }
            return response;
        });
    }
    async getLoginSESSION() {
        await this._axios.get("service/login.html");
    }
    async getVerifyImage(sessionID) {
        const axiosResponse = await this._axios.get("vatuu/GetRandomNumberToJPEG", {
            responseType: "arraybuffer",
            params: {
                currentTime: Date.now()
            },
            headers: {
                "Cookie": sessionID,
            }
        });
        return Buffer.from(axiosResponse.data, 'binary').toString('base64');
    }
    async login(sessionID, userName, password, verifyCode) {
        let postData = new URLSearchParams();
        postData.append("username", userName);
        postData.append("password", password);
        postData.append("ranstring", verifyCode);
        postData.append("url", "http://jwc.swjtu.edu.cn/index.html");
        postData.append("returnUrl", "");
        postData.append("area", "");
        postData.append("returnType", "");
        console.log(userName, "登录中...");
        const axiosResponse = await this._axios.post("vatuu/UserLoginAction", postData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                "Cookie": sessionID,
            }
        });
        //返回的数据
        const data = axiosResponse.data;
        await this.afterLogin(sessionID);
        return data;
    }
    async afterLogin(sessionID) {
        let postData = new URLSearchParams();
        postData.append("url", "");
        postData.append("returnUrl", "");
        postData.append("loginMsg", "");
        const axiosResponse = await this._axios.post("vatuu/UserLoadingAction", postData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                "Referer": "http://jwc.swjtu.edu.cn/service/login.html",
                "Cookie": sessionID,
            }
        });
        //返回的数据
        const data = axiosResponse.data;
        return data;
    }
    async getAllScore(sessionID) {
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
        const html = axiosResponse.data;
        const root = node_html_parser_1.parse(html);
        try {
            const selector = root.querySelector("#table3").querySelectorAll("tr");
            const data = [];
            for (let i = 1; i < selector.length; i++) {
                const row = selector[i];
                const col = row.querySelectorAll("td");
                data.push(Api.parseRow(col));
            }
            return data;
        }
        catch (e) {
            return [];
        }
    }
    static parseRow(col) {
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
        };
    }
    async queryRank(sessionID) {
        const isLogin = await this.checkLogin(sessionID);
        if (!isLogin) {
            return {};
        }
        let sqlData = await this._mysqlConnection.query('select * from `score` order by `averageScore` desc ');
        return sqlData[0];
    }
    async insertRankToDB(sessionID, studentID, averageScore) {
        await this.checkLogin(sessionID);
        let numberScore = Number(averageScore);
        try {
            const data = await this._mysqlConnection.query('insert ignore into `score` values (?,?)', [studentID, numberScore]);
            return data;
        }
        catch (e) {
            if (e.code == 1062) {
                console.log(`${studentID}重复插入`);
            }
        }
    }
    async insertLoginSessionID(sessionID) {
        const data = await this._mysqlConnection.query('insert ignore into `login` values (?)', [sessionID]);
        return data;
    }
    async checkLogin(sessionID) {
        const data = await this._mysqlConnection.query('select * from `login` where `sessionID` = ?', [sessionID]);
        return !(data[0].length == 0);
    }
}
exports.Api = Api;
