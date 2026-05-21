import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const BACKEND = process.env.BACKEND_URL || 'http://localhost:5000';

async function proxyRequest(req: NextRequest, path: string) {
  const session = await getServerSession(authOptions);
  const token = (session?.user as any)?.accessToken;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const url = `${BACKEND}${path}${req.nextUrl.search}`;
  const body = req.method !== 'GET' && req.method !== 'HEAD' ? await req.text() : undefined;

  try {
    const res = await fetch(url, { method: req.method, headers, body, cache: 'no-store' });
    const data = await res.text();
    return new NextResponse(data, {
      status: res.status,
      headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' },
    });
  } catch (e) {
    return NextResponse.json({ message: 'Backend unavailable' }, { status: 503 });
  }
}

// Dynamic API proxy - catches all /api/* routes (except /api/auth)
export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  const path = '/api/' + params.path.join('/');
  return proxyRequest(req, path);
}

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  const path = '/api/' + params.path.join('/');
  return proxyRequest(req, path);
}

export async function PUT(req: NextRequest, { params }: { params: { path: string[] } }) {
  const path = '/api/' + params.path.join('/');
  return proxyRequest(req, path);
}

export async function DELETE(req: NextRequest, { params }: { params: { path: string[] } }) {
  const path = '/api/' + params.path.join('/');
  return proxyRequest(req, path);
}
