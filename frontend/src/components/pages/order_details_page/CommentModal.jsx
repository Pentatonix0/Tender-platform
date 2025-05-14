// components/CommentModal.js
import React from 'react';

const CommentModal = ({ isOpen, onClose, item, onSubmit }) => {
    const [comment, setComment] = React.useState(item.currentComment || '');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#222224] p-6 rounded-lg w-full max-w-md">
                <h3 className="text-base text-white mb-4">
                    <span className="text-base text-orange-400">
                        Comment for{' '}
                    </span>
                    "{item.name || item.price?.order_item?.item?.name}"
                </h3>

                <textarea
                    className="w-full p-2 mb-4 bg-gray-700 text-base text-white rounded"
                    rows="4"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Enter your comment..."
                />
                <div className="flex justify-end space-x-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-1 bg-gray-500 text-white text-base rounded hover:bg-gray-600"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onSubmit(comment)}
                        className="px-4 py-1 bg-[#FF5F00] text-white text-base rounded hover:bg-[#E55600]"
                    >
                        {item.currentComment ? 'Update' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CommentModal;
