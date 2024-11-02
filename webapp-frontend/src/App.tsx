import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Brain, Home, BarChart2, Mic } from "lucide-react"
import HomeScreen from "./components/home-screen"
import DailyTherapySession from "./components/daily-therapy-session"
import UserHistory from "./components/user-history/user-history"

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("home")

  const renderScreen = () => {
    switch (currentScreen) {
      case "home":
        return <HomeScreen />
      case "daily":
        return <UserHistory />
      case "record":
        return <DailyTherapySession />
      default:
        return <HomeScreen />
    }
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Top Bar */}
      <header className="bg-blue-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Brain className="h-6 w-6" />
          <h1 className="text-xl font-bold">NeuroLinguist.ai</h1>
        </div>
        <nav className="hidden md:block">
          <ul className="flex space-x-4">
            <li>
              <Button variant="ghost" onClick={() => setCurrentScreen("home")}>
                Home
              </Button>
            </li>
            <li>
              <Button variant="ghost" onClick={() => setCurrentScreen("daily")}>
                Daily Assessment
              </Button>
            </li>
            <li>
              <Button variant="ghost" onClick={() => setCurrentScreen("record")}>
                My Record
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
              onClick={() => setCurrentScreen("record")}
            >
              <Mic className="h-6 w-6" />
              <span className="sr-only">My Record</span>
            </Button>
          </li>
          <li className="flex-1">
            <Button
              variant="ghost"
              className="w-full py-4"
              onClick={() => setCurrentScreen("home")}
            >
              <Home className="h-6 w-6" />
              <span className="sr-only">Home</span>
            </Button>
          </li>
          <li className="flex-1">
            <Button
              variant="ghost"
              className="w-full py-4"
              onClick={() => setCurrentScreen("daily")}
            >
              <BarChart2 className="h-6 w-6" />
              <span className="sr-only">Daily Assessment</span>
            </Button>
          </li>
        </ul>
      </nav>
    </div>
  )
}