import React, { useEffect, useState } from 'react';
import { YouTubePlayLists } from "../../utils/ApiClient";

const PlaylistVideos = ({ playlist }) => {
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalVideoCount, setTotalVideoCount] = useState(0);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const api_input = { page_number: pageNumber, page_size: pageSize, playlist_id: playlist.playlist_id };
        const response = await YouTubePlayLists(api_input);
        setVideos(response.data.results.videos); // Adjust based on the actual response structure
        setTotalVideoCount(response.data.total_video_count); // Set the total video count
      } catch (error) {
        setError(error.message);
      }
    };

    fetchVideos();
  }, [pageNumber, pageSize, playlist]);

  return (
    <div>
      <h1>Playlist Videos: {playlist.title}</h1>
      {error && <p>Error: {error}</p>}
      <div className="row">
        {videos.length > 0 ? (
          videos.map((video, index) => (
            <div key={video.video_id || index} className="col-lg-4 col-md-6 mb-4">
              <div className="user-images user-images-icon custom-border rounded position-relative overflow-hidden">
                <a href="#">
                  {video.video_urls ? (
                    <video
                      src={video.video_urls}
                      className="img-fluid"
                      muted
                      loop
                      controls
                      style={{ width: "100%", height: "auto" }}
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div className="text-center p-4">
                      <p>Video is unavailable.</p>
                    </div>
                  )}
                  <div className="center-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="50"
                      height="50"
                      fill="currentColor"
                      className="bi bi-play-circle-fill"
                      viewBox="0 0 16 16"
                    >
                      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M6.79 5.093A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814z" />
                    </svg>
                  </div>
                </a>
                <div className="image-hover-data">
                  <div className="product-elements-icon">
                    <ul className="d-flex align-items-center m-0 p-0 list-inline">
                      <li>
                        <a href="#" className="pe-3 text-white d-flex align-items-center">
                          {video.title}
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12 text-center">No videos found</div>
        )}
      </div>
      <div>
        <button onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))} disabled={pageNumber === 1}>
          Previous
        </button>
        <button onClick={() => setPageNumber((prev) => prev + 1)} disabled={videos.length < pageSize}>
          Next
        </button>
      </div>
      <div className="mt-4">
        <p>Total Videos: {totalVideoCount}</p>
      </div>
    </div>
  );
};

export default PlaylistVideos;
