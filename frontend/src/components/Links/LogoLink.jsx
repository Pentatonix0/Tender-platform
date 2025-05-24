import React from 'react';
import { Link } from 'react-router-dom';

const LogoLink = () => (
    <div className="min-w-14">
        <Link to="/">
            <img
                src="/Logo.png"
                alt="Website Logo"
                className="h-12 hover:scale-101" // Размер логотипа (можно настроить)
            />
        </Link>
    </div>
);

export default LogoLink;
