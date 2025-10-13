import {useState, useEffect} from "react"
import '@ant-design/v5-patch-for-react-19';



// IMPORTS NI JACOB
import { Spin } from "antd";
import { LoadingOutlined } from '@ant-design/icons';
import LoginForm from "./LoginForm";
import LoginBrand from "./LoginBrand";
import './styles/LoginPage.css'
import './styles/LoginForm.css'
import './styles/LoginBrand.css'


const LoginPage = () => {
    


    // --- JACOB CODES ---

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
        setLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
        <div className="loading-container">
            <Spin indicator={<LoadingOutlined spin />} size="large" tip="Loading..." />
        </div>
        );
    }



    return(
        <>
            
            <div className="page">
                <div className="left">
                    <LoginBrand />
                </div>
                
                <div className="right">
                    <LoginForm />
                </div>
            </div>



    </>
    )
}

export default LoginPage