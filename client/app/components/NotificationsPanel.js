'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'

const API = 'https://contractlens-api.onrender.com'

export default function NotificationsPanel() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [showPanel, setShowPanel] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (showPanel) {
      fetchNotifications()
    }
  }, [showPanel])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `${API}/api/notifications`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setNotifications(response.data.notifications)
      setUnreadCount(response.data.notifications.filter(n => !n.is_read).length)
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token')
      await axios.put(
        `${API}/api/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      fetchNotifications()
    } catch (err) {
      console.error('Failed to mark as read:', err)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token')
      await axios.put(
        `${API}/api/notifications/read-all`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      fetchNotifications()
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    }
  }

  const handleDelete = async (notificationId) => {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(
        `${API}/api/notifications/${notificationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      fetchNotifications()
    } catch (err) {
      console.error('Failed to delete notification:', err)
    }
  }

  const getNotificationIcon = (type) => {
    const icons = {
      renewal: '📅',
      expiration: '⏰',
      share: '🔗',
      comment: '💬',
    }
    return icons[type] || '📢'
  }

  const getNotificationColor = (type) => {
    const colors = {
      renewal: '#fbbf24',
      expiration: '#f87171',
      share: '#60a5fa',
      comment: '#4ade80',
    }
    return colors[type] || '#888'
  }

  return (
    <>
      <button
        onClick={() => setShowPanel(!showPanel)}
        style={{
          position: 'relative',
          padding: '8px 16px',
          background: '#1a1a1a',
          color: '#fff',
          border: '1px solid #2a2a2a',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        🔔 Notifications
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: -4,
            right: -4,
            background: '#f87171',
            color: '#000',
            fontSize: 10,
            fontWeight: 700,
            padding: '2px 6px',
            borderRadius: 10,
            minWidth: 18,
            textAlign: 'center',
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {showPanel && (
        <div style={{
          position: 'fixed',
          top: 60,
          right: 24,
          width: 400,
          maxHeight: 'calc(100vh - 80px)',
          background: '#1a1a1a',
          borderRadius: 12,
          border: '1px solid #2a2a2a',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{
            padding: 16,
            borderBottom: '1px solid #2a2a2a',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <h3 style={{ color: '#fff', fontSize: 16, margin: 0 }}>
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                style={{
                  padding: '4px 12px',
                  background: '#4ade80',
                  color: '#000',
                  border: 'none',
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Mark All Read
              </button>
            )}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
            {loading ? (
              <p style={{ color: '#888', fontSize: 13, textAlign: 'center', padding: 32 }}>
                Loading...
              </p>
            ) : notifications.length === 0 ? (
              <p style={{ color: '#888', fontSize: 13, textAlign: 'center', padding: 32 }}>
                No notifications
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    style={{
                      background: notification.is_read ? '#0f0f0f' : '#1a1a1a',
                      padding: 12,
                      borderRadius: 8,
                      border: notification.is_read ? '1px solid #2a2a2a' : '1px solid #4ade80',
                      cursor: 'pointer',
                    }}
                    onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <span style={{ fontSize: 20 }}>
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div style={{ flex: 1 }}>
                        <p style={{
                          color: '#fff',
                          fontSize: 13,
                          fontWeight: notification.is_read ? 400 : 600,
                          marginBottom: 4,
                        }}>
                          {notification.title}
                        </p>
                        <p style={{ color: '#888', fontSize: 12, marginBottom: 8 }}>
                          {notification.message}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <p style={{ color: '#666', fontSize: 11 }}>
                            {new Date(notification.created_at).toLocaleString()}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(notification.id)
                            }}
                            style={{
                              padding: '2px 8px',
                              background: '#2a2a2a',
                              color: '#888',
                              border: 'none',
                              borderRadius: 4,
                              fontSize: 10,
                              cursor: 'pointer',
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setShowPanel(false)}
            style={{
              padding: 12,
              background: '#0f0f0f',
              color: '#fff',
              border: 'none',
              borderTop: '1px solid #2a2a2a',
              borderRadius: '0 0 12 12',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      )}
    </>
  )
}
