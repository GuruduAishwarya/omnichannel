import EmojiPicker from 'emoji-picker-react'
import React from 'react'

export default function Emojis({ onEmojiSelect, pickerSize = {}, reaction, allowExpand = true, style }) {
    const { height = 300, width = 300 } = pickerSize; // Default values
    const handleEmojiClick = (event, emojiObject) => {
        // console.log("emojiObject", emojiObject)
        onEmojiSelect(emojiObject.target.innerHTML);
    };
    return (
        <div className="emoji-picker-container">
            <div className="emoji-picker">
                <EmojiPicker
                    open={true}
                    height={height || 300}  // Dynamic height with default
                    width={width || 300}    // Dynamic width with default
                    emojiStyle="native"
                    lazyLoadEmojis={true}
                    skinTonePickerLocation="PREVIEW"
                    onEmojiClick={handleEmojiClick}
                    reactionsDefaultOpen={reaction || false}
                    allowExpandReactions={allowExpand}
                    style={style}
                /></div>

        </div>
    )
}
