import React from 'react';
import UserValidator from '../../../utils/UserValidation';
import LoggedOutLinks from '../../Links/LoggedOutLinks';
import LoggedInUserLinks from '../../Links/LoggedInUserLinks';
import LoggedInAdminLinks from '../../Links/LoggedInAdminLinks';

const Navbar = () => {
    return (
        <header>
            <nav className="bg-[#18181A] min-h-20 p-4 sticky top-0 z-50 border-b border-1 border-gray-600">
                <UserValidator
                    loggedOutCont={LoggedOutLinks}
                    loggedInUserCont={LoggedInUserLinks}
                    loggedInAdminCont={LoggedInAdminLinks}
                />
            </nav>
        </header>
    );
};

export default Navbar;
