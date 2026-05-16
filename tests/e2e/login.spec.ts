import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/');
    
    // Debería redirigir a /login
    await expect(page).toHaveURL(/.*\/login/);
    
    // Verificar que el formulario de login esté presente
    await expect(page.locator('h3', { hasText: 'Bienvenida' })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/contraseña/i)).toBeVisible();
  });

  test('shows validation errors on empty submission', async ({ page }) => {
    await page.goto('/login');
    
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    
    await expect(page.getByText('Email inválido')).toBeVisible();
    await expect(page.getByText('Mínimo 6 caracteres')).toBeVisible();
  });
});
