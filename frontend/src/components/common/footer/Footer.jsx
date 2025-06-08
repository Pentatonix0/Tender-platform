import React from 'react';
import { FaTwitter, FaGithub, FaLinkedin } from 'react-icons/fa';

const Footer = ({ companyName = 'Goodprice' }) => {
    const currentYear = new Date().getFullYear();

    return (
        <footer
            className="bg-[#18181A] py-8 border-t border-gray-600 mt-auto relative"
            aria-label="Site footer"
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center text-center text-gray-600 space-y-4">
                    <p className="text-sm font-medium">
                        © {currentYear} {companyName}. All rights reserved.
                    </p>
                </div>
            </div>
            {/* Незаметная надпись "created by" с ссылкой на Telegram */}
            <div className="absolute bottom-4 right-4 text-xs text-gray-500 opacity-50 hover:opacity-100 transition-opacity">
                created by{' '}
                <a
                    href="https://t.me/Guy_Ritchie_B"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gray-300"
                >
                    @Guy_Ritchie_B
                </a>
            </div>
        </footer>
    );
};

export default React.memo(Footer);
