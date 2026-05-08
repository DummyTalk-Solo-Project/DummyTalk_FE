import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import SignInPage from './pages/SignInPage';
import QuizPage from './pages/QuizPage';
import MyPage from './pages/MyPage';
import MyDummyPage from './pages/MyDummyPage';
import ErrorPage from './pages/ErrorPage';

function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/my-page" element={<MyPage />} />
          <Route path="/my-dummy" element={<MyDummyPage />} />
          <Route path="/error" element={<ErrorPage />} />
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
