"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Loader2, Save, Trash2, LogOut, User as UserIcon } from 'lucide-react';
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

  const [formData, setFormData] = useState({
    name: '',
    color: '#FF6B9D'
  });

  const fetchGroup = async () => {
    try {
      const res = await fetchApi(`/groups/${groupId}`);
      setGroup(res);
      setFormData({ name: res.name, color: res.color || '#FF6B9D' });
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

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetchApi(`/groups/${groupId}`, {
        method: 'PUT',
        body: JSON.stringify(formData)
      });
      alert('Group updated successfully!');
      router.push(`/groups/${groupId}`);
    } catch (err) {
      alert(err.message || 'Failed to update group');
    } finally {
      setSaving(false);
    }
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
    if (!confirm('Are you absolutely sure you want to delete this group? This action cannot be undone and will delete all expenses.')) return;
    setProcessingDanger(true);
    try {
      await fetchApi(`/groups/${groupId}`, { method: 'DELETE' });
      router.push('/dashboard');
    } catch (err) {
      alert(err.message || 'Failed to delete group');
      setProcessingDanger(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <header className="px-4 py-4 sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-white/10">
          <button onClick={() => router.back()} className="p-2 bg-white/5 rounded-full text-white">
            <ChevronLeft className="w-5 h-5" />
          </button>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-pink"></div>
        </div>
      </div>
    );
  }

  const isOwner = group.owner?._id === user?._id || group.owner === user?._id;

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      <header className="px-4 py-4 sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-stone-200">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <button onClick={() => router.back()} className="p-2 bg-stone-100 rounded-full border border-stone-200 text-stone-600 shrink-0 shadow-sm transition hover:scale-105">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center flex-1">
            <h1 className="text-lg font-bold font-serif text-stone-900">Group Settings</h1>
          </div>
          <div className="w-9" /> {/* Spacer */}
        </div>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full p-4 space-y-6">
        {/* Basic Info */}
        <section className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-bold font-serif text-stone-900 mb-4">Edit Details</h2>
          
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Group Name</label>
            <input 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-elegant"
            />
          </div>

          <button 
            onClick={handleUpdateName}
            disabled={saving || name === group.name}
            className="w-full btn-elegant text-stone-900 mt-2"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin mx-auto text-stone-400" /> : (
              <span className="flex items-center justify-center space-x-2 text-stone-900">
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </span>
            )}
          </button>
        </section>

        {/* Members List */}
        <section className="glass-card p-6">
          <h2 className="text-lg font-bold font-serif text-stone-900 mb-4 flex items-center justify-between">
            <span>Members</span>
            <span className="text-sm font-normal text-stone-500">{group.members.length}</span>
          </h2>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {group.members.map(member => (
              <div key={member._id} className="flex items-center justify-between p-3 bg-white rounded-2xl border border-stone-200 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-sky-200 rounded-full flex items-center justify-center text-sky-400">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-stone-900">
                      {member.name} {member._id === user?._id && "(You)"}
                    </p>
                    <p className="text-xs text-stone-500">{member.email}</p>
                  </div>
                </div>
                {member._id === group.owner._id && (
                  <span className="text-xs bg-blush-200 text-stone-900 px-2 py-1 rounded-full font-medium">Owner</span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Danger Zone */}
        <section className="glass-card p-6 border border-coral-200/50">
          <h2 className="text-lg font-bold font-serif text-coral-400 mb-4">Danger Zone</h2>
          
          {isOwner ? (
            <div className="space-y-2">
              <p className="text-sm text-stone-500 mb-4">As the owner, you can delete this group. This action cannot be undone and all expenses will be lost.</p>
              <button 
                onClick={handleDeleteGroup}
                className="w-full relative overflow-hidden rounded-full border-[0.5px] border-coral-300 bg-coral-200/50 px-6 py-3 font-medium text-coral-400 transition-all duration-300 hover:bg-coral-200 flex items-center justify-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Group</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-stone-500 mb-4">Leave this group. You will no longer be able to see its expenses.</p>
              <button 
                onClick={handleLeaveGroup}
                className="w-full relative overflow-hidden rounded-full border-[0.5px] border-coral-300 bg-coral-200/50 px-6 py-3 font-medium text-coral-400 transition-all duration-300 hover:bg-coral-200 flex items-center justify-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Leave Group</span>
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
