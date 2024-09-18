import { Drawer, Box, Typography, Button } from '@mui/material';
import React, { useState } from 'react';
import { useEffect } from 'react';

export const Sidebar: React.FC<{ open: boolean; data: string }> = ({ open, data = '' }) => {
  // const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // const toggleDrawer = () => {
  //   setIsSidebarOpen(!isSidebarOpen);
  // };

  const [isOpen, setIsOpen] = useState(open);

  // useEffect(() => {
  //   const handleOpenSidebar = () => {
  //     setIsOpen(true);
  //   };

  //   // Listen for the custom event dispatched by content.js
  //   window.addEventListener('openReactSidebar', handleOpenSidebar);

  //   // Clean up the event listener on component unmount
  //   return () => {
  //     window.removeEventListener('openReactSidebar', handleOpenSidebar);
  //   };
  // }, [setIsOpen]);

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Sidebar */}
      <Drawer
        variant="persistent"
        open={isOpen}
        anchor="right"
        sx={{
          width: 240, // Set the width of the sidebar
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
          },
        }}
      >
        <Typography variant="h6" sx={{ padding: 2 }}>
          {data}
        </Typography>
        <Button onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? 'Hide Sidebar' : 'Show Sidebar'}
        </Button>
      </Drawer>

      {/* <Box
          component="main"
          sx={{
            flexGrow: 1,
            padding: 3,
            marginLeft: isOpen ? '240px' : '0px', // Adjust margin based on sidebar width
          }}
        >
          <Button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? 'Hide Sidebar' : 'Show Sidebar'}
          </Button>
          <Typography variant="h4">Main Content (Scraped Page)</Typography>
        </Box> */}
    </Box>
  );
};
export default Sidebar;
