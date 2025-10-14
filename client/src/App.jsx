import { Container } from '@mui/material';
import { useRoutes } from 'react-router-dom';
import AppLayout from './components/AppLayout.jsx';
import routes from './routes.js';

const App = () => {
  const element = useRoutes(routes);

  return (
    <AppLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {element}
      </Container>
    </AppLayout>
  );
};

export default App;
