'use client'
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export const useTags = () => {
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [tagsLoading, setTagsLoading] = useState(false);

  useEffect(() => {
    const fetchTags = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('User not logged in, skipping tags fetch');
        setAvailableTags([]);
        return;
      }

      setTagsLoading(true);
      try {
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          console.error('Missing Supabase environment variables');
          setAvailableTags([]);
          return;
        }
        
        console.log('User logged in, fetching tags from database...');
        
        const { data, error } = await supabase
          .from('Tags')
          .select('name')
          .order('name', { ascending: true });

        console.log('Supabase response:', { data, error });

        if (error) {
          console.error('Error fetching initial tags:', error);
          console.error('Error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          setAvailableTags([]);
        } else if (data) {
          setAvailableTags(data.map(item => item.name));
        } else {
          console.warn('No tags data received, setting empty array');
          setAvailableTags([]);
        }
      } catch (err) {
        console.error('Unexpected error fetching initial tags:', err);
        console.error('Error type:', typeof err);
        console.error('Error stack:', err instanceof Error ? err.stack : 'No stack trace');
        setAvailableTags([]);
      } finally {
        setTagsLoading(false);
      }
    };

    fetchTags();
  }, []);

  const addNewTag = (newTag: string) => {
    if (!availableTags.includes(newTag)) {
      setAvailableTags(prev => [...prev, newTag].sort());
    }
  };

  return {
    availableTags,
    tagsLoading,
    addNewTag,
  };
}; 