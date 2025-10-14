import { Container } from '@mui/material';
import { Outlet } from 'react-router-dom';
import AppLayout from './components/AppLayout.jsx';

const App = () => (
  <AppLayout>
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Outlet />
    </Container>
  </AppLayout>
);

export default App;
