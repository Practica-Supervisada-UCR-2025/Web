import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RegisterUser from '../register/page';
import '@testing-library/jest-dom';
import { act } from 'react';


describe('RegisterUser Component', () => {
    beforeEach(() => {
        render(<RegisterUser />);
    });

    test('renders the form with all fields and submit button', () => {
        expect(screen.getByLabelText(/Nombre/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Correo electrónico/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^Contraseña\b/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Confirmar Contraseña/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Registrar usuario/i })).toBeInTheDocument();
    });

    test('shows validation error for empty required fields on blur', async () => {
        const nameInput = screen.getByLabelText(/Nombre/i);
        const emailInput = screen.getByLabelText(/Correo electrónico/i);
        const passwordInput = screen.getByLabelText(/^Contraseña\b/i);
        const confirmPasswordInput = screen.getByLabelText(/Confirmar Contraseña/i);

        fireEvent.blur(nameInput);
        fireEvent.blur(emailInput);
        fireEvent.blur(passwordInput);
        fireEvent.blur(confirmPasswordInput);

        expect(await screen.findByText('El nombre es obligatorio.')).toBeInTheDocument();
        expect(await screen.findByText('El correo es obligatorio.')).toBeInTheDocument();
        expect(await screen.findByText('La contraseña es obligatoria.')).toBeInTheDocument();
        expect(await screen.findByText('Debes confirmar tu contraseña.')).toBeInTheDocument();
    });

    test('validates name format correctly', async () => {
        const nameInput = screen.getByLabelText(/Nombre/i);

        fireEvent.change(nameInput, { target: { value: 'invalid-name' } });
        fireEvent.blur(nameInput);

        expect(await screen.findByText(/El nombre solo debe contener letras o espacios./i)).toBeInTheDocument();
    });

    test('validates name lenght correctly', async () => {
        const nameInput = screen.getByLabelText(/Nombre/i);

        fireEvent.change(nameInput, { target: { value: 'x' } });
        fireEvent.blur(nameInput);

        expect(await screen.findByText(/El nombre debe tener al menos 3 caracteres/i)).toBeInTheDocument();

        fireEvent.change(nameInput, { target: { value: 'x'.repeat(26) } });
        fireEvent.blur(nameInput);

        expect(await screen.findByText(/El nombre no puede tener más de 25 caracteres/i)).toBeInTheDocument();
    });

    test('validates email format correctly', async () => {
        const emailInput = screen.getByLabelText(/Correo electrónico/i);

        fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
        fireEvent.blur(emailInput);

        expect(await screen.findByText(/Formato de correo electrónico inválido/i)).toBeInTheDocument();
    });

    test('validates email length correctly', async () => {
        const emailInput = screen.getByLabelText(/Correo electrónico/i);

        const maxEmailLength = 100;
        const domain = '@ucr.ac.cr';
        const localPartLength = maxEmailLength + 1 - domain.length; // +1 to exceed the limit
        const longEmail = 'x'.repeat(localPartLength) + domain;

        fireEvent.change(emailInput, { target: { value: longEmail } });
        fireEvent.blur(emailInput);

        expect(await screen.findByText(/El correo no puede tener más de 100 caracteres/i)).toBeInTheDocument();
    });

    test('displays "Correo disponible" message when email is available', async () => {
        jest.useFakeTimers();

        const emailInput = screen.getByLabelText(/Correo electrónico/i);

        fireEvent.change(emailInput, { target: { value: 'available@ucr.ac.cr' } });
        fireEvent.blur(emailInput);

        expect(await screen.findByText(/Verificando disponibilidad.../i)).toBeInTheDocument();

        await act(async () => {
            jest.advanceTimersByTime(1000); // Simulate the debounce time
        });

        expect(await screen.findByText(/Correo disponible/i)).toBeInTheDocument();

        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    test('displays "Este correo ya está registrado" message when email is available', async () => {
        jest.useFakeTimers();

        const emailInput = screen.getByLabelText(/Correo electrónico/i);

        fireEvent.change(emailInput, { target: { value: 'admin@ucr.ac.cr' } });
        fireEvent.blur(emailInput);

        expect(await screen.findByText(/Verificando disponibilidad.../i)).toBeInTheDocument();

        await act(async () => {
            jest.advanceTimersByTime(1000); // Simulate the debounce time
        });

        expect(await screen.findByText(/Este correo ya está registrado/i)).toBeInTheDocument();

        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    test('validates password length correctly', async () => {
        const passwordInput = screen.getByLabelText(/^Contraseña\b/i);

        fireEvent.change(passwordInput, { target: { value: 'short' } });
        fireEvent.blur(passwordInput);

        expect(await screen.findByText(/La contraseña debe tener al menos 8 caracteres/i)).toBeInTheDocument();

        fireEvent.change(passwordInput, { target: { value: 'x'.repeat(51) } });
        fireEvent.blur(passwordInput);

        expect(await screen.findByText(/La contraseña no puede tener más de 50 caracteres/i)).toBeInTheDocument();
    });

    test('validates confirm password matches password', async () => {
        const passwordInput = screen.getByLabelText(/^Contraseña\b/i);
        const confirmPasswordInput = screen.getByLabelText(/Confirmar Contraseña/i);

        fireEvent.change(passwordInput, { target: { value: 'validpassword' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'differentpassword' } });
        fireEvent.blur(confirmPasswordInput);

        expect(await screen.findByText(/Las contraseñas no coinciden/i)).toBeInTheDocument();
    });

    test('validates confirm password when password changes', async () => {
        const passwordInput = screen.getByLabelText(/^Contraseña\b/i);
        const confirmPasswordInput = screen.getByLabelText(/Confirmar Contraseña/i);

        fireEvent.change(confirmPasswordInput, { target: { value: 'validpassword' } });
        fireEvent.blur(confirmPasswordInput);

        fireEvent.change(passwordInput, { target: { value: 'differentpassword' } });
        fireEvent.blur(passwordInput);

        expect(await screen.findByText(/Las contraseñas no coinciden/i)).toBeInTheDocument();

    });

    test('displays success message on successful form submission', async () => {
        jest.useFakeTimers();

        const nameInput = screen.getByLabelText(/Nombre/i);
        const emailInput = screen.getByLabelText(/Correo electrónico/i);
        const passwordInput = screen.getByLabelText(/^Contraseña\b/i);
        const confirmPasswordInput = screen.getByLabelText(/Confirmar Contraseña/i);
        const submitButton = screen.getByRole('button', { name: /Registrar usuario/i });

        fireEvent.change(nameInput, { target: { value: 'John Doe' } });
        fireEvent.change(emailInput, { target: { value: 'johndoe@ucr.ac.cr' } });
        fireEvent.change(passwordInput, { target: { value: 'password' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'password' } });

        fireEvent.blur(nameInput);
        fireEvent.blur(emailInput);
        fireEvent.blur(passwordInput);
        fireEvent.blur(confirmPasswordInput);

        // Simulate email availability check
        expect(await screen.findByText(/Verificando disponibilidad.../i)).toBeInTheDocument();
        await act(async () => {
            jest.advanceTimersByTime(1000); // Simulate the debounce time
        });
        expect(await screen.findByText(/Correo disponible/i)).toBeInTheDocument();
        
        await waitFor(() => {
            expect(submitButton).toBeEnabled();
        });
        fireEvent.click(submitButton);
        
        await waitFor(() => {
            expect(screen.getByText(/Usuario registrado correctamente./i)).toBeInTheDocument();
        });

        await act(async () => {
            jest.runOnlyPendingTimers();
        });
        jest.useRealTimers();
    });


    test('disables submit button when form is invalid', () => {
        const submitButton = screen.getByRole('button', { name: /Registrar usuario/i });
        expect(submitButton).toBeDisabled();
    });
});