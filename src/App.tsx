// App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage';
// import QuizPage from './pages/QuizPage';
// import MyPage from '../pages/MyPage';
import LoginPage from './pages/LoginPage'; // 로그인 페이지 import
import SignInPage from './pages/SignInPage'; // 회원가입 페이지 import
import QuizPage from './pages/QuizPage'; 
// import MyPage from './pages/MyPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/quiz" element={<QuizPage />} />
        {/* <Route path="/my-page" element={<MyPage />} /> */}
      </Routes>
    </Router>
  );
}

export default App;