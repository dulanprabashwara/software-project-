import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../app/context/AuthContext'; 
import { api } from "../lib/api"

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
let socket;

export function useNotifications(userId) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth(); 

  useEffect(() => {
    if (!userId || !user) return;

    const setupNotifications = async () => {
      try {
        const token = await user.getIdToken();

        // 1. Fetch historical data via API Service
        const data = await api.getNotifications(token); 
        setNotifications(Array.isArray(data) ? data : data.data || []);

        // 2. Initialize Socket Connection
        if (!socket || !socket.connected) {
            socket = io(SOCKET_URL, {
              auth: { token },
              withCredentials: true,
            });
        }

        // 3. Listen for live incoming notifications
        socket.on('notification:receive', (newNotification) => {
          setNotifications((prev) => [newNotification, ...prev]);
        });

      } catch (error) {
        console.error("Hook Error:", error.message);
      } finally {
        setLoading(false);
      }
    };

    setupNotifications();

    return () => {
      if (socket) {
        socket.off('notification:receive');
      }
    };
  }, [userId, user]); 

  const markAsRead = async (id = null) => {
    try {
      if (!user) return;
      const token = await user.getIdToken();

      // Optimistic Update
      setNotifications(prev => id ? prev.filter(n => n.id !== id) : []);
      
      // API Service Call
      await api.markNotificationRead(id, token);
    } catch (err) {
      console.error("Failed to delete notification:", err.message);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return { notifications, unreadCount, loading, markAsRead };
}