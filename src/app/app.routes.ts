
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'registro',
    loadComponent: () =>
      import('./pages/registro/registro.page').then(m => m.RegistroPage),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then(m => m.LoginPage),
  },
  {
    path: 'inicio',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/inicio/inicio.page').then(m => m.InicioPage),
  },
  {
    path: 'perfil',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/perfil/perfil.page').then(m => m.PerfilPage),
  },
  {
    path: 'usuarios',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/usuarios/usuarios.page').then(m => m.UsuariosPage),
  },
  {
    path: 'chat/:usuarioId',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/chat/chat.page').then(m => m.ChatPage),
  },
  {
    path: 'crear-grupo',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/crear-grupo/crear-grupo.page').then(m => m.CrearGrupoPage),
  },
  {
    path: 'grupos',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/grupos/grupos.page').then(m => m.GruposPage),
  },
  {
    path: 'grupo/:salaId',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/chat-grupo/chat-grupo.page').then(m => m.ChatGrupoPage),
  },
  {
    path: '',
    redirectTo: 'registro',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'registro',
  },
];
