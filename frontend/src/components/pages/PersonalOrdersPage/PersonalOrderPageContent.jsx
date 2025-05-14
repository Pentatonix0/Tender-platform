import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCloudDownloadAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Loading from '../../common/universal_components/Loading';

const PersonalOrderPageContent = () => {
    const [loadingStates, setLoadingStates] = useState({}); // Object to track loading state per button
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState(null);
    const token = JSON.parse(localStorage.getItem('REACT_TOKEN_AUTH_KEY'));

    useEffect(() => {
        const getOrders = async () => {
            try {
                const response = await axios.get(
                    '/api/order/get_personal_orders',
                    {
                        headers: {
                            Authorization: `Bearer ${token.access_token}`,
                        },
                    }
                );

                setOrders(response.data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
            }
        };
        if (loading) {
            getOrders();
        }
    }, [token]);

    const setButtonLoading = (key, isLoading) => {
        setLoadingStates((prev) => ({ ...prev, [key]: isLoading }));
    };

    const handleDownload = async (personalOrder) => {
        const key = `personalOrder_${personalOrder.id}`;
        setButtonLoading(key, true);
        try {
            const response = await axios.get(
                `/api/order/download_personal_order?personal_order_id=${personalOrder.id}&filename=${personalOrder.order.title}`,
                {
                    headers: {
                        Authorization: `Bearer ${token.access_token}`,
                    },
                    responseType: 'blob',
                }
            );
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.download = `${personalOrder.order.title}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error fetching summary:', error);
            toast.error('Downloading failed', {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: 'dark',
            });
        } finally {
            setButtonLoading(key, false);
        }
    };

    return (
        <div>
            <div className="flex flex-col max-w-7xl mx-auto px-20 py-8">
                <h1 className="text-2xl px-3 font-base font mb-2 text-white">
                    Personal orders
                </h1>
                <div className="bg-[#222224] p-8 rounded-3xl shadow-base mt-2 border border-1 border-gray-600 space-y-4">
                    {loading && <Loading />}
                    {orders.length === 0 && !loading ? (
                        <p className="text-gray-400 text-center text-sm">
                            No orders found
                        </p>
                    ) : (
                        orders.map((personalOrder) => (
                            <div
                                key={personalOrder.id}
                                className="bg-[#39393A] rounded-lg p-4 mb-4 flex justify-between items-center border border-1 border-gray-600 hover:scale-101 hover:shadow-[0_0_8px_rgba(209,209,209,0.5)] transition-all duration-300 animate-slide-in box-border animate-fade-in"
                            >
                                <div>
                                    <h2 className="text-lg font-semibold text-white">
                                        {personalOrder.order.title}
                                    </h2>
                                </div>
                                {personalOrder.is_empty ? (
                                    <div className="px-4 py-2 text-white text-sm font-medium rounded-md border border-1 border-red-500">
                                        The order is empty due to pricing
                                    </div>
                                ) : (
                                    <button
                                        onClick={() =>
                                            handleDownload(personalOrder)
                                        }
                                        disabled={
                                            loadingStates[
                                                `personalOrder_${personalOrder.id}`
                                            ]
                                        }
                                        className={`px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white text-sm font-medium rounded-md hover:from-orange-700 hover:to-orange-600 hover:shadow-[0_0_6px_rgba(249,115,22,0.6)] hover:scale-101 focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-[#39393A] transition-all duration-200 flex items-center justify-center space-x-2 ${
                                            loadingStates[
                                                `personalOrder_${personalOrder.id}`
                                            ]
                                                ? 'opacity-50 cursor-not-allowed'
                                                : ''
                                        }`}
                                        aria-label={`Download order ${personalOrder.order.title}`}
                                    >
                                        {loadingStates[
                                            `personalOrder_${personalOrder.id}`
                                        ] ? (
                                            <span>Loading...</span>
                                        ) : (
                                            <>
                                                <FaCloudDownloadAlt className="text-lg" />
                                                <span>Download order</span>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        ))
                    )}
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
                .hover\\:scale-101:hover {
                    transform: scale(1.01);
                }
            `}</style>
        </div>
    );
};

export default PersonalOrderPageContent;
