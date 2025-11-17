'use client';

import React from 'react'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";


import IntroTab from './IntroTab';
import ColltateralTab from './ColltateralTab';
import BridgeTab from './BridgeTab';
import BorrowTab from './BorrowTab';



function TabsContainer() {

  return (
      <Tabs defaultValue="intro" className="max-w-7xl flex justify-center items-center mx-auto mt-8 w-full p-3">
  <TabsList className="self-start overflow-x-auto w-full max-w-xl ">
    <TabsTrigger value="intro">Introduction</TabsTrigger>
    <TabsTrigger value="collateral">Supply Tokens</TabsTrigger>
    <TabsTrigger value="borrow">Borrow PLST</TabsTrigger>
    <TabsTrigger value="bridge">Bridge Tokens</TabsTrigger>
  </TabsList>


<IntroTab/>

<ColltateralTab/>

<BorrowTab/>

<BridgeTab/>

</Tabs>
  )
}

export default TabsContainer