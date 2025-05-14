import React, { useEffect, useState } from 'react';
import { useAuth } from './auth'; // Предполагаем, что useAuth возвращает состояние авторизации
import Error404Page from '../pages/Error404Page';
import AuthRequiredPage from '../pages/AuthRequiredPage';

const PrivateRoute = ({ children, adminRequired = false }) => {
    const [loading, setLoading] = useState(true);
    const [logged] = useAuth();
    const token = JSON.parse(localStorage.getItem('REACT_TOKEN_AUTH_KEY'));
    const isAdmin = token && token.role === 'admin';

    // Handle to not have redirection on refresh
    useEffect(() => {
        setLoading(false);
    }, [logged]);

    if (loading) {
        return null;
    }
    // Если пользователь не авторизован, перенаправляем на страницу входа
    if (!logged) {
        return <AuthRequiredPage />;
    }
    if ((adminRequired && !isAdmin) || (logged && !adminRequired && isAdmin)) {
        return <Error404Page />;
    }

    // Если авторизован — отображаем дочерние компоненты
    return children;
};

export default PrivateRoute;
