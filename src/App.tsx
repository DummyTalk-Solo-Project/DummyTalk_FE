// App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage';
// import QuizPage from './pages/QuizPage';
// import MyPage from './pages/MyPage';
// ... Login, SignIn 페이지도 추가될 예정

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        {/* <Route path="/quiz" element={<QuizPage />} />
        <Route path="/my-page" element={<MyPage />} /> */}
      </Routes>
    </Router>
  );
}

export default App;