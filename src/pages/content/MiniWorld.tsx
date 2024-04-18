import AvatarMeta from '@root/src/pages/content/AvatarMeta';
// import Avatar from '@root/src/pages/content/Avatar';
import React, { useState, useEffect, useRef } from 'react';
import MiniMap from '@root/src/pages/content/MiniMap';



function MiniWorld() {
    const [scale, setScale] = useState(1);
    const [avatarIdx, setAvatarIdx] = useState(1);
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0, scrollX: 0, scrollY: 0 });
    const cursorPosRef = useRef(cursorPos);

    const [presenceData, setPresenceData] = useState([]);
    const [historyPresenceData, setHistoryPresenceData] = useState({});
    
    useEffect(() => {
        cursorPosRef.current = cursorPos;
    }, [cursorPos])

    useEffect(() => {
        // Define the function to handle the keydown event
        const handleKeyDown = (event) => {
            if (event.shiftKey) {
                setScale(10);
                chrome.runtime.sendMessage({ shiftKeyPressed: true });
            }
        };

        // Define the function to handle the keyup event
        const handleKeyUp = (event) => {
            if (event.key === 'Shift') {
                setScale(1);
                chrome.runtime.sendMessage({ shiftKeyPressed: false });
            }
        };

        // Add event listeners when the component mounts
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);

        // Return a cleanup function to remove event listeners when the component unmounts
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
        };
    }, []); // Empty dependency array means this effect runs only on mount and unmount

    useEffect(() => {
        const handleMouseMove = (event) => {
            updateCursorPosition(event);
        };

        const handleScroll = () => {
            updateCursorPosition();
        };

        const updateCursorPosition = (event = null) => {
            var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
            var scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            if (event) {
                setCursorPos({
                    x: event.clientX + scrollLeft,
                    y: event.clientY + scrollTop,
                    scrollX: scrollLeft,
                    scrollY: scrollTop,
                });
            }
            else {
                setCursorPos((prevPos) => ({
                    x: prevPos.x - prevPos.scrollX + scrollLeft,
                    y: prevPos.y - prevPos.scrollY + scrollTop,
                    scrollX: scrollLeft,
                    scrollY: scrollTop,
                }));
            }

        };

        document.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('scroll', handleScroll);

        return () => {
            // Remove event listeners
            document.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    useEffect(() => {
        const intervalId = setInterval(() => {
            chrome.runtime.sendMessage({ type: "CURSOR_POSITION", position: cursorPosRef.current });
            console.log("Cursor position sent:", cursorPosRef.current);
        }, 500);

        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        const handleMessage = (request, sender, sendResponse) => {
            if (request.type === "CHANGE_AVATAR") {
                console.log("Changing avatar to index:", request.avatarIdx);
                setAvatarIdx(request.avatarIdx); // Update the avatar index state
            }
            return true;
        };

        chrome.runtime.onMessage.addListener(handleMessage);

        // Cleanup function to remove the message listener when the component unmounts
        return () => chrome.runtime.onMessage.removeListener(handleMessage);
    }, []);

    useEffect(() => {
        const handleMessage = (request, sender, sendResponse) => {
            console.log("Data:", request.data);
            setPresenceData(request.data);  // Update local state with the received message

            let newHistoryPresenceData = { ...historyPresenceData };
            request.data.forEach(item => {
                if (item.id in historyPresenceData) {
                    newHistoryPresenceData[item.id].positions.push(item.position);
                }
                else {
                    newHistoryPresenceData[item.id] = { positions: [item.position], avatarIdx: item.avatarIdx };
                }
            });
            if (request.data.length > 1) {
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
                
                presenceData.map((data) => {
                    if (data.avatarIdx != avatarIdx) {
                        return (
                            <>
                                {
                                    data.position.y < (window.pageYOffset || document.documentElement.scrollTop) && (
                                        <svg className={`fixed top-0 ${data.scale == 1 ? "w-[48px] h-[48px]": "w-[100px] h-[100px]"}`} style={{left: `${data.position.x}px`}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                                        </svg>
                                    )
                                }
                                {
                                    data.position.y > (window.pageYOffset || document.documentElement.scrollTop) + window.innerHeight && (
                                        <svg className={`fixed bottom-0 ${data.scale == 1 ? "w-[48px] h-[48px]": "w-[100px] h-[100px]"}`} style={{left: `${data.position.x}px`}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    )
                                }


                                <div className="absolute" style={{ width: `${data.scale * 50}px`, height: `${data.scale * 50}px`, left: `${data.position.x - data.scale * 25}px`, top: `${data.position.y - data.scale * 25}px`, zIndex: 1000, pointerEvents: 'none' }}>
                                    <AvatarMeta idx={data.avatarIdx} />
                                </div>
                            </>


                        );
                    }

                })
            }
            {/* <svg className='absolute' style={{ width: `${scale * 40}px`, height: `${scale * 40}px`, left: `${cursorPos.x - scale * 20}px`, top: `${cursorPos.y - scale * 20}px`, zIndex: 1000, pointerEvents: 'none' }} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <Avatar idx={avatarIdx} />
            </svg> */}
            <div className="absolute" style={{ width: `${scale * 50}px`, height: `${scale * 50}px`, left: `${cursorPos.x - scale * 25}px`, top: `${cursorPos.y - scale * 25}px`, zIndex: 1000, pointerEvents: 'none' }}>
                <AvatarMeta idx={avatarIdx} />
            </div>
            {/* <MiniMap cursorPos={cursorPos} historyPresenceData={historyPresenceData} /> */}
        </>

    );
}

export default MiniWorld;