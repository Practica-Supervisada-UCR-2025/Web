import React from 'react';
import { render, screen } from '@testing-library/react';
import Notifications from '@/app/(dashboard)/notifications/page';

describe('Notifications Component', () => {
    test('renders the Notifications component with correct heading', () => {
        // Render the component
        render(<Notifications/>);

        expect(screen.getByLabelText(/título/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/tópico/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /enviar notificación/i })).toBeDisabled();
    });
});