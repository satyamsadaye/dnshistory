import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DnsRecord {
  dnsType: string
  ttl: number
  singleName?: string
  target?: string
  address?: string
  strings?: string[]
  rawText: string
}

interface HistoricalRecord {
  queryTime: string
  domainName: string
  domainRegistered: boolean
  dnsRecords: DnsRecord[]
}

interface DnsHistoryTimelineProps {
  records: HistoricalRecord[]
  domainName: string
  totalChanges: number
}

export function DnsHistoryTimeline({ records, domainName, totalChanges }: DnsHistoryTimelineProps) {
  // Group records by year
  const recordsByYear = records.reduce(
    (acc, record) => {
      const year = new Date(record.queryTime).getFullYear()
      if (!acc[year]) {
        acc[year] = []
      }
      acc[year].push(record)
      return acc
    },
    {} as Record<number, HistoricalRecord[]>,
  )

  // Sort years in descending order
  const sortedYears = Object.keys(recordsByYear)
    .map(Number)
    .sort((a, b) => b - a)

  return (
    <div className="space-y-8">
      <div className="text-xl font-bold">
        {domainName} - {totalChanges} changes recorded over {sortedYears.length} years
      </div>
      <div className="text-sm text-muted-foreground">This domain has not been parked before.</div>

      {sortedYears.map((year) => (
        <div key={year} className="space-y-4">
          <h2 className="text-xl font-bold">{year}</h2>

          {recordsByYear[year]
            .sort((a, b) => new Date(b.queryTime).getTime() - new Date(a.queryTime).getTime())
            .map((record, recordIndex) => {
              const date = new Date(record.queryTime)
              const month = date.toLocaleString("default", { month: "short" })
              const day = date.getDate()

              // Get nameservers from NS records
              const nameservers = record.dnsRecords
                .filter((dns) => dns.dnsType === "NS")
                .map((ns) => ns.singleName || ns.target || "")

              // Get previous record for comparison
              const prevRecord =
                recordIndex < recordsByYear[year].length - 1 ? recordsByYear[year][recordIndex + 1] : null

              // Get previous nameservers
              const prevNameservers = prevRecord
                ? prevRecord.dnsRecords
                    .filter((dns) => dns.dnsType === "NS")
                    .map((ns) => ns.singleName || ns.target || "")
                : []

              // Calculate changes
              const added = nameservers.filter((ns) => !prevNameservers.includes(ns))
              const removed = prevNameservers.filter((ns) => !nameservers.includes(ns))

              return (
                <Card key={record.queryTime} className="overflow-hidden">
                  <CardHeader className="py-3 bg-muted">
                    <CardTitle className="text-base font-medium">
                      {month} {day}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    {recordIndex === recordsByYear[year].length - 1 && (
                      <div className="text-sm mb-4">Domain created*, nameservers added</div>
                    )}

                    <div className="mb-4">
                      <div className="font-medium mb-2">Nameservers</div>
                      <ul className="space-y-1">
                        {nameservers.map((ns, i) => (
                          <li key={i} className="text-sm">
                            {ns}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {(added.length > 0 || removed.length > 0) && (
                      <div>
                        <div className="font-medium mb-2">Changes</div>
                        <ul className="space-y-1">
                          {added.map((ns, i) => (
                            <li key={`added-${i}`} className="text-sm text-green-600">
                              {" "}
                              {ns}
                            </li>
                          ))}
                          {removed.map((ns, i) => (
                            <li key={`removed-${i}`} className="text-sm text-red-600">
                              {" "}
                              {ns}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
        </div>
      ))}
    </div>
  )
}
