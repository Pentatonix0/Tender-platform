import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

/**
 * Константы для стилей и статусов
 */
const STATUS_CLASSES = {
    // Client-side statuses
    100: {
        button: 'bg-[#FF5F00] text-white hover:bg-red-600 hover:shadow-[0_0_8px_rgba(255,95,0,0.6)] focus:ring-orange-500',
        text: 'text-red-500 animate-pulse font-bold text-xl',
        label: 'NEW!',
    },
    101: {
        button: 'bg-[#39393A] border-2 border-indigo-400 hover:bg-[#4A4A4C] hover:shadow-[0_0_8px_rgba(99,102,241,0.6)] focus:ring-indigo-400',
        text: 'text-indigo-400',
        label: 'You are participating',
    },
    102: {
        button: 'bg-[#39393A] border-2 border-indigo-400 hover:bg-[#4A4A4C] hover:shadow-[0_0_8px_rgba(99,102,241,0.6)] focus:ring-indigo-400',
        text: 'text-indigo-400',
        label: 'You are participating',
    },
    103: {
        button: 'bg-[#39393A] border-2 border-[#faed27] hover:bg-[#4A4A4C] hover:shadow-[0_0_8px_rgba(250,237,39,0.6)] focus:ring-[#faed27]',
        text: 'text-[#faed27]',
        label: 'You can offer a lower price',
    },
    104: {
        button: 'bg-[#39393A] border-2 border-[#f7e08b] hover:bg-[#4A4A4C] hover:shadow-[0_0_8px_rgba(247,224,139,0.6)] focus:ring-[#f7e08b]',
        text: 'text-[#f7e08b]',
        label: 'You can change prices',
    },
    105: {
        button: 'bg-[#39393A] border-2 border-[#faed27] hover:bg-[#4A4A4C] hover:shadow-[0_0_8px_rgba(250,237,39,0.6)] focus:ring-[#faed27]',
        text: 'text-[#faed27]',
        label: ['You have not changed prices.', 'Soon you will get an order.'],
    },
    106: {
        button: 'bg-[#39393A] border-2 border-[#4ADE80] hover:bg-[#4A4A4C] hover:shadow-[0_0_8px_rgba(74,222,128,0.6)] focus:ring-[#4ADE80]',
        text: 'text-[#4ADE80]',
        label: 'Soon you will get an order',
    },
    // Admin-side statuses
    200: {
        text: 'text-green-400',
        label: 'Order created, active',
    },
    203: {
        text: 'text-[#faed27]',
        label: 'Bidding',
    },
    205: {
        text: 'text-blue-400',
        label: 'Finished, personal orders created',
    },
    207: {
        text: 'text-gray-400',
        label: 'Archived',
    },
};

const COMMON_BUTTON_CLASSES =
    'w-32 py-3 text-white text-base rounded-lg font-base hover:scale-105 focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#18181A] transition-all duration-200';

const CARD_CLASSES =
    'bg-[#39393A] p-6 rounded-xl border border-gray-600 w-162 h-54 flex flex-col hover:scale-[1.02] hover:shadow-[0_0_8px_rgba(209,209,209,0.5)] transition-all duration-300 animate-slide-in box-border';

/**
 * Хук для управления таймером дедлайна
 * @param {string|null} bidding_deadline - Дедлайн торгов (UTC)
 * @param {number} orderId - ID заказа
 * @param {number} status - Код статуса участника
 * @returns {string} - Оставшееся время или сообщение
 */
