import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";

export default function OEMManagement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Building2 className="h-8 w-8 mr-3" />
            OEM Management
          </h1>
          <p className="text-muted-foreground mt-2">
            This module is under development
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>OEM Management System</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Building2 className="h-16 w-16 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold">Coming Soon</h3>
                <p className="text-muted-foreground">
                  The OEM Management module is currently under development
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}