import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layouts/Layout';
import PrivateRoute from './utils/PrivateAuth';
import SignUpPage from './pages/SignUpPage';
import SignInPage from './pages/SignInPage';
import HomePage from './pages/HomePage';
import OrderDetails from './pages/OrderDetailsPage';
import CreateOrder from './pages/CreateOrderPage';
import AdminOrderDetailsPage from './pages/AdminOrderDetailsPage';
import UsersPage from './pages/UsersPage';
import Error404Page from './pages/Error404Page';
import PersonalOrderPage from './pages/PersonalOrdersPage';

const RouterProvider = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<HomePage />} />
                    <Route path="/signup" element={<SignUpPage />} />
                    <Route path="/login" element={<SignInPage />} />
                    <Route
                        path="/create_order"
                        element={
                            <PrivateRoute adminRequired={true}>
                                <CreateOrder />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/order_details/:orderId"
                        element={
                            <PrivateRoute adminRequired={true}>
                                <AdminOrderDetailsPage />
                            </PrivateRoute>
                        }
                    />
                    <Route path="/" element={<HomePage />} />
                    <Route
                        path="/order/:orderId"
                        element={
                            <PrivateRoute>
                                <OrderDetails />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/order_details/:orderId"
                        element={
                            <PrivateRoute adminRequired={true}>
                                <AdminOrderDetailsPage />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/my_orders"
                        element={
                            <PrivateRoute>
                                <PersonalOrderPage />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/users"
                        element={
                            <PrivateRoute adminRequired={true}>
                                <UsersPage />
                            </PrivateRoute>
                        }
                    />
                    <Route path="*" element={<Error404Page />} />
                </Route>
            </Routes>
        </Router>
    );
};

export default RouterProvider;
