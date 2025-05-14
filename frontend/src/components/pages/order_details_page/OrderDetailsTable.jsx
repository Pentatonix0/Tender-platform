import React, { useRef, useEffect, useState } from 'react';
import InputFieldArrow from '../../common/universal_components/InputFieldArrow';
import CommentModal from './CommentModal';

const OrderDetailsTable = ({ data, register, errors, onCommentsChange }) => {
    const inputRefs = useRef([]);
    const [activeCommentItem, setActiveCommentItem] = useState(null);
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [comments, setComments] = useState(() => {
        const initialComments = {};
        if (data.last_prices) {
            data.last_prices.forEach((item) => {
                if (item.price?.comment) {
                    initialComments[item.price.order_item.id] =
                        item.price.comment;
                }
            });
        }
        return initialComments;
    });

    useEffect(() => {
        onCommentsChange(comments);
    }, [comments, onCommentsChange]);

    const handleKeyDown = (event, index) => {
        if (event.key === 'ArrowDown' && index < data.last_prices.length - 1) {
            inputRefs.current[index + 1]?.focus();
        } else if (event.key === 'ArrowUp' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleAddComment = (item) => {
        const itemId = item.id || item.price?.order_item?.id;
        setActiveCommentItem({
            ...item,
            id: itemId,
            currentComment: comments[itemId] || '',
            name: item.name || item.price?.order_item?.item?.name,
        });
        setShowCommentModal(true);
    };

    const handleSaveComment = (comment) => {
        if (activeCommentItem) {
            setComments((prev) => ({
                ...prev,
                [activeCommentItem.id]: comment,
            }));
        }
        setShowCommentModal(false);
    };

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    const renderTableRow = (item, index, isEditable = false) => {
        const itemId = item.price?.order_item?.id || index;
        const hasComment = !!comments[itemId];
        const isBestPrice = item.is_the_best_price;

        // Условные классы для фона ячейки Price при isEditable
        const priceCellBgClass = isEditable
            ? isBestPrice === true
                ? 'bg-[#4ADE80]/30'
                : isBestPrice === false
                ? 'bg-[#FAED27]/50'
                : ''
            : '';

        return (
            <tr key={index} className="animate-fade-in">
                <td className="border p-2 text-gray-200 max-w-[512px]">
                    {item.name || item.price?.order_item?.item?.name}
                </td>
                <td className="border p-2 text-gray-200">
                    {item.amount || item.price?.order_item?.amount}
                </td>
                <td className={`border p-2 max-w-[150px] ${priceCellBgClass}`}>
                    {isEditable ? (
                        <div>
                            <InputFieldArrow
                                id={`price-${itemId}`}
                                type="numeric"
                                register={register}
                                errors={errors}
                                validation={{
                                    min: {
                                        value: 0,
                                        message:
                                            'Price can not be less than zero',
                                    },
                                    max: {
                                        value: 100000,
                                        message:
                                            'Price can not be more than 100000',
                                    },
                                }}
                                labelClassName="text-gray-800"
                                defaultValue={
                                    item.price?.price
                                        ? parseFloat(item.price?.price)
                                        : null
                                }
                                onKeyDown={(event) =>
                                    handleKeyDown(event, index)
                                }
                                ref={(el) => (inputRefs.current[index] = el)}
                            />
                            {isBestPrice ? (
                                <div className="flex justify-center text-white text-xs">
                                    Your price is the best!
                                </div>
                            ) : (
                                item.price.order_item.recommended_price && (
                                    <div className="flex justify-center text-white text-xs">
                                        {`Recommended price: ${item.price.order_item.recommended_price}`}
                                    </div>
                                )
                            )}
                        </div>
                    ) : (
                        <div className="text-gray-200">
                            {item.price?.price
                                ? parseFloat(item.price?.price)
                                : null}
                        </div>
                    )}
                </td>
                <td className="border p-2 text-center max-w-[150px]">
                    {isEditable ? (
                        <button
                            type="button"
                            onClick={() =>
                                handleAddComment({ ...item, id: itemId })
                            }
                            className={`px-2 py-1 text-white text-sm rounded-md font-medium ${
                                hasComment
                                    ? 'bg-teal-600 hover:bg-teal-700 hover:shadow-[0_0_6px_rgba(13,148,136,0.6)] hover:scale-101'
                                    : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-[0_0_6px_rgba(99,102,241,0.6)] hover:scale-101'
                            } focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#39393A] ${
                                hasComment
                                    ? 'focus:ring-teal-400'
                                    : 'focus:ring-indigo-400'
                            } transition-all duration-200`}
                            aria-label={
                                hasComment
                                    ? 'Edit comment for item'
                                    : 'Add comment for item'
                            }
                        >
                            {hasComment ? 'Edit comment' : 'Add comment'}
                        </button>
                    ) : (
                        <div
                            className="text-xs text-left text-gray-200 break-words"
                            title={item.price?.comment}
                        >
                            {item.price?.comment || ''}
                        </div>
                    )}
                </td>
            </tr>
        );
    };

    switch (data.status.code) {
        case 100:
        case 101:
        case 103:
        case 104:
            return (
                <div className="animate-slide-in">
                    <h3 className="text-xl font-medium text-[#FFFFFF] mb-4">
                        Products from the order
                    </h3>
                    <table className="min-w-full border-collapse table-fixed">
                        <thead>
                            <tr>
                                <th className="border p-2 text-gray-200">
                                    Product
                                </th>
                                <th className="border p-2 text-gray-200">
                                    Amount
                                </th>
                                <th className="border p-2 text-gray-200">
                                    Price
                                </th>
                                <th className="border p-2 text-gray-200 text-center">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.last_prices.map((last_price, index) =>
                                renderTableRow(last_price, index, true)
                            )}
                        </tbody>
                    </table>
                    {showCommentModal && (
                        <CommentModal
                            isOpen={showCommentModal}
                            onClose={() => setShowCommentModal(false)}
                            item={activeCommentItem}
                            onSubmit={handleSaveComment}
                        />
                    )}
                </div>
            );
        case 102:
        case 105:
        case 106:
            return (
                <div className="animate-slide-in">
                    <h3 className="text-xl font-medium text-[#FFFFFF] mb-4">
                        Products from the order
                    </h3>
                    <table className="min-w-full border-collapse table-fixed">
                        <thead>
                            <tr>
                                <th className="border p-2 text-gray-200">
                                    Product
                                </th>
                                <th className="border p-2 text-gray-200">
                                    Amount
                                </th>
                                <th className="border p-2 text-gray-200">
                                    Price
                                </th>
                                <th className="border p-2 text-gray-200 text-center">
                                    Comment
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.last_prices.map((last_price, index) =>
                                renderTableRow(last_price, index)
                            )}
                        </tbody>
                    </table>
                    {showCommentModal && (
                        <CommentModal
                            isOpen={showCommentModal}
                            onClose={() => setShowCommentModal(false)}
                            item={activeCommentItem}
                            onSubmit={handleSaveComment}
                        />
                    )}
                </div>
            );
        default:
            return <></>;
    }
};

export default OrderDetailsTable;
