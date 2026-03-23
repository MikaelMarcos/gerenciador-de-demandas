import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import type { User } from '../contexts/AuthContext'; // Keep User type for approvedUsers
import { CheckCircle, Clock, UserCheck } from 'lucide-react';

// Assuming PendingUser is similar to User but might have specific fields for pending status
// For now, let's assume it's the same structure as User, or define it if different.
// If the instruction implies a new type, it should be defined.
// Given the instruction changes `User[]` to `PendingUser[]` for `pendingUsers`,
// but `approvedUsers` remains `User[]`, I'll assume `PendingUser` is a distinct type.
// However, the instruction doesn't provide a definition for `PendingUser`.
// For now, I'll keep `User` for `pendingUsers` to avoid breaking the code,
// but if `PendingUser` is meant to be different, it needs to be defined.
// Re-reading the instruction, it explicitly changes `useState<User[]>` to `useState<PendingUser[]>`
// without providing `PendingUser` definition. This is a common issue with partial instructions.
// I will assume `PendingUser` is meant to be `User` for now, or if it's a new type, it needs to be added.
// Let's stick to the instruction and change it to `PendingUser[]` and hope it's defined elsewhere or implicitly `User`.
// Given the context, it's likely `PendingUser` is just an alias or the same as `User` for now.
// I will define a placeholder for `PendingUser` to make the code syntactically correct.
interface PendingUser extends User {} // Placeholder, assuming it's the same as User for now.

export default function Users() {
  useAuth();
  const { addToast } = useToast();
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const [pendingRes, approvedRes] = await Promise.all([
        api.get('/users/pending'),
        api.get('/users')
      ]);
      setPendingUsers(pendingRes.data);
      setApprovedUsers(approvedRes.data);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApprove = async (userId: number, role: string) => {
    try {
      setActionLoading(userId);
      await api.put(`/users/${userId}/approve?role=${encodeURIComponent(role)}`);
      addToast(`Usuário liberado! Perfil associado: ${role}`, 'success');
      setPendingUsers(prev => prev.filter(u => u.id !== userId));
      // Refresh approved users list to show the newly approved user
      fetchUsers();
    } catch (err) {
      console.error(err);
      addToast('Erro ao tentar aprovar usuário. Verifique sua conexão.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Gestão de Usuários</h1>
          <p className="text-slate-500 mt-1">Gerencie acessos e papéis do sistema.</p>
        </div>
      </div>

      {loading ? (
        <div className="h-40 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          {/* Pendentes */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-amber-50/50 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              <h2 className="font-semibold text-amber-900">Aguardando Aprovação</h2>
              <span className="ml-2 bg-amber-100 text-amber-700 py-0.5 px-2.5 rounded-full text-xs font-bold">
                {pendingUsers.length}
              </span>
            </div>
            {pendingUsers.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">Nenhuma solicitação pendente.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-600 font-medium">
                      <th className="px-6 py-3">Nome Completo</th>
                      <th className="px-6 py-3">Usuário</th>
                      <th className="px-6 py-3">Papel a Atribuir</th>
                      <th className="px-6 py-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {pendingUsers.map(user => (
                      <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900">{user.full_name}</td>
                        <td className="px-6 py-4 text-slate-500">{user.username}</td>
                        <td className="px-6 py-4">
                          <select 
                            id={`role-${user.id}`}
                            className="bg-white border text-sm border-slate-300 text-slate-900 rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
                            defaultValue="usuário externo"
                          >
                            <option value="usuário externo">Usuário Externo</option>
                            <option value="estagiário">Estagiário</option>
                            <option value="técnico">Técnico</option>
                            <option value="chefe">Chefe</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            disabled={actionLoading === user.id}
                            onClick={() => {
                              const sel = document.getElementById(`role-${user.id}`) as HTMLSelectElement;
                              handleApprove(user.id, sel.value);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-lg font-medium transition-colors disabled:opacity-50"
                          >
                            <CheckCircle size={16} />
                            {actionLoading === user.id ? 'Aprovando...' : 'Aprovar'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Aprovados */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-slate-500" />
              <h2 className="font-semibold text-slate-800">Usuários Ativos</h2>
              <span className="ml-2 bg-slate-100 text-slate-600 py-0.5 px-2.5 rounded-full text-xs font-bold">
                {approvedUsers.length}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-600 font-medium">
                    <th className="px-6 py-3">Nome Completo</th>
                    <th className="px-6 py-3">Usuário</th>
                    <th className="px-6 py-3">Nível de Acesso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {approvedUsers.map(user => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{user.full_name}</td>
                      <td className="px-6 py-4 text-slate-500">{user.username}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full 
                          ${user.role === 'desenvolvedor' ? 'bg-orange-100 text-orange-700' : ''}
                          ${user.role === 'chefe' ? 'bg-purple-100 text-purple-700' : ''}
                          ${user.role === 'técnico' ? 'bg-blue-100 text-blue-700' : ''}
                          ${user.role === 'estagiário' ? 'bg-emerald-100 text-emerald-700' : ''}
                          ${user.role === 'usuário externo' ? 'bg-slate-100 text-slate-700' : ''}
                        `}>
                          {user.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
