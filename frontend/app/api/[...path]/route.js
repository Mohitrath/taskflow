import { NextResponse } from 'next/server';

const BACKEND = (process.env.BACKEND_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

async function proxy(request, { params }) {
  const path = params.path?.join('/') || '';
  const url = `${BACKEND}/${path}${new URL(request.url).search}`;

  try {
    const headers = new Headers();
    const contentType = request.headers.get('content-type');
    const authorization = request.headers.get('authorization');
    if (contentType) headers.set('content-type', contentType);
    if (authorization) headers.set('authorization', authorization);

    const body = ['GET', 'HEAD'].includes(request.method) ? undefined : await request.text();

    const response = await fetch(url, {
      method: request.method,
      headers,
      body,
      cache: 'no-store'
    });

    const text = await response.text();
    return new NextResponse(text, {
      status: response.status,
      headers: { 'content-type': response.headers.get('content-type') || 'application/json' }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'TaskFlow API is unavailable. Set BACKEND_API_URL in the frontend deployment.' },
      { status: 503 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request, context) { return proxy(request, context); }
export async function POST(request, context) { return proxy(request, context); }
export async function PUT(request, context) { return proxy(request, context); }
export async function PATCH(request, context) { return proxy(request, context); }
export async function DELETE(request, context) { return proxy(request, context); }
