import React from 'react';
import { Link } from 'react-router-dom';
import { FiUserPlus, FiLogIn } from 'react-icons/fi';

const LoggedOutContent = () => {
    return (
        <div className="flex flex-col max-w-7xl mx-auto px-4 sm:px-20 py-12">
            <h1 className="text-3xl font-semibold text-white px-3">
                Welcome to GoodPrice Tender Platform
            </h1>

            <div className="bg-[#222224] p-8 rounded-2xl border border-1 border-gray-600 shadow-lg shadow-[0px_0px_8px_0px_rgba(255,255,255,0.1)] mt-6 animate-fade-in">
                <div className="max-w-2xl mx-auto text-center">
                    <p className="text-xl font-medium text-white mb-6">
                        Participate in tenders with GoodPrice and connect with
                        our company to supply goods and services efficiently.
                    </p>

                    <p className="text-base text-gray-300 mb-8 leading-relaxed">
                        Sign up or log in to access tender opportunities, submit
                        your bids, and manage your participation seamlessly with
                        our intuitive platform.
                    </p>

                    <div
                        className="flex justify-center gap-6"
                        style={{ animationDelay: '0.1s' }}
                    >
                        <Link
                            to="/signup"
                            className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white text-lg font-medium rounded-md hover:from-orange-700 hover:to-orange-600 hover:shadow-[0_0_6px_rgba(249,115,22,0.6)] hover:scale-105 focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-[#222224] transition-all duration-200 animate-fade-in"
                            aria-label="Sign up for GoodPrice Tender Platform"
                        >
                            <FiUserPlus className="text-xl" />
                            <span>Sign Up</span>
                        </Link>
                        <Link
                            to="/login"
                            className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-lg font-medium rounded-md hover:from-blue-700 hover:to-blue-600 hover:shadow-[0_0_6px_rgba(59,130,246,0.6)] hover:scale-105 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#222224] transition-all duration-200 animate-fade-in"
                            aria-label="Log in to GoodPrice Tender Platform"
                        >
                            <FiLogIn className="text-xl" />
                            <span>Login</span>
                        </Link>
                    </div>
                </div>
            </div>
            <style jsx>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out;
                }
            `}</style>
        </div>
    );
};

export default LoggedOutContent;
