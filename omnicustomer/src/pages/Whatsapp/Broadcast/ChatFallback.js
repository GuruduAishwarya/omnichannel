import React from 'react'
import Skeleton from 'react-loading-skeleton'

export default function ChatFallback() {
    return (
        <>
            <div class="chat-head">
                <header class="d-flex justify-content-between align-items-center bg-white pt-3  ps-3 pe-3 pb-3 border-bottom rounded-top">
                    <div class="d-flex align-items-center">
                        <Skeleton circle width={40} height={40} />
                        <div class="d-flex align-items-center w-100 iq-userlist-data ms-2">
                            <Skeleton rectangle width={100} height={40} />

                        </div>
                    </div>
                    <div class="chat-header-icons d-inline-flex ms-auto">
                        <div id="the-final-countdown">
                            <Skeleton rectangle width={100} height={40} />
                        </div>
                    </div>
                </header>
            </div>
            <div class="card-body chat-body inbox-body bg-body">
                <div class="iq-message-body iq-other-user  gap-0">
                    <div class="chat-profile me-2">
                        <Skeleton circle width={40} height={40} />
                    </div>
                    <div class="iq-chat-text">
                        <div class="d-flex align-items-center justify-content-start">
                            <div class="iq-chating-content ">
                                <Skeleton rectangle width={560} height={80} />
                            </div>
                        </div>
                    </div>
                </div>

                <div class="iq-message-body iq-current-user " >
                    <div class="iq-chating-content bg-light bg-gradient">
                        <Skeleton rectangle width={560} height={80} />
                    </div>
                </div>
                <div class="iq-message-body iq-other-user  gap-0" >
                    <div class="chat-profile me-2">
                        <Skeleton circle width={40} height={40} />
                    </div>
                    <div class="iq-chat-text">
                        <div class="d-flex align-items-center justify-content-start">
                            <div class="iq-chating-content ">
                                <Skeleton rectangle width={560} height={80} />
                            </div>
                        </div>
                    </div>
                </div>

                <div class="iq-message-body iq-current-user">
                    <div class="iq-chating-content bg-light bg-gradient">
                        <Skeleton rectangle width={560} height={80} />
                    </div>
                </div>

            </div>
            <div class="card-footer px-3 py-3 border-top rounded-0">
                <div class="d-flex align-items-center justify-content-between">
                    <div class="chat-attagement d-flex">
                        <Skeleton circle width={30} height={30} />

                    </div>
                    <Skeleton rectangle width={800} height={40} />
                    <Skeleton rectangle width={70} height={40} />

                </div>
            </div>
        </>
    )
}
