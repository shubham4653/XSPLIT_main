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
        <Loader2 className="w-8 h-8 animate-spin text-accent-pink" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-md mx-auto space-y-6">
        <header className="flex justify-between items-center bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
          <div>
            <h1 className="text-2xl font-bold text-white">Your Groups</h1>
            <p className="text-gray-400 text-sm">Manage your split expenses</p>
          </div>
          <Link href="/groups/new" className="p-2 bg-gradient-to-r from-accent-pink to-accent-purple rounded-xl shadow-[0_4px_15px_rgba(255,107,157,0.3)] hover:scale-105 transition-transform">
            <PlusCircle className="w-6 h-6 text-white" />
          </Link>
        </header>

        <div className="space-y-4">
          {groups.length === 0 ? (
            <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10 border-dashed flex flex-col items-center">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <PlusCircle className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">No Groups Yet</h3>
              <p className="text-gray-400 mb-6 text-center max-w-xs">
                Create a group to start splitting expenses with friends, family, or roommates.
              </p>
              <Link href="/groups/new" className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-xl transition-colors">
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
