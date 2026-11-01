'use client';

import React, { useState } from 'react';
import { User, Lock, Mail, Shield, Check, X, LogIn } from 'lucide-react';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile, token: string) => void;
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('analyst');
  const [password, setPassword] = useState<string>('AnalystPassword123!');
  const [email, setEmail] = useState<string>('analyst@digitaltwin.sec');
  const [role, setRole] = useState<string>('security_analyst');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const endpoint = isRegister ? 'http://127.0.0.1:8000/api/auth/register' : 'http://127.0.0.1:8000/api/auth/login';
    const body = isRegister ? { username, email, password, role } : { username, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Authentication failed');
      }
      localStorage.setItem('auth_token', data.access_token);
      onLoginSuccess(data.user, data.access_token);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = (u: string, p: string, r: string) => {
    setUsername(u);
    setPassword(p);
    setRole(r);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-950 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 text-cyan-400">
          <Shield className="h-5 w-5" />
          <h3 className="font-bold text-slate-100 text-base">
            {isRegister ? 'Register Security Account' : 'Authenticate & Role Selection'}
          </h3>
        </div>

        {/* Quick Role Fill Presets */}
        {!isRegister && (
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] text-slate-400 font-semibold block">Quick Role Presets:</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickSelect('admin', 'AdminPassword123!', 'admin')}
                className={`p-2 rounded text-xs font-mono border transition ${
                  username === 'admin'
                    ? 'border-cyan-500 bg-cyan-950/60 text-cyan-300'
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800'
                }`}
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickSelect('analyst', 'AnalystPassword123!', 'security_analyst')}
                className={`p-2 rounded text-xs font-mono border transition ${
                  username === 'analyst'
                    ? 'border-cyan-500 bg-cyan-950/60 text-cyan-300'
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800'
                }`}
              >
                Analyst
              </button>
              <button
                type="button"
                onClick={() => handleQuickSelect('auditor', 'AuditorPassword123!', 'compliance_auditor')}
                className={`p-2 rounded text-xs font-mono border transition ${
                  username === 'auditor'
                    ? 'border-cyan-500 bg-cyan-950/60 text-cyan-300'
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800'
                }`}
              >
                Auditor
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="p-2.5 rounded bg-rose-950/50 border border-rose-500/50 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Username</label>
            <div className="relative">
              <User className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-slate-400 mb-1">Email</label>
              <div className="relative">
                <Mail className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-400 mb-1">Password</label>
            <div className="relative">
              <Lock className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-slate-400 mb-1">Assigned Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 outline-none focus:border-cyan-500"
              >
                <option value="security_analyst">Security Analyst (Threat Simulation & Triage)</option>
                <option value="compliance_auditor">Compliance Auditor (Readiness & Evidence Vault)</option>
                <option value="admin">System Administrator (Full Control)</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 mt-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition shadow-lg shadow-cyan-950/60"
          >
            {loading ? 'Authenticating...' : isRegister ? 'Create Account' : 'Authenticate & Sign In'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-800 text-[11px] text-slate-400">
          {isRegister ? (
            <span>
              Already have an account?{' '}
              <button
                onClick={() => setIsRegister(false)}
                className="text-cyan-400 hover:underline"
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Need a new auditor or analyst role?{' '}
              <button
                onClick={() => setIsRegister(true)}
                className="text-cyan-400 hover:underline"
              >
                Register Here
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

