import { supabaseAdmin } from '@/lib/supabase-admin';
import { CreditCard } from 'lucide-react';

export default async function RecentTransactions({ gymId }: { gymId: string }) {
  const { data: transactions } = await supabaseAdmin
    .from('financial_transactions')
    .select('id, description, category, amount, type, transaction_date')
    .eq('gym_id', gymId)
    .order('transaction_date', { ascending: false })
    .limit(5);

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
        <CreditCard className="w-5 h-5 text-primary" />
        Recent Transactions
      </h2>
      <div className="space-y-4">
        {transactions && transactions.length > 0 ? (
          transactions.map((t) => (
            <div key={t.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium text-foreground">{t.description || t.category}</p>
                <p className="text-xs text-muted-foreground">{new Date(t.transaction_date).toLocaleDateString()}</p>
              </div>
              <span className={`font-bold ${t.type === 'revenue' ? 'text-green-500' : 'text-red-500'}`}>
                {t.type === 'revenue' ? '+' : '-'}${Number(t.amount).toLocaleString()}
              </span>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground italic">
            No transactions recorded yet. Add members to see revenue!
          </div>
        )}
      </div>
    </div>
  );
}
