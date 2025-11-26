'use client';
import React from 'react'
import { TabsContent } from '../ui/tabs'
import Header from '../ui/Header'
import ProjectDetails from '../tabs/intro/ProjectDetails'
import StabilskiHero from './intro/StabilskiHero';

function IntroTab() {
  return (
  <TabsContent value="intro" className="flex flex-col gap-6 max-w-4xl w-full">
    <Header/>

    <StabilskiHero/>

<ProjectDetails/>
  </TabsContent>
  )
}

export default IntroTab