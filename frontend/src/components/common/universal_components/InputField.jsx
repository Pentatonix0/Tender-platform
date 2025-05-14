import React from 'react';

const InputField = ({
    id,
    label,
    type,
    register,
    errors,
    validation,
    labelTextColor = 'gray-700', // Значение по умолчанию
    errorTextColor = 'red-500', // Значение по умолчанию
    borderColor = 'gray-300',
    bgColor = 'gray-300',
    focusColor = 'orange-500',
    textColor = 'black',
}) => (
    <div className="mb-4">
        <label
            htmlFor={id}
            className={`block text-base font-base text-${labelTextColor}`}
        >
            {label}
        </label>
        <input
            type={type}
            id={id}
            className={`mt-1 p-2 w-full border rounded-md text-base text-${textColor}
                ${
                    errors[id]
                        ? 'border-red-500 bg-red-100'
                        : `border-${borderColor} bg-${bgColor}`
                }
                focus:outline-none focus:ring focus:ring-${focusColor}`}
            {...register(id, validation)}
        />
        {errors[id] && (
            <span className={`text-sm text-${errorTextColor}`}>
                {errors[id].message}
            </span>
        )}
    </div>
);

export default InputField;
