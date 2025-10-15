import { Box } from '@mui/material';
import PropTypes from 'prop-types';

import NavigationBar from './NavigationBar.jsx';

const AppLayout = ({ children = null }) => (
  <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
    <NavigationBar />
    {children}
  </Box>
);

AppLayout.propTypes = {
  children: PropTypes.node,
};

export default AppLayout;
