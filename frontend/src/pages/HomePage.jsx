import React, { useEffect, useState } from 'react';
import { useAuth } from '../utils/auth';
import axios from 'axios';
import { logout } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import LoggedOutContent from '../components/pages/home_page/LoggedOutContent';
import LoggedInAdminContent from '../components/pages/home_page/LoggedInAdminContent';
import LoggedInUserContent from '../components/pages/home_page/LoggedInUserContent';

const HomePage = () => {
    const [loading, setLoading] = useState(true);
    const [logged] = useAuth();
    const [isValid, setIsValid] = useState(true);
    const navigate = useNavigate();
    const token = JSON.parse(localStorage.getItem('REACT_TOKEN_AUTH_KEY'));

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
        setLoading(false);
    }, [logged]);

    if (loading) {
        return null;
    }
    if (!loading && logged && isValid === false) {
        localStorage.removeItem('REACT_TOKEN_AUTH_KEY');
        logout();
        navigate('/');
    }
    return (
        <div className="min-h-screen bg-[#18181A] flex flex-col">
            <main className="flex-grow">
                {logged ? (
                    token?.role === 'admin' ? (
                        <LoggedInAdminContent />
                    ) : (
                        <LoggedInUserContent />
                    )
                ) : (
                    <LoggedOutContent />
                )}
            </main>
        </div>
    );
};

export default HomePage;
