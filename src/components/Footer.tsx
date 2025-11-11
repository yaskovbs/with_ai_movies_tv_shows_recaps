import { Link } from 'react-router-dom';
import { Film, Youtube } from 'lucide-react';

const Footer = () => {
  const navLinks = [
    { path: '/', label: 'בית' },
    { path: '/contact', label: 'צור קשר' },
    { path: '/faq', label: 'שאלות נפוצות' },
  ];

  const legalLinks = [
    { path: '/terms', label: 'תנאי שימוש' },
    { path: '/privacy', label: 'מדיניות פרטיות' },
  ];

  return (
    <footer className="bg-gray-800 border-t border-gray-700 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and About */}
          <div className="space-y-4">
            <Link to="/">
              <div 
                className="flex items-center cursor-pointer"
              >
                <Film className="h-8 w-8 text-blue-400 ml-3" />
                <div className="text-right">
                  <h1 className="text-xl font-bold">Movies & TV Recaps</h1>
                  <p className="text-sm text-gray-400">יוצר סיכומי סרטים וסדרות</p>
                </div>
              </div>
            </Link>
            <p className="text-gray-400 text-sm max-w-xs">
              הפלטפורמה המובילה ליצירת סיכומי וידאו חכמים באמצעות טכנולוגיית AI מתקדמת.
            </p>
          </div>

          {/* Links */}
          <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">ניווט</h3>
              <ul className="mt-4 space-y-2">
                {navLinks.map(link => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-base text-gray-300 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">משפטי</h3>
              <ul className="mt-4 space-y-2">
                {legalLinks.map(link => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-base text-gray-300 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
             <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">עקבו אחרינו</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <a
                    href="https://youtube.com/@movies_and_tv_show_recap?si=KmCPgoiLvOaDQlu3"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-base text-gray-300 hover:text-red-400 transition-colors"
                  >
                    <Youtube className="h-5 w-5 ml-2" />
                    ערוץ YouTube שלנו
                  </a>
                </li>
                <li className="text-gray-400 text-sm">yaskovbs2502@gmail.com</li>
                <li className="text-gray-400 text-sm">050-818-1948</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-base text-gray-400 mb-4 md:mb-0">&copy; {new Date().getFullYear()} Movies & TV Recaps Maker Hub. כל הזכויות שמורות.</p>
            <a
              href="https://youtube.com/@movies_and_tv_show_recap?si=KmCPgoiLvOaDQlu3"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Youtube className="h-5 w-5 ml-2" />
              הצטרפו לערוץ YouTube שלנו
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
