
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RegisterUser from '../register/page';
import '@testing-library/jest-dom';
import { act } from 'react';

import { createUserWithEmailAndPassword, deleteUser, signOut } from 'firebase/auth';
import { getSecondaryAuth } from '@/lib/firebase';
import { deleteApp } from 'firebase/app';

jest.mock('firebase/auth', () => ({
    ...jest.requireActual('firebase/auth'),
    createUserWithEmailAndPassword: jest.fn(),
    deleteUser: jest.fn(),
    signOut: jest.fn(),
}));

jest.mock('firebase/app', () => ({
    deleteApp: jest.fn(),
}));

jest.mock('@/lib/firebase', () => ({
    getSecondaryAuth: jest.fn(),
}));

global.fetch = jest.fn();

describe('RegisterUser Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders the form with all fields and submit button', () => {
        render(<RegisterUser />);

        expect(screen.getByLabelText(/Nombre/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Correo electrónico/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^Contraseña\b/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Confirmar Contraseña/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Registrar usuario/i })).toBeInTheDocument();
    });

    test('shows validation error for empty required fields on blur', async () => {
        render(<RegisterUser />);

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
        render(<RegisterUser />);

        const nameInput = screen.getByLabelText(/Nombre/i);

        fireEvent.change(nameInput, { target: { value: 'invalid-name1' } });
        fireEvent.blur(nameInput);

        expect(await screen.findByText(/El nombre solo debe contener letras o espacios./i)).toBeInTheDocument();
    });

    test('validates name lenght correctly', async () => {
        render(<RegisterUser />);

        const nameInput = screen.getByLabelText(/Nombre/i);

        fireEvent.change(nameInput, { target: { value: 'x' } });
        fireEvent.blur(nameInput);

        expect(await screen.findByText(/El nombre debe tener al menos 3 caracteres/i)).toBeInTheDocument();

        fireEvent.change(nameInput, { target: { value: 'x'.repeat(26) } });
        fireEvent.blur(nameInput);

        expect(await screen.findByText(/El nombre no puede tener más de 25 caracteres/i)).toBeInTheDocument();
    });

    test('validates email format correctly', async () => {
        render(<RegisterUser />);

        const emailInput = screen.getByLabelText(/Correo electrónico/i);

        fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
        fireEvent.blur(emailInput);

        expect(await screen.findByText(/Formato de correo electrónico inválido/i)).toBeInTheDocument();
    });

    test('validates email length correctly', async () => {
        render(<RegisterUser />);

        const emailInput = screen.getByLabelText(/Correo electrónico/i);

        const maxEmailLength = 100;
        const domain = '@ucr.ac.cr';
        const localPartLength = maxEmailLength + 1 - domain.length; // +1 to exceed the limit
        const longEmail = 'x'.repeat(localPartLength) + domain;

        fireEvent.change(emailInput, { target: { value: longEmail } });
        fireEvent.blur(emailInput);

        expect(await screen.findByText(/El correo no puede tener más de 100 caracteres/i)).toBeInTheDocument();
    });

    test('validates password length correctly', async () => {
        render(<RegisterUser />);

        const passwordInput = screen.getByLabelText(/^Contraseña\b/i);

        fireEvent.change(passwordInput, { target: { value: 'short' } });
        fireEvent.blur(passwordInput);

        expect(await screen.findByText(/La contraseña debe tener al menos 8 caracteres/i)).toBeInTheDocument();

        fireEvent.change(passwordInput, { target: { value: 'x'.repeat(51) } });
        fireEvent.blur(passwordInput);

        expect(await screen.findByText(/La contraseña no puede tener más de 50 caracteres/i)).toBeInTheDocument();
    });

    test('validates confirm password matches password', async () => {
        render(<RegisterUser />);

        const passwordInput = screen.getByLabelText(/^Contraseña\b/i);
        const confirmPasswordInput = screen.getByLabelText(/Confirmar Contraseña/i);

        fireEvent.change(passwordInput, { target: { value: 'validpassword' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'differentpassword' } });
        fireEvent.blur(confirmPasswordInput);

        expect(await screen.findByText(/Las contraseñas no coinciden/i)).toBeInTheDocument();
    });

    test('validates confirm password when password changes', async () => {
        render(<RegisterUser />);

        const passwordInput = screen.getByLabelText(/^Contraseña\b/i);
        const confirmPasswordInput = screen.getByLabelText(/Confirmar Contraseña/i);

        fireEvent.change(confirmPasswordInput, { target: { value: 'validpassword' } });
        fireEvent.blur(confirmPasswordInput);

        fireEvent.change(passwordInput, { target: { value: 'differentpassword' } });
        fireEvent.blur(passwordInput);

        expect(await screen.findByText(/Las contraseñas no coinciden/i)).toBeInTheDocument();

    });

    test('toggles password visibility', () => {
        render(<RegisterUser />);

        const passwordInput = screen.getByLabelText(/^Contraseña\b/i);
        const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i });

        expect(passwordInput).toHaveAttribute('type', 'password');

        fireEvent.click(toggleButton);
        expect(passwordInput).toHaveAttribute('type', 'text');

        fireEvent.click(toggleButton);
        expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('toggles confirm password visibility', () => {
        render(<RegisterUser />);

        const confirmPasswordInput = screen.getByLabelText(/Confirmar Contraseña/i);
        const toggleButton = screen.getByRole('button', { name: /toggle confirmPassword visibility/i });

        expect(confirmPasswordInput).toHaveAttribute('type', 'password');

        fireEvent.click(toggleButton);
        expect(confirmPasswordInput).toHaveAttribute('type', 'text');

        fireEvent.click(toggleButton);
        expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    });

    test('displays success message on successful form submission', async () => {
        jest.useFakeTimers();
        const mockGetIdToken = jest.fn().mockResolvedValue('fake-token');
        const mockUser = {
            uid: '12345',
            getIdToken: mockGetIdToken,
        };

        const mockSignOut = jest.fn();
        const mockSecondaryAuth = { signOut: mockSignOut };
        const mockSecondaryApp = {};

        (getSecondaryAuth as jest.Mock).mockReturnValue({
            auth: mockSecondaryAuth,
            app: mockSecondaryApp,
        });

        (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue({ user: mockUser });
        (fetch as jest.Mock).mockResolvedValue({
            ok: true, json: async () => ({})
        });

        render(<RegisterUser />);

        const nameInput = screen.getByLabelText(/Nombre/i);
        const emailInput = screen.getByLabelText(/Correo electrónico/i);
        const passwordInput = screen.getByLabelText(/^Contraseña\b/i);
        const confirmPasswordInput = screen.getByLabelText(/Confirmar Contraseña/i);
        const submitButton = screen.getByRole('button', { name: /Registrar usuario/i });

        fireEvent.change(nameInput, { target: { value: 'John Doe' } });
        fireEvent.change(emailInput, { target: { value: 'johndoe@ucr.ac.cr' } });
        fireEvent.change(passwordInput, { target: { value: '12345678' } });
        fireEvent.change(confirmPasswordInput, { target: { value: '12345678' } });

        expect(submitButton).toBeEnabled();
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(createUserWithEmailAndPassword).toHaveBeenCalled();
            expect(fetch).toHaveBeenCalledWith('/api/admin/auth/register', expect.any(Object));
            expect(mockSignOut).toHaveBeenCalled();
            expect(deleteApp).toHaveBeenCalledWith(mockSecondaryApp);
            expect(screen.getByText(/Usuario registrado correctamente./i)).toBeInTheDocument();
        });

        await act(async () => {
            jest.advanceTimersByTime(3000);
        });
        await waitFor(() =>
            expect(screen.queryByText(/Usuario registrado correctamente./i)).not.toBeInTheDocument()
        );

        jest.useRealTimers();
    });

    test('disables submit button when form is invalid', () => {
        render(<RegisterUser />);

        const nameInput = screen.getByLabelText(/Nombre/i);
        fireEvent.change(nameInput, { target: { value: 'John Doe' } });
        fireEvent.blur(nameInput);

        const submitButton = screen.getByRole('button', { name: /Registrar usuario/i });
        expect(submitButton).toBeDisabled();
    });

    test('does not submit form if validation fails', async () => {
        render(<RegisterUser />);

        const nameInput = screen.getByLabelText(/Nombre/i);
        const emailInput = screen.getByLabelText(/Correo electrónico/i);
        const passwordInput = screen.getByLabelText(/^Contraseña\b/i);
        const confirmPasswordInput = screen.getByLabelText(/Confirmar Contraseña/i);
        const submitButton = screen.getByRole('button', { name: /Registrar usuario/i });

        fireEvent.change(nameInput, { target: { value: 'John Doe' } });
        fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
        fireEvent.change(passwordInput, { target: { value: '12345678' } });
        fireEvent.change(confirmPasswordInput, { target: { value: '12345678' } });

        const form = submitButton.closest('form');
        fireEvent.submit(form!);

        await waitFor(() => {
            expect(createUserWithEmailAndPassword).not.toHaveBeenCalled();
            expect(screen.getByText(/Formato de correo electrónico inválido./i)).toBeInTheDocument();
        });
    });

    test.each([
        [400, { message: 'Algunos datos no son válidos. Verifica e intenta de nuevo.' }, /Algunos datos no son válidos. Verifica e intenta de nuevo./i],
        [401, { message: 'No estás autorizado para realizar esta acción.' }, /No estás autorizado para realizar esta acción/i],
        [409, { message: 'El correo electrónico ya está registrado como administrador.' }, /El correo electrónico ya está registrado como administrador./i],
        [500, { message: 'Hubo un problema en el servidor. Intenta nuevamente más tarde.' }, /Hubo un problema en el servidor. Intenta nuevamente más tarde./i],
        [419, { message: 'Error no contemplado.' }, /Error no contemplado./i],
        [419, {}, /Ocurrió un error inesperado./i],
    ])('shows error message from API response on failed registration', async (status, bodyMessage, expectedError) => {
        const mockGetIdToken = jest.fn().mockResolvedValue('fake-token');
        const mockUser = {
            uid: '12345',
            getIdToken: mockGetIdToken,
        };

        const mockSignOut = jest.fn();
        const mockSecondaryAuth = { signOut: mockSignOut };
        const mockSecondaryApp = {};

        (getSecondaryAuth as jest.Mock).mockReturnValue({
            auth: mockSecondaryAuth,
            app: mockSecondaryApp,
        });

        (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue({ user: mockUser });

        (deleteUser as jest.Mock).mockResolvedValue(undefined);

        global.fetch = jest.fn().mockResolvedValueOnce({
            ok: false,
            status: status,
            json: async () => (bodyMessage),
        });

        render(<RegisterUser />);

        const nameInput = screen.getByLabelText(/Nombre/i);
        const emailInput = screen.getByLabelText(/Correo electrónico/i);
        const passwordInput = screen.getByLabelText(/^Contraseña\b/i);
        const confirmPasswordInput = screen.getByLabelText(/Confirmar Contraseña/i);
        const submitButton = screen.getByRole('button', { name: /Registrar usuario/i });

        fireEvent.change(nameInput, { target: { value: 'John Doe' } });
        fireEvent.change(emailInput, { target: { value: 'johndoe@ucr.ac.cr' } });
        fireEvent.change(passwordInput, { target: { value: '12345678' } });
        fireEvent.change(confirmPasswordInput, { target: { value: '12345678' } });

        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(createUserWithEmailAndPassword).toHaveBeenCalled();
            expect(fetch).toHaveBeenCalled();
            expect(deleteUser).toHaveBeenCalledWith(mockUser);
            expect(screen.getByText(expectedError)).toBeInTheDocument();
        });
    });

    test('shows error details when err.details its and array (400)', async () => {
        const mockGetIdToken = jest.fn().mockResolvedValue('fake-token');
        const mockUser = { uid: '12345', getIdToken: mockGetIdToken };
        const mockSignOut = jest.fn();
        const mockSecondaryAuth = { signOut: mockSignOut };

        (getSecondaryAuth as jest.Mock).mockReturnValue({ auth: mockSecondaryAuth, app: {} });
        (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue({ user: mockUser });

        const errorDetails = ["Campo 'Nombre' es requerido", "Correo inválido"];
        const fakeErrorResponse = {
            ok: false,
            status: 400,
            json: async () => ({ details: errorDetails }),
        };

        (global.fetch as jest.Mock).mockResolvedValue(fakeErrorResponse);

        render(<RegisterUser />);
        fireEvent.change(screen.getByLabelText(/Nombre/i), { target: { value: 'Nombre' } });
        fireEvent.change(screen.getByLabelText(/Correo electrónico/i), { target: { value: 'johndoe@ucr.ac.cr' } });
        fireEvent.change(screen.getByLabelText(/^Contraseña\b/i), { target: { value: '12345678' } });
        fireEvent.change(screen.getByLabelText(/Confirmar Contraseña/i), { target: { value: '12345678' } });

        fireEvent.click(screen.getByRole('button', { name: /Registrar usuario/i }));

        const expectedMessage = errorDetails.join(" ");
        expect(await screen.findByText(expectedMessage)).toBeInTheDocument();
    });

    test.each([
        ['auth/email-already-in-use', /El correo electrónico ya está en uso./i],
        ['auth/invalid-email', /El correo electrónico no es válido./i],
        ['auth/weak-password', /La contraseña es demasiado débil. Debe tener al menos 8 caracteres./i],
    ])('shows error from err.message when there is a standard error', async (code, expectedMessage) => {
        (createUserWithEmailAndPassword as jest.Mock).mockRejectedValue({ code });

        render(<RegisterUser />);
        const nameInput = screen.getByLabelText(/Nombre/i);
        const emailInput = screen.getByLabelText(/Correo electrónico/i);
        const passwordInput = screen.getByLabelText(/^Contraseña\b/i);
        const confirmPasswordInput = screen.getByLabelText(/Confirmar Contraseña/i);
        const submitButton = screen.getByRole('button', { name: /Registrar usuario/i });

        fireEvent.change(nameInput, { target: { value: 'John Doe' } });
        fireEvent.change(emailInput, { target: { value: 'johndoe@ucr.ac.cr' } });
        fireEvent.change(passwordInput, { target: { value: '12345678' } });
        fireEvent.change(confirmPasswordInput, { target: { value: '12345678' } });

        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(expectedMessage)).toBeInTheDocument();
        });
    });


});