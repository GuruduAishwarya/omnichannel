const NoDataMessage = ({ type, icon, title, description }) => {
  const defaultMessages = {
    video: {
      icon: 'videocam_off',
      title: 'No Videos Available',
      description: 'There are no videos uploaded yet. Videos will appear here once they are added.'
    },
    short: {
      icon: 'movie',
      title: 'No Shorts Available',
      description: 'There are no shorts uploaded yet. Shorts will appear here once they are added.'
    },
    playlist: {
      icon: 'playlist_play',
      title: 'No Playlists Available',
      description: 'No playlists have been created yet. Create a playlist to organize your videos.'
    },
    playlistVideos: {
      icon: 'video_library',
      title: 'No Videos in Playlist',
      description: 'This playlist has no videos yet. Add some videos to get started.'
    }
  };

  const message = defaultMessages[type] || { icon, title, description };

  return (
    <div className="col-12">
      <div className="text-center p-5">
        <div className="no-data-wrapper">
          <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#6c757d' }}>
            {message.icon}
          </span>
          <h5 className="mt-3">{message.title}</h5>
          <p className="text-muted">{message.description}</p>
        </div>
      </div>
    </div>
  );
};
export default NoDataMessage;