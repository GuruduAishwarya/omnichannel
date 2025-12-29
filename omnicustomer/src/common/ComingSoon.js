import React from 'react'
import MetaTitle from './MetaTitle';

export default function ComingSoon() {
    const props = {
        title:  " Coming Soon | Social media Sync ",
        description: "Premium Multipurpose Admin & Dashboard Template"
    }

    return (
        <>
        <MetaTitle {...props} />
        <div id="content-page" class="content-page">
            <div class="container">

                <div class="row w-100 mb-4 mt-3">
                    <div class="d-flex align-items-center justify-content-between flex-wrap">
                        <h4 class="fw-bold text-primary">Coming Soon!!</h4>
                    </div>
                </div>
                <div class="row">
                    <div class="col-sm-12 col-lg-12">
                        <div class="card">

                            <div class="card-body">
                                <h5 class="mb-3 fw-500">We're excited to announce that we're currently building something amazing! Check back soon.</h5>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    )
}
