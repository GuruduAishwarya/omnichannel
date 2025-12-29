import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal"; // Or use another library of your choice
import Button from "react-bootstrap/Button";
import { youtubePlayList } from "../../utils/ApiClient";
import CreatePlayList from "./CreatePlayList";

const PlaylistModal = ({ isOpen, onClose, onPlaylistsSelected }) => {
    const [playlists, setPlaylists] = useState([]);
    const [selectedPlaylist, setSelectedPlaylist] = useState(null); // Change to single selection

    const fetchPlaylists = async () => {
        try {
            // Pass user_id and params to the API function
            const response = await youtubePlayList();
            const response_data = response.data;

            if (response_data.error_code === 200) {
                const data = response_data.results?.playlists; // Use response_data to access results
                setPlaylists(data);
            } else {
                setPlaylists([]);
            }
        } catch (error) {
            const response_data = error?.response?.data;
            console.error('Error fetching sub-user data:', response_data?.message || 'Something went wrong!');
        }
    };

    const handleRadioChange = (playlist) => {
        setSelectedPlaylist(playlist);
    };

    const handleSave = () => {
        // console.log("Selected Playlist:", selectedPlaylist);
        onPlaylistsSelected(selectedPlaylist ? [selectedPlaylist] : []);
        onClose(); // Close the modal after saving
    };

    useEffect(() => {
        fetchPlaylists();
    }, []);

    return (
        <Modal show={isOpen} onHide={onClose} centered backdrop="static">
            <Modal.Body>
                {playlists && playlists.length > 0 ? (
                    <ul className="list-group">
                        {playlists.map((playlist) => (
                            <li
                                className="list-group-item d-flex align-items-center"
                                key={playlist?.playlist_id}
                            >
                                <input
                                    type="radio"
                                    name="playlist"
                                    checked={selectedPlaylist?.playlist_id === playlist.playlist_id}
                                    onChange={() => handleRadioChange(playlist)}
                                />
                                <span className="ms-2">{playlist.title}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-muted">No playlists available.</p>
                )}
            </Modal.Body>
            <Modal.Footer>
                <CreatePlayList onPlaylistCreated={fetchPlaylists} />
                <Button variant="primary" onClick={handleSave}>
                    Save
                </Button>
                <Button variant="secondary" onClick={onClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default PlaylistModal;
