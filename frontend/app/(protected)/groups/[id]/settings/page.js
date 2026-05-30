"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Loader2, Save, Trash2, LogOut, User as UserIcon, Plus, Copy, Check } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/components/layout/AuthProvider';

export default function GroupSettingsPage({ params }) {
  const unwrappedParams = use(params);
  const groupId = unwrappedParams.id;
  const router = useRouter();
  const { user } = useAuth();

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [processingDanger, setProcessingDanger] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#FF6B9D');
  const [collaborators, setCollaborators] = useState([]);
  const [addingUserId, setAddingUserId] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchGroup = async () => {
    try {
      const [res, collabRes] = await Promise.all([
        fetchApi(`/groups/${groupId}`),
        fetchApi('/groups/collaborators')
      ]);
      setGroup(res);
      setName(res.name || '');
      setColor(res.color || '#FF6B9D');
      
      // Filter out people already in this group
      const memberIds = res.members.map(m => m._id);
      const filteredCollabs = collabRes.filter(c => !memberIds.includes(c._id));
      setCollaborators(filteredCollabs);
      
    } catch (err) {
      console.error(err);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroup();
  }, [groupId]);

  const handleUpdateName = async () => {
    if (!name.trim() || name === group.name) return;
    setSaving(true);
    try {
      await fetchApi(`/groups/${groupId}`, {
        method: 'PUT',
        body: JSON.stringify({ name: name.trim(), color })
      });
      setGroup(prev => ({ ...prev, name: name.trim(), color }));
      alert('Group updated successfully!');
    } catch (err) {
      alert(err.message || 'Failed to update group');
    } finally {
      setSaving(false);
    }
  };

  const handleAddMember = async (userId) => {
    setAddingUserId(userId);
    try {
      await fetchApi(`/groups/${groupId}/members`, {
        method: 'POST',
        body: JSON.stringify({ userId })
      });
      // Refresh group data
      fetchGroup();
    } catch (err) {
      alert(err.message || 'Failed to add member');
    } finally {
      setAddingUserId(null);
    }
  };

  const handleCopyInvite = () => {
    const inviteUrl = `${window.location.origin}/invite/${groupId}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeaveGroup = async () => {
    if (!confirm('Are you sure you want to leave this group?')) return;
    setProcessingDanger(true);
    try {
      await fetchApi(`/groups/${groupId}/leave`, { method: 'POST' });
      router.push('/dashboard');
    } catch (err) {
      alert(err.message || 'Failed to leave group');
      setProcessingDanger(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!confirm('Are you absolutely sure you want to delete this group? This cannot be undone and will delete all expenses.')) return;
    setProcessingDanger(true);
    try {
      await fetchApi(`/groups/${groupId}`, { method: 'DELETE' });
      router.push('/dashboard');
    } catch (err) {
      alert(err.message || 'Failed to delete group');
      setProcessingDanger(false);
    }
  };

  if (loading || !group) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <header className="px-4 py-4 sticky top-0 z-40 backdrop-blur-md border-b" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
          <button onClick={() => router.back()} className="p-2 rounded-full border" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--foreground)' }}>
            <ChevronLeft className="w-5 h-5" />
          </button>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blush-400"></div>
        </div>
      </div>
    );
  }

  const isOwner = group.owner?._id === user?._id || group.owner === user?._id;

  return (
    <div className="min-h-screen bg-background flex flex-col relative">

      {/* Header */}
      <header
        className="px-4 py-4 sticky top-0 z-40 backdrop-blur-md border-b shadow-sm"
        style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
      >
        <div className="flex justify-between items-center max-w-2xl mx-auto">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full border shadow-sm transition hover:scale-105"
            style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--foreground)' }}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center flex-1">
            <h1 className="text-lg font-bold font-serif" style={{ color: 'var(--foreground)' }}>Group Settings</h1>
          </div>
          <div className="w-9" />
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full p-4 space-y-6 pb-24">

        {/* Edit Details */}
        <section className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-bold font-serif mb-4" style={{ color: 'var(--foreground)' }}>Edit Details</h2>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--muted)' }}>Group Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter group name"
              className="input-elegant"
              style={{ background: 'var(--card-bg)', color: 'var(--foreground)', borderColor: 'var(--card-border)' }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--muted)' }}>Group Color</label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer border-0 p-0.5"
              />
              <span className="text-sm font-mono" style={{ color: 'var(--muted)' }}>{color}</span>
            </div>
          </div>

          <button
            onClick={handleUpdateName}
            disabled={saving || (!name.trim() || name === group.name)}
            className="w-full btn-elegant mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              <span className="flex items-center justify-center space-x-2">
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </span>
            )}
          </button>
        </section>

        {/* Members List */}
        <section className="glass-card p-6">
          <h2 className="text-lg font-bold font-serif mb-4 flex items-center justify-between" style={{ color: 'var(--foreground)' }}>
            <span>Members</span>
            <span className="text-sm font-normal" style={{ color: 'var(--muted)' }}>{group.members.length}</span>
          </h2>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {group.members.map(member => (
              <div
                key={member._id}
                className="flex items-center justify-between p-3 rounded-2xl border shadow-sm"
                style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blush-200 rounded-full flex items-center justify-center font-bold text-stone-900">
                    {member.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--foreground)' }}>
                      {member.name} {member._id === user?._id && <span style={{ color: 'var(--muted)' }}>(You)</span>}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>{member.email}</p>
                  </div>
                </div>
                {(member._id === group.owner?._id || member._id === group.owner) && (
                  <span className="text-xs bg-blush-200 text-stone-900 px-2 py-1 rounded-full font-medium">Owner</span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Add Members (Past Collaborators & Invite Link) */}
        <section className="glass-card p-6">
          <h2 className="text-lg font-bold font-serif mb-4" style={{ color: 'var(--foreground)' }}>Add Members</h2>
          
          <div className="space-y-3 max-h-48 overflow-y-auto pr-2 mb-4">
            {collaborators.length > 0 ? (
              collaborators.map(collab => (
                <div key={collab._id} className="flex items-center justify-between p-2 rounded-xl border" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blush-200 rounded-full flex items-center justify-center font-bold text-stone-900 text-xs">
                      {collab.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>{collab.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddMember(collab._id)}
                    disabled={addingUserId === collab._id}
                    className="p-1.5 bg-blush-400 rounded-lg text-white hover:bg-blush-300 transition-colors disabled:opacity-50"
                  >
                    {addingUserId === collab._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  </button>
                </div>
              ))
            ) : (
              <p className="text-sm italic text-center py-2" style={{ color: 'var(--muted)' }}>No past friends to add.</p>
            )}
          </div>

          <div className="pt-4 border-t" style={{ borderColor: 'var(--card-border)' }}>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--muted)' }}>Invite via Link</label>
            <div className="flex space-x-2">
              <input
                readOnly
                value={`${typeof window !== 'undefined' ? window.location.origin : ''}/invite/${groupId}`}
                className="input-elegant flex-1 text-xs truncate"
                style={{ background: 'var(--card-bg)', color: 'var(--foreground)', borderColor: 'var(--card-border)' }}
              />
              <button
                onClick={handleCopyInvite}
                className="px-3 py-2 bg-stone-200 hover:bg-stone-300 rounded-xl transition-colors flex items-center justify-center text-stone-700"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="glass-card p-6 border border-coral-200/50">
          <h2 className="text-lg font-bold font-serif text-coral-400 mb-4">Danger Zone</h2>

          {isOwner ? (
            <div className="space-y-2">
              <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
                As the owner, you can delete this group. This action cannot be undone and all expenses will be lost.
              </p>
              <button
                onClick={handleDeleteGroup}
                disabled={processingDanger}
                className="w-full relative overflow-hidden rounded-full border border-coral-300 bg-coral-200/50 px-6 py-3 font-medium text-coral-400 transition-all duration-300 hover:bg-coral-200 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {processingDanger ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>Delete Group</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
                Leave this group. You will no longer be able to see its expenses.
              </p>
              <button
                onClick={handleLeaveGroup}
                disabled={processingDanger}
                className="w-full relative overflow-hidden rounded-full border border-coral-300 bg-coral-200/50 px-6 py-3 font-medium text-coral-400 transition-all duration-300 hover:bg-coral-200 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {processingDanger ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                <span>Leave Group</span>
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
