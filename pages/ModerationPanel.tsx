

import React from 'react';
import { useStore } from '../store';
import { CheckCircle, Trash2, Ban, Shield, AlertTriangle } from 'lucide-react';
import { translations } from '../translations';
import { PageHeader } from '../components/PageHeader';
import { useNavigate } from 'react-router-dom';

export const ModerationPanel: React.FC = () => {
  const { reports, resolveReport, language, questions, getUserById } = useStore();
  const t = translations[language];
  const navigate = useNavigate();
  
  const pendingReports = reports.filter(r => r.status === 'PENDING');

  // Helper to get details about reported content
  const getContentDetails = (report: any) => {
      if (report.entityType === 'QUESTION') {
          const q = questions.find(q => q.id === report.entityId);
          return q ? `"${q.title}" - ${q.text.substring(0, 50)}...` : 'Content not found (Deleted)';
      }
      return 'Answer content...'; // In real app, would look up answer
  };

  const getReporterName = (id: string) => {
      const user = getUserById(id);
      return user ? user.username : 'Unknown';
  };

  return (
    <div className="h-screen flex flex-col bg-bg text-white page-transition overflow-hidden">
      <PageHeader 
        title={
          <div className="flex items-center gap-2">
            <Shield className="text-primary" size={20} />
            Moderation Panel
          </div>
        }
        onBack={() => navigate('/profile')}
      />

      <div className="flex-1 overflow-y-auto p-4 pb-24 no-scrollbar">
          
          <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 bg-card p-4 rounded-2xl border border-white/5 text-center">
                  <div className="text-2xl font-bold text-warning">{pendingReports.length}</div>
                  <div className="text-xs text-secondary uppercase tracking-wider">Pending</div>
              </div>
              <div className="flex-1 bg-card p-4 rounded-2xl border border-white/5 text-center">
                  <div className="text-2xl font-bold text-success">{reports.filter(r => r.status === 'RESOLVED').length}</div>
                  <div className="text-xs text-secondary uppercase tracking-wider">Resolved</div>
              </div>
          </div>

          {pendingReports.length === 0 ? (
              <div className="text-center py-20 text-secondary flex flex-col items-center gap-4">
                  <CheckCircle size={48} className="opacity-20" />
                  <p>All clear! No pending reports.</p>
              </div>
          ) : (
              <div className="space-y-4">
                  {pendingReports.map(report => (
                      <div key={report.id} className="bg-card p-5 rounded-3xl border border-white/5 shadow-sm">
                          <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-2">
                                  <span className="px-2 py-1 rounded-lg bg-white/5 text-[10px] font-bold uppercase text-secondary">
                                      {report.entityType}
                                  </span>
                                  <span className="text-xs text-secondary">
                                      Reported by @{getReporterName(report.reporterId)}
                                  </span>
                              </div>
                              <div className="text-xs text-secondary">
                                  {new Date(report.createdAt).toLocaleDateString()}
                              </div>
                          </div>

                          <div className="mb-4">
                              <h4 className="font-bold text-white text-sm mb-1 flex items-center gap-2">
                                  <AlertTriangle size={14} className="text-warning" />
                                  Reason: {t[`report.reason.${report.reason}`] || report.reason}
                              </h4>
                              {report.description && (
                                  <p className="text-xs text-secondary italic mb-2">"{report.description}"</p>
                              )}
                              <div className="p-3 bg-input rounded-xl text-sm text-white border border-white/5">
                                  {getContentDetails(report)}
                              </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                               <button 
                                  onClick={() => resolveReport(report.id, 'DISMISS')}
                                  className="py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white transition-colors"
                               >
                                  Dismiss
                               </button>
                               <button 
                                  onClick={() => resolveReport(report.id, 'DELETE')}
                                  className="py-2 rounded-xl bg-danger/10 hover:bg-danger/20 text-xs font-bold text-danger transition-colors flex items-center justify-center gap-2"
                               >
                                  <Trash2 size={14} /> Delete Content
                               </button>
                               <button 
                                  onClick={() => resolveReport(report.id, 'BAN_24H')}
                                  className="py-2 rounded-xl bg-card border border-white/10 hover:bg-white/5 text-xs font-bold text-warning transition-colors flex items-center justify-center gap-2"
                               >
                                  <Ban size={14} /> Ban 24h
                               </button>
                               <button 
                                  onClick={() => resolveReport(report.id, 'BAN_FOREVER')}
                                  className="py-2 rounded-xl bg-card border border-white/10 hover:bg-white/5 text-xs font-bold text-danger transition-colors flex items-center justify-center gap-2"
                               >
                                  <Ban size={14} /> Ban Forever
                               </button>
                          </div>
                      </div>
                  ))}
              </div>
          )}
      </div>
    </div>
  );
};