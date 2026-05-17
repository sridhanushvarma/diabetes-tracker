import { createClient } from '@supabase/supabase-js';

// These environment variables will need to be set in a .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database schema types
export type User = {
  id: string;
  email: string;
  name?: string;
  created_at: string;
};

export type GlucoseRecord = {
  id: string;
  user_id: string;
  date: string;
  time_of_day: 'Breakfast' | 'Lunch' | 'Dinner';
  glucose_level: number;
  food_description: string;
  created_at: string;
};

// Helper functions for database operations
export async function getUserRecords(userId: string) {
  const { data, error } = await supabase
    .from('glucose_records')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
    
  if (error) {
    console.error('Error fetching records:', error);
    return [];
  }
  
  return data as GlucoseRecord[];
}

export async function addGlucoseRecord(record: Omit<GlucoseRecord, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('glucose_records')
    .insert([record])
    .select();
    
  if (error) {
    console.error('Error adding record:', error);
    return null;
  }
  
  return data?.[0] as GlucoseRecord;
}

export async function updateGlucoseRecord(
  id: string,
  updates: Partial<Omit<GlucoseRecord, 'id' | 'user_id' | 'created_at'>>
) {
  const { data, error } = await supabase
    .from('glucose_records')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error updating record:', error);
    return null;
  }

  return data?.[0] as GlucoseRecord;
}

export async function deleteGlucoseRecord(id: string) {
  const { error } = await supabase
    .from('glucose_records')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting record:', error);
    return false;
  }

  return true;
}

export async function getWeeklyAverage(userId: string) {
  // This would be a database function or a client-side calculation
  // For now, we'll implement it client-side in the stats utility
  const records = await getUserRecords(userId);
  return records;
}

export async function getMonthlyAverage(userId: string) {
  // This would be a database function or a client-side calculation
  // For now, we'll implement it client-side in the stats utility
  const records = await getUserRecords(userId);
  return records;
}
