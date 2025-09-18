
import React from 'react';

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);


function Header() {
  return (
    <header className="w-full max-w-2xl mx-auto py-6 mb-4">
      <div className="flex items-center justify-center space-x-3">
        <SearchIcon />
        <h1 className="text-3xl sm:text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-violet-500">
          AI Scavenger Hunt
        </h1>
      </div>
    </header>
  );
}

export default Header;
