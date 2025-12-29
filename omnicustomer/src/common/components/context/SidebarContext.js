import React, { createContext, useState, useContext, useEffect } from 'react';
import { gettingMenuType, settingMenuType } from '../../../utils/CommonFunctions';

const SidebarContext = createContext();

export const SidebarContextProvider = ({ children }) => {
    const initialValue = gettingMenuType()
    const [sidebarType, setSidebarType] = useState(initialValue);

    // Save the state to localStorage whenever it changes
    useEffect(() => {
        settingMenuType(sidebarType)
    }, [sidebarType]);

    return (
        <SidebarContext.Provider value={{ sidebarType, setSidebarType }}>
            {children}
        </SidebarContext.Provider>
    );
};

export const useSharedState = () => useContext(SidebarContext);
