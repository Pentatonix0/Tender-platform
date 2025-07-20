import React from 'react';

const InputFieldArrow = React.forwardRef(
    (
        {
            id,
            label,
            type = 'text',
            register,
            errors,
            validation = {},
            onKeyDown = null,
            onChange = null,
            defaultValue = '',
            order,
            value_flag,
            setOrder,
            itemId,
            ...props
        },
        ref
    ) => {
        const {
            ref: registerRef,
            onChange: formOnChange,
            ...restRegister
        } = register(id, {
            ...validation,
            setValueAs: (value) => (value === '' ? null : parseFloat(value)),
        });

        const handleKeyPress = (e) => {
            const { value, selectionStart } = e.target;
            const key = e.key;

            // Разрешаем: цифры, Backspace, Delete, Tab, стрелки
            if (/[0-9]|Backspace|Delete|Tab|Arrow/.test(key)) {
                return;
            }

            // Разрешаем точку, но только одну и не в начале
            if (key === '.' && !value.includes('.') && selectionStart !== 0) {
                return;
            }

            e.preventDefault();
        };

        const handleChange = (e) => {
            const value = e.target.value;

            // Проверяем формат числа с максимум 2 знаками после точки
            if (value === '' || /^[0-9]+(\.[0-9]{0,2})?$/.test(value)) {
                formOnChange(e);
                // if (onChange) {
                //     onChange(e);
                // }
                if (order && setOrder && itemId) {
                    setOrder((prevOrder) => {
                        const updatedLastPrices = prevOrder.last_prices.map(
                            (item) => {
                                if (item.price.order_item.id === itemId) {
                                    return {
                                        ...item,
                                        price: {
                                            ...item.price,
                                            price: value,
                                        },
                                    };
                                }
                                return item;
                            }
                        );
                        return {
                            ...prevOrder,
                            last_prices: updatedLastPrices,
                        };
                    });
                }
            } else {
                // Если введено больше 2 знаков после точки, обрезаем
                const parts = value.split('.');
                if (parts.length === 2 && parts[1].length > 2) {
                    e.target.value = `${parts[0]}.${parts[1].substring(0, 2)}`;
                    formOnChange(e);
                    if (onChange) {
                        onChange(e);
                    }
                    if (order && setOrder && itemId) {
                        setOrder((prevOrder) => {
                            const updatedLastPrices = prevOrder.last_prices.map(
                                (item) => {
                                    if (item.price.order_item.id === itemId) {
                                        return {
                                            ...item,
                                            price: {
                                                ...item.price,
                                                price: e.target.value,
                                            },
                                        };
                                    }
                                    return item;
                                }
                            );
                            return {
                                ...prevOrder,
                                last_prices: updatedLastPrices,
                            };
                        });
                    }
                }
            }
        };

        return (
            <div className="m-2">
                {label && (
                    <label
                        htmlFor={id}
                        className="block text-base font-medium text-gray-700"
                    >
                        {label}
                    </label>
                )}
                <input
                    type={type}
                    id={id}
                    className={`p-1 text-base ${
                        value_flag ? 'text-black' : 'text-gray-200'
                    } w-full border rounded-md
                    ${
                        errors[id]
                            ? 'border-red-500 bg-red-100'
                            : 'border-gray-300 bg-gray-200'
                    }
                    focus:outline-none focus:ring-2 focus:ring-orange-500`}
                    {...restRegister}
                    onChange={handleChange}
                    onKeyDown={(e) => {
                        handleKeyPress(e);
                        onKeyDown && onKeyDown(e);
                    }}
                    defaultValue={defaultValue}
                    inputMode="decimal"
                    ref={(e) => {
                        registerRef(e);
                        if (ref) {
                            if (typeof ref === 'function') {
                                ref(e);
                            } else {
                                ref.current = e;
                            }
                        }
                    }}
                    autoComplete="off"
                    {...props}
                />
                {errors[id] && (
                    <span className="text-red-500 text-sm mt-1 block">
                        {errors[id].message}
                    </span>
                )}
            </div>
        );
    }
);

export default InputFieldArrow;
