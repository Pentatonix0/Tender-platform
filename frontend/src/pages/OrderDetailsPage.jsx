import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiInfo, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import OrderDetailsTable from '../components/pages/order_details_page/OrderDetailsTable';
import Loading from '../components/common/universal_components/Loading';

const OrderDetail = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState({});
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState({});

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm();

    useEffect(() => {
        const fetchOrderData = async () => {
            try {
                const token = JSON.parse(
                    localStorage.getItem('REACT_TOKEN_AUTH_KEY')
                );
                const response = await axios.get(
                    `/api/order/order/${orderId}`,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token.access_token}`,
                        },
                    }
                );
                setOrder(response.data);
                console.log(response.data);
            } catch (error) {
                console.error('There was an error fetching order data:', error);
            } finally {
                setLoading(false);
            }
            console.order;
            console.log(order == {});
        };

        fetchOrderData();
    }, [orderId, navigate]);

    const handleCommentsChange = (newComments) => {
        setComments(newComments);
    };

    const onSubmit = async (data) => {
        if (order.deadline) {
            const deadline = new Date(order.deadline + 'Z');
            const now = new Date();
            if (deadline < now) {
                toast.warn('Deadline has expired, returning to homepage', {
                    position: 'top-right',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: 'dark',
                });

                navigate('/');
                return;
            }
        }

        const body = {
            order_id: parseInt(orderId),
            prices: order.last_prices.reduce((acc, item) => {
                const itemId = parseInt(item.price?.order_item?.id);
                acc[itemId] = {
                    item_id: itemId,
                    price: parseFloat(data[`price-${itemId}`]) || null,
                    comment: comments[itemId] || '',
                };
                return acc;
            }, {}),
        };
        try {
            const token = JSON.parse(
                localStorage.getItem('REACT_TOKEN_AUTH_KEY')
            );
            const response = await axios.post(`/api/order/offer_prices`, body, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token.access_token}`,
                },
            });
            if (response.status === 200) {
                toast.success('Prices successfully submitted', {
                    position: 'top-right',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: 'dark',
                });
                navigate('/');
            }
        } catch (error) {
            console.error('There was an error updating the order:', error);
            toast.error('Failed to send prices', {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: 'dark',
            });
        }
    };

    if (!loading && Object.keys(order).length === 0) {
        return (
            <div className="min-h-screen bg-[#18181A] py-12 flex justify-center">
                <div className="flex-col justify-center items-center h-48 bg-[#222224] p-8 rounded-2xl border border-1 border-gray-600 shadow-lg shadow-[0px_0px_8px_0px_rgba(255,255,255,0.1)] max-w-md text-center">
                    <FiAlertCircle className="text-orange-500 text-4xl mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-white mb-2">
                        Order not found
                    </h2>
                    <p className="text-base text-gray-300">
                        No order data available. Please check the order ID or
                        return to the order list.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#18181A] flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-5xl">
                <h1 className="text-3xl font-bold break-words text-white mb-4">
                    {order && !loading ? order.order.title : 'Loading Order...'}
                </h1>
                <div className="bg-[#222224] p-8 rounded-2xl border border-1 border-gray-600 shadow-lg shadow-[0px_0px_8px_0px_rgba(255,255,255,0.1)]">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loading />
                        </div>
                    ) : (
                        order && (
                            <form
                                onSubmit={handleSubmit(onSubmit)}
                                className="space-y-6"
                            >
                                {order &&
                                    !loading &&
                                    order.order.description && (
                                        <div>
                                            <h3 className="text-xl font-medium text-[#FFFFFF] mb-4">
                                                Description
                                            </h3>
                                            <p className="text-gray-300 text-base mb-6 max-w-full break-words line-clamp-3">
                                                {order.order.description}
                                            </p>
                                        </div>
                                    )}
                                {order.status.code !== 102 &&
                                    order.status.code !== 105 &&
                                    order.status.code !== 106 && (
                                        <div className="relative bg-gradient-to-r from-orange-900/20 to-gray-800/80 p-6 rounded-xl border border-orange-600/30 shadow-md animate-fade-in">
                                            <div className="flex items-start">
                                                <FiInfo className="text-orange-500 text-2xl mr-3 mt-1 flex-shrink-0" />
                                                <div>
                                                    <h2 className="text-xl font-semibold text-white mb-2">
                                                        How to Proceed
                                                    </h2>
                                                    <p className="text-sm text-gray-300 leading-relaxed">
                                                        Review the order details
                                                        in the table below.
                                                        Update the prices (use
                                                        whole numbers or
                                                        decimals with a dot,
                                                        e.g., 10 or 10.99) and
                                                        add comments for each
                                                        item as needed. When
                                                        ready, click the{' '}
                                                        <span className="text-orange-400 font-medium">
                                                            "Submit"
                                                        </span>{' '}
                                                        button to save your
                                                        changes.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                <OrderDetailsTable
                                    data={order}
                                    register={register}
                                    errors={errors}
                                    onCommentsChange={handleCommentsChange}
                                />
                                {order.status.code !== 102 &&
                                order.status.code !== 105 &&
                                order.status.code !== 106 ? (
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={`w-full sm:w-auto px-9 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white 
                                            text-lg font-medium rounded-md hover:from-orange-700 hover:to-orange-600 
                                            hover:shadow-[0_0_6px_rgba(249,115,22,0.6)] hover:scale-105 focus:ring-2 
                                            focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-[#222224] 
                                            transition-all duration-200 ${
                                                isSubmitting
                                                    ? 'opacity-50 cursor-not-allowed'
                                                    : ''
                                            }`}
                                        aria-label="Submit order changes"
                                    >
                                        {isSubmitting
                                            ? 'Submitting...'
                                            : 'Submit'}
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        className={`w-full sm:w-auto bg-gradient-to-r from-orange-600 to-orange-500 text-white 
                                            text-lg font-medium rounded-md hover:from-orange-700 hover:to-orange-600 
                                            hover:shadow-[0_0_6px_rgba(249,115,22,0.6)] hover:scale-105
                                            transition-all duration-200`}
                                        aria-label="Submit order changes"
                                    >
                                        <Link
                                            to="/"
                                            className="w-full px-9 py-3 h-full block text-center"
                                        >
                                            Back
                                        </Link>
                                    </button>
                                )}
                            </form>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;
