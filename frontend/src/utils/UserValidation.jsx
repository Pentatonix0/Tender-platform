import React, { useState, useEffect } from 'react';
import { useAuth } from './auth';

const UserValidator = ({
    loggedOutCont: LoggedOutCont,
    loggedInUserCont: LoggedInUserCont,
    loggedInAdminCont: LoggedInAdminCont,
}) => {
    const [loading, setLoading] = useState(true);
    const [logged] = useAuth();
    const token = JSON.parse(localStorage.getItem('REACT_TOKEN_AUTH_KEY'));

    useEffect(() => {
        setLoading(false);
    }, [logged]);

    if (loading) {
        return null;
    }

    return (
        <>
            {logged ? (
                token.role === 'admin' ? (
                    <LoggedInAdminCont />
                ) : (
                    <LoggedInUserCont />
                )
            ) : (
                <LoggedOutCont />
            )}
        </>
    );
};

export default UserValidator;
