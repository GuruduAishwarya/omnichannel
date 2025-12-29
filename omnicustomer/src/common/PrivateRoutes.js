import { Navigate, Outlet } from 'react-router-dom';
import { isLogin } from '../utils/CommonFunctions';
import Layout from './Layout';
import { SocketProvider } from '../SocketContext';
import LayoutWorkspace from './LayoutWorkspace';
import { SidebarContextProvider } from './components/context/SidebarContext';

const PrivateRoutes = ({ withLayout = false }) => {
    const auth = isLogin();
    return (
        auth ? (
            <SocketProvider>
                <SidebarContextProvider>
                    {withLayout ? (
                        <Layout>
                            <Outlet />
                        </Layout>
                    ) : (
                        <LayoutWorkspace >
                            <Outlet />
                        </LayoutWorkspace>
                    )}
                </SidebarContextProvider>
            </SocketProvider>
        ) : (
            <Navigate to='/login' />
        )
    );
};

export default PrivateRoutes;
