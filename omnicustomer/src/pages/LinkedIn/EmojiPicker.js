import React, { useEffect, useRef } from "react";
import Emojis from "../../common/components/Emojis";

const EmojiPicker = ({ showEmojis, setShowEmojis, message, setMessage }) => {
  const emojiPickerRef = useRef(null);

  const emojis = [
    "😀", "😁", "😂", "🤣", "😃", "😄", "😅", "😆", "😉", "😊", 
    "😋", "😎", "😍", "😘", "🥰", "😗", "😙", "😚", "☺️", "🙂",
    "🤩", "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️",
    "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡",
    "👍", "👎", "👏", "🙌", "👌", "✌️", "🤞", "🤟", "❤️", "💯"
  ];

  const handleClickOutside = (event) => {
    if (
      emojiPickerRef.current &&
      !emojiPickerRef.current.contains(event.target) &&
      event.target.id !== "emoji-button"
    ) {
      setShowEmojis(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleEmojiPicker = () => {
    setShowEmojis(!showEmojis);
  };

  const handleEmojiSelect = (emoji) => {
    setMessage((prevMessage) => prevMessage + emoji);
    // Removed setShowEmojis(false) so picker stays open after selection
  };

  return (
    <div className="chat-container">
      <div className="chat-input-container">
        <div className="chat-attachment">
          <a
            href="#"
            className="d-flex align-items-center pe-3"
            onClick={(e) => {
              e.preventDefault();
              toggleEmojiPicker();
            }}
          >
            <svg
              className="icon-24"
              width="24"
              viewBox="0 0 24 25"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_156_599)">
                <path
                  d="M20.4853 4.01473C18.2188 1.74823 15.2053 0.5 12 0.5C8.79469 0.5 5.78119 1.74823 3.51473 4.01473C1.24819 6.28119 0 9.29469 0 12.5C0 15.7053 1.24819 18.7188 3.51473 20.9853C5.78119 23.2518 8.79469 24.5 12 24.5C15.2053 24.5 18.2188 23.2518 20.4853 20.9853C22.7518 18.7188 24 15.7053 24 12.5C24 9.29469 22.7518 6.28119 20.4853 4.01473ZM12 23.0714C6.17091 23.0714 1.42856 18.3291 1.42856 12.5C1.42856 6.67091 6.17091 1.92856 12 1.92856C17.8291 1.92856 22.5714 6.67091 22.5714 12.5C22.5714 18.3291 17.8291 23.0714 12 23.0714Z"
                  fill="currentcolor"
                ></path>
                <path
                  d="M9.40398 9.3309C8.23431 8.16114 6.33104 8.16123 5.16136 9.3309C4.88241 9.60981 4.88241 10.0621 5.16136 10.3411C5.44036 10.62 5.89266 10.62 6.17157 10.3411C6.78432 9.72836 7.78126 9.7284 8.39392 10.3411C8.53342 10.4806 8.71618 10.5503 8.89895 10.5503C9.08171 10.5503 9.26457 10.4806 9.40398 10.3411C9.68293 10.0621 9.68293 9.60986 9.40398 9.3309Z"
                  fill="currentcolor"
                ></path>
                <path
                  d="M18.8384 9.3309C17.6688 8.16123 15.7655 8.16114 14.5958 9.3309C14.3169 9.60981 14.3169 10.0621 14.5958 10.3411C14.8748 10.62 15.3271 10.62 15.606 10.3411C16.2187 9.72836 17.2156 9.72831 17.8284 10.3411C17.9679 10.4806 18.1506 10.5503 18.3334 10.5503C18.5162 10.5503 18.699 10.4806 18.8384 10.3411C19.1174 10.0621 19.1174 9.60986 18.8384 9.3309Z"
                  fill="currentcolor"
                ></path>
                <path
                  d="M18.3335 13.024H5.6668C5.2723 13.024 4.95251 13.3438 4.95251 13.7383C4.95251 17.6243 8.11409 20.7859 12.0001 20.7859C15.8862 20.7859 19.0477 17.6243 19.0477 13.7383C19.0477 13.3438 18.728 13.024 18.3335 13.024ZM12.0001 19.3573C9.14366 19.3573 6.77816 17.215 6.42626 14.4525H17.574C17.2221 17.215 14.8566 19.3573 12.0001 19.3573Z"
                  fill="currentcolor"
                ></path>
              </g>
            </svg>
          </a>
        </div>
      </div>
      {showEmojis && (
        <div className="emoji-picker-overlay" ref={emojiPickerRef}>
          <div 
            className="emoji-picker-backdrop" 
            onClick={() => setShowEmojis(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 998
            }}
          />
          <div style={{ position: 'relative', zIndex: 999 }}>
            <Emojis
              onEmojiSelect={handleEmojiSelect}
              pickerSize={{ height: 330, width: 240 }}
              style={{
                position: "absolute",
                bottom: "50px",
                right: "0em",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EmojiPicker;