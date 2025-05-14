import React from 'react';
import PersonalOrderPageContent from '../components/pages/PersonalOrdersPage/PersonalOrderPageContent';

const PersonalOrderPage = () => {
    return (
        <div className="min-h-screen bg-[#18181A] flex flex-col">
            <main className="flex-grow">
                <PersonalOrderPageContent />
            </main>
        </div>
    );
};

export default PersonalOrderPage;
