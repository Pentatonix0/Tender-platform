import React, { useEffect, useState } from 'react';
import { useAuth } from '../utils/auth';
import LoggedOutContent from '../components/pages/home_page/LoggedOutContent';
import LoggedInAdminContent from '../components/pages/home_page/LoggedInAdminContent';
import LoggedInUserContent from '../components/pages/home_page/LoggedInUserContent';

const HomePage = () => {
    const [loading, setLoading] = useState(true);
    const [logged] = useAuth();
    const token = JSON.parse(localStorage.getItem('REACT_TOKEN_AUTH_KEY'));

    // Handle to not have redirection on refresh
    useEffect(() => {
        setLoading(false);
    }, [logged]);

    if (loading) {
        return null;
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
