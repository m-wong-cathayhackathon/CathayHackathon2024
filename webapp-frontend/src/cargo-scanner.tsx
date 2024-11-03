"use client"

import { useState } from "react"
import { Camera, Loader2, Search, Type, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export default function CargoScanner() {
  const [isScanning, setIsScanning] = useState(false)
  const [searchResults, setSearchResults] = useState<null | {
    exists: boolean
    possibleMatches?: string[]
    confidence?: number[]
  }>(null)
  const [descriptionResults, setDescriptionResults] = useState<null | {
    matches: Array<{ awb: string; confidence: number }>
  }>(null)
  const [activeInput, setActiveInput] = useState("")

  const handleScan = async () => {
    setIsScanning(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsScanning(false)
    setSearchResults({
      exists: false,
      possibleMatches: ["ABC123456", "ABC123457", "ABC123458"],
      confidence: [95, 85, 75]
    })
  }

  const handleManualSearch = async (code: string) => {
    if (!code) return
    setIsScanning(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsScanning(false)
    setSearchResults({
      exists: true,
      possibleMatches: [code],
      confidence: [100]
    })
  }

  const handleDescriptionSearch = async (description: string) => {
    if (!description) return
    setIsScanning(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsScanning(false)
    setDescriptionResults({
      matches: [
        { awb: "XYZ789012", confidence: 92 },
        { awb: "XYZ789013", confidence: 85 },
        { awb: "XYZ789014", confidence: 78 }
      ]
    })
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Tabs defaultValue="barcode" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="barcode">Barcode Scanner</TabsTrigger>
          <TabsTrigger value="description">Cargo Description</TabsTrigger>
        </TabsList>

        <TabsContent value="barcode">
          <Card>
            <CardHeader>
              <CardTitle>Scan Barcode</CardTitle>
              <CardDescription>
                Scan a barcode or manually enter the code
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <Button
                  className="w-full"
                  onClick={handleScan}
                  disabled={isScanning}
                >
                  {isScanning ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Camera className="h-4 w-4 mr-2" />
                  )}
                  Scan Barcode
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={() => handleScan()}
                  />
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="manual-code">Manual Code Entry</Label>
                <div className="flex gap-2">
                  <Input
                    id="manual-code"
                    placeholder="Enter code manually..."
                    value={activeInput}
                    onChange={(e) => setActiveInput(e.target.value)}
                  />
                  <Button
                    variant="secondary"
                    onClick={() => handleManualSearch(activeInput)}
                    disabled={isScanning || !activeInput}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {searchResults && (
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-2">
                    <Badge variant={searchResults.exists ? "default" : "destructive"}>
                      {searchResults.exists ? "Found" : "Not Found"}
                    </Badge>
                  </div>
                  {searchResults.possibleMatches && (
                    <div className="space-y-2">
                      <Label>Possible Matches:</Label>
                      {searchResults.possibleMatches.map((match, index) => (
                        <div key={match} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-2 border rounded-lg">
                          <span className="font-mono text-sm sm:text-base">{match}</span>
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Progress value={searchResults.confidence?.[index]} className="flex-1" />
                            <span className="text-sm text-muted-foreground whitespace-nowrap">
                              {searchResults.confidence?.[index]}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="description">
          <Card>
            <CardHeader>
              <CardTitle>Search by Description</CardTitle>
              <CardDescription>
                Enter cargo description to find matching AWB numbers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="cargo-description">Cargo Description</Label>
                <div className="flex gap-2">
                  <Input
                    id="cargo-description"
                    placeholder="Enter cargo description..."
                    value={activeInput}
                    onChange={(e) => setActiveInput(e.target.value)}
                  />
                  <Button
                    variant="secondary"
                    onClick={() => handleDescriptionSearch(activeInput)}
                    disabled={isScanning || !activeInput}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {descriptionResults && (
                <div className="space-y-2 pt-4">
                  <Label>Matching AWB Numbers:</Label>
                  {descriptionResults.matches.map((match) => (
                    <div key={match.awb} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-2 border rounded-lg">
                      <span className="font-mono text-sm sm:text-base">{match.awb}</span>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Progress value={match.confidence} className="flex-1" />
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {match.confidence}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}