import React from 'react'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

export default function FallbackUI() {
    return (
        <>
            <div className="iq-top-navbar">
                <nav className="nav navbar navbar-expand-lg navbar-light iq-navbar p-lg-0">
                    <div className="container-fluid navbar-inner">
                        <div className="d-flex align-items-center gap-3 pb-2 pb-lg-0 me-auto">
                            <Skeleton circle width={40} height={40} />
                            <Skeleton width={300} height={40} />
                        </div>
                        <ul className="navbar-nav navbar-list">
                            <li className="nav-item d-lg-none">
                                <Skeleton width={40} height={40} />
                            </li>
                            <li className="nav-item dropdown">
                                <Skeleton width={120} height={40} />
                            </li>
                        </ul>
                    </div>
                </nav>
            </div>
            <aside className="sidebar sidebar-default sidebar-base navs-rounded-all sidebar-mini sidebar-hover" id="first-tour" data-toggle="main-sidebar" data-sidebar="responsive">
                <div className="sidebar-body pt-0 data-scrollbar" data-scrollbar="true" tabindex="-1" style={{ overflow: "hidden", outline: "none" }}>
                    <div class="scroll-content">
                        <div className="sidebar-list">
                            <ul className="navbar-nav iq-main-menu" id="sidebar-menu">
                                <li class="nav-item  mt-3 mb-0">
                                    <Skeleton rectangle width={40} height={40} count={10} />
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </aside>
            <div id="content-page" class="content-page">
                <div class="container">
                    <div className="row w-100 mb-4 mt-5">
                        <div className="d-flex align-items-center justify-content-between flex-wrap">
                            <h4 className="fw-bold text-primary"><Skeleton /></h4>
                            <div className="d-flex align-items-center">
                                <Skeleton width={40} height={40} />
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-sm-12 col-lg-12">
                            <div class="card">
                                <div class="card-header border-0">
                                    <Skeleton />
                                </div>
                                <div class="card-body">
                                    <Skeleton count={10} />

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>

    )
}
