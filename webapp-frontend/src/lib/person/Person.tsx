import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import RiskIndicator from "@/components/risk-indicator";
import { Progress } from "@/components/ui/progress";
import { BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default interface Person {
  name: string;
  status: string;
  factors: number[];
}

export default function Person(person: Person) {
  const [showProgress, setShowProgress] = useState(false);

  const toggleProgress = () => {
    setShowProgress(!showProgress);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{person.name}</CardTitle>
          <CardDescription>{person.status}</CardDescription>
        </CardHeader>
        <CardContent>
          {RiskIndicator(person.factors)}
          <Button style={{ width: "100%" }} onClick={toggleProgress}>
            Show results
          </Button>
          {showProgress ? (
            <Card>
              <CardHeader>
                <CardTitle>Current Progress</CardTitle>
                <CardDescription>{person.status}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span>Words Recalled</span>
                    <span className="font-semibold">75/100</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span>Fluency Score</span>
                    <span className="font-semibold">82%</span>
                  </div>
                  <Progress value={82} className="h-2" />
                </div>
                <Button variant="outline" className="w-full">
                  <BarChart2 className="mr-2 h-4 w-4" />
                  View Detailed Progress
                </Button>
              </CardContent>
            </Card>
          ) : (
            <></>
          )}
        </CardContent>
      </Card>
    </>
  );
}
