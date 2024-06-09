import Image from "next/image";
import Nav from '@/components/nav'
import Hero from '@/components/hero'
import Faq from '@/components/faq'

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900">
      <Hero/>

      <Faq/>
    </div>
  );
}
