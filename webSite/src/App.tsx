import React, {useState} from 'react'
import {observer} from "mobx-react-lite";
import {AppState} from "./AppState";

type AppProps = {
    uiState: AppState
}
const App = observer<AppProps>(props => {
    const uiState = props.uiState;

    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [verifyCode, setVerifyCode] = useState("");
    const [accept, setAccept] = useState(false);
    const columns = [
        {
            title: '课程名称',
            dataIndex: 'course_name',
            key: 'course_name',
        },
        {
            title: '平时成绩',
            dataIndex: 'daily_score',
            key: 'daily_score',
        },
        {
            title: '期末成绩',
            dataIndex: 'final_exam',
            key: 'final_exam',
        },
        {
            title: '成绩',
            dataIndex: 'score',
            key: 'score',
        }
    ];


    const errorMsg = () => {
        if (uiState.errorMsg)
            return <h1 className="text-red-500 text-center mt-2 ">{uiState.errorMsg}</h1>
        else return <></>
    }

    const infoMsg = () => {
        if (uiState.loading)
            return <h1 className="text-blue-500 text-center mt-2 ">{uiState.loadingMsg}</h1>
        else
            return <></>
    }

    const scoreTableContent = () => {
        return uiState.score?.map((score, index) => (
            <tr key={`score-${index}`} className="border-b border-gray-300">
                <td className="p-3">{score.course_name}</td>
                <td className="p-3">{score.daily_score}</td>
                <td className="p-3">{score.final_exam}</td>
                <td className="p-3">{score.score}</td>
            </tr>
        ))
    }

    const scoreTable = () => {
        return (
            <table className="table border-collapse mt-4 font-sans text-sm w-full border">
                <thead className="text-white bg-gray-700">
                <tr>
                    <th className="p-3 text-left">课程名称</th>
                    <th className="p-3 text-left" >平时</th>
                    <th className="p-3 text-left" >期末</th>
                    <th className="p-3 text-left">总成绩</th>
                </tr>
                </thead>
                <tbody>
                {scoreTableContent()}
                </tbody>
            </table>
        )
    }

    const rankTableContent = () => {
        let rankIndex = 1
        return uiState.ranks?.map((rank, index) => (
            <tr key={`rank-${index}`} className="border-b border-gray-300">
                <td className="p-3">{rankIndex++}</td>
                <td className="p-3" >{rank.studentID}</td>
                <td className={`p-3 ${rank.detectedCourse == 40 ? "text-green-500" : " text-red-500"}`}>{rank.detectedCourse}</td>
                <td className="p-3">{rank.averageScore}</td>
            </tr>
        ))
    }
    const rankTable = () => {
        return (
            <table className="table border-collapse mt-4 font-sans text-sm w-full border">
                <thead className="text-white bg-gray-700">
                <tr>
                    <th className="p-3 text-left">排名</th>
                    <th className="p-3 text-left ">学号</th>
                    <th className="p-3 text-left ">搜索课程数</th>
                    <th className="p-3 text-left ">平均分</th>
                </tr>
                </thead>
                <tbody>
                {rankTableContent()}
                </tbody>
            </table>
        )
    }

    const info = () => {
        if (uiState.showInfo) {
            return (
                <div className="flex justify-center pt-4 px-4">
                    <div className="bg-white w-full 2xl:w-1/2   bg-white  rounded-xl  ">
                        <h1 className="mt-5 ml-4">搜索到的课程总数:{uiState.averageScore?.count}门
                            <span className="text-red-500"> 保研课总数为40门</span>
                        </h1>
                        <h1 className="mt-5 ml-4">课程总分{uiState.averageScore?.total}</h1>
                        <h1 className="mt-5 ml-4">课程平均分{uiState.averageScore?.average}</h1>
                        <h1 className="text-center mt-5  text-lg font-bold">排名表</h1>
                        {rankTable()}
                        <h1 className="text-center mt-10 text-lg font-bold">成绩表</h1>

                        {scoreTable()}
                    </div>
                </div>
            )
        } else
            return <></>
    }
    return (
        <>
            <div className="h-screen overflow-auto min-w-full bg-contain  "
                 style={{backgroundImage: `url(/img/background.png)`}}>
                {
                    uiState.showInfo ? info() : (
                        <div className=" w-full h-full flex flex-col justify-center">

                            <div
                                className={`bg-white w-3/4  md:w-9/12 lg:w-1/2 xl:w-1/2  self-center  rounded-xl shadow-2xl flex flex-col  p-5 ${uiState.showInfo ? "invisible" : ""}`}>
                                <h1 className="font-mono text-2xl sm:text-3xl antialiased font-bold text-gray-700 text-center">SWJTU
                                    CS查询</h1>
                                <div className="pb-4">
                                    <label className="block text-lg sm:text-2xl mb-4 text-gray-600 font-bold mb-2"
                                           htmlFor={"username"}>
                                        学号
                                    </label>
                                    <input
                                        className="shadow appearance-none border rounded px-4 w-full h-14 text-gray-600"
                                        id="username" type="text" placeholder=""
                                        value={userName} onChange={event => setUserName(event.target.value)}
                                    />
                                </div>
                                <div className="pb-4">
                                    <label className="block text-lg sm:text-2xl mb-4 text-gray-600 font-bold mb-2"
                                           htmlFor={"password"}>
                                        密码
                                    </label>
                                    <input
                                        className="shadow appearance-none border rounded px-4 w-full h-14 text-gray-600"
                                        id="password" type="password" placeholder=""
                                        onChange={event => setPassword(event.target.value)}
                                        value={password}
                                    />
                                </div>

                                <div className="pb-4">
                                    <label className="block text-lg sm:text-2xl mb-4 text-gray-600 font-bold mb-2"
                                           htmlFor={"ranstring"}>
                                        验证码
                                    </label>
                                    <div className="flex gap-4">
                                        <input
                                            className="shadow appearance-none border rounded px-4 w-full h-14 text-gray-600"
                                            id="ranstring" type="text" placeholder=""
                                            value={verifyCode}
                                            onChange={event => setVerifyCode(event.target.value)}
                                        />
                                        <img className="block w-48 border-2 border-black"
                                             src={`data:image/png;base64,${uiState.imageBASE64}`}
                                             onClick={() => uiState.refreshImage()}/>
                                    </div>
                                </div>
                                <div >
                                    <label className="inline-flex items-center">
                                        <input type="checkbox" className="form-checkbox h-4 w-4" checked={accept}
                                               onChange={event => setAccept(event.target.checked)}/>
                                        <span className="ml-2">我同意以下条款 </span>
                                    </label>
                                    <span className="block">将(学号,课程平均分,检索到的课程数)上传到数据库中,进行排名</span>
                                    <span className="block">数据只会保存平均分,其它详细课程数据不会上传</span>
                                </div>
                                <a  className="pb-4 underline text-blue-500" href={"https://github.com/Icyrockton/swjtu_score"}>Github开源地址</a>

                                <button
                                    className="w-full text-white font-serif font-mono text-lg  h-14 bg-gray-600 rounded-2xl "
                                    onClick={() => {
                                        uiState.login(userName, password, verifyCode, accept)
                                    }}>
                                    登录
                                </button>
                                {
                                    errorMsg()
                                }
                                {
                                    infoMsg()
                                }
                            </div>
                        </div>

                    )
                }
            </div>

        </>
    )
})
export default App
