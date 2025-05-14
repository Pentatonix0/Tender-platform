import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import LogoLink from './LogoLink';
import AccountLink from './AccountLink';

const LoggedInAdminLinks = () => {
    const location = useLocation(); // Получаем текущий путь

    return (
        <div className="w-full flex items-center">
            <div className="flex-shrink-0">
                <LogoLink />
            </div>
            <div className="flex space-x-6 ml-6">
                <Link
                    className={`text-white text-sm hover:underline ${
                        location.pathname === '/' ? 'underline' : ''
                    }`}
                    to="/"
                >
                    Заказы
                </Link>
                <Link
                    className={`text-white text-sm hover:underline ${
                        location.pathname === '/clients-orders'
                            ? 'underline'
                            : ''
                    }`}
                    to="/clients-orders"
                >
                    Заказы клиентов
                </Link>
                <Link
                    className={`text-white text-sm hover:underline ${
                        location.pathname === '/stats' ? 'underline' : ''
                    }`}
                    to="/stats"
                >
                    Статистика
                </Link>
                <Link
                    className={`text-white text-sm hover:underline ${
                        location.pathname === '/users' ? 'underline' : ''
                    }`}
                    to="/users"
                >
                    Пользователи
                </Link>
            </div>
            <div className="mr-1 flex-shrink-0 ml-auto">
                <AccountLink />
            </div>
        </div>
    );
};

export default LoggedInAdminLinks;
