'use client';

import { useEffect } from 'react';
import { useToastStore } from '@/store/toastStore';
import { useNotificationsStore } from '@/store/notificationsStore';

export default function WebSocketListener({ role, username }: { role?: string; username?: string }) {
  const { showToast } = useToastStore();
  const { fetchNotifications } = useNotificationsStore();

  useEffect(() => {
    if (!role && !username) return;

    let socket: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const connect = () => {
      try {
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const apiHost = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
        
        let wsHost = '';
        if (apiHost.startsWith('http')) {
          const urlObj = new URL(apiHost);
          wsHost = `${urlObj.protocol === 'https:' ? 'wss:' : 'ws:'}//${urlObj.host}/ws`;
        } else {
          wsHost = `${wsProtocol}//${window.location.hostname}:5001/ws`;
        }

        socket = new WebSocket(wsHost);

        socket.onopen = () => {
          if (role === 'admin' || username === 'Admin') {
            socket?.send(JSON.stringify({ type: 'REGISTER', role: 'admin' }));
          } else if (username) {
            socket?.send(JSON.stringify({ type: 'REGISTER', username }));
          }
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'KYC_PENDING') {
              showToast(`🔔 New KYC Pending Review: ${data.fullName || data.username} (${data.idType})`, 'success');
              fetchNotifications();
            } else if (data.type === 'KYC_PROCESSING') {
              showToast(`🛡️ KYC Verification Under Review: Your ${data.idType} document is being audited.`, 'success');
              fetchNotifications();
            } else if (data.type === 'USER_TRANSFER') {
              showToast(`💸 ${data.title}: ${data.content}`, 'success');
              fetchNotifications();
            } else if (data.type === 'TAC_REQUEST') {
              showToast(`🔑 ${data.title}: ${data.fullName} requested TAC clearance`, 'success');
              fetchNotifications();
            } else if (data.type === 'TAC_PROCESSING') {
              showToast(`⏳ ${data.title}: ${data.content}`, 'success');
              fetchNotifications();
            } else if (data.type === 'TAC_APPROVED') {
              showToast(`🔑 ${data.title}: ${data.content}`, 'success');
              fetchNotifications();
            } else if (data.type === 'TRANSFER_PROCESSING') {
              showToast(`⏳ ${data.title}: ${data.content}`, 'success');
              fetchNotifications();
            } else if (data.type === 'TRANSFER_PENDING_ADMIN') {
              showToast(`🔔 ${data.title}: ${data.content}`, 'success');
              fetchNotifications();
            }
          } catch (e) {
            console.error('Error handling WebSocket message:', e);
          }
        };

        socket.onclose = () => {
          reconnectTimeout = setTimeout(connect, 5000);
        };

        socket.onerror = () => {
          if (socket) socket.close();
        };
      } catch (err) {
        console.error('WebSocket setup error:', err);
      }
    };

    connect();

    return () => {
      if (socket) socket.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [role, username, showToast, fetchNotifications]);

  return null;
}
