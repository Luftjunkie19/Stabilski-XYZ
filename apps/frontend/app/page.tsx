import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Header from "@/components/ui/Header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SelectContent } from "@radix-ui/react-select";
import Image from "next/image";
import StabilskiStableCoin from '@/public/Logox192.png'
import StabilskiStableCoin2 from '@/public/Logox512.png'
import {FaXTwitter, FaTelegram, FaDiscord, FaGithub, FaEthereum, FaBitcoin, FaLink } from "react-icons/fa6"
import Link from "next/link";
import { SiChainlink } from "react-icons/si";


export default function Home() {
  return (
    <div className="h-screen flex justify-between items-center w-full flex-col">
    <Tabs defaultValue="intro" className="max-w-6xl flex justify-center items-center mx-auto mt-8 w-full p-3">
  <TabsList className="self-start overflow-x-auto w-full max-w-xl ">
    <TabsTrigger value="intro">Introduction</TabsTrigger>
    <TabsTrigger value="collateral">Put Collateral</TabsTrigger>
    <TabsTrigger value="borrow">Borrow PLST</TabsTrigger>
    <TabsTrigger value="bridge">Bridge Tokens</TabsTrigger>
  </TabsList>

  <TabsContent value="intro" className="flex flex-col gap-3 max-w-4xl w-full">
    <Header/>
    <div className="flex w-full justify-between items-center flex-col sm:flex-row">

<Image src={StabilskiStableCoin2} width={240} height={240} alt="logo" className="w-60 h-60"/>
<div className="flex flex-col gap-2 max-w-lg w-full">
  <p className="text-3xl text-shadow-lg shadow-black font-bold text-red-500">Stabilski.XYZ</p>
  <p>It is a Lending Protocol for the Polish Złoty, where you can exchange your WETH, LINK and WBTC tokens on Sepolia Ethereum Testnet for PLST (Stabilski Tokens). You can also exchange your LINK on Arbitrum Sepolia Testnet for PLST.</p>
</div>
    </div>
  </TabsContent>

    <TabsContent value="collateral" className="flex flex-col gap-4 max-w-xl w-full">

<Card className=" w-full shadow-sm border-red-500 border shadow-black h-96">
  <div className="h-1/2 py-1 px-3 border-b border-red-500 flex gap-3 flex-col">
  <Label className="text-xl text-red-500">You Give</Label>
<div className="flex items-center gap-4">
  <Input type="number" min={0}  className="w-full"/>
 <Select>
  <SelectTrigger className="w-44">
    <SelectValue placeholder="Token" />
  </SelectTrigger>
  <SelectContent className="w-64 relative bg-white shadow-sm shadow-black rounded-lg">
    <SelectItem value="WETH"> <FaEthereum className="text-zinc-500"/> Wrapped Ethereum (WETH)</SelectItem>
    <SelectItem value="WBTC"><FaBitcoin className="text-orange-500"/> Wrapped Bitcoin (WBTC)</SelectItem>
    <SelectItem value="LINK "><SiChainlink className="text-blue-500" /> Chainlink (LINK)</SelectItem>
  </SelectContent>
</Select>
</div>
  </div>
    <div className="h-1/2 py-1 px-3 flex gap-3 flex-col">
  <Label className="text-xl text-red-500">You Borrow (Max.)</Label>
<div className="p-2 rounded-lg border-gray-300 border">
  <p className="text-red-500 font-semibold">120 PLST</p>
</div>
  </div>
</Card>

<Button className="p-6 transition-all shadow-sm shadow-black hover:bg-red-600 cursor-pointer hover:scale-95 text-lg max-w-sm self-center w-full bg-red-500">Put Collateral</Button>

  </TabsContent>

  <TabsContent value="borrow" className="flex flex-col gap-4 max-w-xl w-full">

<Card className=" w-full shadow-sm border-red-500 border shadow-black h-96">
  <div className="h-1/2 py-1 px-3 border-b border-red-500 flex gap-3 flex-col">
  <Label className="text-xl text-red-500">You Borrow</Label>
<div className="flex items-center gap-4">
  <Input type="number" min={0}  className="w-full"/>
 <Select>
  <SelectTrigger className="w-44">
    <SelectValue placeholder="Chain Vaults" />
  </SelectTrigger>
  <SelectContent className="w-44 bg-white shadow-sm shadow-black rounded-lg">
    <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
    <SelectItem value="SOL">Polygon (MATIC)</SelectItem>
    <SelectItem value="TERRA">BaseCoin (COIN)</SelectItem>
  </SelectContent>
</Select>
</div>
  </div>
    <div className="h-1/2 py-1 px-3 items-center flex gap-3 flex-col">
 <p className="text-red-500 text-2xl tracking">Your position is</p>

<p>150%</p>

<p>Collaterized</p>

  </div>
</Card>

<Button className="p-6 transition-all shadow-sm shadow-black hover:bg-red-600 cursor-pointer hover:scale-95 text-lg max-w-sm self-center w-full bg-red-500">Borrow Stabilski (PLST)</Button>

  </TabsContent>
  <TabsContent value="bridge" className="flex flex-col gap-4 max-w-xl w-full">
    <Card className=" w-full shadow-sm border-red-500 border shadow-black h-96">
  <div className="h-1/2 py-1 px-3 border-b border-red-500 flex gap-3 flex-col">
  <Label className="text-xl text-red-500">Root Chain PLST</Label>
<div className="flex items-center gap-4">
<div className="w-full flex-col gap-1">
  <Label>Amount</Label>
    <Input type="number" min={0}  className="w-full"/>
</div>
<div className="flex-col gap-1">
  <Label>Chain</Label>
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
  </div>
    <div className="h-1/2 w-full py-1 px-3 flex gap-3 flex-col">
  <Label className="text-xl text-red-500">Destination Chain</Label>
   <Select>
  <SelectTrigger className="w-full">
    <SelectValue placeholder="Token" />
  </SelectTrigger>
  <SelectContent className="bg-white max-w-xl w-full shadow-sm shadow-black rounded-lg">
    <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
    <SelectItem value="SOL">Polygon (MATIC)</SelectItem>
    <SelectItem value="TERRA">BaseCoin (COIN)</SelectItem>
  </SelectContent>
</Select>
  </div>

    </Card>

    <Button className="p-6 transition-all shadow-sm shadow-black hover:bg-red-600 cursor-pointer hover:scale-95 text-lg max-w-sm self-center w-full bg-red-500">Bridge Tokens</Button>
  </TabsContent>
</Tabs>
<div className="flex flex-col  w-full p-1 items-center sm:flex-row  gap-2 justify-center">
<div className="flex flex-wrap   m  justify-between items-center gap-3 max-w-3xl w-full">
    <div className="flex items-center gap-2">
    <Image src={StabilskiStableCoin} width={64} height={64} alt="logo"  className="w-16 h-16"/>
    <p className="text-white">Stabilski.xyz</p>
  </div>

  <div className="flex items-center gap-4">
<Link href={'https://t.me/+x7c1r_FpS3YyYjVk'}>
  <FaTelegram size={30} className="text-[#24A1DE] bg-white rounded-full border border-[#24A1DE]"/>
</Link>


<Link href={'https://discord.gg/TeTbqc7HeK'}>
  <FaDiscord size={30} className="text-[#5865F2]"  />
</Link>

<Link href={'https://x.com/StabilskiO'}>
  <FaXTwitter size={24}  />
</Link>

<Link href={'https://github.com/Luftjunkie19/Stabilski-XYZ'}>
<FaGithub size={24} className="text-black"/>
</Link>
  </div>

</div>
  
</div>
    </div>
  );
}
