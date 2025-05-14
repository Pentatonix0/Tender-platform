import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Loading from '../../common/universal_components/Loading';

const ProvidersList = ({ selectedProviders, setSelectedProviders }) => {
    const [loading, setLoading] = useState(true);
    const [providers, setProviders] = useState([]);

    // Функция для получения списка провайдеров
    const getAllProviders = async () => {
        try {
            const response = await axios.get('/api/users/get_all_users', {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            setProviders(response.data);
            setLoading(false);

            // Инициализация состояния с выбранными провайдерами по умолчанию
            const initialSelected = response.data.reduce((acc, provider) => {
                acc.push(provider.id); // Добавляем только id в массив
                return acc;
            }, []);

            setSelectedProviders(initialSelected); // Сохраняем массив id
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getAllProviders();
    }, []);

    // Обработчик изменения состояния чекбокса
    const handleCheckboxChange = (id) => {
        setSelectedProviders((prevSelected) => {
            // Если id уже в массиве, удаляем его, иначе добавляем
            if (prevSelected.includes(id)) {
                return prevSelected.filter((item) => item !== id);
            } else {
                return [...prevSelected, id];
            }
        });
    };

    // Функция для сброса всех выбранных чекбоксов
    const handleResetSelection = () => {
        setSelectedProviders([]); // Очищаем массив выбранных пользователей
    };

    // Функция для выделения всех пользователей
    const handleSelectAll = () => {
        const allProviderIds = providers.map((provider) => provider.id);
        setSelectedProviders(allProviderIds); // Выбираем всех провайдеров
    };

    return (
        <div className="p-6 bg-[#39393A] p-6 rounded-lg mt-2 shadow-[0px_0px_0px_1px_rgba(125,125,128)]">
            {loading ? (
                <Loading />
            ) : (
                <div>
                    {/* Кнопки сброса и выделения всех */}
                    <div className="flex space-x-4 mb-4">
                        {/* Кнопка сброса выделения */}
                        <button
                            type="button"
                            onClick={handleResetSelection}
                            className="px-4 py-2 bg-red-500 text-white text-xs rounded-lg shadow-md hover:bg-red-600 transition-colors"
                        >
                            Сбросить выделение
                        </button>

                        {/* Кнопка выделить все */}
                        <button
                            type="button"
                            onClick={handleSelectAll}
                            className="px-4 py-2 bg-blue-500 text-white text-xs rounded-lg shadow-md hover:bg-blue-600 transition-colors"
                        >
                            Выделить все
                        </button>
                    </div>

                    {/* Список провайдеров */}
                    <div className="space-y-4">
                        {providers.map((item) => (
                            <div
                                className="flex items-center justify-between p-2 bg-gray-200 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                                key={item.id}
                            >
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedProviders.includes(
                                            item.id
                                        )} // Проверка наличия id в массиве
                                        onChange={() =>
                                            handleCheckboxChange(item.id)
                                        }
                                        id={`checkbox-${item.id}`}
                                        className="w-5 h-5 border-gray-300 rounded-md cursor-pointer transition-all checked:bg-green-500 checked:border-green-500"
                                    />
                                    <label
                                        htmlFor={`checkbox-${item.id}`}
                                        className="font-semibold text-sm text-gray-700"
                                    >
                                        {item.company}
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProvidersList;
