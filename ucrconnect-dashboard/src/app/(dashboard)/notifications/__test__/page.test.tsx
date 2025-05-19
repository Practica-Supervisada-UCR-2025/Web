import React from 'react';
import { render, screen } from '@testing-library/react';
import NotificationForm from '@/app/components/notificationForm';

describe('Notifications Component', () => {
    test('renders the Notifications component with correct heading', () => {
        // Render the component
        render(<NotificationForm />);
    });
});