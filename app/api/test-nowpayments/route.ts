import { NextResponse } from "next/server";

export async function GET() {
  const API_KEY = process.env.NOWPAYMENTS_API_KEY;

  if (!API_KEY) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  try {
    // Test 1: Get API status
    const statusResponse = await fetch("https://api.nowpayments.io/v1/status", {
      headers: {
        "x-api-key": API_KEY,
      },
    });
    const statusData = await statusResponse.json();

    // Test 2: Get available currencies
    const currenciesResponse = await fetch("https://api.nowpayments.io/v1/currencies", {
      headers: {
        "x-api-key": API_KEY,
      },
    });
    const currenciesData = await currenciesResponse.json();

    // Test 3: Get minimum amounts
    const minResponse = await fetch("https://api.nowpayments.io/v1/min-amount?currency_from=usd&currency_to=usdt", {
      headers: {
        "x-api-key": API_KEY,
      },
    });
    const minData = await minResponse.json();

    return NextResponse.json({
      message: "NOWPayments API Test Results",
      status: statusData,
      availableCurrencies: currenciesData.currencies?.slice(0, 10) || [],
      totalCurrencies: currenciesData.currencies?.length || 0,
      minimumAmount: minData,
    });
  } catch (error: any) {
    return NextResponse.json({
      error: "Failed to connect to NOWPayments",
      details: error.message,
    }, { status: 500 });
  }
}