const useTimer = (bidding_deadline, orderId, status) => {
    const [timeLeft, setTimeLeft] = useState('');

    const padNumber = (num) => String(num).padStart(2, '0');

    useEffect(() => {
        if (!bidding_deadline) {
            setTimeLeft('');
            return;
        }

        const deadlineDate = new Date(bidding_deadline + 'Z');
        if (isNaN(deadlineDate)) {
            setTimeLeft('Invalid deadline');
            return;
        }

        let hasSentRequest = false;

        const timer = setInterval(() => {
            const now = new Date();
            const distance = deadlineDate - now;

            if (distance < 0) {
                clearInterval(timer);
                setTimeLeft('The deadline has expired');

                if (!hasSentRequest && (status === 103 || status === 104)) {
                    console.log('call', status);
                    hasSentRequest = true;
                    const token = JSON.parse(
                        localStorage.getItem('REACT_TOKEN_AUTH_KEY')
                    );
                    if (token?.access_token) {
                        axios
                            .post(
                                '/api/order/set_participant_status',
                                {
                                    order_id: orderId,
                                    status_code: status === 103 ? 105 : 106,
                                },
                                {
                                    headers: {
                                        'Content-Type': 'application/json',
                                        Authorization: `Bearer ${token.access_token}`,
                                    },
                                }
                            )
                            .catch((error) => {
                                console.error(
                                    'Error setting participant status:',
                                    error
                                );
                            });
                    }
                }
                return;
            }

            const hours = Math.floor(distance / (1000 * 60 * 60));
            const minutes = Math.floor(
                (distance % (1000 * 60 * 60)) / (1000 * 60)
            );
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            setTimeLeft(
                `${padNumber(hours)}:${padNumber(minutes)}:${padNumber(
                    seconds
                )}`
            );
        }, 100);

        return () => clearInterval(timer);
    }, [bidding_deadline, orderId, status]);

    return timeLeft;
};

/**
 * Компонент для отображения статуса участия
 * @param {Object} props
 * @param {number} props.orderId - ID заказа
 * @param {number} props.status - Код статуса участника
 */
const ParticipationStatus = ({ orderId, status }) => {
    const statusConfig = STATUS_CLASSES[status] || {};

    switch (status) {
        case 100:
            return (
                <div className="flex justify-end animate-slide-in">
                    <Link to={`/order/${orderId}`}>
                        <button
                            className={`${COMMON_BUTTON_CLASSES} ${statusConfig.button}`}
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
                    <div
                        className={`mt-6 text-xs font-base ${statusConfig.text} animate-fade-in`}
                    >
                        {statusConfig.label}
                    </div>
                    <div className="w-32">
                        <Link to={`/order/${orderId}`}>
                            <button
                                className={`${COMMON_BUTTON_CLASSES} ${statusConfig.button}`}
                                aria-label="View order details"
                            >
                                Details
                            </button>
                        </Link>
                    </div>
                </div>
            );
        case 103:
            return (
                <div className="flex justify-between items-center animate-slide-in">
                    <div
                        className={`mt-6 text-xs font-base ${statusConfig.text} animate-fade-in`}
                    >
                        {statusConfig.label}
                    </div>
                    <div className="w-32">
                        <Link to={`/order/${orderId}`}>
                            <button
                                className={`${COMMON_BUTTON_CLASSES} ${statusConfig.button}`}
                                aria-label="View order details"
                            >
                                Offer
                            </button>
                        </Link>
                    </div>
                </div>
            );
        case 104:
            return (
                <div className="flex justify-between items-center animate-slide-in">
                    <div
                        className={`mt-6 text-xs font-base ${statusConfig.text} animate-fade-in`}
                    >
                        {statusConfig.label}
                    </div>
                    <div className="w-32">
                        <Link to={`/order/${orderId}`}>
                            <button
                                className={`${COMMON_BUTTON_CLASSES} ${statusConfig.button}`}
                                aria-label="View order details"
                            >
                                Change
                            </button>
                        </Link>
                    </div>
                </div>
            );
        case 105:
            return (
                <div className="flex justify-between items-center animate-slide-in">
                    <div
                        className={`mt-6 text-xs font-base ${statusConfig.text} animate-fade-in flex flex-col`}
                    >
                        {Array.isArray(statusConfig.label) ? (
                            statusConfig.label.map((line, index) => (
                                <span key={index}>{line}</span>
                            ))
                        ) : (
                            <span>{statusConfig.label}</span>
                        )}
                    </div>
                    <div className="w-32">
                        <Link to={`/order/${orderId}`}>
                            <button
                                className={`${COMMON_BUTTON_CLASSES} ${statusConfig.button}`}
                                aria-label="Offer a lower price"
                            >
                                Details
                            </button>
                        </Link>
                    </div>
                </div>
            );
        case 106:
            return (
                <div className="flex justify-between items-center animate-slide-in">
                    <div
                        className={`mt-6 text-xs font-base ${statusConfig.text} animate-fade-in flex flex-col`}
                    >
                        {Array.isArray(statusConfig.label) ? (
                            statusConfig.label.map((line, index) => (
                                <span key={index}>{line}</span>
                            ))
                        ) : (
                            <span>{statusConfig.label}</span>
                        )}
                    </div>
                    <div className="w-32">
                        <Link to={`/order/${orderId}`}>
                            <button
                                className={`${COMMON_BUTTON_CLASSES} ${statusConfig.button}`}
                                aria-label="Offer a lower price"
                            >
                                Details
                            </button>
                        </Link>
                    </div>
                </div>
            );
        default:
            return <span className="text-gray-400">{status}</span>;
    }
};

