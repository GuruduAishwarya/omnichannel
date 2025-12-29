import React from 'react'
import Footer from './Footer'
import Workspace_Header from './Workspace_Header'

export default function LayoutWorkspace({ children }) {
    return (
        <>
            <Workspace_Header />
            {children}

            <Footer />

        </>
    )
}
