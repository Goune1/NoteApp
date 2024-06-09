"use client"

import { useState, useEffect } from 'react'
import { Dialog } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
// @ts-ignore
import Cookies from 'js-cookie'
import { LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navigation = [
  { name: 'Accueil', href: '/' },
  { name: 'Journal', href: '/journal' },
  { name: 'Chat', href: '/chat'}
]

const pp = Cookies.get('pp')

export default function Example() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [username, setUsername] = useState()
  // @ts-ignore
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogout = () => {
    // Supprimer le cookie de l'utilisateur
    Cookies.remove('username');
    Cookies.remove('email')
  };


  useEffect(() => {
      const usernameCookie = Cookies.get('username');
      if (usernameCookie) {
        setIsLoggedIn(true);
        setUsername(usernameCookie)
      } else {
        setIsLoggedIn(false);
      }
  }, []);

  return (
    <header className="">
      <nav className=" flex  items-center justify-between p-1 ml-2 lg:ml-20" aria-label="Global">
        <div className="flex items-center gap-x-12">
          <a href="/" className='-m-1.5 p-1.5'>
            <img className="h-24 w-24" src="logo.png" alt="" />
          </a>
          <div className="hidden lg:flex lg:gap-x-12">
            {navigation.map((item) => (
              <a key={item.name} href={item.href} className="text-sm font-semibold leading-6 text-white hover:text-indigo-600">
                {item.name}
              </a>
            ))}
          </div>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-white"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className="h-6 w-6 mr-3" aria-hidden="true" />
          </button>
        </div>
        <div className="hidden lg:flex">
          {isLoggedIn ? (
            <DropdownMenu >
              <DropdownMenuTrigger asChild>
                <h1 className='text-white mr-8 font-semibold cursor-pointer'>{username}</h1>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="dark w-56">
                <div className='flex cursor-pointer'>
                  <LogOut/>
                  <a className='-mt-0.5 ml-1' href='/' onClick={handleLogout}>Se déconnecter</a>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            
          ) : (
            <a href='/login' className="text-sm font-semibold leading-6 text-white cursor-pointer mr-4">
              Se connecter<span aria-hidden="true">&rarr;</span>
            </a>
          )}
        </div>
      </nav>
      <Dialog as="div" className="lg:hidden" open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)}>
        <div className="fixed inset-0 z-10" />
        <Dialog.Panel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-slate-900 px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <a href="#" className="-m-1.5 p-1.5">
              <span className="sr-only">Your Company</span>
              <img className="h-10 w-auto" src="spotify.webp" alt="" />
            </a>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-white "
                  >
                    {item.name}
                  </a>
                ))}
              </div>
              <div className="py-6">
              {isLoggedIn ? (
                <>
                  <h1 className='text-white mr-8 font-semibold cursor-pointer'>{username}</h1>
                  <div className='flex cursor-pointer mt-4'>
                    <LogOut className='text-white'/>
                    <a className='-mt-0.5 ml-1 text-white' href='/' onClick={handleLogout}>Se déconnecter</a>
                  </div>
                 
                </>
              ) : (
                <a href='/login' className="text-sm font-semibold leading-6 text-white cursor-pointer">
                  Se connecter<span aria-hidden="true">&rarr;</span>
                </a>
              )}
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  )
}
