"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const api_1 = require("./api");
const axiosInstance = axios_1.default.create({
    baseURL: "http://jwc.swjtu.edu.cn/"
});
axiosInstance.get("service/login.html").then(response => {
    console.log(response.headers);
});
const api = new api_1.Api();
