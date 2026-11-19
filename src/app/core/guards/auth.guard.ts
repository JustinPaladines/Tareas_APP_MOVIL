    import { inject } from '@angular/core';
    import { CanActivateFn, Router } from '@angular/router';
    import { AuthService } from '../services/auth.service';

    export const authGuard: CanActivateFn = async () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    try {
        const { data, error } = await authService.obtenerUsuario();

        if (error || !data.user) {
        return router.createUrlTree(['/login']);
        }

        return true;

    } catch (error) {
        console.error('Error al verificar la sesión:', error);
        return router.createUrlTree(['/login']);
    }
    };