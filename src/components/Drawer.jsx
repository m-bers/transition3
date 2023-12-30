// Drawer.jsx
import * as React from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import CompareIcon from '@mui/icons-material/Compare';

const ResponsiveDrawer = ({ 
    drawerWidth, 
    mobileOpen, 
    handleDrawerToggle, 
    children }) => {
        
    const drawerContent = (
        <div>
            <Toolbar>
            <Typography variant="h6" noWrap component="div" color="primary">
              <CompareIcon sx={{ marginTop: -5, marginBottom: -0.7 }}/> Transition Generator
            </Typography>
            </Toolbar>
            <Divider />
            <Stack spacing={2}>
                {children}
            </Stack>

        </div>
    );

    return (
        <Box
            component="nav"
            sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            aria-label="mailbox folders"
        >
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                    keepMounted: true,
                }}
                sx={{
                    display: { xs: 'block', sm: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                }}
            >
                {drawerContent}
            </Drawer>
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', sm: 'block' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                }}
                open
            >
                {drawerContent}
            </Drawer>
        </Box>
    );
};

export default ResponsiveDrawer;
