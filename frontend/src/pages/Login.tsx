import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { User } from '../contexts/AuthContext';
import { Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import api from '../api';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isRequesting, setIsRequesting] = useState(false);
  
  // Login form
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [keepConnected, setKeepConnected] = useState(false);
  
  // Request access form
  const [fullName, setFullName] = useState('');
  
  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await api.post('/auth/login', { username, password });
      login(response.data as User, keepConnected);
      navigate('/');
    } catch (err: any) {
      if (err.response) {
        // Backend retornou um código de erro (401, 404, etc)
        setError(err.response?.data?.detail || 'Credenciais inválidas ou erro no servidor.');
      } else if (err.request) {
        // Sem resposta do servidor
        setError('Servidor indisponível. O Backend está desligado ou offline.');
      } else {
        // Outro erro de configuração
        setError('Erro de conexão ao tentar fazer o login.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      await api.post('/auth/request-access', {
        full_name: fullName,
        username,
        password
      });
      setSuccess('Acesso solicitado! Espere um chefe liberar seu login.');
      // Reset after 3s
      setTimeout(() => {
        setIsRequesting(false);
        setSuccess('');
        setUsername('');
        setPassword('');
      }, 5000);
    } catch (err: any) {
      if (err.response) {
        setError(err.response?.data?.detail || 'Erro ao solicitar acesso.');
      } else if (err.request) {
        setError('Servidor indisponível no momento.');
      } else {
        setError('Ocorreu um erro na requisição.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-800 to-black font-sans inset-0 z-50 fixed">
      <div className="w-full max-w-md p-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600"></div>
        
        <div className="text-center mb-8 pt-4">
          <h1 className="text-4xl font-bold text-white tracking-widest bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-400 mb-2">NUIAM</h1>
          <p className="text-slate-300 text-sm font-medium tracking-wide">
            {isRequesting ? 'Solicitação de Acesso' : 'Gestão Operacional e Telemetria'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 text-red-100 rounded-lg text-sm text-center animate-pulse">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 text-green-100 rounded-lg text-sm text-center">
            {success}
          </div>
        )}

        {isRequesting ? (
          <form onSubmit={handleRequestAccess} className="space-y-5 transition-all">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1.5" htmlFor="fullname">Nome Completo</label>
              <input 
                id="fullname"
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                placeholder="Ex. João Batista"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1.5" htmlFor="req-username">Usuário</label>
              <input 
                id="req-username"
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                placeholder="Ex. jbatista"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1.5" htmlFor="req-password">Senha</label>
              <div className="relative">
                <input 
                  id="req-password"
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors pr-10"
                  placeholder="Defina uma senha"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white py-3.5 rounded-lg font-semibold tracking-wide shadow-lg shadow-primary-900/50 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Processando...' : <><UserPlus size={20} /> Solicitar Liberação</>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1.5" htmlFor="username">Usuário</label>
              <input 
                id="username"
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                placeholder="Digite seu usuário"
                required
              />
            </div>
            
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1.5" htmlFor="password">Senha</label>
              <div className="relative">
                <input 
                  id="password"
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors pr-10"
                  placeholder="••••••••"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input 
                id="keep-connected"
                type="checkbox"
                checked={keepConnected}
                onChange={(e) => setKeepConnected(e.target.checked)}
                className="w-4 h-4 rounded border-slate-600 text-primary-600 focus:ring-primary-500 focus:ring-offset-slate-900 bg-slate-900/50 cursor-pointer"
              />
              <label htmlFor="keep-connected" className="ml-2 text-sm text-slate-300 cursor-pointer select-none">
                Manter conectado
              </label>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white py-3.5 rounded-lg font-semibold tracking-wide shadow-lg shadow-primary-900/50 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Acessando...' : <><LogIn size={20} /> Entrar</>}
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <button 
            type="button"
            onClick={() => {
              setIsRequesting(!isRequesting);
              setError('');
              setSuccess('');
              setUsername('');
              setPassword('');
            }}
            className="text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors"
          >
            {isRequesting ? 'Já tem uma conta? Fazer login' : 'Não tem conta? Solicitar login'}
          </button>
        </div>
      </div>
    </div>
  );
}
