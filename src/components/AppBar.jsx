// AppBar.jsx
import React, { useState, useRef, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import { Box, Card, CardContent, Slider } from '@mui/material';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Button from '@mui/material/Button';
import SaveIcon from '@mui/icons-material/Save';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import PermMediaIcon from '@mui/icons-material/PermMedia';
import GridViewIcon from '@mui/icons-material/GridView';
import { ColorModeContext } from '../Theme';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { Settings } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles';

const MyAppBar = ({
    drawerWidth,
    handleDrawerToggle,
    handleSave,
    handleLoad,
    handleDownload,
    handleTransition,
    handleRandomize,
    allCanvasPresent,
    setDebugMode,
    imageSizeValue,
    handleImageSizeChange
}) => {
    const colorMode = React.useContext(ColorModeContext);
    const theme = useTheme();
    const containerRef = useRef(null);
    const [showCard, setShowCard] = useState(false);
    const cardRef = useRef(null); // Create a ref for the card

    // Function to toggle the Card's visibility
    const toggleCard = () => {
        setShowCard(!showCard);
    };

    // Function to handle click outside the card
    const handleClickOutside = (event) => {
        if (cardRef.current && !containerRef.current.contains(event.target)) {
            setShowCard(false);
        }
    };

    // Effect for handling outside clicks
    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <AppBar

            position="fixed"
            sx={{
                width: { sm: `calc(100% - ${drawerWidth}px)` },
                ml: { sm: `${drawerWidth}px` },
            }}
        >
            <Toolbar>
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={handleDrawerToggle}
                    sx={{ mr: 2, display: { sm: 'none' } }}
                >
                    <MenuIcon />
                </IconButton>
                <IconButton color="inherit" onClick={handleTransition}><RestartAltIcon /></IconButton>
                <IconButton color="inherit" onClick={handleRandomize}><ShuffleIcon /></IconButton>
                <IconButton color="inherit" onClick={handleSave}><SaveIcon /></IconButton>
                <IconButton color="inherit" onClick={toggleCard}>
                    <GridViewIcon />
                </IconButton>
                <input
                    type="file"
                    accept=".json"
                    style={{ display: 'none' }}
                    id="file-upload"
                    onChange={handleLoad}
                />
                <label htmlFor="file-upload">
                    <IconButton color="inherit" component="span"><UploadFileIcon /></IconButton>
                </label>
                <IconButton color="inherit" onClick={handleDownload} disabled={!allCanvasPresent}><PermMediaIcon /></IconButton>
                <IconButton color="inherit" onClick={() => setDebugMode(prevDebugMode => !prevDebugMode)}><Settings /></IconButton>
                <IconButton onClick={colorMode.toggleColorMode} color="inherit">
                    {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
            </Toolbar>
            {/* {showCard && (
                <Card sx={{ width: 500 }} ref={cardRef}>
                    <CardContent>
                        <Slider
                            value={imageSizeValue}
                            onChange={handleImageSizeChange}
                            min={0}
                            max={1}
                            step={0.01}
                        />
                    </CardContent>
                </Card>

            )} */}
                            {showCard && (
                    <Card
                        sx={{
                            width: `calc(100% - ${drawerWidth}px)`, // Match AppBar width
                            position: 'fixed', // Fixed position
                            top: theme.mixins.toolbar.minHeight, // Position below AppBar, adjust for theme spacing
                            ml: { sm: `${drawerWidth}px` }, // Match the AppBar's margin
                            zIndex: 1 // Ensure it's above other content but below AppBar
                        }}
                        ref={cardRef}
                    >
                        <CardContent>
                            Image size:
                            <Slider
                                value={imageSizeValue}
                                onChange={handleImageSizeChange}
                                min={0}
                                max={1}
                                step={0.01}
                            />
                        </CardContent>
                    </Card>
                )}
        </AppBar>
    );
};

export default MyAppBar;