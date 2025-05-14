import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import InputField from '../components/common/universal_components/InputField';
import OrderAdminTable from '../components/pages/admin_order_details_page/OrderAdminTable';
import ProvidersList from '../components/pages/admin_order_details_page/OrderAdminProvidersList';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Функция для получения текущей даты в нужном формате
const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const CreateOrder = () => {
    const navigate = useNavigate();
    const [orderData, setOrderData] = useState([]);
    const [selectedProviders, setSelectedProviders] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const token = JSON.parse(localStorage.getItem('REACT_TOKEN_AUTH_KEY'));

    const createOrder = async (data) => {
        setIsSubmitting(true);
        const allFalse = Object.values(selectedProviders).every(
            (value) => value === false
        );
        let showWarning = false;

        if (allFalse) {
            toast.warning('Должен быть выбран хотя бы один поставщик!', {
                position: 'top-right',
                autoClose: 3000,
            });
            showWarning = true;
        }

        if (orderData.length === 0) {
            toast.warning('Необходимо добавить файл', {
                position: 'top-right',
                autoClose: 3000,
            });
            showWarning = true;
        }

        if (showWarning) {
            setIsSubmitting(false);
            return;
        }

        const body = {
            title: data.title,
            description: data.description,
            status: 200,
            order_items: orderData,
            permitted_providers: selectedProviders,
        };

        try {
            const response = await axios.post(
                '/api/order/create_admin_order',
                body,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token.access_token}`,
                    },
                }
            );
            reset();
            navigate('/');
            setOrderData(response.data);
        } catch (error) {
            toast.error('Ошибка при создании заказа', {
                position: 'top-right',
                autoClose: 3000,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const defaultOrderTitle = `Order ${getCurrentDate()}`;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            title: defaultOrderTitle,
        },
    });

    const handleInputChange = (e) => {
        e.target.style.height = 'auto';
        e.target.style.height = `${e.target.scrollHeight}px`;
    };

    const handleFileChange = async (e) => {
        const formData = new FormData();
        formData.append('file', e.target.files[0]);

        try {
            const response = await axios.post(
                '/api/excel/excel_process',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token.access_token}`,
                    },
                }
            );
            setOrderData(response.data);
        } catch (error) {
            console.log(error);
            setOrderData([]);
            toast.error('Ошибка при чтении файла!', {
                position: 'top-right',
                autoClose: 3000,
            });
        }
    };

    return (
        <div className="min-h-screen bg-[#18181A] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="bg-[#222224] w-full max-w-4xl p-8 rounded-lg shadow-[0px_0px_1px_0px_rgba(255,255,255)]">
                <h1 className="text-3xl font-base text-white text-center mb-4">
                    Создание нового заказа
                </h1>
                <h2 className="text-xl font-base text-gray-300 text-center mb-6">
                    Информация о заказе
                </h2>
                <form
                    onSubmit={handleSubmit(createOrder)}
                    className="space-y-6"
                >
                    <InputField
                        id="title"
                        label="Название заказа"
                        type="text"
                        register={register}
                        errors={errors}
                        validation={{
                            required: 'Название обязательно',
                            maxLength: {
                                value: 80,
                                message:
                                    'Название не может быть длиннее 80 символов',
                            },
                        }}
                        className="w-full p-3 bg-[#39393A] text-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                        labelTextColor="white"
                    />
                    <div className="space-y-2">
                        <label
                            htmlFor="description"
                            className="block text-base font-base text-white"
                        >
                            Описание заказа
                        </label>
                        <textarea
                            id="description"
                            {...register('description', {
                                maxLength: {
                                    value: 240,
                                    message:
                                        'Описание не может быть длиннее 240 символов',
                                },
                            })}
                            onInput={handleInputChange}
                            rows={4}
                            className="w-full mt-2 p-3 bg-[#39393A] text-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                            placeholder="Введите описание..."
                        />
                        {errors.description && (
                            <p className="text-red-500 text-sm">
                                {errors.description.message}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <label
                            htmlFor="file"
                            className="block text-base font-base text-white"
                        >
                            Загрузить файл
                        </label>
                        <input
                            id="file"
                            type="file"
                            onChange={handleFileChange}
                            className="w-full p-3 bg-[#39393A] text-white rounded-lg border border-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-500 file:text-white hover:file:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                    </div>
                    <OrderAdminTable data={orderData} />
                    <div>
                        <h3 className="text-base font-semibold text-white mb-4">
                            Список поставщиков
                        </h3>
                        <ProvidersList
                            selectedProviders={selectedProviders}
                            setSelectedProviders={setSelectedProviders}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full h-12 bg-gradient-to-r from-orange-600 to-orange-500 text-white text-base font-semibold px-6 py-3 rounded-lg transition duration-200 ${
                            isSubmitting
                                ? 'opacity-50 cursor-not-allowed'
                                : 'hover:from-orange-700 hover:to-orange-600'
                        }`}
                    >
                        {isSubmitting ? 'Создание...' : 'Создать заказ'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateOrder;
