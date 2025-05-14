import React from 'react';
import { Link } from 'react-router-dom';

const LogoLink = () => (
    <Link to="/">
        <img
            src="/Logo.png"
            alt="Website Logo"
            className="h-10 hover:scale-101" // Размер логотипа (можно настроить)
        />
    </Link>
);

export default LogoLink;
