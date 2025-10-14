import React from 'react';
import HomePage from './features/home/HomePage.jsx';
import LoginPage from './features/auth/LoginPage.jsx';
import RegisterPage from './features/auth/RegisterPage.jsx';
import CatalogPage from './features/catalog/CatalogPage.jsx';

const routes = [
  {
    path: '/',
    element: React.createElement(HomePage),
  },
  {
    path: '/login',
    element: React.createElement(LoginPage),
  },
  {
    path: '/register',
    element: React.createElement(RegisterPage),
  },
  {
    path: '/catalog',
    element: React.createElement(CatalogPage),
  },
];

export default routes;
