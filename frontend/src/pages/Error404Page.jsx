import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiAlertTriangle } from 'react-icons/fi';

const Error404Page = () => {
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-[#18181A] flex items-center justify-center sm:px-6 lg:px-8 bg-[#1a1a1c]">
            <div className="bg-[#222224] max-w-md w-full p-8 border border-1 border-gray-600 rounded-2xl shadow-lg shadow-[0px_0px_8px_0px_rgba(255,255,255,0.1)] text-center">
                <FiAlertTriangle className="text-orange-500 text-5xl mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-white mb-2">
                    Error 404
                </h1>
                <p className="text-base text-gray-300 mb-6">
                    Page not found. It looks like you've wandered off the path.
                </p>
                <button
                    onClick={handleGoHome}
                    className="w-full sm:w-auto px-9 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white text-lg font-medium rounded-md hover:from-orange-700 hover:to-orange-600 hover:shadow-[0_0_6px_rgba(249,115,22,0.6)] hover:scale-105 focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-[#222224] transition-all duration-200"
                    aria-label="Return to home page"
                >
                    Return to Home
                </button>
            </div>
        </div>
    );
};

export default Error404Page;
