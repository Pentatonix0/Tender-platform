import React from 'react';
import { Link } from 'react-router-dom';

const IsPartisipating = ({ orderId, status }) => {
    switch (status) {
        case 100:
            return (
                <div className="flex justify-end animate-slide-in">
                    <Link to={`/order/${orderId}`}>
                        <button
                            className="bg-[#FF5F00] text-white text-base w-32 py-3 rounded-lg font-base hover:bg-red-600 hover:scale-105 hover:shadow-[0_0_8px_rgba(255,95,0,0.6)] focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-[#18181A] transition-all duration-200"
                            aria-label="Participate in order"
                        >
                            Participate
                        </button>
                    </Link>
                </div>
            );
        case 101:
        case 102:
            return (
                <div className="flex justify-between items-center animate-slide-in">
                    <div className="mt-6 text-xs font-base text-indigo-400 animate-fade-in">
                        You are participating
                    </div>
                    <div className="w-32">
                        <Link to={`/order/${orderId}`}>
                            <button
                                className="bg-[#39393A] w-full py-3 text-white text-base rounded-lg font-base border-2 border-indigo-400 hover:bg-[#4A4A4C] hover:shadow-[0_0_8px_rgba(99,102,241,0.6)] hover:scale-105 focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-[#18181A] transition-all duration-200"
                                aria-label="View order details"
                            >
                                Details
                            </button>
                        </Link>
                    </div>
                </div>
            );
        case 103:
        case 104:
            return (
                <div className="flex justify-between items-center animate-slide-in">
                    <div className="mt-6 text-xs font-base text-[#faed27] animate-fade-in">
                        You can offer a lower price
                    </div>
                    <div className="w-32">
                        <Link to={`/order/${orderId}`}>
                            <button
                                className="bg-[#39393A] w-full py-3 text-white text-base rounded-lg font-base border-2 border-[#faed27] hover:bg-[#4A4A4C] hover:shadow-[0_0_8px_rgba(250,237,39,0.6)] hover:scale-105 focus:ring-2 focus:ring-[#faed27] focus:ring-offset-2 focus:ring-offset-[#18181A] transition-all duration-200"
                                aria-label="Offer a lower price"
                            >
                                Offer
                            </button>
                        </Link>
                    </div>
                </div>
            );
        default:
            return <span className="text-gray-400">{status}</span>;
    }
};

export default React.memo(IsPartisipating);
