const Footer = () => {
  return (
    // Tambahkan w-full agar background merentang ujung ke ujung layar
    <footer className="w-full mt-24 border-t border-blue-800/50 bg-blue-950/40 backdrop-blur-xl">
      
      {/* Container utama (max-w-7xl) agar isi footer tetap rapi sejajar di tengah */}
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row gap-8 justify-between items-center">
        
        {/* Logo/Nama disamakan dengan gaya Navbar */}
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent cursor-pointer hover:scale-105 transition-transform duration-300">
          @adnankurniawann
        </h1>
        
        {/* Menu Navigasi */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-10 text-blue-200 font-medium">
          <a href="#beranda" className="hover:text-white hover:-translate-y-1 transition-all duration-300">Home</a>
          <a href="#tentang" className="hover:text-white hover:-translate-y-1 transition-all duration-300">About</a>
          <a href="#proyek" className="hover:text-white hover:-translate-y-1 transition-all duration-300">Experience</a>
        </div>
        
        {/* Ikon Sosial Media dengan efek Hover Menyala */}
        <div className="flex items-center gap-6 text-blue-300">
          <a 
            href="https://github.com/adnankurniawann" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-white hover:-translate-y-1 hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-300"
          >
            <i className="ri-github-fill ri-2x"></i>
          </a>
          <a 
            href="https://www.linkedin.com/in/adnankurniawan/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-white hover:-translate-y-1 hover:drop-shadow-[0_0_10px_rgba(59,130,246,0.8)] transition-all duration-300"
          >
            <i className="ri-linkedin-fill ri-2x"></i>
          </a>
          <a 
            href="https://www.instagram.com/adnankurniawann/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-white hover:-translate-y-1 hover:drop-shadow-[0_0_10px_rgba(236,72,153,0.8)] transition-all duration-300"
          >
            <i className="ri-instagram-fill ri-2x"></i>
          </a>
        </div>
      </div>

      {/* Copyright Line */}
      <div className="border-t border-blue-800/30 py-6 text-center text-sm text-blue-400/60 font-medium tracking-wide w-full">
        &copy; {new Date().getFullYear()} Muhammad Adnan Kurniawan. All rights reserved.
      </div>
      
    </footer>
  );
};

export default Footer;