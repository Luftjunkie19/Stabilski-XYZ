'use client';
import React from 'react'
import { TabsContent } from './ui/tabs'
import Header from './ui/Header'
import StabilskiXYZHero from './tabs/intro/StabilskiXYZHero'
import ProjectDetails from './tabs/intro/ProjectDetails'

function IntroTab() {
  return (
  <TabsContent value="intro" className="flex flex-col gap-3 max-w-4xl w-full">
    <Header/>
 
 <StabilskiXYZHero/>

<ProjectDetails/>
  </TabsContent>
  )
}

export default IntroTab