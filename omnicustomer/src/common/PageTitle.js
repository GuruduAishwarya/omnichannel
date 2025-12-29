import React from 'react'
import MetaTitle from './MetaTitle'

export default function PageTitle({ heading, showPrimaryButton, showWarningButton, onPrimaryClick, onWarningClick, otherElements, numberButtonHide }) {
    const props = {
        title: heading + " | Social media Sync ",
        description: "Premium Multipurpose Admin & Dashboard Template"
    }

    return (
        <>
            <MetaTitle {...props} />
            <div className="row w-100 mb-3">
                <div className="d-flex align-items-center justify-content-between flex-wrap">
                    {heading && <h4 className="fw-bold text-primary">{heading}</h4>}
                    <div className="d-flex align-items-center">
                        {otherElements}
                        {showWarningButton && !numberButtonHide && (
                            <button
                                type="button"
                                className="btn btn-warning d-flex align-items-center"
                                onClick={onWarningClick}
                            >
                                <span className="">{showWarningButton}</span>
                            </button>
                        )}
                        {showPrimaryButton && !numberButtonHide && (
                            <button
                                type="button"
                                className="btn btn-primary ms-2 d-flex align-items-center"
                                onClick={onPrimaryClick}
                            >
                                <span className="">{showPrimaryButton}</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}


