"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function ApiTest() {
  const [domain, setDomain] = useState("example.com")
  const [apiKey, setApiKey] = useState("")
  const [response, setResponse] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const testDirectApi = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const url = `https://api.apifreaks.com/v1.0/domain/dns/history?host-name=${encodeURIComponent(domain)}&type=all&page=1`

      const response = await fetch(url, {
        headers: {
          "X-apiKey": apiKey || process.env.DNS_API_KEY || "",
        },
      })

      const data = await response.json()
      setResponse(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const testNextApi = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/dns-history?domain=${encodeURIComponent(domain)}&recordType=all`)
      const data = await response.json()
      setResponse(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">API Test Page</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Test Direct API</CardTitle>
            <CardDescription>Test the external API directly</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Domain</label>
                <Input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="example.com" />
              </div>
              <div>
                <label className="text-sm font-medium">API Key (optional)</label>
                <Input
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Your API key"
                  type="password"
                />
              </div>
              <Button onClick={testDirectApi} disabled={isLoading}>
                {isLoading ? "Testing..." : "Test Direct API"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Next.js API Route</CardTitle>
            <CardDescription>Test the Next.js API route</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Domain</label>
                <Input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="example.com" />
              </div>
              <Button onClick={testNextApi} disabled={isLoading}>
                {isLoading ? "Testing..." : "Test Next.js API"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Card className="mt-6 border-red-500">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {response && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>API Response</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs overflow-auto max-h-[500px] p-4 bg-muted rounded-md">
              {JSON.stringify(response, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
