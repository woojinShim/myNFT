import { useEffect } from 'react';
import { gapi } from 'gapi-script';
import './App.css';
import KakaoLogin from './components/kakao';
// import GoogleLogin from './components/google';
import GoogleLogin from './components/login';
import GoogleLogout from './components/logout';
import FacebookLogin from './components/facebook';

function App() {
    useEffect(() => {
        function start() {
            gapi.client.init({
                clientId: process.env.REACT_APP_GOOGLE,
                scope: ""
            });
        };
        gapi.load('client:auth2', start);
    });


    const onSuccessHandler = res => {
        console.log(res)
    };

    return (
        <div className="App">
            <GoogleLogin />
            <GoogleLogout />
            <KakaoLogin
                success={onSuccessHandler}
                fail={res => console.log(res)}
            /><br />
            <FacebookLogin />
        </div>
    );
}

export default App;
