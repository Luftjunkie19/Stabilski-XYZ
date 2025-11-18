
import Image from "next/image";
import StabilskiStableCoin from '@/public/Logox192.png'
import {FaXTwitter, FaTelegram, FaDiscord, FaGithub } from "react-icons/fa6"
import Link from "next/link";
import TabsContainer from "../components/tabs/TabsContainer";



export default function Home() {
  return (
    <div className="h-screen flex justify-between items-center w-full flex-col">
 
 <TabsContainer/>

<div className="flex flex-col  w-full p-1 items-center sm:flex-row  gap-2 justify-center">
<div className="flex flex-wrap   m  justify-between items-center gap-3 max-w-3xl w-full">
    <div className="flex items-center gap-2">
    <Image src={StabilskiStableCoin} width={64} height={64} alt="logo"  className="w-16 h-16"/>
    <p className="text-white">Stabilski.xyz</p>
  </div>

  <div className="flex items-center gap-4">
<Link target="_blank"
href={'https://t.me/+x7c1r_FpS3YyYjVk'}>
  <FaTelegram size={30} className="text-[#24A1DE] bg-white rounded-full border border-[#24A1DE]"/>
</Link>


<Link
target="_blank"
href={'https://github.com/Luftjunkie19/Stabilski-XYZ'}>
<FaGithub size={24} className="text-black"/>
</Link>
  </div>

</div>
  
</div>
    </div>
  );
}
