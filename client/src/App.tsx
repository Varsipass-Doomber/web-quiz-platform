import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import './App.css';

// Импорты страниц
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { HomePage } from './pages/HomePage';
import { CreateQuizPage } from './pages/CreateQuizPage';

function App() {
  // Используем useRef для хранения socket
  const socketRef = useRef<ReturnType<typeof io> | null>(null);

  useEffect(() => {
    // Создаем соединение только один раз
    const newSocket = io('http://localhost:5001', {
      autoConnect: true,
      reconnection: true,
    });

    socketRef.current = newSocket;

    // Логируем статус подключения (для отладки)
    newSocket.on('connect', () => {
      console.log('🟢 Socket connected, ID:', newSocket.id);
    });

    newSocket.on('disconnect', () => {
      console.log('🔴 Socket disconnected');
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
    });

    // Очистка при размонтировании
    return () => {
      if (newSocket) {
        newSocket.disconnect();
        newSocket.close();
        socketRef.current = null;
      }
    };
  }, []); // Пустой массив — эффект выполняется только один раз

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/quiz/create" element={<CreateQuizPage />} />
        {/* Добавим позже: 
        <Route path="/quiz/:id" element={<QuizSession />} />
        <Route path="/results/:id" element={<Results />} />
        <Route path="/profile" element={<Profile />} />
        */}
      </Routes>
    </Router>
  );
}

export default App;