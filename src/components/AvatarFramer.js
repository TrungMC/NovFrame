import React, { useState, useRef, useEffect } from 'react';
import AvatarEditor from 'react-avatar-editor';
import { Button } from '@mui/material';

const ImageFrameEditor = () => {
    const [image, setImage] = useState(null);
    const [scale, setScale] = useState(1);
    const [editorSize, setEditorSize] = useState({ width: 250, height: 250 });
    const editorRef = useRef(null);
    const frameRef = useRef(null);
    const frameImage = 'frame.png'; // Replace with your frame image path

    useEffect(() => {
        const handleResize = () => {
            const width = Math.min(window.innerWidth - 140, 600);
            console.log("Width",width);
            const height = width;
            setEditorSize({ width, height });
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
                document.getElementById('downloadButton').style.display = 'block';
                document.getElementById('scaleSlider').style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            // Hide the download button and the slider
            document.getElementById('downloadButton').style.display = 'none';
            document.getElementById('scaleSlider').style.display = 'none';
        }
    };

    const handleDownload = () => {
        if (editorRef.current) {
            const frameImg = new Image();
            frameImg.src = frameImage;
            frameImg.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = frameImg.width;
                canvas.height = frameImg.height;

                // Draw the cropped image first
                editorRef.current.getImage().toBlob((blob) => {
                    const img = new Image();
                    img.src = URL.createObjectURL(blob);
                    img.onload = () => {
                        ctx.drawImage(img, 0, 0, frameImg.width, frameImg.height);

                        // Draw the frame image on top
                        ctx.drawImage(frameImg, 0, 0, frameImg.width, frameImg.height);

                        const url = canvas.toDataURL('image/png');
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'avatar.png';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                    };
                });
            };
        }
    };

    return (
        <div style={{ textAlign: 'center', padding: '10px' }}>
            {/*<h3>🎨 Nào mình cùng lên xe buýt ! 🎨</h3>*/}
            {/*<p>Nào mình cùng thay avatar    ! 🌟</p>*/}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '10px' }}>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ marginBottom: '2px' }}
                />
                <Button
                    id="downloadButton"
                    onClick={handleDownload}
                    variant="contained"
                    style={{ marginBottom: '2px', display: 'none' }}
                >
                    📥 Download
                </Button>
                <input
                    id="scaleSlider"
                    type="range"
                    min="-3"
                    max="3"
                    step="0.1"
                    value={scale}
                    onChange={(e) => setScale(e.target.value)}
                    style={{ marginBottom: '5px', display: 'none' }}
                />
            </div>
            <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
                {image && (
                    <AvatarEditor
                        ref={editorRef}
                        image={image}
                        width={editorSize.width}
                        height={editorSize.height}
                        border={50}
                        scale={scale}
                        rotate={0}
                        style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
                    />
                )}
                <img
                    ref={frameRef}
                    src={frameImage}
                    alt="Frame"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        zIndex: 2,
                        width: editorSize.width+100,
                        height: editorSize.height+100,
                        pointerEvents: 'none', // Allow mouse events to pass through
                    }}
                />
            </div>
            {/* Add an empty div at the bottom */}
            <div style={{ height: '100px' }}></div>
        </div>
    );
};

export default ImageFrameEditor;
