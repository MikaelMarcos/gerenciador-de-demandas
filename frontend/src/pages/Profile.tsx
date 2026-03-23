import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import { useToast } from '../contexts/ToastContext';
import { Lock, User as UserIcon, ShieldCheck } from 'lucide-react';
import { availableIcons, getIconComponent } from '../utils/icons';

export default function Profile() {
  const { user, login } = useAuth();
  const { addToast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [iconLoading, setIconLoading] = useState(false);

  // Derive initial icon from user
  const CurrentUserIcon = getIconComponent(user?.icon);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('As novas senhas não coincidem.');
      return;
    }

    if (newPassword.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      await api.put(`/users/${user?.id}/password`, {
        current_password: currentPassword,
        new_password: newPassword
      });
      addToast('Sua senha foi atualizada com sucesso!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Não foi possível alterar a sua senha. Verifique se a senha atual está correta.';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Meu Perfil</h1>
          <p className="text-slate-500 mt-1">Gerencie suas informações pessoais e segurança.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden col-span-1">
          <div className="h-24 bg-gradient-to-r from-primary-600 to-primary-800"></div>
          <div className="px-6 pb-6 relative">
            <div className="w-20 h-20 rounded-full bg-white border-4 border-white flex items-center justify-center text-primary-600 shadow-sm absolute -top-10">
              <CurrentUserIcon size={40} />
            </div>
            <div className="mt-12 space-y-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800">{user?.full_name}</h3>
                <p className="text-slate-500 text-sm">@{user?.username}</p>
              </div>
              
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-3 text-slate-600">
                   <UserIcon size={18} className="text-slate-400" />
                   <span className="text-sm font-medium">{user?.role}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                   <ShieldCheck size={18} className={user?.is_approved ? "text-green-500" : "text-amber-500"} />
                   <span className="text-sm font-medium">{user?.is_approved ? 'Acesso Liberado' : 'Aguardando Aprovação'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden col-span-1 md:col-span-2">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <Lock className="w-5 h-5 text-slate-500" />
            <h2 className="font-semibold text-slate-800">Segurança da Conta</h2>
          </div>
          
          <div className="p-6">
            <h3 className="font-medium text-slate-700 mb-4">Alterar Senha</h3>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4 max-w-sm">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Senha Atual</label>
                <input 
                  type="password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nova Senha</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar Nova Senha</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="pt-2"
              >
                <span className="inline-flex justify-center items-center py-2.5 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-colors">
                  {loading ? 'Salvando...' : 'Atualizar Senha'}
                </span>
              </button>
            </form>
          </div>
        </div>

        {/* Change Icon Grid */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden col-span-1 md:col-span-3">
           <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-slate-500" />
            <h2 className="font-semibold text-slate-800">Avatar Divertido</h2>
          </div>
          
          <div className="p-6">
            <p className="text-slate-500 text-sm mb-4">Escolha um ícone para te representar pelo sistema:</p>
            <div className={`grid grid-cols-4 sm:grid-cols-6 md:grid-cols-10 gap-4 ${iconLoading ? 'opacity-50 pointer-events-none' : ''}`}>
               {availableIcons.map(iconObj => {
                 const isSelected = user?.icon === iconObj.name;
                 const IconNode = iconObj.component;
                 return (
                   <button 
                     key={iconObj.name}
                     onClick={async () => {
                        if (!user || user.icon === iconObj.name) return;
                        setIconLoading(true);
                        try {
                           const updatedUser = { ...user, icon: iconObj.name };
                           await api.put(`/users/${user.id}/icon`, { icon: iconObj.name });
                           addToast(`Avatar atualizado para ${iconObj.name}!`, 'success');
                           
                           const isPersistent = !!localStorage.getItem('nuiam_user');
                           login(updatedUser, isPersistent);
                        } catch (e) {
                           addToast('Erro ao atualizar avatar.', 'error');
                        } finally {
                           setIconLoading(false);
                        }
                     }}
                     className={`aspect-square rounded-xl flex items-center justify-center transition-all ${
                       isSelected 
                       ? 'bg-primary-600 text-white shadow-md scale-110' 
                       : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-primary-50 hover:text-primary-600 hover:scale-105'
                     }`}
                     title={iconObj.name}
                   >
                     <IconNode size={28} />
                   </button>
                 );
               })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
