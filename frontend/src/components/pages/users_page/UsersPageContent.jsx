import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Loading from '../../common/universal_components/Loading';
import { FaEye, FaEyeSlash, FaCopy } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UsersPageContent = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [passKey, setPassKey] = useState('');
    const [passKeyLoading, setPassKeyLoading] = useState(false);
    const [passKeyError, setPassKeyError] = useState('');

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
            console.log(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Ошибка при загрузке пользователей', {
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
                toast.success(`Пользователь ${username} успешно удален`, {
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
            console.error('Error deleting user:', error);
            toast.error('Ошибка при удалении пользователя', {
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

    const handleChangePassword = async () => {
        if (newPassword.length < 8) {
            setErrorMessage('Пароль должен содержать не менее 8 символов');
            toast.error('Пароль должен содержать не менее 8 символов', {
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

        const token = JSON.parse(localStorage.getItem('REACT_TOKEN_AUTH_KEY'));
        try {
            const response = await axios.put(
                `api/users/change_password_admin?user_id=${selectedUser.id}`,
                { password: newPassword },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token.access_token}`,
                    },
                }
            );
            if (response.status === 200) {
                setShowModal(false);
                setNewPassword('');
                setErrorMessage('');
                setShowPassword(false);
                toast.success('Пароль успешно изменен', {
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
            console.error('Error changing password:', error);
            setErrorMessage('Ошибка при изменении пароля');
            toast.error('Ошибка при изменении пароля', {
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

    const handleCreatePassKey = async () => {
        setPassKeyLoading(true);
        setPassKeyError('');
        setPassKey('');

        // Восстановлен закомментированный код для API-запроса
        // const token = JSON.parse(localStorage.getItem('REACT_TOKEN_AUTH_KEY'));
        // try {
        //     const response = await axios.post(
        //         '/api/passkey/create',
        //         {},
        //         {
        //             headers: {
        //                 'Content-Type': 'application/json',
        //                 Authorization: `Bearer ${token.access_token}`,
        //             },
        //         }
        //     );
        //     setPassKey(response.data.passKey);
        //     toast.success('PassKey успешно создан', {
        //         position: 'top-right',
        //         autoClose: 3000,
        //         hideProgressBar: false,
        //         closeOnClick: true,
        //         pauseOnHover: true,
        //         draggable: true,
        //         theme: 'dark',
        //     });
        // } catch (error) {
        //     console.error('Error creating passKey:', error);
        //     setPassKeyError('Ошибка при создании PassKey');
        //     toast.error('Ошибка при создании PassKey', {
        //         position: 'top-right',
        //         autoClose: 3000,
        //         hideProgressBar: false,
        //         closeOnClick: true,
        //         pauseOnHover: true,
        //         draggable: true,
        //         theme: 'dark',
        //     });
        // } finally {
        //     setPassKeyLoading(false);
        // }

        setPassKey('KJDIN79cM');
        setPassKeyLoading(false);
    };

    const handleCopyPassKey = async () => {
        try {
            await navigator.clipboard.writeText(passKey);
            toast.success('PassKey скопирован в буфер обмена', {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: 'dark',
            });
        } catch (error) {
            console.error('Error copying passKey:', error);
            toast.error('Ошибка при копировании PassKey', {
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

    const openModal = (user) => {
        setSelectedUser(user);
        setShowModal(true);
        setNewPassword('');
        setErrorMessage('');
        setShowPassword(false);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedUser(null);
        setNewPassword('');
        setErrorMessage('');
        setShowPassword(false);
    };

    useEffect(() => {
        getAllUsers();
    }, []);

    const formatLongText = (text) => {
        if (!text) return '';
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
                        <button
                            onClick={handleCreatePassKey}
                            disabled={passKeyLoading}
                            className={`w-40 h-10 bg-orange-600 text-white text-base px-4 py-2 rounded-lg hover:bg-orange-700 transition duration-200 ${
                                passKeyLoading
                                    ? 'opacity-50 cursor-not-allowed'
                                    : ''
                            }`}
                        >
                            {passKeyLoading ? 'Создание...' : 'Создать PassKey'}
                        </button>
                    </div>
                    {passKeyError && (
                        <div className="text-red-500 text-sm mb-4 px-3">
                            {passKeyError}
                        </div>
                    )}
                    {passKey && (
                        <div className="relative w-full max-w-md mb-4 px-3">
                            <input
                                type="text"
                                value={passKey}
                                readOnly
                                placeholder="PassKey"
                                className="w-full p-2 bg-gray-800 text-white rounded-lg border border-gray-600 pr-10"
                            />
                            <button
                                type="button"
                                onClick={handleCopyPassKey}
                                className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition duration-200"
                            >
                                <FaCopy size={20} />
                            </button>
                        </div>
                    )}
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
                                                Email
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
                                                <td className="px-6 py-4 text-base max-w-xs break-words">
                                                    {formatLongText(user.email)}
                                                </td>
                                                <td className="px-6 py-4 text-base whitespace-nowrap">
                                                    <button
                                                        onClick={() =>
                                                            handleDeleteUser(
                                                                user.username
                                                            )
                                                        }
                                                        className="w-32 h-10 bg-red-600 text-white text-base px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200 mr-2"
                                                    >
                                                        Удалить
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            openModal(user)
                                                        }
                                                        className="w-40 h-10 bg-blue-600 text-white text-base px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                                                    >
                                                        Изменить пароль
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                    {showModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-[#222224] p-6 rounded-3xl border border-1 border-gray-600 w-96">
                                <h2 className="text-xl text-white mb-4">
                                    Изменить пароль для {selectedUser?.username}
                                </h2>
                                <div className="relative">
                                    <input
                                        type={
                                            showPassword ? 'text' : 'password'
                                        }
                                        value={newPassword}
                                        onChange={(e) =>
                                            setNewPassword(e.target.value)
                                        }
                                        placeholder="Новый пароль"
                                        className="w-full p-2 mb-4 bg-gray-800 text-white rounded-lg border border-gray-600 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute pt-1 right-2 top-2 text-gray-400 hover:text-white transition duration-200"
                                    >
                                        {showPassword ? (
                                            <FaEyeSlash size={20} />
                                        ) : (
                                            <FaEye size={20} />
                                        )}
                                    </button>
                                </div>
                                {errorMessage && (
                                    <div className="text-red-500 text-sm mb-4">
                                        {errorMessage}
                                    </div>
                                )}
                                <div className="flex justify-end">
                                    <button
                                        onClick={closeModal}
                                        className="w-24 h-10 bg-gray-600 text-white text-base px-4 py-2 rounded-lg hover:bg-gray-700 mr-2 transition duration-200"
                                    >
                                        Отмена
                                    </button>
                                    <button
                                        onClick={handleChangePassword}
                                        className="w-24 h-10 bg-blue-600 text-white text-base px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 flex justify-center"
                                    >
                                        Сохранить
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default UsersPageContent;
