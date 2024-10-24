// src/components/Navbar.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignInButton, SignUpButton, UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { Home, Users, PlusCircle, Search, LucideIcon, Edit } from 'lucide-react';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  icon: LucideIcon;
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

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
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
                  <NavLink href={`/r/${communityName}/submit`} icon={Edit}>
                    Create Post
                  </NavLink>
                ) : (
                  <NavLink href="/submit" icon={Edit}>
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
                <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                  Log In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors">
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>
            
            <SignedIn>
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10"
                  }
                }}
              />
            </SignedIn>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
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
                      icon={Edit}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Create Post
                    </NavLink>
                  ) : (
                    <NavLink 
                      href="/submit" 
                      icon={Edit}
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
              <div className="px-4 mt-4 space-y-2">
                <SignedOut>
                  <SignInButton mode="modal">
                    <button 
                      className="w-full px-4 py-2 text-center text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Log In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button 
                      className="w-full px-4 py-2 text-center text-white bg-orange-500 hover:bg-orange-600 rounded-md transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign Up
                    </button>
                  </SignUpButton>
                </SignedOut>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;