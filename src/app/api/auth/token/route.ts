import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, redirect_uri } = body;

    const client_id = process.env.EHR_CLIENT_ID;
    const client_secret = process.env.EHR_CLIENT_SECRET;

    if (!code || !client_id || !client_secret) {
      return NextResponse.json(
        { error: 'Missing required parameters or configuration' },
        { status: 400 }
      );
    }

    // Exchange authorization code for access token
    const tokenUrl = process.env.EHR_TOKEN_URL || process.env.NEXT_PUBLIC_EHR_TOKEN_URL || '';

    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${client_id}:${client_secret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);
      return NextResponse.json(
        { error: 'Token exchange failed' },
        { status: tokenResponse.status }
      );
    }

    const tokenData = await tokenResponse.json();

    return NextResponse.json({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
      token_type: tokenData.token_type,
      scope: tokenData.scope,
    });

  } catch (error) {
    console.error('Token exchange error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}