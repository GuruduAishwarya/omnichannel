import React, { useState, useEffect } from "react";
import VideoList from "./VideoList";
import VideoModal from "./VideoModal";
import { triggerAlert } from "../../utils/CommonFunctions";
import { YoutubeProfile } from "../../utils/ApiClient";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const ProfileSkeleton = () => (
  <div className="card">
    <div className="card-body">
      <div className="row align-items-center">
        <div className="col-lg-2 col-md-2">
          <div className="item1 ms-1 text-center">
            <Skeleton circle width={100} height={100} />
          </div>
        </div>
        <div className="col-lg-10 col-md-10">
          <div className="d-flex justify-content-between">
            <div className="item2">
              <Skeleton width={200} height={30} />
            </div>
          </div>
          <div className="row">
            <div className="col-lg-12">
              <div className="item5 mt-2">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="d-flex align-items-center mb-2">
                    <Skeleton circle width={20} height={20} />
                    <div className="ms-2" style={{ flex: 1 }}>
                      <Skeleton width={200} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="row mt-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="col-sm-3 col-lg-3">
                    <div className="card">
                      <div className="card-body text-center">
                        <Skeleton circle width={50} height={50} className="mb-2" />
                        <Skeleton width={120} height={24} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const YouTube = () => {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const baseUrl = process.env.REACT_APP_API_BASE_URL;

  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      const response = await YoutubeProfile({});
      if (response.status === 200) {
        const data = response.data;
        if (data && data.results) {
          setProfileData(data.results);
        } else {
          console.error("Unexpected response structure:", data);
          triggerAlert('error', 'Oops...', "Unexpected response structure");
        }
      } else {
        console.error("Error fetching YouTube profile data:", response.status);
        triggerAlert('error', 'Oops...', `Error fetching YouTube profile data (Status: ${response.status})`);
      }
    } catch (error) {
      console.error("Error fetching YouTube profile data:", error);
      triggerAlert('error', 'Oops...', error?.message || "Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  useEffect(() => {
    // console.log("Profile Data:", profileData);
  }, [profileData]);

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return `${year}-${day}-${month}, ${hours}:${minutes}:${seconds}`;
  };

  return (
    <div>
      <div className="position-relative"></div>
      <div id="content-page" className="content-page">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              {isLoading ? (
                <ProfileSkeleton />
              ) : (
                <div className="card">
                  <div className="card-body">
                    <div className="row align-items-center">
                      <div className="col-lg-2 col-md-2">
                        <div className="item1 ms-1 text-center">
                          {profileData?.profile_url ? (
                            <img
                              src={profileData.profile_url}
                              className="img-fluid rounded-circle profile-image object-cover"
                              alt="profile-image"
                              loading="lazy"
                            />
                          ) : (
                            <img
                              src="/assets/images/icon-7797704_1280.png"
                              className="img-fluid rounded-circle profile-image object-cover"
                              alt="default-profile-icon"
                              loading="lazy"
                            />
                          )}
                        </div>
                      </div>
                      <div className="col-lg-10 col-md-10">
                        <div className="d-flex justify-content-between">
                          <div className="item2">
                            <h4 className="text-warning fw-500">
                              {profileData?.channel_name || "No Channel Name Available"}
                            </h4>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-lg-12">
                            <div className="item5 mt-2">
                              <div className="d-flex align-items-center mb-2">
                                <span className="material-symbols-outlined md-18">
                                  account_circle
                                </span>
                                <span className="ms-2">{profileData?.user_name || "No User Available"}</span>
                              </div>
                              <div className="d-flex align-items-center mb-2">
                                <span className="material-symbols-outlined md-18">
                                  border_color
                                </span>
                                <span className="ms-2">{profileData?.description || "No Description Available"}</span>
                              </div>
                              {/* <div className="d-flex align-items-center mb-2">
                                <span className="material-symbols-outlined md-18">
                                  link
                                </span>
                                <span className="ms-2">
                                  <a href="#" className="fw-500 h6">
                                    {profileData?.profile_url || "No Profile Available"}
                                  </a>
                                </span>
                              </div> */}
                              <div className="d-flex align-items-center mb-2">
                                <span className="material-symbols-outlined md-18">
                                  schedule_send
                                </span>
                                <span className="ms-2">
                                  {formatDate(new Date())}
                                </span>
                              </div>
                            </div>
                            <div className="row mt-3">
                              <div className="col-sm-3 col-lg-3">
                                <div className="card">
                                  <div className="card-body text-center">
                                    <div className="item1 ms-1 text-center mb-2">
                                      <img
                                        src="https://cdn-icons-png.flaticon.com/128/4907/4907500.png"
                                        className="img-fluid"
                                        alt="profile-image"
                                        loading="lazy"
                                        style={{ width: "50px" }}
                                      />
                                    </div>
                                    <h5 className="mt-1 d-flex justify-content-center align-items-center fw-bold text-info">
                                      {profileData?.subscriber_count || "0"} Subscribers
                                    </h5>
                                  </div>
                                </div>
                              </div>
                              <div className="col-sm-3 col-lg-3">
                                <div className="card">
                                  <div className="card-body text-center">
                                    <div className="item1 ms-1 text-center mb-2">
                                      <img
                                        src="https://cdn-icons-png.flaticon.com/128/15050/15050908.png"
                                        className="img-fluid rounded-circle"
                                        alt="profile-image"
                                        loading="lazy"
                                        style={{ width: "50px" }}
                                      />
                                    </div>
                                    <h5 className="mt-1 d-flex justify-content-center align-items-center fw-bold text-info">
                                      {profileData?.video_count || "0"} Videos
                                    </h5>
                                  </div>
                                </div>
                              </div>
                              <div className="col-sm-3 col-lg-3">
                                <div className="card">
                                  <div className="card-body text-center">
                                    <div className="item1 ms-1 text-center mb-2">
                                      <img
                                        src="https://cdn-icons-png.flaticon.com/128/17540/17540891.png"
                                        className="img-fluid"
                                        alt="profile-image"
                                        loading="lazy"
                                        style={{ width: "50px" }}
                                      />
                                    </div>
                                    <h5 className="mt-1 d-flex justify-content-center align-items-center fw-bold text-info">
                                      {profileData?.view_count || "0"} Views
                                    </h5>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <VideoList baseUrl={baseUrl} handleVideoClick={handleVideoClick} />
        </div>
      </div>
      <VideoModal />
    </div>
  );
};

export default YouTube;