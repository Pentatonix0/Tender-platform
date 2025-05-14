import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import OrderAdminTable from '../components/pages/admin_order_details_page/OrderAdminTable';
import OrderActions from '../components/pages/admin_order_details_page/OrderActions';
import Loading from '../components/common/universal_components/Loading';

const ActiveOrderContent = ({ data = [] }) => {
    const token = JSON.parse(localStorage.getItem('REACT_TOKEN_AUTH_KEY'));
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    console.log(data);
    const {
        id,
        title,
        description,
        status,
        order_items,
        publishing_date,
        permitted_providers,
        participants,
        deadline,
    } = data;

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        defaultValues: { title, description },
    });

    useEffect(() => {
        const fetchAllPersonalOrders = async () => {
            try {
                const response = await fetch(
                    `/api/order/get_all_personal_orders?${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token.access_token}`,
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch orders');
                }

                const data = await response.json();
                setOrders(data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
            }
        };
        if (status.code === 205) {
            fetchAllPersonalOrders();
        }
    }, []);

    const onSubmit = async (formData) => {
        try {
            const response = await axios.put(
                `/api/order/update_order_meta?order_id=${id}`,
                { id, ...formData },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token.access_token}`,
                    },
                }
            );
            if (response.status === 200) {
                toast.success('Заказ успешно обновлен', {
                    position: 'top-right',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: 'dark',
                });
                setIsEditing(false);
                data.title = formData.title;
                data.description = formData.description;
            }
        } catch (error) {
            console.error('Error updating order:', error);
            toast.error('Не удалось обновить заказ', {
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

    const toggleEdit = () => {
        setIsEditing(!isEditing);
        reset({ title, description });
    };

    const formattedDate = new Date(publishing_date).toLocaleDateString(
        'ru-RU',
        {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
        }
    );

    return (
        <>
            {isEditing ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="text-base font-base text-white">
                            Название заказа:
                        </label>
                        <input
                            type="text"
                            {...register('title', {
                                required: 'Название обязательно',
                            })}
                            className="w-full mt-2 p-3 bg-[#39393A] text-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                        {errors.title && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.title.message}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="text-base font-base text-white">
                            Описание заказа:
                        </label>
                        <textarea
                            {...register('description')}
                            className="w-full mt-2 p-3 bg-[#39393A] text-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                            rows="4"
                        />
                    </div>
                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={toggleEdit}
                            className="w-48 h-12 bg-gray-600 text-white text-base px-6 py-3 rounded-lg font-base hover:bg-gray-700 hover:scale-105 hover:shadow-[0_0_8px_rgba(75,85,99,0.6)] focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-[#39393A] transition-all duration-200"
                        >
                            Отменить
                        </button>
                        <button
                            type="submit"
                            className="w-48 h-12 bg-gradient-to-r from-orange-600 to-orange-500 text-white text-base px-6 py-3 rounded-lg font-base hover:from-orange-700 hover:to-orange-600 hover:scale-105 hover:shadow-[0_0_8px_rgba(249,115,22,0.6)] focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-[#39393A] transition-all duration-200"
                        >
                            Сохранить
                        </button>
                    </div>
                </form>
            ) : (
                <>
                    <div className="flex justify-between items-center mb-4 box-border">
                        <h1 className="text-3xl font-base text-white break-words overflow-hidden">
                            {title}
                        </h1>
                        {status.code != 205 && status.code != 207 && (
                            <button
                                onClick={toggleEdit}
                                className="w-48 h-12 bg-gradient-to-r from-orange-600 to-orange-500 text-white text-base px-6 py-3 rounded-lg font-base hover:from-orange-700 hover:to-orange-600 hover:scale-105 hover:shadow-[0_0_8px_rgba(249,115,22,0.6)] focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-[#39393A] transition-all duration-200"
                            >
                                Редактировать
                            </button>
                        )}
                    </div>
                    <p className="text-base font-base text-gray-300 mb-4 break-words overflow-auto max-h-48">
                        <strong className="text-base font-base text-white">
                            Описание заказа:
                        </strong>{' '}
                        {description ? description : 'Без описания'}
                    </p>
                    <p className="text-base font-base text-gray-300 mb-4">
                        <strong className="text-base font-base text-white">
                            Статус:
                        </strong>{' '}
                        {status.message}
                    </p>
                    <p className="text-base font-base text-gray-300 mb-6">
                        <strong className="text-base font-base text-white">
                            Дата публикации:
                        </strong>{' '}
                        {formattedDate}
                    </p>
                    <h3 className="text-base font-semibold text-white mb-4">
                        Товары в заказе:
                    </h3>
                    <OrderAdminTable data={order_items} showText={false} />
                    <OrderActions
                        status={status}
                        orderId={id}
                        token={token}
                        navigate={navigate}
                        participants={participants}
                        order_deadline={deadline}
                    />
                </>
            )}
        </>
    );
};

const AdminOrderDetailsPage = () => {
    const { orderId } = useParams();
    const [orderDetails, setOrderDetails] = useState({});
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const getOrderDetails = async () => {
        const token = JSON.parse(localStorage.getItem('REACT_TOKEN_AUTH_KEY'));
        try {
            const response = await axios.get(
                `/api/order/admin_order/${orderId}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token.access_token}`,
                    },
                }
            );
            console.log(response.data);
            setOrderDetails(response.data);
        } catch (error) {
            console.error('Error fetching order details:', error);
            toast.error('Не удалось загрузить данные о заказе', {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: 'dark',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getOrderDetails();
    }, [orderId]);

    return (
        <div className="min-h-screen flex justify-center py-12 min-h-screen bg-[#18181A]">
            {loading ? (
                <div className="flex flex-col items-center justify-center bg-[#222224] items-center w-full max-w-4xl rounded-lg shadow-[0px_0px_1px_0px_rgba(255,255,255)]">
                    <Loading />
                </div>
            ) : orderDetails.id == null ? (
                <div className="flex flex-col h-20 items-center justify-center bg-[#222224] w-full max-w-4xl rounded-lg shadow-[0px_0px_1px_0px_rgba(255,255,255)]">
                    <div className="text-center text-base text-white">
                        Нет данных о заказе
                    </div>
                </div>
            ) : (
                <div className="bg-[#222224] w-full max-w-4xl p-8 rounded-lg shadow-[0px_0px_1px_0px_rgba(255,255,255)]">
                    <ActiveOrderContent data={orderDetails} />
                </div>
            )}
        </div>
    );
};

export default AdminOrderDetailsPage;
