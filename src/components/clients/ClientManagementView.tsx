import React, { useState } from 'react';
import { useLms } from '../../context/LmsContext';
import { Client, LineOfBusiness, Location } from '../../types';
import {
  Building2,
  Layers,
  MapPin,
  Plus,
  Shield,
  CheckCircle2,
  FolderTree,
  ChevronRight,
  X,
} from 'lucide-react';

export const ClientManagementView: React.FC = () => {
  const { clients, addNewClient, logAuditEvent } = useLms();

  const [selectedClient, setSelectedClient] = useState<Client>(clients[0]);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientCode, setNewClientCode] = useState('');

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim() || !newClientCode.trim()) return;

    addNewClient({
      name: newClientName,
      code: newClientCode.toUpperCase(),
      lobs: [
        {
          id: `lob-${Date.now()}-1`,
          name: 'Customer Care & Support',
          description: 'Tier-1 and Tier-2 service queues',
          code: 'CARE',
        },
      ],
      locations: [
        {
          id: `loc-${Date.now()}-1`,
          name: 'HQ Operations Hub',
          city: 'Chicago',
          country: 'USA',
        },
      ],
    });

    logAuditEvent('CREATE_CLIENT', newClientName, `Added new client partition [${newClientCode}]`);
    setShowAddClientModal(false);
    setNewClientName('');
    setNewClientCode('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
            Client & Scope Partition Architecture (Section 8)
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Hierarchical structure: Client &gt; Line of Business (LOB) &gt; Location / Delivery Site
          </p>
        </div>

        <button
          onClick={() => setShowAddClientModal(true)}
          className="px-4 py-2 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-xs font-semibold rounded hover:opacity-90 transition-opacity inline-flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-neutral-900 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Enterprise Client</span>
        </button>
      </div>

      {/* Scope Isolation Guard Rails Explanation */}
      <div className="p-4 bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs space-y-1.5">
        <div className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          <span>Strict Scope Boundary Enforcement (Section 8)</span>
        </div>
        <p className="text-neutral-600 dark:text-neutral-400">
          • Users assigned to Client A can NEVER view updates, assessments, or documents assigned to Client B.
          <br />
          • LOB partitioning ensures Voice queues and Chat queues maintain isolated operational content.
          <br />
          • Admins inherit visibility according to their administrative tier (Client Admin vs. LOB Admin vs. Super Admin).
        </p>
      </div>

      {/* Client List & Hierarchy Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client Selector List (1 col) */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
            Tenants ({clients.length})
          </h3>

          <div className="space-y-2">
            {clients.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedClient(c)}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedClient.id === c.id
                    ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-100 dark:bg-neutral-800/80 shadow-xs'
                    : 'border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-850'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-neutral-900 dark:text-neutral-100">
                    {c.code}
                  </span>
                  <span className="text-[11px] text-neutral-500 font-mono">
                    {c.lobs.length} LOBs • {c.locations.length} Sites
                  </span>
                </div>
                <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mt-1">
                  {c.name}
                </h4>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Client Detailed Scope Tree (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <div>
                <span className="font-mono text-[10px] text-neutral-400 font-bold uppercase">
                  Active Hierarchy Partition
                </span>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  {selectedClient.name} ({selectedClient.code})
                </h3>
              </div>
            </div>

            {/* Lines of Business (LOBs) */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>Lines of Business ({selectedClient.lobs.length})</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedClient.lobs.map((lob) => (
                  <div
                    key={lob.id}
                    className="p-3.5 bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700 rounded space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between font-mono font-bold text-neutral-900 dark:text-neutral-100">
                      <span>{lob.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700">
                        {lob.code}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500">{lob.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Locations */}
            <div className="space-y-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
              <h4 className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>Delivery Locations & Facilities ({selectedClient.locations.length})</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {selectedClient.locations.map((loc) => (
                  <div
                    key={loc.id}
                    className="p-3 bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700 rounded space-y-1 text-xs"
                  >
                    <span className="font-bold text-neutral-900 dark:text-neutral-100 block">
                      {loc.name}
                    </span>
                    <span className="text-[11px] text-neutral-500 font-mono">
                      {loc.city}, {loc.country}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Client Modal */}
      {showAddClientModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg shadow-2xl p-6 space-y-4 my-6 text-xs">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-700 pb-3">
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Add New Enterprise Client (Section 8)
              </h3>
              <button
                onClick={() => setShowAddClientModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-4">
              <div>
                <label className="font-semibold block mb-1">Client Official Name *</label>
                <input
                  type="text"
                  required
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="e.g., Apex Global Financial Services"
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Client Code (Short Prefix) *</label>
                <input
                  type="text"
                  required
                  value={newClientCode}
                  onChange={(e) => setNewClientCode(e.target.value)}
                  placeholder="e.g., APEX"
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded font-mono uppercase"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-700">
                <button
                  type="button"
                  onClick={() => setShowAddClientModal(false)}
                  className="px-3 py-1.5 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-semibold rounded hover:opacity-90"
                >
                  Create Client Partition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
