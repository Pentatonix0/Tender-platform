import React, { useEffect, useState } from 'react';
import OrderCard from '../../common/card/Card';
import Loading from '../../common/universal_components/Loading';
import axios from 'axios';

const LoggedInUserContent = () => {
    const [orders, setOrders] = useState([]); // Состояние для хранения заказов
    const [loading, setLoading] = useState(true); // Состояние для отображения загрузки
    const token = JSON.parse(localStorage.getItem('REACT_TOKEN_AUTH_KEY'));

    const getAllOrders = async () => {
        try {
            const response = await axios.get(
                `/api/order/get_all_user_participation`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token.access_token}`,
                    },
                }
            );
            console.log(response.data);
            setOrders(response.data); // Сохраняем полученные заказы в состояние
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false); // Завершаем загрузку
        }
    };

    useEffect(() => {
        getAllOrders(); // Загружаем данные при монтировании компонен
    }, []);
    return (
        <div className="flex flex-col max-w-7xl mx-auto px-20 py-8">
            <h1 className="text-2xl px-3 font-base font mb-2 text-white">
                Open orders
            </h1>

            <div className="bg-[#222224] p-8 rounded-3xl shadow-base mt-2 border border-1 border-gray-600">
                {loading && <Loading />}
                {orders.length === 0 && !loading && (
                    <div className="text-center text-base text-white">
                        No open orders
                    </div>
                )}

                {/* Контейнер с подложкой */}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-12">
                    {orders.map((order, index) => (
                        <OrderCard
                            key={index}
                            orderId={order.order.id}
                            title={order.order.title}
                            description={order.order.description}
                            bidding_deadline={order.deadline}
                            status={parseInt(order.status.code)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LoggedInUserContent;
