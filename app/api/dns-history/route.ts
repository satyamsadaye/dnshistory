import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const domain = searchParams.get("domain")
  const page = searchParams.get("page") || "1"

  if (!domain) {
    return NextResponse.json({ error: "Domain parameter is required" }, { status: 400 })
  }

  try {
    // Use the environment variable for the API key
    const apiKey = process.env.DNS_API_KEY

    if (!apiKey) {
      console.error("API key is not configured")
      return NextResponse.json({ error: "API key is not configured" }, { status: 500 })
    }

    const url = "https://api.apifreaks.com/v1.0/domain/dns/history"

    const params = new URLSearchParams({
      "host-name": domain,
      type: "NS",
      page: page.toString(),
    })

    const headers = {
      "X-apiKey": apiKey,
    }

    console.log(`Fetching DNS history for ${domain} with NS records`)

    const response = await fetch(`${url}?${params.toString()}`, {
      headers,
      cache: "no-store",
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`API error: ${response.status} - ${errorText}`)
      return NextResponse.json(
        {
          error: `API request failed with status ${response.status}`,
          details: errorText,
        },
        { status: response.status },
      )
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching DNS history:", error)
    return NextResponse.json(
      { error: "Failed to fetch DNS history" },
      { status: 500 },
    )
  }
}
