import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Package, LayoutDashboard } from "lucide-react"
import CargoScanner from "./barcodeRestoration"
import Dashboard from "./dashboard"

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<"scanner" | "dashboard">("scanner")

  const renderScreen = () => {
    switch (currentScreen) {
      case "dashboard":
        return <Dashboard />
      default:
        return <CargoScanner />
    }
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Top Bar */}
      <header className="bg-blue-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Package className="h-6 w-6" />
          <h1 className="text-xl font-bold">CargoScan</h1>
        </div>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Button variant="ghost" onClick={() => setCurrentScreen("scanner")}>
                Cargo Scanner
              </Button>
            </li>
            <li>
              <Button variant="ghost" onClick={() => setCurrentScreen("dashboard")}>
                Dashboard
              </Button>
            </li>
          </ul>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow overflow-auto bg-gray-100">
        {renderScreen()}
      </main>

      {/* Bottom Navigation Bar (Mobile) */}
      <nav className="md:hidden bg-white border-t border-gray-200">
        <ul className="flex justify-around">
          <li className="flex-1">
            <Button
              variant="ghost"
              className="w-full py-4"
              onClick={() => setCurrentScreen("scanner")}
            >
              <Package className="h-6 w-6" />
              <span className="sr-only">Cargo Scanner</span>
            </Button>
          </li>
          <li className="flex-1">
            <Button
              variant="ghost"
              className="w-full py-4"
              onClick={() => setCurrentScreen("dashboard")}
            >
              <LayoutDashboard className="h-6 w-6" />
              <span className="sr-only">Dashboard</span>
            </Button>
          </li>
        </ul>
      </nav>
    </div>
  )
}