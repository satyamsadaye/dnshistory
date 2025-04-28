"use client"

import type React from "react"

import { useState } from "react"
import { Search, Info, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function DnsHistoryLookup() {
  const [domain, setDomain] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState("")
  const [apiResponse, setApiResponse] = useState<any>(null)

  // Function to clean domain name
  const cleanDomainName = (domain: string): string => {
    return domain
      .replace(/^https?:\/\//i, '') // Remove http:// or https://
      .replace(/^www\./i, '')       // Remove www.
      .trim()                       // Remove any leading/trailing whitespace
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!domain) {
      setError("Please enter a domain name")
      return
    }

    const cleanedDomain = cleanDomainName(domain)
    if (!cleanedDomain) {
      setError("Please enter a valid domain name")
      return
    }

    setIsLoading(true)
    setError("")
    setResults(null)
    setApiResponse(null)

    try {
      // For debugging, let's log the full URL we're trying to access
      const apiUrl = `/api/dns-history?domain=${encodeURIComponent(cleanedDomain)}&recordType=NS`
      console.log(`Fetching from: ${apiUrl}`)

      const response = await fetch(apiUrl)
      const data = await response.json()

      // Store the raw API response for debugging
      setApiResponse(data)

      if (!response.ok) {
        throw new Error(data.error || `Error: ${response.status}`)
      }

      setResults(data)
    } catch (err) {
      console.error("Error fetching DNS history:", err)
      setError(err instanceof Error ? err.message : "An error occurred while fetching DNS history")
    } finally {
      setIsLoading(false)
    }
  }

  // Function to safely get nameservers from a record
  const getNameservers = (record: any): string[] => {
    if (!record?.dnsRecords) return []
    return record.dnsRecords
      .filter((dns: any) => dns?.dnsType === "NS")
      .map((ns: any) => ns?.singleName || ns?.target || ns?.address || "Unknown")
  }

  // Function to compare nameservers between records
  const compareNameservers = (currentRecord: any, previousRecord: any): { added: string[]; removed: string[] } => {
    const currentNs = getNameservers(currentRecord)
    const previousNs = getNameservers(previousRecord)

    return {
      added: currentNs.filter((ns) => !previousNs.includes(ns)),
      removed: previousNs.filter((ns) => !currentNs.includes(ns)),
    }
  }

  return (
    <div className="container mx-auto py-4 sm:py-8 px-4 max-w-3xl">
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          DNS History Lookup
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">Track and analyze DNS changes over time</p>
      </div>

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
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* For debugging - show raw API response */}
      {apiResponse && !results && (
        <Card className="mb-6 border-none shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
          <CardHeader>
            <CardTitle>API Response (Debug)</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs overflow-auto max-h-[300px] p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              {JSON.stringify(apiResponse, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {results && <DnsHistoryResults results={results} />}
    </div>
  )
}

function DnsHistoryResults({ results }: { results: any }) {
  if (!results.historicalDnsRecords || results.historicalDnsRecords.length === 0) {
    return (
      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertTitle>No Records Found</AlertTitle>
        <AlertDescription>No DNS history records were found for this domain.</AlertDescription>
      </Alert>
    )
  }

  // Process the data to group by year and format like the example
  const domainName = results.historicalDnsRecords[0]?.domainName || "Unknown domain"
  const totalChanges = results.totalRecords || 0

  // Group records by date
  const recordsByDate = new Map()

  results.historicalDnsRecords.forEach((record: any) => {
    const date = new Date(record.queryTime)
    const year = date.getFullYear()
    const month = date.toLocaleString("default", { month: "short" })
    const day = date.getDate()

    const key = `${year}-${month}-${day}`

    if (!recordsByDate.has(key)) {
      recordsByDate.set(key, {
        year,
        month,
        day,
        records: [],
      })
    }

    recordsByDate.get(key).records.push(record)
  })

  // Sort by date (newest first)
  const sortedDates = Array.from(recordsByDate.keys()).sort().reverse()

  // Calculate years span
  const dates = results.historicalDnsRecords.map((r: any) => new Date(r.queryTime))
  const oldestDate = new Date(Math.min(...dates.map((d: Date) => d.getTime())))
  const newestDate = new Date(Math.max(...dates.map((d: Date) => d.getTime())))
  const yearsSpan = newestDate.getFullYear() - oldestDate.getFullYear() + 1

  return (
    <div className="space-y-6">
      <div className="text-lg font-medium">
        {domainName} - {totalChanges} changes recorded over {yearsSpan} years
      </div>
      <div className="text-sm text-muted-foreground">This domain has not been parked before.</div>

      {sortedDates.map((dateKey) => {
        const dateData = recordsByDate.get(dateKey)
        const { year, month, day, records } = dateData

        return (
          <Card key={dateKey} className="overflow-hidden">
            <CardHeader className="bg-muted py-3">
              <CardTitle className="text-lg">
                {year} {month} {day}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {records.map((record: any, index: number) => {
                // Function to get nameservers from a record
                const getNameservers = (rec: any): string[] => {
                  if (!rec?.dnsRecords) return []
                  return rec.dnsRecords
                    .filter((dns: any) => dns?.dnsType === "NS")
                    .map((ns: any) => ns?.singleName || ns?.target || ns?.address || "Unknown")
                }

                // Get nameservers for current record
                const nameservers = getNameservers(record)

                // Get previous record for comparison
                const prevRecord = index > 0 ? records[index - 1] : null

                // Calculate changes if there's a previous record
                let added: string[] = []
                let removed: string[] = []

                if (prevRecord) {
                  const prevNameservers = getNameservers(prevRecord)
                  added = nameservers.filter((ns) => !prevNameservers.includes(ns))
                  removed = prevNameservers.filter((ns) => !nameservers.includes(ns))
                }

                const isFirstRecord = index === 0 && dateKey === sortedDates[sortedDates.length - 1]

                return (
                  <div key={index} className="mb-4 last:mb-0">
                    {isFirstRecord && <div className="text-sm mb-4">Domain created*, nameservers added</div>}

                    <div className="font-medium mb-2">Nameservers</div>
                    <ul className="space-y-1 mb-4">
                      {nameservers.map((ns: string, nsIndex: number) => (
                        <li key={nsIndex} className="text-sm">
                          {ns}
                        </li>
                      ))}
                    </ul>

                    {(added.length > 0 || removed.length > 0) && (
                      <>
                        <div className="font-medium mb-2">Changes</div>
                        <ul className="space-y-1">
                          {added.map((ns: string, nsIndex: number) => (
                            <li key={`added-${nsIndex}`} className="text-sm text-green-600">
                              {" "}
                              {ns}
                            </li>
                          ))}

                          {removed.map((ns: string, nsIndex: number) => (
                            <li key={`removed-${nsIndex}`} className="text-sm text-red-600">
                              {" "}
                              {ns}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
