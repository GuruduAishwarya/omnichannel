import React, { useState } from "react";
import Header from "./Header";
// import Sidebar from "./Sidebar";
// import RightSidebar from "./RightSidebar";
import Footer from "./Footer";
import CommunicationSidebar from "./CommunicationSidebar";

export default function Layout({ children }) {
  const [toggleSidebar, setToggleSidebar] = useState(true);

  const handleToggleSidebar = () => {
    setToggleSidebar((prev) => !prev);
  };

  return (
    <>
      <Header
        toggleSidebar={toggleSidebar}
        handleToggleSidebar={handleToggleSidebar}
      />
      <CommunicationSidebar toggleSidebar={toggleSidebar} />
      {children}
      <Footer />
    </>
  );
}
