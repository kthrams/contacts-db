import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { DEFAULT_USER_PREFERENCES } from '@/types';

export async function GET() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: preferences, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows found, which is ok for new users
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return defaults if no preferences found
  if (!preferences) {
    return NextResponse.json({
      user_id: user.id,
      ...DEFAULT_USER_PREFERENCES,
    });
  }

  return NextResponse.json(preferences);
}

export async function PUT(request: Request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  // Validate inputs
  const validColumns = ['full_name', 'company', 'tags', 'source'];
  const validDirections = ['asc', 'desc'];
  const validRowsPerPage = [50, 100, 1000, -1];

  if (body.sort_column && !validColumns.includes(body.sort_column)) {
    return NextResponse.json({ error: 'Invalid sort column' }, { status: 400 });
  }
  if (body.sort_direction && !validDirections.includes(body.sort_direction)) {
    return NextResponse.json({ error: 'Invalid sort direction' }, { status: 400 });
  }
  if (body.rows_per_page && !validRowsPerPage.includes(body.rows_per_page)) {
    return NextResponse.json({ error: 'Invalid rows per page' }, { status: 400 });
  }

  // Upsert preferences
  const { data: preferences, error } = await supabase
    .from('user_preferences')
    .upsert({
      user_id: user.id,
      ...body,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(preferences);
}
