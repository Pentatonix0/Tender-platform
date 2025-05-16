import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { login } from '../utils/auth';
import InputField from '../components/common/universal_components/InputField';

const SignUpPage = () => {
    const navigate = useNavigate();
    const [serverResponse, setServerResponse] = useState('');
    const [serverError, setServerError] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm();

    const onSubmit = async (data) => {
        if (data.password !== data.confirmPassword) {
            setServerError('Passwords do not match');
            return;
        }

        const body = {
            username: data.login,
            email: data.email,
            company: data.company,
            password: data.password,
        };

        try {
            const response = await axios.post('/api/auth/signup', body, {
                headers: { 'Content-Type': 'application/json' },
            });
            setServerResponse(
                response.data.message || 'Registration successful'
            );
            setServerError('');
            login(response.data);
            navigate('/');
        } catch (err) {
            console.error('Error:', err);
            setServerError(err.response?.data?.message || 'Registration error');
            setServerResponse('');
        }
    };

    return (
        <div className="min-h-screen bg-[#18181A] flex items-center justify-center">
            <div className="mt-24 mb-24 max-w-md w-full bg-[#222224] p-8 rounded-2xl border border-1 border-gray-600 shadow-lg shadow-[0px_0px_8px_0px_rgba(255,255,255,0.1)] animate-fade-in">
                <h1 className="text-3xl font-semibold text-white text-center mb-6">
                    Sign Up
                </h1>
                {serverResponse && (
                    <div className="flex items-center bg-green-900/20 border border-green-600/30 p-4 rounded-xl mb-6">
                        <FiCheckCircle className="text-green-500 text-xl mr-3" />
                        <p className="text-green-500 text-sm">
                            {serverResponse}
                        </p>
                    </div>
                )}
                {serverError && (
                    <div className="flex items-center bg-orange-900/20 border border-orange-600/30 p-4 rounded-xl mb-6">
                        <FiAlertCircle className="text-orange-500 text-xl mr-3" />
                        <p className="text-orange-500 text-sm">{serverError}</p>
                    </div>
                )}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <InputField
                        id="login"
                        label="Username"
                        type="text"
                        register={register}
                        errors={errors}
                        validation={{
                            required: 'Username is required',
                            maxLength: {
                                value: 25,
                                message:
                                    'Username cannot be longer than 25 characters',
                            },
                            minLength: {
                                value: 4,
                                message:
                                    'Username must be at least 4 characters',
                            },
                        }}
                        labelTextColor="gray-200"
                        inputClassName="w-full p-3 bg-[#39393A] text-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                        errorClassName="text-orange-500 text-sm mt-1"
                    />
                    <InputField
                        id="email"
                        label="Email"
                        type="email"
                        register={register}
                        errors={errors}
                        validation={{
                            required: 'Email is required',
                            maxLength: {
                                value: 80,
                                message:
                                    'Email cannot be longer than 80 characters',
                            },
                        }}
                        labelTextColor="gray-200"
                        inputClassName="w-full p-3 bg-[#39393A] text-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                        errorClassName="text-orange-500 text-sm mt-1"
                    />
                    <InputField
                        id="company"
                        label="Company Name"
                        type="text"
                        register={register}
                        errors={errors}
                        validation={{
                            required: 'Company name is required',
                            maxLength: {
                                value: 80,
                                message:
                                    'Company name cannot be longer than 80 characters',
                            },
                        }}
                        labelTextColor="gray-200"
                        inputClassName="w-full p-3 bg-[#39393A] text-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                        errorClassName="text-orange-500 text-sm mt-1"
                    />
                    <InputField
                        id="password"
                        label="Password"
                        type="password"
                        register={register}
                        errors={errors}
                        validation={{
                            required: 'Password is required',
                            minLength: {
                                value: 8,
                                message:
                                    'Password must be at least 8 characters',
                            },
                        }}
                        labelTextColor="gray-200"
                        inputClassName="w-full p-3 bg-[#39393A] text-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                        errorClassName="text-orange-500 text-sm mt-1"
                    />
                    <InputField
                        id="confirmPassword"
                        label="Confirm Password"
                        type="password"
                        register={register}
                        errors={errors}
                        validation={{
                            required: 'Password confirmation is required',
                            validate: (value) =>
                                value ===
                                    document.getElementById('password').value ||
                                'Passwords do not match',
                        }}
                        labelTextColor="gray-200"
                        inputClassName="w-full p-3 bg-[#39393A] text-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                        errorClassName="text-orange-500 text-sm mt-1"
                    />
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white text-lg font-medium rounded-md hover:from-orange-700 hover:to-orange-600 hover:shadow-[0_0_6px_rgba(249,115,22,0.6)] hover:scale-101 focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-[#222224] transition-all duration-200 ${
                            isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        aria-label="Register"
                    >
                        {isSubmitting ? 'Registering...' : 'Register'}
                    </button>
                </form>
            </div>
            <style jsx>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out;
                }
            `}</style>
        </div>
    );
};

export default SignUpPage;
