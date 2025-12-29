// SocketContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import io from 'socket.io-client';
import { getLoginData, getCookie } from './utils/CommonFunctions'

const SOCKET_SERVER_URL = process.env.REACT_APP_API_BASE_URL; // Replace with your server URL
// const SOCKET_SERVER_URL = process.env.REACT_APP_API_BASE_URL.replace("https://", "wss://").replace("http://", "ws://");
const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [userId, setUserId] = useState(getCookie('selected_workspace_id') || null);

    useEffect(() => {
        // console.log("first", userId)
        if (userId) {
            let user_logged_data = getLoginData();
            var auth_user = getCookie('full_name');
            var username = user_logged_data.username;
            // var user_id = user_logged_data.user_id;
            var user_id = userId;

            // let auth_user = "amritha"
            // let username = "amritha"
            // let user_id = 1
            // console.log("socket_url", SOCKET_SERVER_URL)
            const newSocket = io(SOCKET_SERVER_URL, {
                // path: "/socket.io", // or "/socket.io" based on your backend
                auth: { auth_user, username, user_id },
                // transports: ["websocket"], // Force WebSocket instead of polling
                reconnection: true,
                reconnectionAttempts: 5,
                timeout: 10000,
            });
            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
            };
        }
    }, [userId]);

    useEffect(() => {
        if (socket) {
            // console.log("Socket ID:", socket);
            // socket.on("connect", () => {
            //     console.log("✅ Socket connected! ID:", socket.id);
            // });

            // socket.on("disconnect", (reason) => {
            //     console.log("❌ Socket disconnected! Reason:", reason);
            // });

            // socket.on("connect_error", (error) => {
            //     console.log("⚠️ Connection error:", error);
            // });

            // return () => {
            //     socket.off("connect");
            //     socket.off("disconnect");
            //     socket.off("connect_error");
            // };
        }
    }, [socket]);


    const initializeSocket = (newUserId) => {
        setUserId(newUserId);
    };

    return (
        <SocketContext.Provider value={{ socket, initializeSocket }}>
            {children}
        </SocketContext.Provider>
    );
};
