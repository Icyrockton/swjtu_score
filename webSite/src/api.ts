import axios from "axios";

interface LoginResponse {
    loginMsg: string
    loginStatus: string
}

export interface ScoreDetail {
    key: string,
    code: string,//代码
    course_name: string,//课程名称
    class_number: string,//班号
    property: string,//性质 必修/选修
    score: string,//成绩
    final_exam: string,//期末
    daily_score: string,//平时
    credit: string,//学分
    teacher_name: string,//教师
    academic_year: string,//学年
    semester: string//学期
}

export interface RankInfo {
    studentID:string
    averageScore:number
}

export class Api {
    private _axios = axios.create({
        baseURL: "http://121.4.151.26:3010",
    })

    async fetchImageBase64(sessionID: string) {
        console.log('刷新图片')
        const axiosResponse = await this._axios.get("/image", {
            params: {
                sessionID: sessionID
            }
        });
        console.log(axiosResponse.status)
        console.log(axiosResponse.statusText)
        return axiosResponse.data
    }

    async login(sessionID: string, userName: string, password: string, verifyCode: string) {
        const axiosResponse = await this._axios.get<LoginResponse>("/login", {
            params: {
                userName: userName,
                passWord: password,
                verifyCode: verifyCode,
                sessionID: sessionID
            }
        });
        return axiosResponse.data
    }

    async score(sessionID: string) {
        const axiosResponse = await this._axios.get<ScoreDetail[]>("/score", {
            params: {
                sessionID: sessionID
            }
        });
        return axiosResponse.data
    }

    async sessionID(){
        const axiosResponse = await this._axios.get<string>("/session");
        return axiosResponse.data
    }

    async rank(sessionID: string){
        const axiosResponse = await this._axios.get<RankInfo[]>("/rank", {
            params: {
                sessionID: sessionID
            }
        });
        return axiosResponse.data
    }

    async insertToRankDB(sessionID: string,studentID:string,averageScore:number){
        const axiosResponse = await this._axios.get<string>("/insertRank", {
            params: {
                sessionID: sessionID,
                studentID :studentID,
                averageScore:averageScore
            }
        });
        return axiosResponse.data
    }

    async insertToLoginDB(sessionID: string){
        const axiosResponse = await this._axios.get<string>("/insertLogin", {
            params: {
                sessionID: sessionID,
            }
        });
        return axiosResponse.data
    }
}

export const useApi = new Api()
