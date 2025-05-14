import React, { useEffect, useState } from 'react';
import OrderCard from '../../common/card/Card';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Loading from '../../common/universal_components/Loading';

const LoggedInAdminContent = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]); // Состояние для хранения заказов
    const [loading, setLoading] = useState(true); // Состояние для отображения загрузки

    const handleCreateOrder = () => {
        navigate('/create_order');
    };

    const getAllOrders = async () => {
        const token = JSON.parse(localStorage.getItem('REACT_TOKEN_AUTH_KEY'));
        try {
            const response = await axios.get('api/order/get_all_orders', {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token.access_token}`,
                },
            });
            setOrders(response.data); // Сохраняем полученные заказы в состояние
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false); // Завершаем загрузку
        }
    };

    useEffect(() => {
        getAllOrders(); // Загружаем данные при монтировании компонента
    }, []);

    return (
        <div className="flex flex-col max-w-7xl mx-auto px-20 py-8">
            {/* Контейнер с заголовком и кнопкой */}
            <div className="flex justify-between items-center mb-2">
                <h1 className="text-2xl px-3 font-base text-white">
                    Открытые заказы
                </h1>
                <button
                    onClick={handleCreateOrder}
                    className="w-48 h-12 bg-[#FF5F00] text-white text-base px-6 py-3 rounded-lg hover:bg-red-600 transition duration-200"
                >
                    Создать заказ
                </button>
            </div>

            {/* Контейнер для карточек */}
            <div className="bg-[#222224] p-8 rounded-3xl shadow-base mt-2 shadow-[0px_0px_1px_0px_rgba(255,255,255)]">
                {/* Если идет загрузка, показываем индикатор */}
                {loading && <Loading />}

                {/* Если произошла ошибка, показываем сообщение */}
                {orders.length === 0 && !loading && (
                    <div className="text-center text-base text-white">
                        Нет заказов
                    </div>
                )}

                {orders.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-12">
                        {orders.map((order, index) => (
                            <OrderCard
                                key={index}
                                orderId={order.id}
                                title={order.title}
                                description={order.description}
                                status={order.status.code}
                                isAdmin={true}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoggedInAdminContent;
