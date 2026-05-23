import Link from 'next/link';
import { motion } from 'framer-motion';
import { Users, ChevronRight } from 'lucide-react';

export default function GroupCard({ group }) {
  const { _id, name, icon, memberCount, userOwes, owesUser } = group;

  const safeOwesUser = Number(owesUser) || 0;
  const safeUserOwes = Number(userOwes) || 0;
  const netBalance = safeOwesUser - safeUserOwes;
  const isPositive = netBalance > 0;
  const isNegative = netBalance < 0;

  return (
    <Link href={`/groups/${_id}`}>
      <motion.div
        whileHover={{ scale: 1.01, y: -2, transition: { duration: 0.2 } }}
        whileTap={{ scale: 0.98 }}
        className="p-5 flex items-center justify-between mb-4 rounded-2xl border shadow-soft transition-all"
        style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
      >
        <div className="flex items-center space-x-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
            style={{ backgroundColor: group.color ? `${group.color}33` : 'var(--card-border)' }}
          >
            {icon || '🗂️'}
          </div>
          <div>
            <h3 className="font-bold font-serif text-lg tracking-tight" style={{ color: 'var(--foreground)' }}>
              {name}
            </h3>
            <div
              className="flex items-center text-[11px] uppercase tracking-wide font-medium space-x-1 mt-0.5"
              style={{ color: 'var(--muted)' }}
            >
              <Users className="w-3 h-3" />
              <span>{memberCount} members</span>
            </div>
          </div>
        </div>

        <div className="text-right flex items-center space-x-3">
          <div>
            {netBalance === 0 ? (
              <span className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Settled up</span>
            ) : (
              <div className="flex flex-col">
                <span className={`text-[10px] uppercase tracking-wider font-semibold ${isPositive ? 'text-mint-400' : 'text-coral-400'}`}>
                  {isPositive ? 'Owes you' : 'You owe'}
                </span>
                <span className={`font-light font-mono text-xl tracking-tight ${isPositive ? 'text-mint-400' : 'text-coral-400'}`}>
                  ₹{Math.abs(netBalance).toFixed(2)}
                </span>
              </div>
            )}
          </div>
          <ChevronRight className="w-5 h-5" style={{ color: 'var(--muted)' }} />
        </div>
      </motion.div>
    </Link>
  );
}
