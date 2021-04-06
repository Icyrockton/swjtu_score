import React, {useState} from 'react'
import {observer} from "mobx-react-lite";
import {AppState} from "./AppState";
import 'antd/dist/antd.css';
import {Table} from "antd/es";
import classes from "./App.module.css"

type AppProps = {
    uiState: AppState
}
const App = observer<AppProps>(props => {
    const uiState = props.uiState;

    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [verifyCode, setVerifyCode] = useState("");

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

    const tableContent = () => {
        if (uiState.score) {
            return <Table dataSource={uiState.score} columns={columns} pagination={false}/>
        } else
            return <h1>暂无数据</h1>
    }

    const errorMsg = () => {
        if (uiState.errorMsg)
            return <h3 className={classes.errorMsg}>{uiState.errorMsg}</h3>
        else return <></>
    }

    const infoMsg=()=>{
        if (uiState.loading)
            return <h3 className={classes.infoMsg}>{uiState.loadingMsg}</h3>
        else
            return  <></>
    }

    const scoreTableContent=()=>{
        return  uiState.score?.map(score=>(
            <tr>
                <td>{score.course_name}</td>
                <td>{score.daily_score}</td>
                <td>{score.final_exam}</td>
                <td>{score.score}</td>
            </tr>
        ))
    }

    const scoreTable = ()=>{
        return (
            <table className={classes.rankTable}>
                <thead>
                <tr>
                    <th>课程名称</th>
                    <th>平时</th>
                    <th>期末</th>
                    <th>总成绩</th>
                </tr>
                </thead>
                <tbody>
                {scoreTableContent()}
                </tbody>
            </table>
        )
    }

    const rankTableContent =()=>{
        let index = 1
       return  uiState.ranks?.map(rank=>(
            <tr>
                <td>{index ++ }</td>
                <td>{rank.studentID}</td>
                <td>{rank.averageScore}</td>
            </tr>
        ))
    }
    const rankTable = ()=>{
        return (
            <table className={classes.rankTable}>
                <thead>
                    <tr>
                        <th>排名</th>
                        <th>学号</th>
                        <th>平均分</th>
                    </tr>
                </thead>
                <tbody>
                    {rankTableContent()}
                </tbody>
            </table>
        )
    }

    const info=()=>{
        if (uiState.showInfo){
            return  (
                <div className={classes.infoCard}>
                    <h1>搜索到的课程总数{uiState.averageScore?.count}</h1>
                    <h1>课程总分{uiState.averageScore?.total}</h1>
                    <h1>课程平均分{uiState.averageScore?.average}</h1>
                    {rankTable()}
                    {scoreTable()}
                </div>
            )
        }
        else
            return <></>
    }
    return (
        <>

            <div className={classes.outer}>
                <div className={classes.container}>
                    <div className={classes.card}>
                        <form>
                            <span className={classes.loginTitle}>
                                系统
                            </span>
                            <span className={classes.label}>
                                账号
                            </span>
                            <div className={classes.inputContainer}>
                                <input value={userName} onChange={event => setUserName(event.target.value)}  className={classes.input} type="text" name="username"/>
                            </div>
                            <span  className={classes.label} >
                                密码
                            </span>
                            <div className={classes.inputContainer}>
                                <input value={password} onChange={event => setPassword(event.target.value)} className={classes.input} type="password" name="password"/>
                            </div>

                            <img className={classes.image} src={`data:image/png;base64,${uiState.imageBASE64}`} onClick={()=>uiState.refreshImage()}/>

                            <span className={classes.label}>
                                验证码
                            </span>
                            <div className={classes.inputContainer}>
                                <input  value={verifyCode} onChange={event => setVerifyCode(event.target.value)} className={classes.input} type="text" name="verifyCode"/>
                            </div>

                            <button type={"button"} className={classes.login} onClick={()=>{uiState.login(userName,password,verifyCode)}}>
                                登录
                            </button>
                            {
                                errorMsg()
                            }
                            {
                                infoMsg()
                            }
                        </form>
                    </div>

                    {info()}
                </div>
            </div>
        </>
    )
})
export default App
