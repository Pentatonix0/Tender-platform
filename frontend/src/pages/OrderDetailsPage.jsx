import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiInfo, FiAlertCircle, FiDownload, FiUpload } from 'react-icons/fi';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import OrderDetailsTable from '../components/pages/order_details_page/OrderDetailsTable';
import Loading from '../components/common/universal_components/Loading';

const formatPrice = (price) => {
    if (!price && price !== 0) return '';

    const str = price.toString();

    // Если заканчивается на точку и не начинается с нее — вернуть как есть
    if (str.endsWith('.') && !str.startsWith('.')) {
        return str;
    }

    const num = parseFloat(str);
    if (isNaN(num)) return '';

    // Убираем лишние нули после запятой, оставляя максимум 2 знака
    const fixed = num.toFixed(2).replace(/\.?0+$/, ''); // удалит .00 или .0

    return fixed;
};

const OrderDetail = () => {
    const [loadingStates, setLoadingStates] = useState({});
    const { orderId } = useParams();
    const [order, setOrder] = useState({});
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState({});
    const [showEditor, setShowEditor] = useState(false);
    const [uploadStatus, setUploadStatus] = useState('');
    const [isUpdatingData, setIsUpdatingData] = useState(false);
    const fileInputRef = useRef(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm();

    const setButtonLoading = (key, isLoading) => {
        setLoadingStates((prev) => ({ ...prev, [key]: isLoading }));
    };

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
                setShowEditor(
                    response.data.status.code !== 100 &&
                        response.data.status.code !== 101
                );
            } catch (error) {
                console.error('There was an error fetching order data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrderData();
    }, [orderId]);

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
                    price: parseFloat(item.price?.price) || null,
                    comment: item.price?.comment || '',
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

    const handleDownloadOrder = async () => {
        const key = 'downloadOrder';
        setButtonLoading(key, true);
        try {
            const token = JSON.parse(
                localStorage.getItem('REACT_TOKEN_AUTH_KEY')
            );
            const response = await axios.get(
                `/api/order/get_order_excel?order_id=${orderId}`,
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
            link.download = `${order.order.title}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading personal order:', error);
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

    const handleUploadOrder = async () => {
        const file = fileInputRef.current?.files[0];
        if (!file) {
            toast.error('Please select a file', {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: 'dark',
            });
            return;
        }

        const key = 'uploadOrder';
        setButtonLoading(key, true);
        setUploadStatus('Loading');
        setIsUpdatingData(true);

        try {
            const token = JSON.parse(
                localStorage.getItem('REACT_TOKEN_AUTH_KEY')
            );
            const formData = new FormData();
            formData.append('file', file);
            formData.append('order_id', orderId);

            const response = await axios.post(
                '/api/excel/get_prices_from_excel',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token.access_token}`,
                    },
                }
            );

            if (response.status === 200) {
                const newPrices = response.data;
                let hasError = false;

                const updatedOrder = {
                    ...order,
                    last_prices: [...order.last_prices],
                };
                const updatedComments = { ...comments };

                newPrices.forEach((newPrice) => {
                    const matchedItem = updatedOrder.last_prices.find(
                        (item) =>
                            item.price.order_item.item.name === newPrice.name
                    );
                    if (matchedItem) {
                        matchedItem.price.price = formatPrice(newPrice.price);
                        matchedItem.price.comment = newPrice.comment || '';
                        updatedComments[matchedItem.price.order_item.id] =
                            newPrice.comment || '';
                    } else {
                        hasError = true;
                        toast.error(
                            `Item "${newPrice.name}" not found in order`,
                            {
                                position: 'top-right',
                                autoClose: 3000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                                theme: 'dark',
                            }
                        );
                    }
                });

                if (!hasError) {
                    setUploadStatus('Prices and comments loaded');
                    toast.success('Prices and comments successfully loaded', {
                        position: 'top-right',
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        theme: 'dark',
                    });
                } else {
                    setUploadStatus('Error while loading prices and comments');
                }

                setOrder(updatedOrder);
                handleCommentsChange(updatedComments);
            }
        } catch (error) {
            setUploadStatus('Error while loading prices and comments');
            console.error('Error while loading prices and comments:', error);
            toast.error('Error while loading prices and comments', {
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
            setIsUpdatingData(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
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
                                <h3 className="text-xl font-medium text-[#FFFFFF] mb-4">
                                    Products from the order
                                </h3>
                                {(order.status.code === 100 ||
                                    order.status.code === 101) && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowEditor(!showEditor)
                                        }
                                        disabled={isUpdatingData}
                                        className={`mb-4 px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-base font-medium rounded-md ${
                                            isUpdatingData
                                                ? 'opacity-50 cursor-not-allowed'
                                                : 'hover:from-blue-700 hover:to-blue-600 hover:shadow-[0_0_6px_rgba(59,130,246,0.6)] transition-all duration-200'
                                        }`}
                                    >
                                        {showEditor
                                            ? 'Hide Online Editor'
                                            : 'Show Online Editor'}
                                    </button>
                                )}
                                {showEditor && !isUpdatingData && (
                                    <OrderDetailsTable
                                        data={order}
                                        register={register}
                                        errors={errors}
                                        onCommentsChange={handleCommentsChange}
                                        order={order}
                                        setOrder={setOrder}
                                        formatPrice={formatPrice}
                                    />
                                )}
                                {(order.status.code === 100 ||
                                    order.status.code === 101) && (
                                    <div>
                                        <div>
                                            <h3 className="text-xl font-medium text-[#FFFFFF] mb-4">
                                                Download the order
                                            </h3>
                                            <button
                                                type="button"
                                                onClick={handleDownloadOrder}
                                                disabled={
                                                    loadingStates[
                                                        'downloadOrder'
                                                    ]
                                                }
                                                className={`flex items-center px-6 py-2 mb-6 bg-gradient-to-r from-green-600 to-green-500 text-white text-base font-medium rounded-md ${
                                                    loadingStates[
                                                        'downloadOrder'
                                                    ]
                                                        ? 'opacity-50 cursor-not-allowed'
                                                        : 'hover:from-green-700 hover:to-green-600 hover:shadow-[0_0_8px_rgba(34,197,94,0.7)] hover:scale-105 focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-[#222224] transition-all duration-300'
                                                }`}
                                            >
                                                <FiDownload className="mr-2 text-lg" />
                                                {loadingStates[
                                                    'downloadOrder'
                                                ] ? (
                                                    <span>Downloading...</span>
                                                ) : (
                                                    <span>Download</span>
                                                )}
                                            </button>
                                        </div>

                                        <h3 className="text-xl font-medium text-[#FFFFFF] mb-4">
                                            Upload prices
                                        </h3>
                                        <div className="flex space-x-4 bg-[#2a2a2c] p-4 rounded-lg border border-gray-600 shadow-md items-center">
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                accept=".xlsx,.xls"
                                                className="hidden"
                                                id="file-upload"
                                                disabled={
                                                    loadingStates['uploadOrder']
                                                }
                                                onChange={handleUploadOrder}
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    fileInputRef.current?.click()
                                                }
                                                disabled={
                                                    loadingStates['uploadOrder']
                                                }
                                                className={`relative flex items-center px-6 py-3 bg-gradient-to-r from-orange-900/20 to-gray-800/80 text-white text-sm font-medium rounded-xl border border-orange-600/30 shadow-md animate-fade-in ${
                                                    loadingStates['uploadOrder']
                                                        ? 'opacity-50 cursor-not-allowed'
                                                        : 'hover:from-orange-800/30 hover:to-gray-700/80 hover:shadow-lg hover:scale-105 focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-[#222224] transition-all duration-300'
                                                }`}
                                            >
                                                <FiUpload className="mr-2 text-base" />
                                                Select file
                                            </button>
                                            <span className="text-gray-300 text-sm">
                                                {uploadStatus}
                                            </span>
                                        </div>
                                    </div>
                                )}
                                {order.status.code !== 102 &&
                                order.status.code !== 105 &&
                                order.status.code !== 106 ? (
                                    <button
                                        type="submit"
                                        disabled={
                                            isSubmitting || isUpdatingData
                                        }
                                        className={`w-full sm:w-auto px-9 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white text-lg font-medium rounded-md ${
                                            isSubmitting || isUpdatingData
                                                ? 'opacity-50 cursor-not-allowed'
                                                : 'hover:from-orange-700 hover:to-orange-600 hover:shadow-[0_0_6px_rgba(249,115,22,0.6)] hover:scale-105 focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-[#222224] transition-all duration-200'
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
                                        className="w-full sm:w-auto bg-gradient-to-r from-orange-600 to-orange-500 text-white text-lg font-medium rounded-md hover:from-orange-700 hover:to-orange-600 hover:shadow-[0_0_6px_rgba(249,115,22,0.6)] hover:scale-105 transition-all duration-200"
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
