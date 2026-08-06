// @ts-nocheck
import React from 'react';
import { Bell, LogOut } from 'lucide-react';
import api from '../../services/api';

export function Header(props: any) {
  const { currentUser, ROLE_LABELS, notifications, showNotificationsDropdown, setShowNotificationsDropdown, handleMarkAllNotificationsRead, handleMarkNotificationRead, setActiveTab, showToast, handleLogout } = props;
  return (
<header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="SegueEMR Logo" className="h-12 w-auto object-contain" />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                <span>{currentUser?.userId}</span>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-800 border border-slate-200">
                  {ROLE_LABELS?.[currentUser?.role] || currentUser?.role}
                </span>
              </div>

              {/* Notification Badge / Dropdown (Doctor & Patient only) */}
              {(currentUser?.role === 'doctor' || currentUser?.role === 'patient') && (
                <div className="relative">
                  <button
                    onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
                    className="relative p-1 text-slate-500 hover:text-indigo-600 transition-colors focus:outline-none rounded-full"
                    title="In-app alerts"
                  >
                    <Bell className="h-5 w-5" />
                    {notifications.some(n => !n.isRead) && (
                      <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
                    )}
                  </button>

                  {showNotificationsDropdown && (
                    <div className="absolute right-0 mt-2 w-80 rounded-md bg-white border border-slate-200 shadow-lg py-1 z-50">
                      <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                        <span className="font-semibold text-xs text-slate-700">
                          Notifications ({notifications.filter(n => !n.isRead).length} unread)
                        </span>
                        {notifications.some(n => !n.isRead) && (
                          <button
                            onClick={() => {
                              handleMarkAllNotificationsRead();
                              setShowNotificationsDropdown(false);
                            }}
                            className="text-[10px] text-indigo-600 hover:text-indigo-800 font-medium bg-transparent border-0 cursor-pointer"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-6 text-xs text-slate-400 text-center">
                            No notifications
                          </div>
                        ) : (
                          notifications.map(notif => (
                            <div
                              key={notif.id}
                              onClick={async () => {
                                handleMarkNotificationRead(notif.id);
                                setShowNotificationsDropdown(false);
                                
                                if (notif.type === 'lab_report') {
                                  try {
                                    console.log('[Download] Lab report notif referenceId:', notif.referenceId);
                                    const res = await api.downloadLabReport(notif.referenceId);
                                    if (res.success && res.sasUrl) {
                                      window.open(res.sasUrl, '_blank');
                                    } else {
                                      showToast((res as any).error || 'Failed to retrieve secure report', true);
                                    }
                                  } catch (err: any) {
                                    // apiClient interceptor already sets err.message to the backend's error string
                                    showToast(err?.message || 'Error downloading report', true);
                                  }
                                  return;
                                }

                                if (currentUser?.role === 'doctor') {
                                  if (notif.referenceType === 'LabOrder') {
                                    setActiveTab('labs');
                                  } else if (notif.referenceType === 'Prescription') {
                                    setActiveTab('prescriptions');
                                  }
                                } else if (currentUser?.role === 'patient') {
                                  if (notif.referenceType === 'LabOrder' || notif.referenceType === 'Prescription') {
                                    setActiveTab('clinical');
                                  }
                                }
                              }}
                              className={`px-4 py-3 border-b border-slate-50 text-xs text-left cursor-pointer hover:bg-slate-50 transition-colors ${!notif.isRead ? 'bg-indigo-50/30 font-medium' : ''}`}
                            >
                              <div className="font-semibold text-slate-800">{notif.title}</div>
                              <div className="text-slate-700 mt-0.5">{notif.message}</div>
                              <div className="text-[10px] text-slate-400 mt-1">
                                {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
              >
                <LogOut className="h-4 w-4 text-slate-500" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>
  );
}
