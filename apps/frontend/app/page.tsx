import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SelectContent } from "@radix-ui/react-select";


export default function Home() {
  return (
    <div className="h-screen">
    <Tabs defaultValue="buy" className="max-w-3xl mx-auto mt-10 w-full">
  <TabsList>
    <TabsTrigger value="buy">Buy PLST</TabsTrigger>
    <TabsTrigger value="bridge">Bridge Tokens</TabsTrigger>
  </TabsList>
  <TabsContent value="buy" className="flex flex-col gap-4 max-w-2xl w-full">

<Card className=" w-full shadow-sm border-red-500 border shadow-black h-96">
  <div className="h-1/2 py-1 px-3 border-b border-red-500 flex gap-3 flex-col">
  <Label className="text-xl text-red-500">You Give</Label>
<div className="flex items-center gap-4">
  <Input type="number" min={0}  className="w-full"/>
 <Select>
  <SelectTrigger className="w-44">
    <SelectValue placeholder="Token" />
  </SelectTrigger>
  <SelectContent className="w-44 bg-white shadow-sm shadow-black rounded-lg">
    <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
    <SelectItem value="SOL">Polygon (MATIC)</SelectItem>
    <SelectItem value="TERRA">BaseCoin (COIN)</SelectItem>
  </SelectContent>
</Select>
</div>
  </div>
    <div className="h-1/2 py-1 px-3 flex gap-3 flex-col">
  <Label className="text-xl text-red-500">You Receive</Label>
<div className="p-2 rounded-lg border-gray-300 border">
  <p className="text-red-500 font-semibold">120 PLST</p>
</div>
  </div>
</Card>

<Button className="p-6 transition-all shadow-sm shadow-black hover:bg-red-600 cursor-pointer hover:scale-95 text-lg max-w-xl self-center w-full bg-red-500">Buy Stabilski (PLST)</Button>

  </TabsContent>
  <TabsContent value="bridge">Change your password here.</TabsContent>
</Tabs>
    </div>
  );
}
