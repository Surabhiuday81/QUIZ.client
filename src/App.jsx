// client/src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import CreateQuiz from "./pages/CreateQuiz";
import LoginSignup from "./pages/LoginSignup";
import QuizPreview from "./pages/QuizPreview";
import QuizPlayer from "./pages/QuizPlayer";
import Home from "./pages/Home";
import Discover from "./pages/Discover";
import SharePreview from "./pages/SharePreview";
import QuizResult from "./pages/QuizResult";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import MyQuizzes from "./pages/MyQuizzes";
import QuizDetail from "./pages/QuizDetail";

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateQuiz />} />
          <Route path="/preview" element={<QuizPreview />} />
          <Route path="/my-quizzes" element={<MyQuizzes />} />
          <Route path="/play" element={<QuizPlayer />} />
          <Route path="/auth" element={<LoginSignup />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/p/:shareCode" element={<SharePreview />} />
          <Route path="/quiz/:id" element={<QuizDetail />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/results/:sessionId" element={<QuizResult />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
    </div>
  );
}
