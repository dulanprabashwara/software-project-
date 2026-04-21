import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import { useAuth } from '../app/context/AuthContext'; 

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
let socket: Socket;

export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Get the firebase 'user' object from your AuthContext
  const { user } = useAuth(); 

  useEffect(() => {
    if (!userId || !user) return;

    const setupNotifications = async () => {
      try {
        // Get the fresh token for the initial fetch and socket auth
        const token = await user.getIdToken();

        // 1. Fetch historical notifications
        const res = await fetch(`${SOCKET_URL}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` } 
        });
        const json = await res.json();
        if (json.success) setNotifications(json.data);

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
        console.error("Failed to setup notifications:", error);
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
  }, [userId, user]); // Added user to dependencies

  /**
   * Deletes notification(s) from DB and removes from local UI.
   */
  const markAsRead = async (id?: string) => {
    try {
      // 1. Get a fresh token from the context user
      if (!user) {
        console.error("User not authenticated");
        return;
      }
      const token = await user.getIdToken();

      // 2. Optimistic Update: Remove from UI immediately
      setNotifications(prev => id ? prev.filter(n => n.id !== id) : []);
      
      // 3. Send the delete request to the backend
      console.log("Full Request URL:", `${SOCKET_URL}/api/notifications/delete`);
      await axios.post(`${SOCKET_URL}/api/notifications/mark-read`, 
        { notificationId: id },
        { 
          headers: { Authorization: `Bearer ${token}` } 
        }
      );
    } catch (err) {
      console.error("Failed to delete notification:", err);
      // Optional: Refetch on error to restore UI if deletion failed on server
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return { notifications, unreadCount, loading, markAsRead };
}