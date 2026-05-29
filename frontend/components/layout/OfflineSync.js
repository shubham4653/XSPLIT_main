"use client";

import { useEffect } from 'react';
import { fetchApi } from '@/lib/api';

export default function OfflineSync() {
  useEffect(() => {
    const handleOnline = async () => {
      console.log('App is back online. Checking for offline expenses to sync...');
      
      const offlineExpensesStr = localStorage.getItem('offline_expenses');
      if (!offlineExpensesStr) return;

      let offlineExpenses = [];
      try {
        offlineExpenses = JSON.parse(offlineExpensesStr);
      } catch (err) {
        console.error('Failed to parse offline expenses', err);
        return;
      }

      if (offlineExpenses.length === 0) return;

      console.log(`Found ${offlineExpenses.length} offline expenses. Syncing...`);
      let successCount = 0;
      
      for (const expense of offlineExpenses) {
        try {
          // Remove the temporary _id before sending to backend
          const { _id, ...payload } = expense;
          
          await fetchApi('/expenses', {
            method: 'POST',
            body: JSON.stringify(payload)
          });
          
          successCount++;
        } catch (err) {
          console.error('Failed to sync offline expense', err);
        }
      }

      // If all succeeded, clear the cache. For MVP, we clear it entirely.
      localStorage.removeItem('offline_expenses');
      
      if (successCount > 0) {
        alert(`Successfully synced ${successCount} offline expense(s)!`);
        // We could also force a page reload or state update here
        // window.location.reload();
      }
    };

    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return null;
}
