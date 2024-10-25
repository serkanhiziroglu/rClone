import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Save, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Rule {
  id: string;
  title: string;
  description?: string;
}

export default function CommunityRules({ communityId }: { communityId: string }) {
  const [rules, setRules] = useState<Rule[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [editedRules, setEditedRules] = useState<Rule[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    async function fetchRules() {
      const { data, error } = await supabase
        .from('community_rules')
        .select('*')
        .eq('community_id', communityId);

      if (!error && data) {
        setRules(data);
        setEditedRules(data);
      }
    }

    async function checkAdminStatus() {
      if (!user) return;

      const { data } = await supabase
        .from('community_members')
        .select('role')
        .eq('community_id', communityId)
        .eq('user_id', user.id)
        .single();

      setIsAdmin(data?.role === 'admin');
    }

    fetchRules();
    checkAdminStatus();
  }, [communityId, user]);

  const handleEdit = (index: number, field: 'title' | 'description', value: string) => {
    const newRules = [...editedRules];
    newRules[index] = { ...newRules[index], [field]: value };
    setEditedRules(newRules);
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('community_rules')
        .upsert(
          editedRules.map(rule => ({
            id: rule.id,
            title: rule.title,
            description: rule.description,
            community_id: communityId
          }))
        );

      if (error) throw error;
      setRules(editedRules);
      setEditMode(false);
    } catch (error) {
      console.error('Error saving rules:', error);
    }
  };

  if (rules.length === 0) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg">Community Rules</CardTitle>
        {isAdmin && !editMode && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditMode(true)}
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <ol className="space-y-4 list-decimal list-inside">
          {(editMode ? editedRules : rules).map((rule, index) => (
            <li key={rule.id}>
              {editMode ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={rule.title}
                    onChange={(e) => handleEdit(index, 'title', e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                  <textarea
                    value={rule.description || ''}
                    onChange={(e) => handleEdit(index, 'description', e.target.value)}
                    className="w-full p-2 border rounded"
                    rows={2}
                  />
                </div>
              ) : (
                <>
                  <span className="font-medium">{rule.title}</span>
                  {rule.description && (
                    <p className="mt-1 text-sm text-gray-600 ml-5">
                      {rule.description}
                    </p>
                  )}
                </>
              )}
            </li>
          ))}
        </ol>
        {editMode && (
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setEditedRules(rules);
                setEditMode(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}