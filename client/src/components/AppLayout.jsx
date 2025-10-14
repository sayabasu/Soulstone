import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import NavigationBar from './NavigationBar.jsx';

const AppLayout = ({ children }) => (
  <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
    <NavigationBar />
    {children}
  </Box>
);

AppLayout.propTypes = {
  children: PropTypes.node,
};

AppLayout.defaultProps = {
  children: null,
};

export default AppLayout;
