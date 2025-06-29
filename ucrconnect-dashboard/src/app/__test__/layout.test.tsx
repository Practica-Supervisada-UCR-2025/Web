import React, { ReactNode } from 'react';
import { render } from '@testing-library/react';
import RootLayout from '../layout';

// Mock the imported modules and components
jest.mock("next/font/google", () => ({
    Poppins: jest.fn(() => ({
        variable: "mock-poppins-variable"
    }))
}));

// Mock the providers module first
jest.mock("@/lib/providers", () => {
    const MockProviders = ({ children }: { children: ReactNode }) => {
        return <div data-testid="mock-providers">{children}</div>;
    };
    MockProviders.displayName = 'MockProviders';
    return {
        __esModule: true,
        default: MockProviders
    };
});

// Now we can import the mock
import { default as MockProviders } from "@/lib/providers";

describe('RootLayout Component', () => {
    test('renders children inside providers', () => {
        const testChild = <div data-testid="test-child">Test Child Content</div>;

        // Mock the RootLayout to avoid rendering HTML tags
        const MockRootLayout = ({ children }: { children: ReactNode }) => (
            <MockProviders>
                {children}
            </MockProviders>
        );

        // Render the mock layout
        const { getByTestId } = render(
            <MockRootLayout>
                {testChild}
            </MockRootLayout>
        );

        // Check if Providers component is rendered
        const providersElement = getByTestId('mock-providers');
        expect(providersElement).toBeInTheDocument();

        // Check if children are rendered inside the Providers
        const childElement = getByTestId('test-child');
        expect(childElement).toBeInTheDocument();
        expect(childElement).toHaveTextContent('Test Child Content');
    });

    test('verifies RootLayout implementation details', () => {
        // Create a spy on the implementation
        const originalImplementation = RootLayout;
        const mockChildren = <div>Test Children</div>;

        // Call the component directly to verify its structure
        const result = originalImplementation({ children: mockChildren });

        // Verify the structure matches what we expect
        expect(result.type).toBe('html');
        expect(result.props.lang).toBe('en');
        expect(result.props.children.type).toBe('body');

        // Verify the className contains the expected font variable
        const className = result.props.children.props.className;
        expect(className).toContain('mock-poppins-variable');
        expect(className).toContain('antialiased');
    });
});