"use client"

import type React from "react"

import { useState } from "react"
import { Search, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ClientLookup() {
  const [domain, setDomain] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!domain) {
      setError("Please enter a domain name")
      return
    }

    setIsLoading(true)
    setError("")
    setResults(null)

    try {
      const response = await fetch(`/api/dns-history?domain=${encodeURIComponent(domain)}&recordType=NS`)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      setResults(data)
    } catch (err) {
      console.error("Error fetching DNS history:", err)
      setError(err instanceof Error ? err.message : "An error occurred while fetching DNS history")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-4 sm:py-8 px-4 max-w-3xl">
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Client-Side DNS Lookup
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">Test DNS history lookups directly from your browser</p>
      </div>

      <Alert className="mb-6 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
        <Info className="h-4 w-4" />
        <AlertTitle>Client-Side Testing</AlertTitle>
        <AlertDescription className="text-sm sm:text-base">
          This page makes API calls directly from the client for testing purposes. You will need to enter your API key
          when prompted.
        </AlertDescription>
      </Alert>

      <Card className="mb-6 sm:mb-8 border-none shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg sm:text-xl">Search DNS History</CardTitle>
          <CardDescription className="text-sm sm:text-base">Enter a domain name to view its DNS history and changes over time</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end">
              <div className="flex-1 space-y-2">
                <label htmlFor="domain" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Domain Name
                </label>
                <Input
                  id="domain"
                  placeholder="example.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="h-10 sm:h-12 text-base sm:text-lg border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200"
                />
              </div>

              <Button 
                type="submit" 
                disabled={isLoading} 
                className="h-10 sm:h-12 px-4 sm:px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Searching...</span>
                  </div>
                ) : (
                  <>
                    Search
                    <Search className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="mb-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <Info className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="text-sm sm:text-base">{error}</AlertDescription>
        </Alert>
      )}

      {results && (
        <Card className="border-none shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
          <CardHeader>
            <CardTitle>API Response</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs overflow-auto max-h-[500px] p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              {JSON.stringify(results, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
