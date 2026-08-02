import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

export type PlanType = 'free' | 'pro' | 'full';
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled';

export interface SubscriptionData {
  planType: PlanType;
  status: SubscriptionStatus;
  trialEnd: string | null;
  isLoading: boolean;
}

export function useSubscription(): SubscriptionData {
  const { user } = useAuthStore();
  const [data, setData] = useState<Omit<SubscriptionData, 'isLoading'>>({
    planType: 'free',
    status: 'trialing',
    trialEnd: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('plan_type, subscription_status, trial_end')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (profile) {
          setData({
            planType: profile.plan_type as PlanType,
            status: profile.subscription_status as SubscriptionStatus,
            trialEnd: profile.trial_end,
          });
        }
      } catch (err) {
        console.error("Error fetching subscription:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();

    // Subscribe to realtime changes in case webhook updates it while user is online
    const channel = supabase
      .channel('public:profiles')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          setData({
            planType: payload.new.plan_type as PlanType,
            status: payload.new.subscription_status as SubscriptionStatus,
            trialEnd: payload.new.trial_end,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { ...data, isLoading };
}

// Helper to check access
export function checkAccess(
  module: 'signatures' | 'whatsapp',
  plan: PlanType,
  status: SubscriptionStatus,
  trialEnd: string | null
): boolean {
  // If trial is active (and not expired), allow access to everything
  if (status === 'trialing' && trialEnd && new Date(trialEnd) > new Date()) {
    return true;
  }

  // If status is not active (and trial expired), deny
  if (status !== 'active') {
    return false;
  }

  // Active subscriptions: check plan
  if (module === 'signatures') {
    return plan === 'pro' || plan === 'full';
  }
  if (module === 'whatsapp') {
    return plan === 'full';
  }

  return false;
}
