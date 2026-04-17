import { get } from '@vercel/edge-config';

export const config = {
  runtime: 'edge',
};

const DEFAULT_FLAGS: Record<string, boolean> = {
  'fortune-wheel': true,
  'answer-input': false,
};

export default async function handler() {
  try {
    const flags = await get<Record<string, boolean>>();

    return new Response(JSON.stringify({ flags: { ...DEFAULT_FLAGS, ...flags } }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, must-revalidate',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch {
    return new Response(JSON.stringify({ flags: DEFAULT_FLAGS }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, must-revalidate',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
