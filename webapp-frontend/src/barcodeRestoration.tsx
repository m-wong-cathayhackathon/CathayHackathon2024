import { useState, useRef } from "react"
import { Camera, Loader2, Search, Type, Upload, Maximize, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { scanBarcode, searchByCode, searchByDescription, processImage, checkCodeValid } from "./components/ApiFetch"
import { retryImageProcess } from "./components/ApiFetch"

export default function CargoScanner() {
  const [isScanning, setIsScanning] = useState(false)
  const [searchResults, setSearchResults] = useState<null | {
    exists: boolean
    possibleMatches?: string[]
    confidence?: number[]
  }>(null)
  const [descriptionResults, setDescriptionResults] = useState<null | {
    matches: Array<{  id: string; description: string; dimensions: string;  }>
  }>(null)
  const [activeInput, setActiveInput] = useState("")
  const [dimensions, setDimensions] = useState({ length: "", width: "", height: "" })
  const [scannedImage, setScannedImage] = useState<string | null>(null)
  const [detectedCode, setDetectedCode] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleScan = async () => {
    setIsScanning(true)
    try {
      // In a real implementation, you would capture an image here
      const mockCapturedImage = new File([], "mock-image.jpg", { type: "image/jpeg" })
      setScannedImage(URL.createObjectURL(mockCapturedImage))
      const result = await scanBarcode(mockCapturedImage)
      setSearchResults(result)
    } catch (error) {
      console.error("Error scanning barcode:", error)
    } finally {
      setIsScanning(false)
    }
  }

  const handleManualSearch = async (code: string) => {
    if (!code) return
    setIsScanning(true)
    try {
      const result = await checkCodeValid(code)
      if(result.valid) {
        alert("The code is correct")
      } else {
        alert(result.reason)
      }
    } catch (error) {
      console.error("Error searching by code:", error)
    } finally {
      setIsScanning(false)
    }
  }

  const handleDescriptionSearch = async (description: string) => {
    if (!description && !dimensions.length && !dimensions.width && !dimensions.height) return
    setIsScanning(true)
    try {
      //Mock searching
      const result = await searchByDescription(description, dimensions)
      //set result
      setDescriptionResults(result)
    } catch (error) {
      console.error("Error searching by description:", error)
    } finally {
      setIsScanning(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setScannedImage(URL.createObjectURL(file))
      setIsScanning(true)
      try {
        const { detectedCode, searchResult } = await processImage(file)
        //After upload the image, set the detected code and result
        setDetectedCode(detectedCode)
        setSearchResults(searchResult)
      } catch (error) {
        console.error("Error processing image:", error)
      } finally {
        setIsScanning(false)
      }
    }
  }

  const retryImageProcessing = async () => {
    if (scannedImage) {
      setIsScanning(true)
      try {
        const file = await fetch(scannedImage).then(r => r.blob()).then(blobFile => new File([blobFile], "image.jpg", { type: "image/jpeg" }))
        const { detectedCode, searchResult } = await retryImageProcess(file)
        setDetectedCode(detectedCode)
        setSearchResults(searchResult)
      } catch (error) {
        console.error("Error retrying image processing:", error)
      } finally {
        setIsScanning(false)
      }
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Tabs defaultValue="barcode" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="barcode">Image Search</TabsTrigger>
          <TabsTrigger value="description">Cargo Chat</TabsTrigger>
        </TabsList>

        <TabsContent value="barcode">
          <Card>
            <CardHeader>
              <CardTitle>AWB Recognition</CardTitle>
              <CardDescription>
                Take a picture, we'll make your life easier.
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
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </Button>
              </div>

              {scannedImage && (
                <div className="space-y-2">
                  <Label>Scanned Image</Label>
                  <div className="relative">
                    <img src={scannedImage} alt="Scanned barcode" className="w-full rounded-lg" />
                    <Button
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={retryImageProcessing}
                      disabled={isScanning}
                    >
                      <RefreshCcw className="h-4 w-4 mr-2" />
                      Retry
                    </Button>
                  </div>
                </div>
              )}

              {detectedCode && (
                <div className="space-y-2">
                  <Label>Detected Code</Label>
                  <div className="p-2 bg-muted rounded-lg font-mono">{detectedCode}</div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="manual-code">Manual Code Check</Label>
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
              <CardTitle>Search by Description or Dimensions</CardTitle>
              <CardDescription>
                Enter cargo description or dimensions to find matching AWB numbers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="cargo-description">Cargo Description</Label>
                <Textarea
                  id="cargo-description"
                  placeholder="Enter cargo description..."
                  value={activeInput}
                  onChange={(e) => setActiveInput(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="length">Length (cm)</Label>
                  <Input
                    id="length"
                    placeholder="Length"
                    value={dimensions.length}
                    onChange={(e) => setDimensions({...dimensions, length: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="width">Width (cm)</Label>
                  <Input
                    id="width"
                    placeholder="Width"
                    value={dimensions.width}
                    onChange={(e) => setDimensions({...dimensions, width: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    placeholder="Height"
                    value={dimensions.height}
                    onChange={(e) => setDimensions({...dimensions, height: e.target.value})}
                  />
                </div>
              </div>

              <Button
                className="w-full"
                onClick={() => handleDescriptionSearch(activeInput)}
                disabled={isScanning || (!activeInput && !dimensions.length && !dimensions.width && !dimensions.height)}
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>

              {/* {descriptionResults && (
                <div className="space-y-2 pt-4">
                  <Label>Matching AWB Numbers:</Label>
                  {descriptionResults.matches.map((match) => (
                    <div key={match.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-2 border rounded-lg">
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
              )} */}
              
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}