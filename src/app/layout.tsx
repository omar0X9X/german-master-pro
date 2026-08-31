import "@/styles/globals.css";
import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import { PWARegister } from "@/components/PWARegister";
export const metadata:Metadata={ title:"GermanMaster Pro", description:"منصة ألمانية تكيفية للناطقين بالعربية", manifest:"/manifest.webmanifest", themeColor:"#2563EB" };
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ar" dir="rtl"><body><Providers><PWARegister/>{children}</Providers></body></html>}
