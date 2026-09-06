import React, { useState } from 'react';
import { useLms } from '../../context/LmsContext';
import { User, Role } from '../../types';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Eye,
  ShieldCheck,
  Building2,
  Lock,
  X,
  Check,
} from 'lucide-react';

const ALL_ROLES: Role[] = [
  'Super Admin',
  'Client Admin',
  'LOB Admin',
  'Location Admin',
  'Trainer',
  'Team Leader',
  'Quality Analyst',
  'Agent',
];

export const UserManagementView: React.FC = () => {
  const {
    currentUser,
    allUsers,
    clients,
    startImpersonation,
    addNewUser,
    isImpersonating,
  } = useLms();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');

  // Modal create user state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserEmpId, setNewUserEmpId] = useState('');
  const [newUserRole, setNewUserRole] = useState<Role>('Agent');
  const [newUserClientId, setNewUserClientId] = useState(clients[0]?.id || 'client-abc');
  const [newUserLobId, setNewUserLobId] = useState('lob-int-voice');
  const [newUserLocationId, setNewUserLocationId] = useState('loc-gurgaon');

  const selectedClientObj = clients.find((c) => c.id === newUserClientId);

  const filteredUsers = allUsers.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (clientFilter !== 'all' && u.scope.clientId !== clientFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.employeeId.toLowerCase().includes(q) ||
        u.scope.lobName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim() || !newUserEmpId.trim()) return;

    addNewUser({
      name: newUserName,
      email: newUserEmail,
      employeeId: newUserEmpId,
      role: newUserRole,
      scope: {
        clientId: newUserClientId,
        clientName: selectedClientObj?.name || 'Client',
        lobId: newUserLobId,
        lobName: selectedClientObj?.lobs.find((l) => l.id === newUserLobId)?.name || 'LOB',
        locationId: newUserLocationId,
        locationName: selectedClientObj?.locations.find((loc) => loc.id === newUserLocationId)?.name || 'Location',
      },
      status: 'Active',
    });

    setShowCreateModal(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserEmpId('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
            User Directory & Access Control (Section 11, 12, 13)
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Enterprise RBAC: Super Admin, Client Admin, LOB Admin, Trainer, QA, TL, and Frontline Agents
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-xs font-semibold rounded hover:opacity-90 transition-opacity inline-flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-neutral-900 shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Provision New User</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded">
          <Search className="w-4 h-4 text-neutral-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, employee ID, or email..."
            className="w-full bg-transparent focus:outline-none text-neutral-900 dark:text-neutral-100"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded font-medium"
          >
            <option value="all">All Roles</option>
            {ALL_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded font-medium"
          >
            <option value="all">All Clients</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/60 text-neutral-500 font-medium">
                <th className="py-3 px-4">User Details</th>
                <th className="py-3 px-4">Employee ID</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Assigned Scope (Client &gt; LOB)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filteredUsers.map((u) => {
                const isSelf = u.id === currentUser.id;

                return (
                  <tr key={u.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {u.name} {isSelf && '(You)'}
                      </div>
                      <div className="text-neutral-500 font-mono text-[11px]">{u.email}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-neutral-700 dark:text-neutral-300">
                      {u.employeeId}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400 font-medium">
                      <div>{u.scope.clientName}</div>
                      <div className="text-[11px] text-neutral-400">
                        {u.scope.lobName} • {u.scope.locationName}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 font-semibold text-[11px] text-neutral-900 dark:text-neutral-100">
                        <Check className="w-3 h-3" /> {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {u.role === 'Agent' && !isSelf && (
                        <button
                          onClick={() => startImpersonation(u)}
                          className="px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-750 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 font-semibold rounded text-[11px] inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View as Agent (Sec 16)</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision User Modal */}
      {showCreateModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="w-full max-w-lg bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg shadow-2xl p-6 space-y-4 my-6 text-xs">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-700 pb-3">
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Provision New User (Section 11)
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="space-y-4">
              <div>
                <label className="font-semibold block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g., Jane Doe"
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="user@enterprise.com"
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Employee ID *</label>
                  <input
                    type="text"
                    required
                    value={newUserEmpId}
                    onChange={(e) => setNewUserEmpId(e.target.value)}
                    placeholder="EMP-90210"
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Role Assignment (Section 12)</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as Role)}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded font-medium"
                >
                  {ALL_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded border border-neutral-200 dark:border-neutral-700 space-y-3">
                <span className="font-bold uppercase text-[10px] text-neutral-500">
                  Partition Scope (Section 8)
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] text-neutral-500 block">Client</label>
                    <select
                      value={newUserClientId}
                      onChange={(e) => {
                        setNewUserClientId(e.target.value);
                        const c = clients.find((item) => item.id === e.target.value);
                        if (c) {
                          setNewUserLobId(c.lobs[0]?.id || '');
                          setNewUserLocationId(c.locations[0]?.id || '');
                        }
                      }}
                      className="w-full px-2 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded text-xs"
                    >
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.code}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-neutral-500 block">LOB</label>
                    <select
                      value={newUserLobId}
                      onChange={(e) => setNewUserLobId(e.target.value)}
                      className="w-full px-2 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded text-xs"
                    >
                      {selectedClientObj?.lobs.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-neutral-500 block">Location</label>
                    <select
                      value={newUserLocationId}
                      onChange={(e) => setNewUserLocationId(e.target.value)}
                      className="w-full px-2 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded text-xs"
                    >
                      {selectedClientObj?.locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-700">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-semibold rounded hover:opacity-90"
                >
                  Confirm & Provision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
