import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-neutral-100 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center mr-3 shadow-lg">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-2xl font-bold text-neutral-900 tracking-tight">PeraBida</span>
            </div>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-10">
              <button 
                onClick={() => scrollToSection('features')}
                className="text-neutral-600 hover:text-primary transition-all duration-200 font-medium"
                data-testid="nav-features"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('education')}
                className="text-neutral-600 hover:text-primary transition-all duration-200 font-medium"
                data-testid="nav-education"
              >
                Learn
              </button>
              <button 
                onClick={() => scrollToSection('currency')}
                className="text-neutral-600 hover:text-primary transition-all duration-200 font-medium"
                data-testid="nav-currency"
              >
                Currency
              </button>
              <Button 
                onClick={() => scrollToSection('signup')}
                className="bg-gradient-to-r from-primary to-blue-600 text-white hover:shadow-lg hover:scale-105 transition-all duration-200 px-6 py-2.5 rounded-xl font-semibold"
                data-testid="nav-get-started"
              >
                Get Started
              </Button>
            </div>
          </div>
          
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              data-testid="mobile-menu-toggle"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-b border-gray-100">
            <button 
              onClick={() => scrollToSection('features')}
              className="block px-3 py-2 text-neutral-500 hover:text-primary transition-colors w-full text-left"
              data-testid="mobile-nav-features"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('education')}
              className="block px-3 py-2 text-neutral-500 hover:text-primary transition-colors w-full text-left"
              data-testid="mobile-nav-education"
            >
              Learn
            </button>
            <button 
              onClick={() => scrollToSection('currency')}
              className="block px-3 py-2 text-neutral-500 hover:text-primary transition-colors w-full text-left"
              data-testid="mobile-nav-currency"
            >
              Currency
            </button>
            <Button 
              onClick={() => scrollToSection('signup')}
              className="w-full bg-primary text-white hover:bg-blue-700 mt-2"
              data-testid="mobile-nav-get-started"
            >
              Get Started
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
