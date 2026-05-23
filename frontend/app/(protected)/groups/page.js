"use client";

import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import GroupCard from '@/components/group/GroupCard';
import { Loader2, PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const data = await fetchApi('/groups');
        setGroups(data);
      } catch (error) {
        console.error("Failed to fetch groups", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-blush-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 pb-24">
      <div className="max-w-md mx-auto space-y-6">

        {/* Header */}
        <header
          className="flex justify-between items-center p-4 rounded-2xl border shadow-soft"
          style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
        >
          <div>
            <h1 className="text-2xl font-bold font-serif" style={{ color: 'var(--foreground)' }}>
              Your Groups
            </h1>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              Manage your split expenses
            </p>
          </div>
          <Link
            href="/groups/new"
            className="p-2 bg-gradient-to-r from-blush-300 to-blush-400 rounded-xl shadow-blush hover:scale-105 transition-transform"
          >
            <PlusCircle className="w-6 h-6 text-white" />
          </Link>
        </header>

        <div className="space-y-4">
          {groups.length === 0 ? (
            <div
              className="text-center py-12 rounded-2xl border border-dashed flex flex-col items-center"
              style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ background: 'var(--card-border)' }}
              >
                <PlusCircle className="w-8 h-8" style={{ color: 'var(--muted)' }} />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--foreground)' }}>
                No Groups Yet
              </h3>
              <p className="mb-6 text-center max-w-xs" style={{ color: 'var(--muted)' }}>
                Create a group to start splitting expenses with friends, family, or roommates.
              </p>
              <Link
                href="/groups/new"
                className="bg-blush-400 hover:bg-blush-300 text-white px-6 py-2 rounded-xl transition-colors font-medium"
              >
                Create First Group
              </Link>
            </div>
          ) : (
            groups.map(group => (
              <GroupCard key={group._id} group={group} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
