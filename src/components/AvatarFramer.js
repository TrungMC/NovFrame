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
    const [position, setPosition] = useState({x: 0, y: 0});
    const [aspectRatio, setAspectRatio] = useState(1); // Default aspect ratio
    const [showNotes, setShowNotes] = useState(false);

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
                const img = new Image();
                img.src = reader.result;
                img.onload = () => {
                    setAspectRatio(img.width / img.height); // Calculate and set aspect ratio
                };
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

            // Get image properties from AvatarEditor
            //const position = editorRef.current.getCroppingRect(); // Position of cropped area
            //const scale = editorRef.current.props.scale || 1;
            //const rotate = editorRef.current.props.rotate || 0; // Get current rotation
            console.log("Scale:", scale);
            console.log("Rotate:", rotate);

            // Load frame image
            const frameImg = await loadImage(frameImage);
            const frameWidth = frameImg.width; // 2048
            const frameHeight = frameImg.height; // 2048

            // Create a new canvas for final image
            const finalCanvas = document.createElement('canvas');
            finalCanvas.width = frameWidth;
            finalCanvas.height = frameHeight;
            const finalContext = finalCanvas.getContext('2d');

            // Calculate canvas dimensions (display size)
            const editorCanvasWidth = editorSize.width; // e.g., 398
            const editorCanvasHeight = editorSize.height; // e.g., 398

            // Calculate scaling factor between canvas and frame
            const scaleFactor = frameWidth / editorCanvasWidth; // e.g., 2048 / 398

            // Calculate new scaled image height and width while maintaining aspect ratio
            const imageHeight = editorCanvasHeight * scale * scaleFactor;
            const imageWidth = imageHeight * aspectRatio; // Maintain aspect ratio
            // Calculate adjusted offsets based on cropping position and scaling factor
            // Adjusting offset calculation to account for potential misalignment
            const offsetX = (position.x * editorCanvasWidth);//- (imageWidth / 2) + (frameWidth / 2);
            const offsetY = (position.y * editorCanvasHeight);//- (imageHeight / 2) + (frameHeight / 2);


            console.log("Calculated Offsets - X:", offsetX, "Y:", offsetY);

            // Draw uploaded image
            const uploadImg = editorRef.current.props.image;
            const img = await loadImage(uploadImg);

            // Save the current context state before transformations
            finalContext.save();

            // Translate to center of the canvas
            finalContext.translate(frameWidth / 2, frameHeight / 2);

            // Rotate the context
            finalContext.rotate((rotate * Math.PI) / 180); // Convert degrees to radians

            // Translate back to top-left corner after rotation
            finalContext.translate(-imageWidth / 2, -imageHeight / 2);

            // Draw the image with offsets applied
            finalContext.drawImage(img, offsetX, offsetY, imageWidth, imageHeight);

            // Restore context to its original state before drawing the frame
            finalContext.restore();

            // Draw the frame on top
            finalContext.drawImage(frameImg, 0, 0, frameWidth, frameHeight);

            // Handle download
            const blob = await canvasToBlob(finalCanvas);
            const blobUrl = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = 'amsavatar-4u.png';

            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);

        } catch (error) {
            console.error('Download failed:', error);
        } finally {
            setIsDownloading(false);
        }
    };


    return (
        <Container maxWidth="lg" sx={{height: '100vh', p: 0}}>
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
                                to: {opacity: 1}
                            }
                        }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <SliderLabel>
                                        <ZoomInIcon/> Nhỏ to
                                    </SliderLabel>
                                    <Slider
                                        value={scale}
                                        onChange={(e, newValue) => {
                                            setScale(newValue);
                                            console.log("New Scale:", newValue); // Log new scale value
                                        }}
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
                                        <RotateRightIcon/>Sấp ngửa
                                    </SliderLabel>
                                    <Slider
                                        value={rotate}
                                        onChange={(e, newValue) => {
                                            setRotate(newValue);
                                            console.log("New Rotation:", newValue); // Log new rotation value
                                        }}
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
                                width: editorSize.width + 104,
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
                                        onPositionChange={(newPosition) => {
                                            setPosition(newPosition);
                                            console.log("New Position - X:", newPosition.x, "Y:", newPosition.y); // Log new position
                                        }}
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
                                Thiết kế bởi Dũng PMU - lập trình bởi {' '}
                                <Typography
                                    component="span"
                                    sx={{
                                        color: 'blue',
                                        textDecoration: 'underline',
                                        cursor: 'pointer',
                                        fontSize: 'inherit' // Inherit font size from parent to match
                                    }}
                                    onClick={() => setShowNotes(!showNotes)}
                                >
                                    TrungMC
                                </Typography>
                            </Box>
                        </Paper>
                    </EditorContainer>
                </Box>
                {/* Note Section */}

                    {/*<Typography variant="h6" sx={{ fontWeight: 'bold' }}>*/}
                    {/*    Ghi chú :*/}
                    {/*</Typography>*/}
                    {/* Note Section */}
                    {showNotes && (
                        <Box sx={{mt: 2, p: 2, backgroundColor: '#f0f0f0', borderRadius: 2}}>
                            <Typography variant="body1">
                                🌐 Dùng trình duyệt phổ biến được hỗ trợ như: Edge, Chrome, Firefox...<br/>
                                🚫 Không hoạt động với trình duyệt trong: Messenger/Zalo

                            </Typography>
                            <Typography variant="body1">
                                - Trân trọng gửi lời chào tới các thầy cô giáo và các bạn học trong đội tuyển tiếng Anh
                                năm 1994🎓
                            </Typography>
                            <Typography variant="body1">
                                {/**** Topic for #ams is Don't walk in front of me, I may not follow. Don't walk behind me, I may not lead. Just walk beside me and be my friend. To NOCry *Joyeux Anniversaire* (nhoveanh)<br/>*/}
                                {/**** Topic for #ams set by Ke[voice] at Sun Oct 29 01:07:50 2000<br/>*/}

                                - CDT has joined #ams: 👋 HacNho, LeQuoc, Bart_Simpson, monkeee, PQLinh ...
                            </Typography>
                        </Box>
                    )}


            </StyledPaper>
        </Container>
    );
};

export default ImageFrameEditor;