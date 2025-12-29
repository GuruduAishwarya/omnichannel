import React, { useState } from 'react'
import PageTitle from '../../../common/PageTitle'
import Brands from './Brands';
import Campaign from './Campaign';
import NumberAssignment from './NumberAssignment';

export default function CampaignRegistry() {
    const [activeTab, setActiveTab] = useState('brand');
    return (
        <div id="content-page" class="content-page">
            <div class="container">

                <PageTitle heading="Campaign Registry" />
                <div class="row">
                    <div class="col-lg-12">
                        <div class="card ">
                            <nav class="tab-bottom-bordered   ">
                                <div class="mb-0 nav nav-pills flex-column flex-md-row   rounded-top border-0" id="nav-tab1" role="tablist">
                                    <button class={`nav-link col-xs-12 ${activeTab === 'brand' ? 'active' : ''}`} id="nav-home-11-tab" data-bs-toggle="tab" data-bs-target="#nav-home-11" type="button" role="tab"
                                        aria-controls="nav-home-11" aria-selected={activeTab === 'brand'} onClick={() => setActiveTab('brand')}>My Brand</button>
                                    <button class={`nav-link col-xs-12 ms-1 ${activeTab === 'campaign' ? 'active' : ''}`} id="nav-profile-11-tab" data-bs-toggle="tab" data-bs-target="#nav-profile-11" type="button" role="tab"
                                        aria-controls="nav-profile-11 " aria-selected={activeTab === 'campaign'} tabindex="-1" onClick={() => setActiveTab('campaign')}>My Campaign</button>
                                    <button class={`nav-link ms-1 ${activeTab === 'numberassign' ? 'active' : ''}`} id="nav-contact-11-tab" data-bs-toggle="tab" data-bs-target="#nav-contact-11" type="button" role="tab"
                                        aria-controls="nav-contact-11" aria-selected={activeTab === 'numberassign'} tabindex="-1" onClick={() => setActiveTab('numberassign')}>Number Assignment</button>
                                </div>
                            </nav>
                            <div class="tab-content iq-tab-fade-up card-body pt-0" id="nav-tabContent">
                                <div class={`tab-pane fade ${activeTab === 'brand' ? 'active show' : ''}`} id="nav-home-11" role="tabpanel" >
                                    {activeTab === 'brand' && <Brands />}
                                </div>
                                <div class={`tab-pane fade ${activeTab === 'campaign' ? 'active show' : ''}`} id="nav-profile-11" role="tabpanel" >
                                    {activeTab === 'campaign' && <Campaign />}
                                </div>
                                <div class={`tab-pane fade ${activeTab === 'numberassign' ? 'active show' : ''}`} id="nav-contact-11" role="tabpanel" >
                                    {activeTab === 'numberassign' && <NumberAssignment />}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
