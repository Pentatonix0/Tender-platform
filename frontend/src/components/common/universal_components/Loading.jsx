const Loading = () => {
    return (
        <div className="flex justify-center items-center h-32">
            <div className="relative w-12 h-12">
                {/* Вращающееся кольцо с тонкой границей */}
                <div className="absolute w-full h-full border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>

                {/* Центральная точка */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-orange-500 rounded-full"></div>
            </div>
        </div>
    );
};

export default Loading;
