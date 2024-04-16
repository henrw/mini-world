import Avatar from '@root/src/pages/content/Avatar';
import React, { useState, useEffect } from 'react';

function MiniMap({ cursorPos, historyPresenceData }) {

    return (
        <div className='fixed bottom-1 right-1 outline outline-2 rounded w-[300px] h-[200px] bg-white'>
            <svg className='absolute w-[40px] h-[40px]' style={{ left: `${cursorPos.x}px`, top: `${cursorPos.y}px`, zIndex: 1000, pointerEvents: 'none' }} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <Avatar idx={0} /> {/* Make sure Avatar can use the idx prop or adjust as needed */}
            </svg>
        </div>
    );
}

export default MiniMap;