// @ts-nocheck
import React from 'react';
import api from '../../services/api';

export function Modals(props: any) {
  const { confirmDialog, setConfirmDialog, sendReportModal, setSendReportModal, showToast, fetchData } = props;
  return (
    <>
{/* Confirm Modal */}
      {confirmDialog && confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
            <div className={`px-6 py-4 border-b ${confirmDialog.type === 'danger' ? 'border-rose-100 bg-rose-50' : 'border-slate-100 bg-slate-50'}`}>
              <h3 className={`text-lg font-bold ${confirmDialog.type === 'danger' ? 'text-rose-700' : 'text-slate-900'}`}>
                {confirmDialog.title}
              </h3>
            </div>
            <div className="px-6 py-5 text-sm text-slate-600">
              {confirmDialog.message}
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
                className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setConfirmDialog({ ...confirmDialog, isOpen: false });
                  confirmDialog.onConfirm();
                }}
                className={`px-4 py-2 text-sm font-semibold text-white rounded-lg ${confirmDialog.type === 'danger' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
              >
                {confirmDialog.actionLabel || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Report Modal */}
      {sendReportModal && sendReportModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">
                Share Report
              </h3>
            </div>
            <div className="px-6 py-5 text-sm text-slate-600">
              <p className="mb-4">PDF uploaded successfully! Who would you like to notify with the secure download link?</p>
              <div className="space-y-2">
                <button
                  onClick={async () => {
                    setSendReportModal(null);
                    try {
                      await api.sendLabReport(sendReportModal.labId, 'doctor');
                      showToast('Sent to Doctor successfully');
                      await fetchData();
                    } catch (err) {
                      showToast('Failed to send notification', true);
                    }
                  }}
                  className="w-full text-left px-4 py-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors flex items-center gap-3 font-semibold text-slate-700"
                >
                  <span className="text-xl">👨‍⚕️</span> Send to Doctor Only
                </button>
                <button
                  onClick={async () => {
                    setSendReportModal(null);
                    try {
                      await api.sendLabReport(sendReportModal.labId, 'patient');
                      showToast('Sent to Patient successfully');
                      await fetchData();
                    } catch (err) {
                      showToast('Failed to send notification', true);
                    }
                  }}
                  className="w-full text-left px-4 py-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors flex items-center gap-3 font-semibold text-slate-700"
                >
                  <span className="text-xl">🧑</span> Send to Patient Only
                </button>
                <button
                  onClick={async () => {
                    setSendReportModal(null);
                    try {
                      await api.sendLabReport(sendReportModal.labId, 'both');
                      showToast('Sent to Both successfully');
                      await fetchData();
                    } catch (err) {
                      showToast('Failed to send notification', true);
                    }
                  }}
                  className="w-full text-left px-4 py-3 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-3 font-semibold text-indigo-700 shadow-sm"
                >
                  <span className="text-xl">🚀</span> Send to Both (Recommended)
                </button>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSendReportModal(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Skip for now
              </button>
            </div>
          </div>
        </div>
      )}

      
    </>
  );
}
