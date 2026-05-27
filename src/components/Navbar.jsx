import { useState, useEffect } from "react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 50) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // UPDATE: Tambah menu Projects dan sesuaikan ID link-nya
  const navLinks = [
    { name: "Home", href: "#beranda" },
    { name: "About", href: "#tentang" },
    { name: "Experience", href: "#experience" },
    { name: "Projects", href: "#projects" },
    { name: "Contact", href: "#kontak" },
  ];

  return (
    <header 
      className={`fixed left-1/2 w-[calc(100%-2rem)] max-w-6xl z-50 transition-all duration-500 ease-in-out ${
        isVisible ? "top-4 -translate-x-1/2 opacity-100" : "-top-24 -translate-x-1/2 opacity-0"
      }`}
    >
      <div className="flex items-center justify-between rounded-full px-5 py-3 md:px-8 bg-blue-950/80 backdrop-blur-xl border border-blue-700/50 shadow-lg">
        
        <a 
          href="#" 
          className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300"
        >
          @adnankurniawann
        </a>

        <ul className="hidden md:flex items-center gap-6 lg:gap-8">
          {navLinks.map((link, index) => (
            <li key={index}>
              <a 
                href={link.href} 
                className="text-blue-100 hover:text-white text-sm font-medium transition-colors relative group"
              >
                {link.name}
                <span className="absolute -bottom-1.5 left-0 w-0 h-[2px] bg-blue-400 transition-all duration-300 group-hover:w-full rounded-full"></span>
              </a>
            </li>
          ))}
        </ul>

        <button 
          className="md:hidden text-blue-200 hover:text-white text-2xl transition-colors focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <i className={isMenuOpen ? "ri-close-line" : "ri-menu-3-line"}></i>
        </button>
      </div>

      <div 
        className={`md:hidden absolute top-full left-0 right-0 mt-3 rounded-2xl bg-blue-950/90 backdrop-blur-xl border border-blue-800/50 shadow-2xl transition-all duration-400 transform origin-top ${
          isMenuOpen ? "scale-y-100 opacity-100 visible" : "scale-y-95 opacity-0 invisible"
        }`}
      >
        <ul className="flex flex-col p-2">
          {navLinks.map((link, index) => (
            <li key={index}>
              <a 
                href={link.href} 
                onClick={() => setIsMenuOpen(false)}
                className="block text-center text-blue-100 hover:text-white hover:bg-blue-900/50 py-3 rounded-xl text-base font-medium transition-all duration-300"
              >
                {link.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
};

export default Navbar;