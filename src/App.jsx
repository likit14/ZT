import { useEffect, useState } from 'react'
import { Outlet } from "react-router-dom";
import Login from './View/Login'

const App=()=>{
    const [isLogin,setIsLogin]=useState(false)

    useEffect(()=>{
        const loginData=JSON.parse(localStorage.getItem('loginDetails'))
        if(!(loginData&&loginData.loginStatus)){
            const loginDetails={
                loginStatus:false
              }
              localStorage.setItem('loginDetails',JSON.stringify(loginDetails))
        }else{
            setIsLogin(true)
        }
    },[isLogin])

    function checkLogin(status){
        setIsLogin(status)
    }

    return(
        <>{
            isLogin?<Outlet />:<Login checkLogin={checkLogin}/>
        }
        </>
    )
}

export default App