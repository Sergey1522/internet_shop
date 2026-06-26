import { Routes, CanActivateFn } from '@angular/router';
import { Layout } from './shared/layout/layout';
import { Main } from './views/main/main';
import { Login } from './views/users/login/login';
import { Signup } from './views/users/signup/signup';
import { Catalog } from './views/product/catalog/catalog';
import { Ditail } from './views/product/ditail/ditail';
import { Cart } from './views/order/cart/cart';
import { Favorite } from './views/personal/favorite/favorite';
import { authForwardGuard } from './core/auth/auth-forward-guard';
import { authGuard } from './core/auth/auth-guard';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      {
        path: '',
        component: Main,
        children: [],
      },
      {
        path: 'catalog',
        component: Catalog,
        children: [],
      },
      {
        path: 'product/:url',
        component: Ditail,
      },
      {
        path: 'cart',
        component: Cart,
      },
      {
        path: 'favorite',
        component: Favorite,
        canActivate: [authGuard],
      },

      { path: 'signup', component: Signup, canActivate: [authForwardGuard] },
      { path: 'login', component: Login, canActivate: [authForwardGuard] },
    ],
  },
];
