import React, { useEffect, useState } from 'react';
import { useAuth } from '../utils/auth';
import LoggedOutContent from '../components/pages/home_page/LoggedOutContent';
import LoggedInAdminContent from '../components/pages/home_page/LoggedInAdminContent';
import LoggedInUserContent from '../components/pages/home_page/LoggedInUserContent';
import UsersPageContent from '../components/pages/users_page/UsersPageContent';

const UsersPage = () => {
    return (
        <div className="min-h-screen bg-[#18181A] flex flex-col">
            <main className="flex-grow">
                <UsersPageContent />
            </main>
        </div>
    );
};

export default UsersPage;
