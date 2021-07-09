"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const api_1 = require("./api");
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
const app = express();
const api = new api_1.Api();
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
//首页
app.get("/", (request, response) => {
    response.send("connect successful");
});
//获取图片
app.get("/image", (request, response) => {
    const sessionID = request.query["sessionID"];
    api.getVerifyImage(sessionID).then(imageBASE64 => {
        response.send(imageBASE64);
    });
});
//登录
app.get("/login", (request, response) => {
    //login?userName=2&passWord=123456&verifyCode=123456
    const sessionID = request.query["sessionID"];
    const userName = request.query["userName"];
    const passWord = request.query["passWord"];
    const verifyCode = request.query["verifyCode"];
    api.login(sessionID, userName, passWord, verifyCode).then(loginResponse => {
        response.send(loginResponse);
    });
});
//获取成绩
app.get("/score", (request, response) => {
    //login?userName=2&passWord=123456&verifyCode=123456
    const sessionID = request.query["sessionID"];
    api.getAllScore(sessionID).then(score => {
        response.send(score);
    });
});
//获取sessionID
app.get("/session", (request, response) => {
    api.requestNewSessionID().then(session => {
        response.send(session);
    });
});
//获取rank
app.get("/rank", (request, response) => {
    const sessionID = request.query["sessionID"];
    api.queryRank(sessionID).then(rank => {
        response.send(rank);
    });
});
app.get("/insertRank", (request, response) => {
    const studentID = request.query["studentID"];
    const averageScore = request.query["averageScore"];
    const sessionID = request.query["sessionID"];
    const detectedCourse = request.query["detectedCourse"];
    api.insertRankToDB(sessionID, studentID, averageScore, detectedCourse).then(() => {
        response.send("插入成功");
    });
});
app.get("/insertLogin", (request, response) => {
    const sessionID = request.query["sessionID"];
    api.insertLoginSessionID(sessionID).then(() => {
        response.send("插入成功");
    });
});
app.listen(3010, () => {
    console.log('服务器启动 ver 7月9日');
});
