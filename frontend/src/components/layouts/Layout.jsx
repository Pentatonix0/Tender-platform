import { Outlet } from 'react-router-dom';
import Navbar from '../common/navbar/Navbar';
import Footer from '../common/footer/Footer';

const Layout = () => {
    return (
        <div className="app">
            <Navbar />
            <main className="content min-h-screen bg-[#18181A]">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
