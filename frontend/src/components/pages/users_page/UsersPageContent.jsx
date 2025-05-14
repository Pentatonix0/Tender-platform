import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Loading from '../../common/universal_components/Loading';

const UsersPageContent = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const getAllUsers = async () => {
        const token = JSON.parse(localStorage.getItem('REACT_TOKEN_AUTH_KEY'));
        try {
            const response = await axios.get('api/users/get_all_users', {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token.access_token}`,
                },
            });
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (username) => {
        const confirmed = window.confirm(
            `Вы уверены, что хотите удалить пользователя ${username}?`
        );
        if (!confirmed) return;

        const token = JSON.parse(localStorage.getItem('REACT_TOKEN_AUTH_KEY'));
        try {
            const response = await axios.delete('api/users/delete_user', {
                params: { username },
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token.access_token}`,
                },
            });
            if (response.status === 200) {
                setUsers(users.filter((user) => user.username !== username));
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    useEffect(() => {
        getAllUsers();
    }, []);

    // Упрощенная функция для переноса длинного текста
    const formatLongText = (text) => {
        if (!text) return '';
        // Просто разрешаем тексту переноситься естественным образом
        return text;
    };

    return (
        <div className="flex flex-col max-w-7xl mx-auto px-20 py-8">
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loading />
                </div>
            ) : (
                <>
                    <div className="flex justify-between items-center mb-2">
                        <h1 className="text-2xl px-3 font-base font text-white">
                            Пользователи
                        </h1>
                    </div>

                    <div className="bg-[#222224] p-6 rounded-3xl shadow-base mt-2 border border-1 border-gray-600">
                        {users.length === 0 && !loading && (
                            <div className="text-center text-base text-white">
                                Нет пользователей
                            </div>
                        )}

                        {users.length > 0 && (
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-white">
                                    <thead>
                                        <tr>
                                            <th className="px-6 py-3 text-left text-base font-medium whitespace-nowrap">
                                                Имя пользователя
                                            </th>
                                            <th className="px-6 py-3 text-left text-base font-medium whitespace-nowrap">
                                                Компания
                                            </th>
                                            <th className="px-6 py-3 text-left text-base font-medium whitespace-nowrap">
                                                Действия
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700">
                                        {users.map((user, index) => (
                                            <tr key={index}>
                                                <td className="px-6 py-4 text-base max-w-xs break-words">
                                                    {formatLongText(
                                                        user.username
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-base max-w-xs break-words">
                                                    {formatLongText(
                                                        user.company
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-base whitespace-nowrap">
                                                    <button
                                                        onClick={() =>
                                                            handleDeleteUser(
                                                                user.username
                                                            )
                                                        }
                                                        className="w-32 h-10 bg-red-600 text-white text-base px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200"
                                                    >
                                                        Удалить
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default UsersPageContent;
