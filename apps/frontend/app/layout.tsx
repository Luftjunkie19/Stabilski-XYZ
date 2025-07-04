import type { Metadata } from "next";
import {  Audiowide
} from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/lib/Web3Provider";
import Navbar from "@/components/ui/Navbar";

// const poppins = Lexend({
//   variable: "--font-lexend",
//   weight:['100', '200', '300', '400', '500', '600', '700', '800', '900'],
//   style:["normal"],
//   subsets: ["latin"],
// });


const audiowide = Audiowide({
  variable: "--font-audiowide",
  weight:['400'],
  style:["normal"],
  subsets: ["latin"],
});



export const metadata: Metadata = {
  title: "Stabilski.xyz",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Web3Provider>
      <body
        className={`${audiowide.variable} antialiased`}
        >
        <Navbar/>
        {/* <HackerBackground className="bg-transparent" color="#ff3f3f"/> */}
        {children}
      </body>
      </Web3Provider>
    </html>
  );
}
