import { useEffect, useState } from 'react';
import { Alert, Grid, Skeleton, Typography } from '@mui/material';
import api from '../../api/client.js';
import ProductCard from './components/ProductCard.jsx';

const CatalogPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/catalog/products');
        setProducts(data);
      } catch (err) {
        setError(err.response?.data?.message ?? 'Unable to load products');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <Grid container spacing={3}>
        {Array.from({ length: 6 }).map((_, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Skeleton variant="rectangular" height={240} />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!products.length) {
    return <Typography>No products available yet. Check back soon!</Typography>;
  }

  return (
    <Grid container spacing={3}>
      {products.map((product) => (
        <Grid item xs={12} sm={6} md={4} key={product.id}>
          <ProductCard product={product} />
        </Grid>
      ))}
    </Grid>
  );
};

export default CatalogPage;
