import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Info } from 'lucide-react';

const Settings = () => {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-display font-bold text-foreground">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Game Configuration</CardTitle>
          <CardDescription>
            Questions per level are auto-calculated based on the number of active questions available for each age group and level.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3 text-sm text-muted-foreground bg-muted/50 rounded-md p-4">
            <Info className="h-5 w-5 mt-0.5 shrink-0" />
            <p>All active questions matching the player's age group will be shown in each level. Manage questions from the <strong>Questions</strong> tab.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
