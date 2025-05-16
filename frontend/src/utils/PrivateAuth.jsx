import React, { useEffect, useState } from 'react';
import { useAuth } from './auth'; // Предполагаем, что useAuth возвращает состояние авторизации
import { logout } from './auth';
import axios from 'axios';
import Error404Page from '../pages/Error404Page';
import AuthRequiredPage from '../pages/AuthRequiredPage';
import { useNavigate } from 'react-router-dom';

const PrivateRoute = ({ children, adminRequired = false }) => {
    const [loading, setLoading] = useState(true);
    const [isValid, setIsValid] = useState(true);
    const [logged] = useAuth();
    const navigate = useNavigate();
    const token = JSON.parse(localStorage.getItem('REACT_TOKEN_AUTH_KEY'));
    const isAdmin = token && token.role === 'admin';

    // Handle to not have redirection on refresh
    useEffect(() => {
        const ValidateUser = async () => {
            console.log(token);
            const response = await axios.get('api/auth/validate_user', {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token.access_token}`,
                },
            });

            setIsValid(response.data['is_valid']);
        };

        if (token) {
            ValidateUser();
            setLoading(false);
        }
    }, [logged]);

    if (loading) {
        return null;
    }
    if (!loading && logged && isValid === false) {
        localStorage.removeItem('REACT_TOKEN_AUTH_KEY');
        logout();
        navigate('/');
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
