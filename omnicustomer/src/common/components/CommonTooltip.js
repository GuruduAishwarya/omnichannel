import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

const CommonTooltip = ({ placement, message, children }) => {
    const renderTooltip = (props) => (
        <Tooltip id='tooltip' {...props}>
            {message}
        </Tooltip>
    );

    return (
        <OverlayTrigger
            placement={placement}
            overlay={renderTooltip}
        >
            {children}
        </OverlayTrigger>
    );
};

export default CommonTooltip;