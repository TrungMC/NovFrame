import React, {useState, useRef, useEffect} from 'react';
import AvatarEditor from 'react-avatar-editor';
import {
    Button,
    Paper,
    Box,
    Slider,
    styled,
    useTheme,
    useMediaQuery,
    Container,
    Typography,
    Grid
} from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import RotateRightIcon from '@mui/icons-material/RotateRight';

const StyledPaper = styled(Paper)(({theme}) => ({
    margin: '0 auto',
    padding: theme.spacing(2),
    background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #01579b 100%)',
    borderRadius: 16,
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(1),
        borderRadius: 0,
    }
}));

const GlowingTitle = styled(Typography)(({theme}) => ({
    color: '#fff',
    textAlign: 'center',
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    textShadow: '0 0 10px rgba(255,255,255,0.5), 0 0 20px rgba(255,255,255,0.3), 0 0 30px rgba(255,255,255,0.2)',
    marginBottom: theme.spacing(3),
    fontFamily: "'Roboto', sans-serif",
    [theme.breakpoints.down('sm')]: {
        fontSize: '1.5rem',
    }
}));

const SliderLabel = styled(Typography)(({theme}) => ({
    color: '#fff',
    fontSize: '0.875rem',
    marginBottom: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    '& svg': {
        fontSize: '1.2rem',
    }
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

const EditorContainer = styled(Box)(({theme}) => ({
    position: 'relative',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexGrow: 1,
    padding: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(1),
    }
}));

const ImageFrameEditor = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [image, setImage] = useState(null);
    const [scale, setScale] = useState(1);
    const [rotate, setRotate] = useState(0);
    const [editorSize, setEditorSize] = useState({width: 250, height: 250});
    const editorRef = useRef(null);
    const frameRef = useRef(null);
    const frameImage = 'ams_frame.png';
    const [isDownloading, setIsDownloading] = useState(false);
    const containerRef = useRef(null);


    useEffect(() => {
        const calculateSize = () => {
            if (!containerRef.current) return;

            const padding = isMobile ? 16 : 32; // Adjust padding based on screen size
            const containerWidth = containerRef.current.offsetWidth - (padding * 2);
            const maxSize = Math.min(containerWidth, window.innerHeight * 0.6);

            // Subtract the border (50 on each side) from the editor size
            const editorDimension = Math.max(250, Math.min(maxSize - 100, 600));

            setEditorSize({
                width: editorDimension,
                height: editorDimension
            });
        };

        calculateSize();
        window.addEventListener('resize', calculateSize);
        return () => window.removeEventListener('resize', calculateSize);
    }, [isMobile]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // const handleImageChange1 = (e) => {
    //     const file = e.target.files[0];
    //     if (file) {
    //         const reader = new FileReader();
    //         reader.onloadend = () => {
    //             setImage(reader.result);
    //             document.getElementById('downloadButton').style.display = 'block';
    //             document.getElementById('scaleSlider').style.display = 'block';
    //         };
    //         reader.readAsDataURL(file);
    //     } else {
    //         document.getElementById('downloadButton').style.display = 'none';
    //         document.getElementById('scaleSlider').style.display = 'none';
    //     }
    // };

    // Helper function to load image as Promise
    const loadImage = (src) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';  // Enable CORS
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    };

    // Helper function to create blob from canvas
    const canvasToBlob = (canvas) => {
        return new Promise((resolve) => {
            canvas.toBlob(resolve, 'image/png', 1.0);
        });
    };

    const handleDownload = async () => {
        if (!editorRef.current || isDownloading) return;

        try {
            setIsDownloading(true);

            // Get the edited image from AvatarEditor
            const editedCanvas = editorRef.current.getImage();
            // const editedContext = editedCanvas.getContext('2d');

            // Load the frame image
            const frameImg = await loadImage(frameImage);

            // Create a new canvas for the final image
            const finalCanvas = document.createElement('canvas');
            finalCanvas.width = frameImg.width;
            finalCanvas.height = frameImg.height;
            const finalContext = finalCanvas.getContext('2d');

            // Draw the edited image
            finalContext.drawImage(editedCanvas, 0, 0, frameImg.width, frameImg.height);

            // Draw the frame
            finalContext.drawImage(frameImg, 0, 0, frameImg.width, frameImg.height);

            try {
                // First attempt: Using Blob and createObjectURL
                const blob = await canvasToBlob(finalCanvas);
                const blobUrl = URL.createObjectURL(blob);

                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = 'novavatar-4u.png';

                // Append link to body (required for Firefox)
                document.body.appendChild(link);

                // Trigger download
                link.click();

                // Cleanup
                document.body.removeChild(link);
                setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
            } catch (error) {
                console.log('Blob download failed, trying alternative method:', error);

                // Fallback: Using dataURL
                const dataUrl = finalCanvas.toDataURL('image/png');

                // For iOS Safari
                if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
                    // Open image in new tab
                    window.open(dataUrl);
                } else {
                    const link = document.createElement('a');
                    link.href = dataUrl;
                    link.download = 'novavatar-4u.png';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            }
        } catch (error) {
            console.error('Download failed:', error);
            alert('Sorry, there was an error downloading your image. Please try again or use a different browser.');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ height: '100vh', p: 0 }}>
            <StyledPaper elevation={3}>
                <GlowingTitle variant={isMobile ? "h4" : "h3"}>
                    Amsers Avatar Framer
                </GlowingTitle>

                <Box
                    ref={containerRef}
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        height: '100%',
                        position: 'relative'
                    }}
                >
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        pt: isMobile ? 1 : 2,
                        px: isMobile ? 1 : 2,
                        width: '100%'
                    }}>
                        <Button
                            component="label"
                            variant="contained"
                            startIcon={<CameraAltIcon/>}
                            sx={{
                                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                boxShadow: '0 0 15px rgba(33, 203, 243, .5)',
                                color: 'white',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #1976D2 30%, #00BCD4 90%)',
                                    boxShadow: '0 0 20px rgba(33, 203, 243, .7)',
                                },
                                width: isMobile ? '100%' : 'auto',
                                maxWidth: '400px'
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

                    {image && (
                        <Box sx={{
                            px: isMobile ? 1 : 2,
                            mt: 2,
                            opacity: 0,
                            animation: 'fadeIn 0.5s forwards',
                            '@keyframes fadeIn': {
                                to: { opacity: 1 }
                            }
                        }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <SliderLabel>
                                        <ZoomInIcon /> Nhỏ to
                                    </SliderLabel>
                                    <Slider
                                        value={scale}
                                        onChange={(e, newValue) => setScale(newValue)}
                                        min={-2}
                                        max={3}
                                        step={0.1}
                                        sx={{
                                            color: '#90caf9',
                                            '& .MuiSlider-thumb': {
                                                backgroundColor: '#fff',
                                                '&:hover, &.Mui-focusVisible': {
                                                    boxShadow: '0 0 0 8px rgba(144, 202, 249, 0.16)'
                                                }
                                            },
                                            '& .MuiSlider-track': {
                                                backgroundColor: '#90caf9'
                                            },
                                            '& .MuiSlider-rail': {
                                                backgroundColor: 'rgba(144, 202, 249, 0.3)'
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <SliderLabel>
                                        <RotateRightIcon />Sấp ngửa
                                    </SliderLabel>
                                    <Slider
                                        value={rotate}
                                        onChange={(e, newValue) => setRotate(newValue)}
                                        min={-180}
                                        max={180}
                                        step={1}
                                        sx={{
                                            color: '#90caf9',
                                            '& .MuiSlider-thumb': {
                                                backgroundColor: '#fff',
                                                '&:hover, &.Mui-focusVisible': {
                                                    boxShadow: '0 0 0 8px rgba(144, 202, 249, 0.16)'
                                                }
                                            },
                                            '& .MuiSlider-track': {
                                                backgroundColor: '#90caf9'
                                            },
                                            '& .MuiSlider-rail': {
                                                backgroundColor: 'rgba(144, 202, 249, 0.3)'
                                            }
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    )}

                    <Box sx={{
                        px: isMobile ? 1 : 2,
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center'
                    }}>
                        <Button
                            id="downloadButton"
                            variant="contained"
                            onClick={handleDownload}
                            disabled={isDownloading}
                            sx={{
                                display: image ? 'block' : 'none',
                                background: 'linear-gradient(45deg, #4CAF50 30%, #81C784 90%)',
                                boxShadow: '0 0 15px rgba(76, 175, 80, .5)',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #388E3C 30%, #66BB6A 90%)',
                                    boxShadow: '0 0 20px rgba(76, 175, 80, .7)',
                                },
                                width: isMobile ? '100%' : 'auto',
                                maxWidth: '400px'
                            }}
                        >
                            {isDownloading ? 'Đang tải...' : 'Tải về thay avatar thôi ⬇️'}
                        </Button>
                    </Box>

                    <EditorContainer>
                        <Paper
                            elevation={8}
                            sx={{
                                position: 'relative',
                                borderRadius: isMobile ? 1 : 2,
                                overflow: 'hidden',
                                bgcolor: 'rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(10px)',
                                p: 1,
                                width: 'fit-content',
                                height: 'fit-content',
                                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
                            }}
                        >
                            <div style={{
                                position: 'relative',
                                width: editorSize.width + 100,
                                height: editorSize.height + 100
                            }}>
                                {image && (
                                    <AvatarEditor
                                        ref={editorRef}
                                        image={image}
                                        width={editorSize.width}
                                        height={editorSize.height}
                                        border={50}
                                        scale={scale}
                                        rotate={rotate}
                                        style={{position: 'absolute', top: 0, left: 0, zIndex: 1}}
                                        crossOrigin="anonymous"
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
                                    crossOrigin="anonymous"
                                />
                            </div>
                            <Box sx={{
                                textAlign: 'center',
                                mt: 1,
                                color: '#90caf9',
                                typography: 'caption',
                                fontStyle: 'italic'
                            }}>
                                Thiết kế bởi Dũng PMU-code by TrungMC
                            </Box>
                        </Paper>
                    </EditorContainer>
                </Box>
            </StyledPaper>
        </Container>
    );
};

export default ImageFrameEditor;