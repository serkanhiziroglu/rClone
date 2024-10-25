'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

interface Rule {
  id: string;
  title: string;
  description?: string;
}

export default function CommunityRules({ communityId }: { communityId: string }) {
  const [rules, setRules] = useState<Rule[]>([]);

  useEffect(() => {
    async function fetchRules() {
      const { data, error } = await supabase
        .from('community_rules')
        .select('*')
        .eq('community_id', communityId)
        .order('order_number');

      if (!error && data) {
        setRules(data);
      }
    }

    fetchRules();
  }, [communityId]);

  if (rules.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Community Rules</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="space-y-4 list-decimal list-inside">
          {rules.map((rule) => (
            <li key={rule.id}>
              <span className="font-medium">{rule.title}</span>
              {rule.description && (
                <p className="mt-1 text-sm text-gray-600 ml-5">
                  {rule.description}
                </p>
              )}
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}