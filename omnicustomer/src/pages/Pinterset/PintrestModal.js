import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { fetchPintrestPlaylist } from "../../utils/ApiClient";
import CreatePintrestBoard from "./CreatePintrestBoard";
import "./pintrest.css";

const PintrestModal = ({ isOpen, onClose, onPlaylistsSelected, selectedBoards }) => {
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylists, setSelectedPlaylists] = useState(selectedBoards || []);
  const [errorMessage, setErrorMessage] = useState("");
  const [createBoardModalOpen, setCreateBoardModalOpen] = useState(false);

  // Sync selectedPlaylists with selectedBoards prop
  useEffect(() => {
    setSelectedPlaylists(selectedBoards || []);
  }, [selectedBoards]);

  const NoPlaylistMessage = () => (
    <div className="col-12">
      <div className="text-center p-5">
        <div className="no-data-wrapper">
          <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#6c757d' }}>
            playlist_play
          </span>
          <h5 className="mt-3">No Boards Available</h5>
          <p className="text-muted">No Boards have been created yet. Create a board to begin organizing your boards.</p>
        </div>
      </div>
    </div>
  );

  const fetchPlaylists = async () => {
    try {
      const response = await fetchPintrestPlaylist();
      const response_data = response.data;

      if (response_data.error_code === 200) {
        const data = response_data?.results;
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
    // Single selection for radio buttons
    const updatedSelection = [{ id: playlist.board_id, title: playlist.name }];
    setSelectedPlaylists(updatedSelection);
  };

  const handleSave = () => {
    onPlaylistsSelected(selectedPlaylists); // Pass the selected playlists
    onClose();
  };

  const openCreateBoardModal = () => {
    setCreateBoardModalOpen(true);
  };

  const closeCreateBoardModal = () => {
    setCreateBoardModalOpen(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchPlaylists();
    }
  }, [isOpen]);

  return (
    <Modal className="pintrest-modal" show={isOpen} onHide={onClose} centered backdrop="static">
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
                key={playlist?.board_id} // Changed to board_id for consistency
              >
                <input
                  type="radio"
                  className="form-check-input me-2"
                  name="playlist-selection"
                  checked={selectedPlaylists.some(
                    (item) => item.id === playlist.board_id // Fixed comparison
                  )}
                  onChange={() => handleCheckboxChange(playlist)}
                />
                <span>{playlist.name}</span>
              </li>
            ))}
          </ul>
        ) : !errorMessage && (
          <NoPlaylistMessage />
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="outline-primary"
          onClick={openCreateBoardModal}
        >
          Create Board
        </Button>
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

      {/* Create Board Modal */}
      <CreatePintrestBoard 
        createModalOpen={createBoardModalOpen}
        closeBoardModal={closeCreateBoardModal}
        onPlaylistCreated={() => fetchPlaylists()}
      />
    </Modal>
  );
};

export default PintrestModal;