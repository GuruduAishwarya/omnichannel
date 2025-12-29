import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { pintrestBoardCreate } from "../../utils/ApiClient";
import { triggerAlert } from "../../utils/CommonFunctions";

const CreatePintrestBoard = ({ buttonText, onPlaylistCreated, fetchPlaylistVideos, createModalOpen, closeBoardModal }) => {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: ""
  });

  const handleClose = () => {
    setShow(false);
    setFormData({ title: "", description: "" });
    setErrorMessage("");
  };

  const handleShow = () => setShow(true);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setErrorMessage("Title is required");
      return false;
    }
    if (!formData.description.trim()) {
      setErrorMessage("Description is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrorMessage("");
    let secretMsg = isChecked ? "PROTECTED" : "PUBLIC";
    const payload = {
      name: formData.title,
      description: formData.description,
      privacy: secretMsg,
    };

    try {
      const response = await pintrestBoardCreate(payload);

      if (response?.data?.error_code === 200 || response?.data?.error_code === 201) {
        // Call onPlaylistCreated (fetchVideos) with post_type="playlist"
        if (onPlaylistCreated) {
          await onPlaylistCreated("playlist", true); // true for reset to get fresh data
        }

        closeBoardModal()
        triggerAlert("success", "Success", response.data.message || "Playlist created successfully.");
      } else {
        setErrorMessage("Failed to create playlist.");
      }
    } catch (err) {
      setErrorMessage(err?.response?.data?.message || "Unable to create playlist.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>

      <Modal show={createModalOpen} onHide={closeBoardModal}>
        <Modal.Header closeButton>
          <Modal.Title>Create Board</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {errorMessage && (
              <div className="alert alert-danger">
                {errorMessage}
              </div>
            )}
            <Form.Group controlId="formTitle">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                placeholder="Enter title"
                value={formData.title}
                onChange={handleInputChange}
                maxLength={150}
              />
              <Form.Text className="text-muted">
                {formData.title.length}/150
              </Form.Text>
            </Form.Group>

            <Form.Group controlId="formDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                rows={3}
                placeholder="Enter description"
                value={formData.description}
                onChange={handleInputChange}
                maxLength={5000}
              />
              <Form.Text className="text-muted">
                {formData.description.length}/5000
              </Form.Text>
            </Form.Group>
            <Form.Label className="fw-500 mb-0">Secret</Form.Label>
            <br />
            <Form.Check type="switch" id="secretSwitch" className='fs-3' checked={isChecked} onChange={() => setIsChecked(!isChecked)} />
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="primary"
              type="submit"
              disabled={loading}
              className="w-100"
            >
              {loading ? "Creating..." : "Create"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default CreatePintrestBoard;