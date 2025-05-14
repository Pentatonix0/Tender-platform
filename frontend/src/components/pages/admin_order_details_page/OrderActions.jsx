import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    FaCloudDownloadAlt,
    FaPlay,
    FaCloudUploadAlt,
    FaTimes,
    FaUserPlus,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { statusDictionary } from '../../../constants/StatusDictionary';

const OrderActions = ({
    title,
    status,
    orderId,
    token,
    navigate,
    participants,
    order_deadline,
}) => {
    const [loadingStates, setLoadingStates] = useState({}); // Object to track loading state per button
    const [isBiddingModalOpen, setIsBiddingModalOpen] = useState(false);
    const [isOrderDeadlineModalOpen, setIsOrderDeadlineModalOpen] =
        useState(false);
    const [isParticipantDeadlineModalOpen, setIsParticipantDeadlineModalOpen] =
        useState(false);
    const [deadline, setDeadline] = useState('');
    const [deadlineError, setDeadlineError] = useState('');
    const [selectedParticipantId, setSelectedParticipantId] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isFileUploading, setIsFileUploading] = useState(false);
    const [personalOrders, setPersonalOrders] = useState([]);

    useEffect(() => {
        const fetchAllPersonalOrders = async () => {
            try {
                const response = await fetch(
                    `/api/order/get_all_order_personal_orders?order_id=${orderId}`,
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
                setPersonalOrders(data);
            } catch (err) {
                console.log(err);
            }
        };
        if (status.code === 205) {
            fetchAllPersonalOrders();
        }
    }, [token]);

    const setButtonLoading = (key, isLoading) => {
        setLoadingStates((prev) => ({ ...prev, [key]: isLoading }));
    };

    const handleDownloadPersonalOrder = async (personalOrder) => {
        const key = `personalOrder_${personalOrder.id}`;
        setButtonLoading(key, true);
        try {
            const response = await axios.get(
                `/api/order/download_personal_order?personal_order_id=${personalOrder.id}&filename=${personalOrder.order.title}_${personalOrder.user.company}`,
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
            link.download = `${personalOrder.order.title}_${personalOrder.user.company}.xlsx`;
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

    const handleDeleteOrder = async () => {
        const confirmed = window.confirm(
            'Вы уверены, что хотите удалить этот заказ?'
        );
        if (!confirmed) return;

        try {
            const response = await axios.delete('/api/order/delete_order', {
                params: { id: orderId },
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token.access_token}`,
                },
            });
            if (response.status === 200) {
                toast.success('Заказ успешно удален', {
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
            console.error('Error deleting order:', error);
            toast.error('Не удалось удалить заказ', {
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

    const handleRequestSummary = async (action) => {
        const key = action; // Use action as the key (e.g., 'summary' or 'allPersonalOrders')
        setButtonLoading(key, true);
        try {
            const response = await axios.get(
                `/api/order/get_current_order_state?order_id=${orderId}`,
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
            link.download =
                action === 'summary'
                    ? 'summary.xlsx'
                    : 'all_personal_orders.xlsx';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error fetching summary:', error);
            toast.error('Не удалось скачать сводку', {
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

    const handleDownloadAllPersonalOrders = async () => {
        const key = 'allPersonalOrders';
        try {
            const response = await axios.get(
                `/api/order/download_all_personal_orders?order_id=${orderId}&filename=${title}`,
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
            link.download = `${title}_all_personal_orders.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error fetching summary:', error);
            toast.error('Не удалось скачать сводку', {
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

    const handleStartBidding = () => {
        setIsBiddingModalOpen(true);
    };

    const handleBiddingSubmit = async (e) => {
        e.preventDefault();
        if (!deadline) {
            setDeadlineError('Пожалуйста, выберите дедлайн');
            return;
        }

        const selectedDate = new Date(deadline);
        const now = Date.now();
        if (selectedDate <= now) {
            setDeadlineError('Дедлайн должен быть в будущем');
            return;
        }

        const isoDeadline = selectedDate.toISOString();

        try {
            const response = await axios.post(
                `/api/order/start_bidding?order_id=${orderId}`,
                { deadline: isoDeadline },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token.access_token}`,
                    },
                }
            );
            if (response.status === 200) {
                toast.success('Торги успешно начаты', {
                    position: 'top-right',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: 'dark',
                });
                setIsBiddingModalOpen(false);
                setDeadline('');
                setDeadlineError('');
            }
        } catch (error) {
            console.error('Error starting bidding:', error);
            toast.error('Не удалось начать торги', {
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

    const handleAddParticipant = () => {};
    const handleUnableParticipant = async (participant_id) => {
        console.log(token);
        try {
            const response = await axios.post(
                `/api/order/unable_participant?participant_id=${participant_id}`,
                {},
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token.access_token}`,
                    },
                }
            );
            if (response.status === 200) {
                toast.success('Участник успешно отстранён', {
                    position: 'top-right',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: 'dark',
                });
            }
        } catch (error) {
            console.error('Error unable participant:', error);
            toast.error('Не удалось отстранить участника', {
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
    const handleReturnParticipant = async (participant_id) => {
        try {
            const response = await axios.post(
                `/api/order/return_participant?participant_id=${participant_id}`,
                {},
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token.access_token}`,
                    },
                }
            );
            if (response.status === 200) {
                toast.success('Участник успешно возвращён', {
                    position: 'top-right',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: 'dark',
                });
            }
        } catch (error) {
            console.error('Error updating order deadline:', error);
            toast.error('Не удалось вернуть участника', {
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

    const handleUpdateOrderDeadline = async (e) => {
        e.preventDefault();
        if (!deadline) {
            setDeadlineError('Пожалуйста, выберите дедлайн');
            return;
        }

        const selectedDate = new Date(deadline);
        const now = Date.now();
        if (selectedDate <= now) {
            setDeadlineError('Дедлайн должен быть в будущем');
            return;
        }

        const isoDeadline = selectedDate.toISOString();

        try {
            const response = await axios.put(
                `/api/order/update_deadline?order_id=${orderId}`,
                { deadline: isoDeadline },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token.access_token}`,
                    },
                }
            );
            if (response.status === 200) {
                toast.success('Дедлайн заказа успешно обновлен', {
                    position: 'top-right',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: 'dark',
                });
                setIsOrderDeadlineModalOpen(false);
                setDeadline('');
                setDeadlineError('');
            }
        } catch (error) {
            console.error('Error updating order deadline:', error);
            toast.error('Не удалось обновить дедлайн заказа', {
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

    const handleUpdateParticipantDeadline = async (e) => {
        e.preventDefault();
        if (!deadline) {
            setDeadlineError('Пожалуйста, выберите дедлайн');
            return;
        }

        const selectedDate = new Date(deadline);
        const now = Date.now();
        if (selectedDate <= now) {
            setDeadlineError('Дедлайн должен быть в будущем');
            return;
        }

        const isoDeadline = selectedDate.toISOString();

        try {
            const response = await axios.put(
                `/api/order/update_participant_deadline?participant_id=${selectedParticipantId}`,
                { deadline: isoDeadline },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token.access_token}`,
                    },
                }
            );
            if (response.status === 200) {
                window.location.reload();
                toast.success('Дедлайн участника успешно обновлен', {
                    position: 'top-right',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: 'dark',
                });
                setIsParticipantDeadlineModalOpen(false);
                setDeadline('');
                setDeadlineError('');
                setSelectedParticipantId(null);
            }
        } catch (error) {
            console.error('Error updating participant deadline:', error);
            toast.error('Не удалось обновить дедлайн участника', {
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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setSelectedFile(file);
    };

    const handleClearFile = () => {
        setSelectedFile(null);
        document.querySelector('input[type="file"]').value = '';
    };

    const handleCreateOrders = async () => {
        if (!selectedFile) {
            toast.error('Пожалуйста, выберите файл', {
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

        setIsFileUploading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await axios.post(
                `/api/order/create_personal_orders?order_id=${orderId}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token.access_token}`,
                    },
                }
            );
            if (response.status === 201) {
                toast.success('Персональные заказы успешно созданы', {
                    position: 'top-right',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: 'dark',
                });
                document.querySelector('input[type="file"]').value = '';
            }
        } catch (error) {
            console.error('Error creating personal orders:', error);
            toast.error('Не удалось создать заказы', {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: 'dark',
            });
        } finally {
            setIsFileUploading(false);
        }
    };

    const handleBiddingCancel = () => {
        setIsBiddingModalOpen(false);
        setIsOrderDeadlineModalOpen(false);
        setIsParticipantDeadlineModalOpen(false);
        setDeadline('');
        setDeadlineError('');
        setSelectedParticipantId(null);
    };

    const formatRemainingTime = (deadline) => {
        if (!deadline) return 'Не указано';

        const deadlineDate = new Date(deadline + 'Z');
        const now = new Date();
        const diffMs = deadlineDate - now;

        if (diffMs <= 0) return 'Истек';

        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(
            (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const diffMinutes = Math.floor(
            (diffMs % (1000 * 60 * 60)) / (1000 * 60)
        );

        let result = '';
        if (diffDays > 0) result += `${diffDays} дн. `;
        if (diffHours > 0 || diffDays > 0) result += `${diffHours} ч. `;
        result += `${diffMinutes} мин.`;

        return result.trim();
    };

    const openParticipantDeadlineModal = (participantId) => {
        setSelectedParticipantId(participantId);
        setIsParticipantDeadlineModalOpen(true);
    };

    const renderDeadlineModal = ({ title, onSubmit }) => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#39393A] p-6 rounded-lg shadow-lg max-w-md w-full">
                <h2 className="text-xl font-semibold text-white mb-4">
                    {title}
                </h2>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="text-base font-base text-white">
                            Дедлайн:
                        </label>
                        <input
                            type="datetime-local"
                            value={deadline}
                            onChange={(e) => {
                                setDeadline(e.target.value);
                                setDeadlineError('');
                            }}
                            className="w-full mt-2 p-3 bg-[#222224] text-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                        {deadlineError && (
                            <p className="text-red-500 text-sm mt-1">
                                {deadlineError}
                            </p>
                        )}
                    </div>
                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={handleBiddingCancel}
                            className="w-32 h-10 bg-gray-600 text-white text-base px-4 py-2 rounded-lg font-base hover:bg-gray-700 hover:scale-105 hover:shadow-[0_0_8px_rgba(75,85,99,0.6)] focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-[#39393A] transition-all duration-200"
                        >
                            Отменить
                        </button>
                        <button
                            type="submit"
                            className="w-32 h-10 bg-gradient-to-r from-green-600 to-green-500 text-white text-base px-4 py-2 rounded-lg font-base hover:from-green-700 hover:to-green-600 hover:scale-105 hover:shadow-[0_0_8px_rgba(22,163,74,0.6)] focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-[#39393A] transition-all duration-200"
                        >
                            Подтвердить
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    const renderActions = () => {
        switch (status.code) {
            case 200:
                return (
                    <>
                        <h3 className="text-base font-semibold text-white mt-6 mb-4">
                            Разрешенные поставщики:
                        </h3>
                        <div className="bg-[#39393A] p-6 rounded-lg mt-4 mb-4 shadow-[0px_0px_0px_1px_rgba(125,125,128)]">
                            <table className="min-w-full table-auto border-collapse border border-gray-300">
                                <thead>
                                    <tr>
                                        <th className="text-base font-base text-white px-4 py-2 border-b border-r border-gray-300">
                                            ID поставщика
                                        </th>
                                        <th className="text-base font-base text-white px-4 py-2 border-b border-r">
                                            Участвует
                                        </th>
                                        <th className="text-base font-base text-white px-4 py-2 border-b">
                                            Действия
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {participants &&
                                        participants.map((participant) => (
                                            <tr key={participant.user.id}>
                                                <td className="text-base font-base text-white px-4 py-2 border-b border-r border-gray-300">
                                                    {participant.user.company}
                                                </td>
                                                <td className="px-4 py-2 border-b border-r text-center">
                                                    {
                                                        statusDictionary[
                                                            participant.status
                                                                .code
                                                        ].emoji
                                                    }
                                                </td>
                                                <td className="px-4 py-2 border-b">
                                                    <div className="flex justify-center">
                                                        {participant.status
                                                            .code === 111 ? (
                                                            <button
                                                                onClick={() =>
                                                                    handleReturnParticipant(
                                                                        participant.id
                                                                    )
                                                                }
                                                                className="h-8 bg-gradient-to-r from-green-600 to-green-500 text-white text-sm px-3 py-1 rounded-lg hover:from-green-700 hover:to-green-600 hover:scale-105 hover:shadow-[0_0_8px_rgba(74,222,128,0.6)] focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-[#39393A] transition-all duration-200"
                                                            >
                                                                Вернуть
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() =>
                                                                    handleUnableParticipant(
                                                                        participant.id
                                                                    )
                                                                }
                                                                className="h-8 bg-gradient-to-r from-orange-600 to-orange-500 text-white text-sm px-3 py-1 rounded-lg hover:from-orange-700 hover:to-orange-600 hover:scale-105 hover:shadow-[0_0_8px_rgba(249,115,22,0.6)] focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-[#39393A] transition-all duration-200"
                                                            >
                                                                Отстранить
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                        <div>
                            <button
                                onClick={handleAddParticipant}
                                className="w-18 h-8 bg-gradient-to-r from-purple-600 to-purple-500 text-white text-base font-semibold px-6 py-3 rounded-lg hover:from-purple-700 hover:to-purple-600 hover:scale-105 hover:shadow-[0_0_8px_rgba(147,51,234,0.6)] focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-[#39393A] transition-all duration-200 flex items-center justify-center space-x-2"
                                aria-label="Добавить участника"
                            >
                                <FaUserPlus className="text-xs" />
                            </button>
                        </div>
                        <div className="mt-6 flex justify-start gap-4">
                            <button
                                onClick={() => handleRequestSummary('summary')}
                                disabled={loadingStates['summary']}
                                className={`w-48 h-12 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-base font-semibold px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-600 hover:scale-105 hover:shadow-[0_0_8px_rgba(37,99,235,0.6)] focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-[#39393A] transition-all duration-200 flex items-center justify-center space-x-2 ${
                                    loadingStates['summary']
                                        ? 'opacity-50 cursor-not-allowed'
                                        : ''
                                }`}
                                aria-label="Скачать сводку заказа"
                            >
                                {loadingStates['summary'] ? (
                                    <span>Загрузка...</span>
                                ) : (
                                    <>
                                        <FaCloudDownloadAlt className="text-lg" />
                                        <span>Скачать сводку</span>
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleStartBidding}
                                className="w-48 h-12 bg-gradient-to-r from-green-600 to-green-500 text-white text-base font-semibold px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-600 hover:scale-105 hover:shadow-[0_0_8px_rgba(22,163,74,0.6)] focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-[#39393A] transition-all duration-200 flex items-center justify-center space-x-2"
                                aria-label="Начать торги"
                            >
                                <FaPlay className="text-lg" />
                                <span>Начать торги</span>
                            </button>
                        </div>
                        <div className="flex justify-end mt-6">
                            <button
                                onClick={handleDeleteOrder}
                                className="w-30 h-8 bg-red-600 text-white text-xs px-6 rounded-lg font-base hover:bg-red-700 hover:scale-105 hover:shadow-[0_0_8px_rgba(220,38,38,0.6)] focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-[#39393A] transition-all duration-200"
                            >
                                Удалить заказ
                            </button>
                        </div>
                    </>
                );
            case 203:
                return (
                    <>
                        <h3 className="text-base font-semibold text-white mt-6 mb-4">
                            Разрешенные поставщики:
                        </h3>
                        <div className="flex items-center gap-4 mb-4">
                            <p className="text-base font-base text-gray-300">
                                <strong className="text-base font-base text-white">
                                    Осталось до окончания торгов:
                                </strong>{' '}
                                {formatRemainingTime(order_deadline)}
                            </p>
                            <button
                                onClick={() =>
                                    setIsOrderDeadlineModalOpen(true)
                                }
                                className="h-10 bg-gradient-to-r from-orange-600 to-orange-500 text-white text-base px-4 py-2 rounded-lg hover:from-orange-700 hover:to-orange-600 hover:scale-105 hover:shadow-[0_0_8px_rgba(249,115,22,0.6)] focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-[#39393A] transition-all duration-200"
                            >
                                Изменить дедлайн
                            </button>
                        </div>
                        <div className="bg-[#39393A] p-6 rounded-lg mt-4 mb-8 shadow-[0px_0px_0px_1px_rgba(125,125,128)]">
                            <table className="min-w-full table-auto border-collapse border border-gray-300">
                                <thead>
                                    <tr>
                                        <th className="text-base font-base text-white px-4 py-2 border-b border-r border-gray-300">
                                            Поставщик
                                        </th>
                                        <th className="text-base font-base text-white px-4 py-2 border-b border-r border-gray-300">
                                            Участвует в торгах
                                        </th>
                                        <th className="text-base font-base text-white px-4 py-2 border-b border-r border-gray-300">
                                            Оставшееся время
                                        </th>
                                        <th className="text-base font-base text-white px-4 py-2 border-b">
                                            Действия
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {participants &&
                                        participants.map((participant) =>
                                            participant.status.code !== 111 ? (
                                                <tr key={participant.user.id}>
                                                    <td className="text-base font-base text-white px-4 py-2 border-b border-r border-gray-300">
                                                        {
                                                            participant.user
                                                                .company
                                                        }
                                                    </td>
                                                    <td className="px-4 py-2 border-b text-center border-r border-gray-300">
                                                        {
                                                            statusDictionary[
                                                                participant
                                                                    .status.code
                                                            ].emoji
                                                        }
                                                    </td>
                                                    <td className="text-base font-base text-white px-4 py-2 border-b border-r border-gray-300">
                                                        {formatRemainingTime(
                                                            participant.deadline
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-2 border-b">
                                                        <button
                                                            onClick={() =>
                                                                openParticipantDeadlineModal(
                                                                    participant.id
                                                                )
                                                            }
                                                            className="h-8 bg-gradient-to-r from-orange-600 to-orange-500 text-white text-sm px-3 py-1 rounded-lg hover:from-orange-700 hover:to-orange-600 hover:scale-105 hover:shadow-[0_0_8px_rgba(249,115,22,0.6)] focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-[#39393A] transition-all duration-200"
                                                        >
                                                            Изменить
                                                        </button>
                                                    </td>
                                                </tr>
                                            ) : null
                                        )}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-6 flex flex-col gap-4">
                            <div className="flex justify-start gap-4">
                                <button
                                    onClick={() =>
                                        handleRequestSummary('summary')
                                    }
                                    disabled={loadingStates['summary']}
                                    className={`w-48 h-12 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-base font-semibold px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-600 hover:scale-105 hover:shadow-[0_0_8px_rgba(37,99,235,0.6)] focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-[#39393A] transition-all duration-200 flex items-center justify-center space-x-2 ${
                                        loadingStates['summary']
                                            ? 'opacity-50 cursor-not-allowed'
                                            : ''
                                    }`}
                                    aria-label="Скачать сводку заказа"
                                >
                                    {loadingStates['summary'] ? (
                                        <span>Загрузка...</span>
                                    ) : (
                                        <>
                                            <FaCloudDownloadAlt className="text-lg" />
                                            <span>Скачать сводку</span>
                                        </>
                                    )}
                                </button>
                            </div>
                            <div className="flex flex-col gap-4">
                                <div className="w-full flex items-center gap-2">
                                    <label className="flex-1 flex items-center p-3 bg-[#222224] border border-gray-300 rounded-lg cursor-pointer hover:bg-[#2a2a2c] hover:shadow-[0_0_8px_rgba(255,255,255,0.1)] transition-all duration-200 focus-within:ring-2 focus-within:ring-orange-400">
                                        <FaCloudUploadAlt className="text-orange-400 mr-2 text-lg" />
                                        <span className="text-white truncate">
                                            {selectedFile
                                                ? selectedFile.name
                                                : 'Выберите файл (.xlsx, .xls)'}
                                        </span>
                                        <input
                                            type="file"
                                            accept=".xlsx,.xls"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                    </label>
                                    {selectedFile && (
                                        <FaTimes
                                            className="text-red-500 cursor-pointer hover:text-red-400 transition-colors duration-200"
                                            onClick={handleClearFile}
                                        />
                                    )}
                                </div>
                                <button
                                    onClick={handleCreateOrders}
                                    disabled={!selectedFile || isFileUploading}
                                    className={`w-48 h-12 bg-gradient-to-r from-purple-600 to-purple-500 text-white text-base font-semibold px-6 py-3 rounded-lg hover:from-purple-700 hover:to-purple-600 hover:scale-105 hover:shadow-[0_0_8px_rgba(147,51,234,0.6)] focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-[#39393A] transition-all duration-200 flex items-center justify-center ${
                                        !selectedFile || isFileUploading
                                            ? 'opacity-50 cursor-not-allowed'
                                            : ''
                                    }`}
                                    aria-label="Создать персональные заказы"
                                >
                                    {isFileUploading ? (
                                        <span>Загрузка...</span>
                                    ) : (
                                        <span>Создать заказы</span>
                                    )}
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-end mt-6">
                            <button
                                onClick={handleDeleteOrder}
                                className="w-30 h-8 bg-red-600 text-white text-xs px-6 rounded-lg font-base hover:bg-red-700 hover:scale-105 hover:shadow-[0_0_8px_rgba(220,38,38,0.6)] focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-[#39393A] transition-all duration-200"
                            >
                                Удалить заказ
                            </button>
                        </div>
                    </>
                );
            case 205:
                return (
                    <>
                        <div className="bg-[#39393A] p-6 rounded-lg mt-4 mb-4 shadow-[0px_0px_0px_1px_rgba(125,125,128)]">
                            <table className="min-w-full table-auto border-collapse border border-gray-300">
                                <thead>
                                    <tr>
                                        <th className="text-base font-base text-white px-4 py-2 border-b border-r border-gray-300">
                                            Поставщик
                                        </th>
                                        <th className="text-base font-base text-white px-4 py-2 border-b">
                                            Действия
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {personalOrders &&
                                        personalOrders.map((personalOrder) => (
                                            <tr key={personalOrder.id}>
                                                <td className="text-base font-base text-white px-4 py-2 border-b border-r border-gray-300">
                                                    {personalOrder.user.company}
                                                </td>
                                                <td className="px-4 py-2 border-b">
                                                    <div className="flex justify-center">
                                                        {personalOrder.is_empty ? (
                                                            <div className="px-4 py-2 w-32 text-white text-sm font-medium rounded-md border border-1 border-red-500">
                                                                Заказ пустой
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() =>
                                                                    handleDownloadPersonalOrder(
                                                                        personalOrder
                                                                    )
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
                                                                    <span>
                                                                        Загрузка...
                                                                    </span>
                                                                ) : (
                                                                    <span>
                                                                        Скачать
                                                                        заказ
                                                                    </span>
                                                                )}
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-6 flex flex-col gap-4">
                            <div className="flex justify-start gap-4">
                                <button
                                    onClick={() =>
                                        handleRequestSummary('summary')
                                    }
                                    disabled={loadingStates['summary']}
                                    className={`w-48 h-12 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-base font-semibold px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-600 hover:scale-105 hover:shadow-[0_0_8px_rgba(37,99,235,0.6)] focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-[#39393A] transition-all duration-200 flex items-center justify-center space-x-2 ${
                                        loadingStates['summary']
                                            ? 'opacity-50 cursor-not-allowed'
                                            : ''
                                    }`}
                                    aria-label="Скачать сводку заказа"
                                >
                                    {loadingStates['summary'] ? (
                                        <span>Загрузка...</span>
                                    ) : (
                                        <>
                                            <FaCloudDownloadAlt className="text-lg" />
                                            <span className="text-xs">
                                                Скачать последнюю сводку
                                            </span>
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() =>
                                        handleDownloadAllPersonalOrders()
                                    }
                                    disabled={
                                        loadingStates['allPersonalOrders']
                                    }
                                    className={`w-48 h-12 bg-gradient-to-r from-orange-600 to-orange-500 text-white text-base font-semibold px-6 py-3 rounded-lg hover:from-orange-700 hover:to-orange-600 hover:scale-105 hover:shadow-[0_0_8px_rgba(249,115,22,0.6)] focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-[#39393A] transition-all duration-200 flex items-center justify-center space-x-2 ${
                                        loadingStates['allPersonalOrders']
                                            ? 'opacity-50 cursor-not-allowed'
                                            : ''
                                    }`}
                                    aria-label="Скачать все персональные заказы"
                                >
                                    {loadingStates['allPersonalOrders'] ? (
                                        <span>Загрузка...</span>
                                    ) : (
                                        <>
                                            <FaCloudDownloadAlt className="text-lg" />
                                            <span className="text-xs">
                                                Скачать все персональные заказы
                                            </span>
                                        </>
                                    )}
                                </button>
                            </div>
                            <div className="flex flex-col gap-4">
                                <div className="w-full flex items-center gap-2">
                                    <label className="flex-1 flex items-center p-3 bg-[#222224] border border-gray-300 rounded-lg cursor-pointer hover:bg-[#2a2a2c] hover:shadow-[0_0_8px_rgba(255,255,255,0.1)] transition-all duration-200 focus-within:ring-2 focus-within:ring-orange-400">
                                        <FaCloudUploadAlt className="text-orange-400 mr-2 text-lg" />
                                        <span className="text-white truncate">
                                            {selectedFile
                                                ? selectedFile.name
                                                : 'Выберите файл (.xlsx, .xls)'}
                                        </span>
                                        <input
                                            type="file"
                                            accept=".xlsx,.xls"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                    </label>
                                    {selectedFile && (
                                        <FaTimes
                                            className="text-red-500 cursor-pointer hover:text-red-400 transition-colors duration-200"
                                            onClick={handleClearFile}
                                        />
                                    )}
                                </div>
                                <button
                                    onClick={handleCreateOrders}
                                    disabled={!selectedFile || isFileUploading}
                                    className={`w-48 h-12 bg-gradient-to-r from-purple-600 to-purple-500 text-white text-base font-semibold px-6 py-3 rounded-lg hover:from-purple-700 hover:to-purple-600 hover:scale-105 hover:shadow-[0_0_8px_rgba(147,51,234,0.6)] focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-[#39393A] transition-all duration-200 flex items-center justify-center ${
                                        !selectedFile || isFileUploading
                                            ? 'opacity-50 cursor-not-allowed'
                                            : ''
                                    }`}
                                    aria-label="Создать персональные заказы"
                                >
                                    {isFileUploading ? (
                                        <span>Загрузка...</span>
                                    ) : (
                                        <span>Обновить заказы</span>
                                    )}
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-end mt-6">
                            <button
                                onClick={handleDeleteOrder}
                                className="w-30 h-8 bg-red-600 text-white text-xs px-6 rounded-lg font-base hover:bg-red-700 hover:scale-105 hover:shadow-[0_0_8px_rgba(220,38,38,0.6)] focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-[#39393A] transition-all duration-200"
                            >
                                Удалить заказ
                            </button>
                        </div>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <>
            {renderActions()}
            {isBiddingModalOpen &&
                renderDeadlineModal({
                    title: 'Установить дедлайн для торгов',
                    onSubmit: handleBiddingSubmit,
                })}
            {isOrderDeadlineModalOpen &&
                renderDeadlineModal({
                    title: 'Изменить дедлайн заказа',
                    onSubmit: handleUpdateOrderDeadline,
                })}
            {isParticipantDeadlineModalOpen &&
                renderDeadlineModal({
                    title: 'Изменить дедлайн участника',
                    onSubmit: handleUpdateParticipantDeadline,
                })}
        </>
    );
};

export default OrderActions;
