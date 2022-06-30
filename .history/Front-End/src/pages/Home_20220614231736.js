import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div>
            <h1>홈</h1>
            <p>가장 먼저 보여지는 페이지입니다.</p>
            <Link to="/about">소개</Link><br />
            <Link to="/modal">모달</Link>
            <Link to="/tokenlist">리스트</Link>
        </div>
    );
};

export default Home;