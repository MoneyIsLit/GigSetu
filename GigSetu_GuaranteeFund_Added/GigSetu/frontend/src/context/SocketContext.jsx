import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    if (!user?._id) return undefined;

    const socket = io(window.location.origin, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => socket.emit('join', { userId: user._id }));
    socket.on('notification', (msg) => {
      const translated = msg.type ? t(`notifications.${msg.type}`) : msg.message;
      const finalMessage = translated.startsWith('notifications.') ? msg.message : translated;
      setNotifications(prev => [{ ...msg, message: finalMessage, receivedAt: Date.now(), id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` }, ...prev].slice(0, 30));
      toast(finalMessage, { icon: '🔔' });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?._id, t]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, notifications, clearNotifications: () => setNotifications([]) }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
