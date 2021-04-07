import express = require("express")
import {Api} from "./api";
import {request, response} from "express";
import * as mysql   from "mysql2"
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';






const app = express();
const api = new Api();

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
})

//首页
app.get("/", (request, response) => {
    response.send("connect successful")
})


//获取图片
app.get("/image", (request, response) => {
    const sessionID = request.query["sessionID"] as string;

    api.getVerifyImage(sessionID).then(imageBASE64 => {
            response.send(imageBASE64)
        }
    )
})


interface LoginParam {
    userName: string,
    passWord: string,
    verifyCode: string
}

//登录
app.get("/login", (request, response) => {
    //login?userName=2&passWord=123456&verifyCode=123456
    const sessionID = request.query["sessionID"] as string;

    const userName = request.query["userName"] as string;
    const passWord = request.query["passWord"] as string;
    const verifyCode = request.query["verifyCode"] as string;
    api.login(sessionID,userName, passWord, verifyCode).then(loginResponse => {
        response.send(loginResponse)
    })
})

//获取成绩
app.get("/score", (request, response) => {
    //login?userName=2&passWord=123456&verifyCode=123456
    const sessionID = request.query["sessionID"] as string;

    api.getAllScore(sessionID).then(score => {
        response.send(score)
    })
})

//获取sessionID
app.get("/session", (request, response) => {
    api.requestNewSessionID().then(session=>{
        response.send(session)
    })
})

//获取rank
app.get("/rank",(request,response)=>{
    const sessionID = request.query["sessionID"] as string;
    api.queryRank(sessionID).then(rank=>{
        response.send(rank)
    })
})


app.get("/insertRank" ,(request,response)=>{
    const studentID = request.query["studentID"] as string;
    const averageScore = request.query["averageScore"] as string;
    const sessionID = request.query["sessionID"] as string;
    api.insertRankToDB(sessionID,studentID,averageScore).then(()=>{
        response.send("插入成功")
    })
})

app.get("/insertLogin" ,(request,response)=>{
    const sessionID = request.query["sessionID"] as string;
    api.insertLoginSessionID(sessionID).then(()=>{
        response.send("插入成功")
    })
})
app.listen(3010, () => {
    console.log('服务器启动')
})



