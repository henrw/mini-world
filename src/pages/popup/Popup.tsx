import React from 'react';
import avatar0 from '@assets/img/avatar-meta-0.svg';
import avatar1 from '@assets/img/avatar1.svg';
import avatar2 from '@assets/img/avatar2.svg';
import avatar3 from '@assets/img/avatar3.svg';
import avatar4 from '@assets/img/avatar4.svg';
import avatar5 from '@assets/img/avatar5.svg';
import '@pages/popup/Popup.css';
import { useState } from 'react';

const Popup = () => {
  const [avatarIdx, setAvatarIdx] = useState(0);
  
  function getRandomInt(min, max) {
    min = Math.ceil(min);  // Ensure the minimum is rounded up to the nearest whole number
    max = Math.floor(max); // Ensure the maximum is rounded down to the nearest whole number
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  const shuffleAvatar = () => {
    const newAvatarIdx = (avatarIdx + 1) % 2
    setAvatarIdx(newAvatarIdx);
    chrome.runtime.sendMessage({
      type: "CHANGE_AVATAR", avatarIdx: newAvatarIdx
    });
  };

  return (
    <div
      className="App"
      style={{
        backgroundColor: '#fff',
      }}>
      <header className="App-header" style={{ color: 'light' }}>
        {
          avatarIdx === 0 &&
          <img src="https://rapidprototype.s3.us-east-2.amazonaws.com/Subject.png" alt="Circular Image" className="App-logo h-48 object-cover rounded-full overflow-hidden" />
        }
        {
          avatarIdx === 1 &&
          <img src="https://rapidprototype.s3.us-east-2.amazonaws.com/Subject+2.png" alt="Circular Image" className="App-logo h-48 object-cover rounded-full overflow-hidden" />
        }

        {/* <button
          style={{
            backgroundColor: '#fff',
            color: "#000",
          }}
          onClick={shuffleAvatar}>
          Shuffle
        </button> */}
      </header>
    </div>
  );
};

export default Popup;
// withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occur </div>);
