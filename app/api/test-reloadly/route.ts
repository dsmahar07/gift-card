import { NextResponse } from "next/server";

export async function GET() {
  const CLIENT_ID = process.env.RELOADLY_CLIENT_ID;
  const CLIENT_SECRET = process.env.RELOADLY_CLIENT_SECRET;
  const IS_SANDBOX = process.env.RELOADLY_SANDBOX === "true";

  if (!CLIENT_ID || !CLIENT_SECRET) {
    return NextResponse.json({ error: "Reloadly credentials not configured" }, { status: 500 });
  }

  try {
    // Get access token
    const authUrl = IS_SANDBOX 
      ? "https://auth.reloadly.com/oauth/token"
      : "https://auth.reloadly.com/oauth/token";
    
    const authResponse = await fetch(authUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "client_credentials",
        audience: IS_SANDBOX 
          ? "https://giftcards-sandbox.reloadly.com"
          : "https://giftcards.reloadly.com",
      }),
    });

    if (!authResponse.ok) {
      const error = await authResponse.json();
      return NextResponse.json({
        error: "Failed to authenticate with Reloadly",
        details: error,
        isSandbox: IS_SANDBOX,
      }, { status: 401 });
    }

    const authData = await authResponse.json();
    const accessToken = authData.access_token;

    // Get account balance
    const balanceUrl = IS_SANDBOX
      ? "https://giftcards-sandbox.reloadly.com/accounts/balance"
      : "https://giftcards.reloadly.com/accounts/balance";

    const balanceResponse = await fetch(balanceUrl, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Accept": "application/com.reloadly.giftcards-v1+json",
      },
    });

    const balanceData = await balanceResponse.json();

    return NextResponse.json({
      message: "Reloadly API Test Results",
      mode: IS_SANDBOX ? "SANDBOX (Test Mode)" : "PRODUCTION",
      authenticated: true,
      balance: balanceData,
      warning: IS_SANDBOX 
        ? "You're in SANDBOX mode. Request test credits from Reloadly dashboard if balance is 0."
        : "You're in PRODUCTION mode. Add real funds to your Reloadly wallet to purchase gift cards.",
    });
  } catch (error: any) {
    return NextResponse.json({
      error: "Failed to connect to Reloadly",
      details: error.message,
      isSandbox: IS_SANDBOX,
    }, { status: 500 });
  }
}
