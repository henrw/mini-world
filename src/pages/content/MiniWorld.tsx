import Avatar from '@root/src/pages/content/Avatar';
import React, { useState, useEffect } from 'react';
import MiniMap from '@root/src/pages/content/MiniMap';



function MiniWorld() {
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
    const [presenceData, setPresenceData] = useState([{ id: "test", avatarIdx: 1, position: { x: 100, y: 100 } }]);
    const [historyPresenceData, setHistoryPresenceData] = useState({});

    useEffect(() => {
        const handleMouseMove = (event) => {
            setCursorPos({ x: event.clientX, y: event.clientY });
        };

        document.addEventListener('mousemove', handleMouseMove);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    useEffect(() => {
        const intervalId = setInterval(() => {
            chrome.runtime.sendMessage({ type: "CURSOR_POSITION", position: cursorPos });
            console.log("Cursor position sent:", cursorPos);
        }, 1000);

        return () => clearInterval(intervalId);
    }, [cursorPos]);

    useEffect(() => {
        const handleMessage = (request, sender, sendResponse) => {
            console.log("Data:", request.data);
            setPresenceData(request.data);  // Update local state with the received message

            let newHistoryPresenceData = {...historyPresenceData};
            request.data.forEach(item => {
                if (item.id in historyPresenceData) {
                    newHistoryPresenceData[item.id].positions.push(item.position);
                }
                else {
                    newHistoryPresenceData[item.id] = { positions: [item.position], avatarIdx: item.avatarIdx };
                }
            });
            if (request.data.length > 1)
            {
                setHistoryPresenceData(newHistoryPresenceData);
            }
        };

        // Add message listener when component mounts
        chrome.runtime.onMessage.addListener(handleMessage);

        // Cleanup function to remove listener when component unmounts
        return () => {
            chrome.runtime.onMessage.removeListener(handleMessage);
        };
    }, []);

    return (

        <>
            {
                presenceData.map((data) => (
                    <svg className='fixed w-[40px] h-[40px]' style={{ left: `${data.position.x}px`, top: `${data.position.y}px`, zIndex: 1000, pointerEvents: 'none' }} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <Avatar idx={data.avatarIdx} />
                    </svg>
                ))

            }
            <svg className='fixed w-[40px] h-[40px]' style={{ left: `${cursorPos.x}px`, top: `${cursorPos.y}px`, zIndex: 1000, pointerEvents: 'none' }} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <Avatar idx={1} />
            </svg>

            <MiniMap cursorPos={cursorPos} />
        </>

    );
}

export default MiniWorld;