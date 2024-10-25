'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignInButton, SignUpButton, UserButton, SignedIn, SignedOut, useClerk, useUser } from "@clerk/nextjs";
import { Home, Users, PlusCircle, Search, LogOut, Settings, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  icon: React.ComponentType<any>;
  onClick?: () => void;
}

const NavLink = ({ href, children, icon: Icon, onClick }: NavLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link 
      href={href} 
      className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
        isActive 
          ? 'text-orange-500 bg-orange-50' 
          : 'text-gray-700 hover:text-orange-500 hover:bg-gray-50'
      }`}
      onClick={onClick}
    >
      <Icon size={20} />
      {children}
    </Link>
  );
};

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useUser();
  const { signOut } = useClerk();
  const isInCommunity = pathname?.startsWith('/r/');
  const communityName = isInCommunity ? pathname.split('/')[2] : null;

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center gap-6">
            <Link href="/" className="text-orange-500 text-xl font-bold">
              MiniReddit
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              <NavLink href="/" icon={Home}>
                Home
              </NavLink>
              <NavLink href="/communities" icon={Users}>
                Communities
              </NavLink>
              <SignedIn>
                {isInCommunity ? (
                  <NavLink href={`/r/${communityName}/submit`} icon={PlusCircle}>
                    Create Post
                  </NavLink>
                ) : (
                  <NavLink href="/submit" icon={PlusCircle}>
                    Create Post
                  </NavLink>
                )}
                <NavLink href="/create-community" icon={PlusCircle}>
                  Create Community
                </NavLink>
              </SignedIn>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl mx-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search MiniReddit"
              className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            />
          </div>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-2">
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="ghost">
                  Log In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button>
                  Sign Up
                </Button>
              </SignUpButton>
            </SignedOut>
            
            <SignedIn>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div>
                    <UserButton 
                      afterSignOutUrl="/"
                      appearance={{
                        elements: {
                          avatarBox: "w-10 h-10"
                        }
                      }}
                    />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link 
                      href={`/u/${user?.username}`}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <User size={16} />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link 
                      href="/settings"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Settings size={16} />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="flex items-center gap-2 cursor-pointer text-red-500 hover:text-red-600"
                    onClick={() => signOut()}
                  >
                    <LogOut size={16} />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SignedIn>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <SignedIn>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div>
                    <UserButton afterSignOutUrl="/" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link 
                      href={`/u/${user?.username}`}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <User size={16} />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link 
                      href="/settings"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Settings size={16} />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="flex items-center gap-2 cursor-pointer text-red-500 hover:text-red-600"
                    onClick={() => signOut()}
                  >
                    <LogOut size={16} />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SignedIn>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="flex flex-col py-4">
              {/* Mobile Search */}
              <div className="px-4 mb-4 relative">
                <Search className="absolute left-7 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search MiniReddit"
                  className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>
              
              {/* Mobile Navigation Links */}
              <div className="px-4 space-y-1">
                <NavLink href="/" icon={Home} onClick={() => setIsMobileMenuOpen(false)}>
                  Home
                </NavLink>
                <NavLink href="/communities" icon={Users} onClick={() => setIsMobileMenuOpen(false)}>
                  Communities
                </NavLink>
                <SignedIn>
                  {isInCommunity ? (
                    <NavLink 
                      href={`/r/${communityName}/submit`} 
                      icon={PlusCircle}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Create Post
                    </NavLink>
                  ) : (
                    <NavLink 
                      href="/submit" 
                      icon={PlusCircle}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Create Post
                    </NavLink>
                  )}
                  <NavLink 
                    href="/create-community" 
                    icon={PlusCircle}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Create Community
                  </NavLink>
                </SignedIn>
              </div>

              {/* Mobile Auth Buttons */}
              <div className="px-4 mt-4">
                <SignedOut>
                  <div className="space-y-2">
                    <SignInButton mode="modal">
                      <Button 
                        variant="ghost"
                        className="w-full"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Log In
                      </Button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <Button
                        className="w-full"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Sign Up
                      </Button>
                    </SignUpButton>
                  </div>
                </SignedOut>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}