/**
 * Карточка заказа для поставщика
 * @param {Object} props
 * @param {number} props.orderId - ID заказа
 * @param {string} props.title - Название заказа
 * @param {string} props.description - Описание заказа
 * @param {string|null} props.bidding_deadline - Дедлайн торгов (UTC)
 * @param {number} props.status - Код статуса участника
 */
const ProviderCard = ({
    orderId,
    title,
    description,
    bidding_deadline,
    status = 0,
}) => {
    const timeLeft = useTimer(bidding_deadline, orderId, status);

    return (
        <div className={CARD_CLASSES} aria-label={`Order ${title}`}>
            <div className="flex justify-between items-start">
                <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-base text-[#d1d1d1] mb-4 mr-4 animate-fade-in break-words overflow-hidden text-ellipsis">
                        {title}
                    </h2>
                </div>
                <div className="flex-shrink-0 w-40 text-right">
                    {bidding_deadline &&
                    (status === 103 || status === 104 || status === 105) ? (
                        <span
                            className="text-[#FAED27] font-base text-sm animate-pulse-slow"
                            aria-live="polite"
                        >
                            {timeLeft || ''}
                        </span>
                    ) : (
                        status === 100 && (
                            <span className={STATUS_CLASSES[100].text}>
                                {STATUS_CLASSES[100].label}
                            </span>
                        )
                    )}
                </div>
            </div>
            <p className="text-sm text-gray-500 mb-6 flex-grow animate-fade-in break-words overflow-auto max-h-24">
                {description}
            </p>
            <ParticipationStatus orderId={orderId} status={status} />
        </div>
    );
};

/**
 * Карточка заказа для администратора
 * @param {Object} props
 * @param {number} props.orderId - ID заказа
 * @param {string} props.title - Название заказа
 * @param {string} props.description - Описание заказа
 * @param {number} props.status - Код статуса заказа
 */
const AdminCard = ({ orderId, title, description, status }) => {
    const statusConfig = STATUS_CLASSES[status] || {
        text: 'text-gray-400',
        label: 'Unknown',
    };

    return (
        <div className={CARD_CLASSES} aria-label={`Order ${title}`}>
            <h2 className="text-lg font-semibold text-[#d1d1d1] mb-4 animate-fade-in break-words overflow-hidden">
                {title}
            </h2>
            <p className="text-sm text-gray-500 mb-6 flex-grow animate-fade-in break-words overflow-auto max-h-24">
                {description}
            </p>
            <div className="flex justify-between items-center">
                <div
                    className={`text-xs font-base ${statusConfig.text} animate-fade-in`}
                >
                    {statusConfig.label}
                </div>
                <Link to={`/order_details/${orderId}`}>
                    <button
                        className="bg-[#FF5F00] text-white text-base px-6 py-3 rounded-lg font-base hover:bg-red-600 hover:scale-105 hover:shadow-[0_0_8px_rgba(255,95,0,0.6)] focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-[#39393A] transition-all duration-200"
                        aria-label="View order details"
                    >
                        Подробности
                    </button>
                </Link>
            </div>
        </div>
    );
};

/**
 * Основной компонент карточки заказа
 * @param {Object} props
 * @param {number} props.orderId - ID заказа
 * @param {string} props.title - Название заказа
 * @param {string} props.description - Описание заказа
 * @param {number} props.status - Код статуса участника
 * @param {string|null} props.bidding_deadline - Дедлайн торгов (UTC)
 * @param {boolean} props.isAdmin - Флаг администратора
 */
const OrderCard = ({
    orderId,
    title,
    description,
    status,
    bidding_deadline,
    isAdmin = false,
}) => {
    return isAdmin ? (
        <AdminCard
            orderId={orderId}
            title={title}
            description={description}
            status={status}
        />
    ) : (
        <ProviderCard
            orderId={orderId}
            title={title}
            description={description}
            bidding_deadline={bidding_deadline}
            status={status}
        />
    );
};

export default React.memo(OrderCard);
