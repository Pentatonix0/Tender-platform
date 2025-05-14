import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ToastDarkContainer = () => {
    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
                toastStyle={{
                    backgroundColor: '#39393A',
                    color: '#FFFFFF',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
                progressStyle={{
                    background: 'linear-gradient(to right, #F97316, #F59E0B)',
                }}
            />
        </>
    );
};

export default ToastDarkContainer;
