import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

interface Post {
  id: string;
  author: string;
  content: string;
  created_at: string;
}


export async function GET() {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { author, content } = body as { author: string; content: string }

    if (!author || !content) {
      return NextResponse.json({ error: 'Missing author or content' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('posts')
      .insert([{ author, content }])
      .select()
    console.log("Вставка:", data, error)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'No data returned after insert' }, { status: 500 })
    }

    const newPost: Post = data[0]
    return NextResponse.json(newPost, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
