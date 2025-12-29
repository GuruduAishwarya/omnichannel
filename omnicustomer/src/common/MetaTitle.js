import React from 'react'
import { Helmet } from 'react-helmet';

export default function MetaTitle(props) {
    return (
        <Helmet>
            <title>{props.title}</title>
            <meta content={props.description} name="description" />
            {/* Add more meta tags as needed */}
        </Helmet>
    )
}
