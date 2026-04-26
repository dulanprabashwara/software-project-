const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const getNotificationsApi = async (token) => {
  const res = await fetch(`${SOCKET_URL}/api/notifications`, {
    headers: { Authorization: `Bearer ${token}` } 
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || "Failed to fetch notifications");
  return json.data || [];
};

export const markNotificationReadApi = async (notificationId, token) => {
  const res = await fetch(`${SOCKET_URL}/api/notifications/mark-read`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ notificationId }),
  });
  if (!res.ok) throw new Error("Failed to update notification status");
  return await res.json();
};