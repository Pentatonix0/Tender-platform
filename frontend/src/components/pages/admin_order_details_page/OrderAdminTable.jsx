import React, { useState } from 'react';

const DataTable = ({ data, showText = true }) => {
    const [isTableVisible, setIsTableVisible] = useState(false); // Состояние для отображения таблицы
    const [isArrowRotated, setIsArrowRotated] = useState(false); // Состояние для вращения стрелки

    // Функция для переключения видимости таблицы
    const handleClick = () => {
        setIsTableVisible(!isTableVisible);
        setIsArrowRotated(!isArrowRotated); // Переключение состояния стрелки
    };

    return (
        <div className="mt-4">
            {data.length > 0 ? (
                <>
                    {showText ? (
                        <h3 className="text-base font-base text-gray-300 mb-2">
                            Данные из файла:
                        </h3>
                    ) : (
                        <h3></h3>
                    )}
                    <div className="w-full h-16 bg-[#39393A] rounded-lg shadow-[0px_0px_0px_1px_rgba(125,125,128)] relative">
                        {/* Контейнер для стрелки */}
                        <div
                            onClick={handleClick}
                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#FF5F00] p-3 rounded-full  hover:bg-red-600    cursor-pointer transition-transform duration-300"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                width="24"
                                height="24"
                                fill="white"
                                className={`transition-transform duration-300 ${
                                    isArrowRotated ? 'rotate-180' : ''
                                }`} // Добавляем класс для поворота стрелки
                            >
                                <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z" />
                            </svg>
                        </div>
                    </div>

                    {/* Если таблица видна, показываем её */}
                    {isTableVisible && (
                        <div className="bg-[#39393A] p-6 rounded-lg mt-4 shadow-[0px_0px_0px_1px_rgba(125,125,128)]">
                            <table className="min-w-full mt-2 border-collapse">
                                <thead>
                                    <tr>
                                        <th className="border p-2 text-gray-300">
                                            Name
                                        </th>
                                        <th className="border p-2 text-gray-300">
                                            Amount
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((pos, index) => (
                                        <tr key={index}>
                                            <td className="border p-2 text-gray-300">
                                                {pos.item
                                                    ? pos.item.name
                                                    : pos.name}
                                            </td>
                                            <td className="border p-2 text-gray-300">
                                                {pos.amount}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            ) : (
                <p className="text-xs text-red-400">
                    Нет данных для отображения.
                </p>
            )}
        </div>
    );
};

export default DataTable;
