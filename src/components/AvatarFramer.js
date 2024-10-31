import React, {useState, useRef, useEffect} from 'react';
import AvatarEditor from 'react-avatar-editor';
import {
    Button,
    Paper,
    Box,
    Slider,
    styled
} from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

const StyledPaper = styled(Paper)(({ theme }) => ({
    maxWidth: 600,
    margin: '0 auto',
    padding: theme.spacing(2),
    background: 'linear-gradient(to bottom right, #f0f7ff, #f5f0ff)',
    borderRadius: 16
}));

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

const ImageFrameEditor = () => {
    const [image, setImage] = useState(null);
    const [scale, setScale] = useState(1);
    const [editorSize, setEditorSize] = useState({width: 250, height: 250});
    const editorRef = useRef(null);
    const frameRef = useRef(null);
    const frameImage = 'frame.png';

    useEffect(() => {
        const handleResize = () => {
            const width = Math.min(window.innerWidth - 140, 600);
            console.log("Width", width);
            const height = width;
            setEditorSize({width, height});
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

                editorRef.current.getImage().toBlob((blob) => {
                    const img = new Image();
                    img.src = URL.createObjectURL(blob);
                    img.onload = () => {
                        ctx.drawImage(img, 0, 0, frameImg.width, frameImg.height);
                        ctx.drawImage(frameImg, 0, 0, frameImg.width, frameImg.height);

                        const url = canvas.toDataURL('image/png');
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'novavatar-4u.png';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                    };
                });
            };
        }
    };

    return (
        <StyledPaper elevation={3}>
            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Button
                        component="label"
                        variant="contained"
                        startIcon={<CameraAltIcon />}
                        sx={{
                            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                            boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                            color: 'white',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #1976D2 30%, #00BCD4 90%)',
                            }
                        }}
                    >
                        Chọn ảnh đẹp nhất nhá 📸
                        <VisuallyHiddenInput
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                    </Button>
                </Box>

                <Box sx={{ width: '100%', mb: 2 }}>
                    <Slider
                        id="scaleSlider"
                        min={-3}
                        max={3}
                        step={0.1}
                        value={scale}
                        onChange={(e, newValue) => setScale(newValue)}
                        sx={{
                            display: 'none',
                            color: '#2196F3',
                            '& .MuiSlider-thumb': {
                                '&:hover, &.Mui-focusVisible': {
                                    boxShadow: '0px 0px 0px 8px rgba(33, 150, 243, 0.16)'
                                }
                            }
                        }}
                    />
                </Box>

                <Button
                    id="downloadButton"
                    variant="contained"
                    onClick={handleDownload}
                    // startIcon={<FileDownloadIcon />}
                    sx={{
                        display: 'none',
                        background: 'linear-gradient(45deg, #4CAF50 30%, #81C784 90%)',
                        boxShadow: '0 3px 5px 2px rgba(76, 175, 80, .3)',
                        '&:hover': {
                            background: 'linear-gradient(45deg, #388E3C 30%, #66BB6A 90%)',
                        }
                    }}
                >
                    Tải về thay avatar thôi ⬇️
                </Button>

                <Paper
                    elevation={2}
                    sx={{
                        position: 'relative',
                        display: 'inline-block',
                        width: '100%',
                        borderRadius: 2,
                        overflow: 'hidden',
                        bgcolor: 'white',
                        p: 1,
                        minHeight: editorSize.height + 100, // Added to maintain height
                        '& > div': {  // Target AvatarEditor
                            margin: '0 auto'
                        }
                    }}
                >
                    {image && (
                        <AvatarEditor
                            ref={editorRef}
                            image={image}
                            width={editorSize.width}
                            height={editorSize.height}
                            border={50}
                            scale={scale}
                            rotate={0}
                            style={{position: 'absolute', top: 0, left: 0, zIndex: 1}}
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
                            width: editorSize.width + 100,
                            height: editorSize.height + 100,
                            pointerEvents: 'none',
                        }}
                    />
                </Paper>

                <Box sx={{ height: '50px' }} />
            </Box>
        </StyledPaper>
    );
};

export default ImageFrameEditor;