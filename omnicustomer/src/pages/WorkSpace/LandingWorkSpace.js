import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserFullname, getCookie } from '../../utils/CommonFunctions';
import { useSharedState } from '../../common/components/context/SidebarContext';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { workspacebillinglistingAccountBalances } from '../../utils/ApiClient';

const CardSkeleton = () => (
  <div className="card text-center h-100" style={{ minHeight: '400px', maxWidth: '500px', margin: '0 auto' }}>
    <div className="card-body d-flex flex-column align-items-center" style={{ padding: '2.5rem' }}>
      <Skeleton circle width={120} height={120} className="mt-4" />
      <div style={{ width: '320px', marginTop: '25px' }}>
        <Skeleton height={32} />
      </div>
      <div style={{ width: '100%', marginTop: '20px', padding: '0 15px' }}>
        <Skeleton count={3} height={24} style={{ marginBottom: '8px' }} />
      </div>
      <div style={{ width: '140px', marginTop: 'auto', marginBottom: '20px' }}>
        <Skeleton height={45} borderRadius={8} />
      </div>
    </div>
  </div>
);

const LandingWorkSpace = () => {
  const navigate = useNavigate();
  const { setSidebarType } = useSharedState();
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [billingData, setBillingData] = useState(null);
  const [billingLoading, setBillingLoading] = useState(true);
  const userType = getCookie('user_type');

  const defaultImage = "/assets/images/default-featured-image.png.jpg";
  const actualImage = "/assets/images/landing.svg";
  const actualImage1 = "/assets/images/icon/facebook_land.png";
  const actualImage2 = "/assets/images/icon/user-landing.png";
  const paymentImage = "/assets/images/icon/payment.png";

  useEffect(() => {
    const timer = setTimeout(() => {
      setFullName(getUserFullname());
      setLoading(false);
    }, 2000);

    const fetchBillingData = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const urlWorkspaceId = urlParams.get('workspace_id');

        let cookieWorkspaceId;
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
          const trimmedCookie = cookie.trim();
          if (trimmedCookie.startsWith('selected_workspace_id=')) {
            cookieWorkspaceId = trimmedCookie.substring('selected_workspace_id='.length);
            break;
          }
        }

        const workspaceId = urlWorkspaceId || cookieWorkspaceId;

        const response = await workspacebillinglistingAccountBalances(workspaceId);
        setBillingData(response.data.results);
        setBillingLoading(false);
      } catch (error) {
        console.error("Error fetching billing data:", error);
        setBillingLoading(false);
      }
    };

    fetchBillingData();
    return () => clearTimeout(timer);
  }, []);

  const handleSocialNavigate = (type) => {
    navigate('/dashboard');
    setSidebarType(Number(type));
  };

  const handlePaymentClick = (e) => {
    e.preventDefault();
    navigate('/payment#chooseplan');
  };

  const handleConfigurationClick = (configType) => {
    navigate(`/add-page-workspace?config_type=${configType}`);
  };

  // Step 1: Verify payment methods
  const hasPaymentMethod = billingData?.card_serailizers?.length > 0 || false;

  // Step 2: Determine plan status and card visibility
  const planStatus = billingData?.plan_status === true; // Convert to boolean
  const socialMediaStatus = billingData?.social_media?.toLowerCase();
  const smsStatus = billingData?.sms?.toLowerCase();
  const whatsappStatus = billingData?.whatsapp?.toLowerCase();

  // Step 3: Determine card visibility
  const showSocialMediaCard = !billingLoading && planStatus;
  const showCommunicationCard = !billingLoading && planStatus;
  const showPaymentCard = !billingLoading && (!hasPaymentMethod || !planStatus) && billingData?.user_type !== 'sub_user';

  // Step 4: Social Media card logic
  const showSocialMediaButtons = socialMediaStatus === 'active' || socialMediaStatus === 'inactive';
  const socialMediaMessage = socialMediaStatus === 'no_plan'
    ? (
      <span>
        You have not purchased any plan. Go to{' '}
        <span
          className="text-primary"
          style={{ cursor: 'pointer', textDecoration: "underline" }}
          onClick={handlePaymentClick}
        >
          Plans
        </span>{' '}
        to purchase.
      </span>
    )
    : socialMediaStatus === 'inactive'
    ? (
      <span>
        Social Media plan expired. Go to{' '}
        <span
          className="text-primary"
          style={{ cursor: 'pointer', textDecoration: "underline" }}
          onClick={handlePaymentClick}
        >
          Plans
        </span>{' '}
        to renew.
      </span>
    )
    : null;

  // Step 5: Communication card logic
  const showCommunicationButtons = !(smsStatus === 'no_plan' && whatsappStatus === 'no_plan');
  let communicationMessage = null;
  if (smsStatus === 'no_plan' && whatsappStatus === 'no_plan') {
    communicationMessage = (
      <span>
        You have not purchased any plan. Go to{' '}
        <span
          className="text-primary"
          style={{ cursor: 'pointer', textDecoration: "underline" }}
          onClick={handlePaymentClick}
        >
          Plans
        </span>{' '}
        to purchase.
      </span>
    );
  } else if (smsStatus === 'inactive' && whatsappStatus === 'inactive') {
    communicationMessage = (
      <span>
        SMS and WhatsApp plans expired. Go to{' '}
        <span
          className="text-primary"
          style={{ cursor: 'pointer', textDecoration: "underline" }}
          onClick={handlePaymentClick}
        >
          Plans
        </span>{' '}
        to renew.
      </span>
    );
  } else if (smsStatus === 'inactive') {
    communicationMessage = (
      <span>
        SMS plan expired. Go to{' '}
        <span
          className="text-primary"
          style={{ cursor: 'pointer', textDecoration: "underline" }}
          onClick={handlePaymentClick}
        >
          Plans
        </span>{' '}
        to renew.
      </span>
    );
  } else if (whatsappStatus === 'inactive') {
    communicationMessage = (
      <span>
        WhatsApp plan expired. Go to{' '}
        <span
          className="text-primary"
          style={{ cursor: 'pointer', textDecoration: "underline" }}
          onClick={handlePaymentClick}
        >
          Plans
        </span>{' '}
        to renew.
      </span>
    );
  }

  // Step 6: Determine column width
  const activePlansCount = [showSocialMediaCard, showCommunicationCard].filter(Boolean).length;
  const colWidth = activePlansCount === 1 ? 'col-lg-8' : 'col-lg-4';

  return (
    <div id="content-page" className="content-page">
      <div className="container">
        <div className="d-flex justify-content-end mb-3">
          <button
            className="btn btn-primary"
            onClick={() => navigate('/workspace')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <i className="fa fa-arrow-left"></i>
            Back
          </button>
        </div>
        <div className="d-flex flex-column justify-content-center align-items-center auto-vh-100">
          {/* Welcome section */}
          <div className="iq-maintenance1">
            <div className="text-center">
              {loading ? (
                <Skeleton height={400} width={400} />
              ) : (
                <img
                  src={imageLoaded ? actualImage : defaultImage}
                  className="img-fluid"
                  alt="Landing Image"
                  loading="lazy"
                  width="400"
                  onLoad={() => setImageLoaded(true)}
                />
              )}
            </div>
            <h3 className="mb-1 text-center text-primary fw-500">
              {loading ? (
                <div style={{ margin: '0 auto', width: '250px' }}>
                  <Skeleton height={30} />
                </div>
              ) : (
                `Welcome Back ${fullName} !!`
              )}
            </h3>
            <p className="text-center mb-0">
              {loading ? (
                <div style={{ margin: '0 auto', width: '400px' }}>
                  <Skeleton count={2} height={20} />
                </div>
              ) : (
                'Unify Your Social Media Strategy and Seamlessly Manage All Your Accounts from a Single Platform'
              )}
            </p>
          </div>

          {/* Cards section */}
          {!loading && (
            <div className="row mt-5 mb-3 justify-content-center g-4">
              {/* SOCIAL MEDIA CARD */}
              {showSocialMediaCard && (
                <div className={`${colWidth} col-md-6`}>
                  <div className="card text-center h-100" style={{ minHeight: '380px' }}>
                    <div className="card-body p-4">
                      <img
                        src={imageLoaded ? actualImage1 : defaultImage}
                        className="img-fluid avatar-90 mt-3 mb-3"
                        alt="Social Media Management"
                        loading="lazy"
                      />
                      <h5 className="card-title mt-2 text-center text-warning fs-4">Social Media Management</h5>
                      <p className="mb-0 text-center fs-6 mt-3">
                        The ultimate social media management platform designed to deliver unparalleled capabilities and comprehensive solutions for both brands and agencies
                      </p>
                      {showSocialMediaButtons && (
                        <div className="d-flex justify-content-center gap-2 mt-4">
                          <button
                            className="btn btn-primary px-4 py-2"
                            onClick={() => handleSocialNavigate(0)}
                          >
                            <span className="d-flex align-items-center">
                              <i className="fa fa-compass me-2"></i>
                              Explore
                            </span>
                          </button>
                          <button
                            className="btn btn-warning px-4 py-2"
                            onClick={() => handleConfigurationClick('social')}
                          >
                            <span className="d-flex align-items-center">
                              <i className="fa fa-cog me-2"></i>
                              Configure
                            </span>
                          </button>
                        </div>
                      )}
                      {socialMediaMessage && (
                        <p className="text-center mt-4" style={{ color: '#FF0000' }}>
                          {socialMediaMessage}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* COMMUNICATION CARD */}
              {showCommunicationCard && (
                <div className={`${colWidth} col-md-6`}>
                  <div className="card text-center h-100" style={{ minHeight: '380px' }}>
                    <div className="card-body p-4">
                      <img
                        src={imageLoaded ? actualImage2 : defaultImage}
                        className="img-fluid avatar-90 mt-3 mb-3"
                        alt="Messaging and Communication"
                        loading="lazy"
                      />
                      <h5 className="card-title mt-2 text-center text-warning fs-4">Messaging and Communication</h5>
                      <p className="mb-0 text-center fs-6 mt-3">
                        Our platform ensures seamless communication and effective marketing through various communication channels.
                      </p>
                      {showCommunicationButtons && (
                        <div className="d-flex justify-content-center gap-2 mt-4">
                          <button
                            className="btn btn-primary"
                            onClick={() => handleSocialNavigate(1)}
                          >
                            <span className="d-flex align-items-center">
                              <i className="fa fa-compass me-2"></i>
                              Explore
                            </span>
                          </button>
                          {(whatsappStatus !== 'active' ||
                            billingData?.user_details?.[0]?.wa_permanent_access_token === null) && (
                            <button
                              className="btn btn-warning"
                              onClick={() => handleConfigurationClick('communication')}
                            >
                              <span className="d-flex align-items-center">
                                <i className="fa fa-cog me-2"></i>
                                Configure
                              </span>
                            </button>
                          )}
                        </div>
                      )}
                      {communicationMessage && (
                        <p className="text-center mt-4" style={{ color: '#FF0000' }}>
                          {communicationMessage}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* PAYMENT/SUBSCRIPTION CARD */}
              {showPaymentCard && (
                <div className={`${activePlansCount === 0 ? 'col-lg-8' : colWidth} col-md-6`}>
                  <div className="card text-center h-100" style={{ minHeight: '380px' }}>
                    <div className="card-body p-4">
                      <img
                        src={paymentImage || defaultImage}
                        className="img-fluid avatar-90 mt-3 mb-3"
                        alt="Payment"
                        loading="lazy"
                      />
                      <h5 className="card-title mt-2 text-center text-warning fs-4">
                        {hasPaymentMethod ? 'Subscribe to Plans' : 'Add Payment Method'}
                      </h5>
                      <p className="mb-0 text-center fs-6 mt-3">
                        {hasPaymentMethod
                          ? 'Unlock additional features by subscribing to our flexible plans tailored to your needs.'
                          : 'Add your payment details to start exploring our subscription options.'}
                      </p>
                      <div className="d-flex justify-content-center mt-4">
                        <button
                          className="btn btn-warning px-4 py-2"
                          onClick={handlePaymentClick}
                        >
                          <span className="d-flex align-items-center">
                            <i className="fa fa-credit-card me-2"></i>
                            {hasPaymentMethod ? 'Subscribe to a Plan' : 'Add Payment Method'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Skeleton Loaders */}
              {billingLoading && (
                <>
                  <div className="col-lg-4 col-md-6">
                    <CardSkeleton />
                  </div>
                  <div className="col-lg-4 col-md-6">
                    <CardSkeleton />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandingWorkSpace;