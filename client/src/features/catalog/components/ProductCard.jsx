import PropTypes from 'prop-types';
import { Card, CardActions, CardContent, CardMedia, Chip, Stack, Typography, Button } from '@mui/material';

const ProductCard = ({ product }) => (
  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
    <CardMedia component="img" image={product.imageUrl} alt={product.name} height="180" />
    <CardContent sx={{ flexGrow: 1 }}>
      <Typography variant="h6" gutterBottom>
        {product.name}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {product.description}
      </Typography>
      <Typography variant="subtitle1" fontWeight={600}>
        ₹{Number(product.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </Typography>
      <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}>
        {product.tags.map((tag) => (
          <Chip key={tag} label={tag} size="small" color="secondary" variant="outlined" />
        ))}
      </Stack>
    </CardContent>
    <CardActions>
      <Button color="primary" fullWidth variant="contained">
        Add to cart
      </Button>
    </CardActions>
  </Card>
);

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    imageUrl: PropTypes.string.isRequired,
    tags: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
};

export default ProductCard;
