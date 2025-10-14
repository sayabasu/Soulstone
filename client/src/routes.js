import React from 'react';
import HomePage from './features/home/HomePage.jsx';
import LoginPage from './features/auth/LoginPage.jsx';
import RegisterPage from './features/auth/RegisterPage.jsx';
import CatalogPage from './features/catalog/CatalogPage.jsx';

const routes = [
  {
    path: '/',
    element: <HomePage />, 
  },
  {
    path: '/login',
    element: <LoginPage />, 
  },
  {
    path: '/register',
    element: <RegisterPage />, 
  },
  {
    path: '/catalog',
    element: <CatalogPage />, 
  },
];

export default routes;
