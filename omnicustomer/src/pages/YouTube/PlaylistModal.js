import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { youtubePlayList } from "../../utils/ApiClient";
import CreatePlayList from "./CreatePlayList";

const Playlist = ({ isOpen, onClose, onPlaylistsSelected, video }) => {
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylists, setSelectedPlaylists] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const NoPlaylistMessage = () => (
    <div className="col-12">
      <div className="text-center p-5">
        <div className="no-data-wrapper">
          <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#6c757d' }}>
            playlist_play
          </span>
          <h5 className="mt-3">No Playlists Available</h5>
          <p className="text-muted">No playlists have been created yet. Create a playlist to begin organizing your videos.</p>
        </div>
      </div>
    </div>
  );

  const fetchPlaylists = async () => {
    try {
      const response = await youtubePlayList();
      const response_data = response.data;

      if (response_data.error_code === 200) {
        const data = response_data.results?.playlists;
        setPlaylists(data || []);
        setErrorMessage("");
      } else if (response.status === 204) {
        setPlaylists([]);
        setErrorMessage(""); // Clear error message for 204 status
      } else {
        setPlaylists([]);
        setErrorMessage("Failed to fetch playlists. Please try again later.");
      }
    } catch (error) {
      console.error("Error fetching playlists:", error);
      setPlaylists([]);
      setErrorMessage("Unable to fetch playlists. Please check your connection and try again.");
    }
  };

  const handleCheckboxChange = (playlist) => {
    // Replace multiple selection with single selection
    setSelectedPlaylists([{ id: playlist.id, title: playlist.title }]);
  };

  const handleSave = () => {
    onPlaylistsSelected(selectedPlaylists, video); // Pass the selected playlists and video object
    onClose();
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  return (
    <Modal show={isOpen} onHide={onClose} centered backdrop="static">
      <Modal.Body>
        {errorMessage && (
          <div className="alert alert-danger">
            <span className="material-symbols-outlined me-2" style={{ verticalAlign: 'middle' }}>
              error
            </span>
            {errorMessage}
          </div>
        )}
        
        {playlists && playlists.length > 0 ? (
          <ul className="list-group">
            {playlists.map((playlist) => (
              <li
                className="list-group-item d-flex align-items-center"
                key={playlist?.id}
              >
                <input
                  type="radio"
                  className="form-check-input me-2"
                  name="playlist-selection"
                  checked={selectedPlaylists.some(
                    (item) => item.id === playlist.id
                  )}
                  onChange={() => handleCheckboxChange(playlist)}
                />
                <span>{playlist.title}</span>
              </li>
            ))}
          </ul>
        ) : !errorMessage && (
          <NoPlaylistMessage />
        )}
      </Modal.Body>
      <Modal.Footer>
        <CreatePlayList onPlaylistCreated={fetchPlaylists} />
        <Button 
          variant="primary" 
          onClick={handleSave}
          disabled={selectedPlaylists.length === 0}
        >
          Save
        </Button>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default Playlist;