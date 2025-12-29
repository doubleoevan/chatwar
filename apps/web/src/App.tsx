import { Button, Input, Label } from "@chatwar/ui";

export default function App() {
  return (
    <div className="p-6 space-y-4 max-w-md">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" placeholder="you@chatwar.com" />
      </div>
      <Button>Save</Button>
    </div>
  );
}
