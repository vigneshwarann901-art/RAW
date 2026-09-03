import { supabase } from './supabase';

type RealtimeHandlers = {
  onChange?: () => void;
};

export function subscribeToRawRealtime(userId: string, handlers: RealtimeHandlers) {
  if (!supabase) return () => undefined;

  const channel = supabase.channel(`raw-live-${userId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'listings' }, () => handlers.onChange?.())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'requirements' }, () => handlers.onChange?.())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'offers' }, () => handlers.onChange?.())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => handlers.onChange?.())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, () => handlers.onChange?.())
    .subscribe();

  return () => {
    void supabase?.removeChannel(channel);
  };
}
