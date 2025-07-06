import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { BookOpen, Coins, Menu, X } from 'lucide-react';
import { ReferralModal } from '@/components/ReferralModal';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsScrolled(scrollTop > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAuthAction = () => {
    if (user) {
      if (profile?.is_admin) {
        navigate('/admin');
      } else {
        navigate('/student');
      }
    } else {
      navigate('/auth');
    }
  };

  const scrollToSection = (sectionId: string) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsOpen(false);
  };

  const handleCoinsClick = () => {
    if (user && profile?.is_admin !== true) {
      setShowReferralModal(true);
    }
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
        isScrolled 
          ? 'top-4 left-4 right-4 bg-white/80 backdrop-blur-md border border-gray-200 rounded-full shadow-lg' 
          : 'bg-white border-b border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className={`flex justify-between items-center transition-all duration-300 ${
            isScrolled ? 'h-14' : 'h-20'
          }`}>
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <BookOpen className={`text-yellow-500 transition-all duration-300 ${
                  isScrolled ? 'h-6 w-6' : 'h-8 w-8'
                }`} />
                <span className={`font-bold text-black transition-all duration-300 ${
                  isScrolled ? 'text-xl' : 'text-2xl'
                }`}>Skillur</span>
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center justify-center flex-1">
              <div className="flex items-center space-x-8">
                {['Home', 'subjects', 'features', 'developers'].map(section => (
                  <button
                    key={section}
                    onClick={() => scrollToSection(section)}
                    className={`text-gray-700 hover:text-black px-3 py-2 font-medium transition-colors ${
                      isScrolled ? 'text-sm' : 'text-base'
                    }`}
                  >
                    {section.charAt(0).toUpperCase() + section.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Desktop Items */}
            <div className="hidden md:flex items-center space-x-4">
              {user && profile && !profile.is_admin && (
                <button
                  onClick={handleCoinsClick}
                  className={`flex items-center space-x-2 bg-yellow-400 hover:bg-yellow-500 rounded-full transition-all duration-300 cursor-pointer ${
                    isScrolled ? 'px-3 py-1.5' : 'px-4 py-2'
                  }`}
                >
                  <Coins className={`text-black ${isScrolled ? 'h-4 w-4' : 'h-5 w-5'}`} />
                  <span className={`font-medium text-black ${isScrolled ? 'text-sm' : 'text-base'}`}>
                    {profile.coins}
                  </span>
                </button>
              )}
              <Button
                onClick={handleAuthAction}
                className={`bg-black hover:bg-gray-800 text-white rounded-full h-auto transition-all duration-300 ${
                  isScrolled ? 'px-5 py-1.5 text-sm' : 'px-6 py-2 text-base'
                }`}
              >
                {user ? (profile?.is_admin ? 'Admin Area' : 'Student Area') : 'Login'}
              </Button>
            </div>

            {/* Hamburger Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`bg-white inline-flex items-center justify-center rounded-full text-black hover:bg-gray-200 transition-all duration-300 ${
                  isScrolled ? 'p-2' : 'p-3'
                }`}
              >
                {isOpen ? (
                  <X className={isScrolled ? 'h-5 w-5' : 'h-6 w-6'} />
                ) : (
                  <Menu className={isScrolled ? 'h-5 w-5' : 'h-6 w-6'} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 mt-2 px-4 z-40">
            <div className="relative bg-white border border-gray-200 rounded-2xl shadow-2xl px-6 pt-4 pb-5 space-y-2">
              {['Home', 'subjects', 'features', 'developers'].map(section => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className="text-gray-700 hover:text-black block px-3 py-2 text-base font-medium w-full text-left hover:bg-gray-100 rounded-lg"
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </button>
              ))}
              {user && profile && !profile.is_admin && (
                <button
                  onClick={handleCoinsClick}
                  className="flex items-center space-x-2 bg-yellow-400 hover:bg-yellow-500 px-3 py-2 rounded-full mx-1 transition-colors w-fit"
                >
                  <Coins className="h-4 w-4 text-black" />
                  <span className="text-sm font-medium text-black">{profile.coins} Coins</span>
                </button>
              )}
              <div className="pt-2">
                <Button onClick={handleAuthAction} className="w-full bg-black hover:bg-gray-800 text-white rounded-full">
                  {user ? (profile?.is_admin ? 'Admin Area' : 'Student Area') : 'Login'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Space for fixed navbar */}
      <div className={`transition-all duration-300 ${isScrolled ? 'h-14' : 'h-20'}`} />

      <ReferralModal isOpen={showReferralModal} onClose={() => setShowReferralModal(false)} />
    </>
  );
}
