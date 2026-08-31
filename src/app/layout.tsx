import "@/styles/globals.css";
import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
export const metadata:Metadata={ title:"GermanMaster Pro", description:"منصة ألمانية تكيفية للناطقين بالعربية" };
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ar" dir="rtl"><body><Providers>{children}</Providers></body></html>}
