import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ProfileForm } from '@/components/profile/profileForm'

describe('ProfileForm', () => {
  const mockOnChange = jest.fn()
  const defaultProps = {
    formData: {
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan@example.com',
      username: 'juanp'
    },
    errors: {},
    onChange: mockOnChange
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders input fields with correct values', () => {
    render(<ProfileForm {...defaultProps} />)

    expect(screen.getByLabelText('Nombre')).toHaveValue('Juan')
    expect(screen.getByLabelText('Apellidos')).toHaveValue('Pérez')
    expect(screen.getByLabelText('Correo electrónico')).toHaveValue('juan@example.com')
    expect(screen.getByLabelText('Usuario')).toHaveValue('juanp')
  })

  // it('calls onChange handler when changing firstName', () => {
  //   const mockOnChange = jest.fn()
  //   render(<ProfileForm {...defaultProps} onChange={mockOnChange} />)

  //   const input = screen.getByLabelText('Nombre')
  //   fireEvent.change(input, { target: { name: 'firstName', value: 'Carlos' } })

  //   expect(mockOnChange).toHaveBeenCalledTimes(1)
  //   expect(mockOnChange).toHaveBeenCalledWith(
  //     expect.objectContaining({
  //       target: expect.objectContaining({
  //         name: 'firstName',
  //         value: 'Carlos',
  //       }),
  //     })
  //   )
  // })

  it('displays error message for firstName if present', () => {
    const propsWithError = {
      ...defaultProps,
      errors: { firstName: 'El nombre es requerido' }
    }

    render(<ProfileForm {...propsWithError} />)

    expect(screen.getByText('El nombre es requerido')).toBeInTheDocument()
  })

  it('renders readOnly fields correctly', () => {
    render(<ProfileForm {...defaultProps} />)

    const emailInput = screen.getByLabelText('Correo electrónico')
    const usernameInput = screen.getByLabelText('Usuario')

    expect(emailInput).toHaveAttribute('readOnly')
    expect(usernameInput).toHaveAttribute('readOnly')
    expect(emailInput).toHaveClass('cursor-not-allowed')
    expect(usernameInput).toHaveClass('cursor-not-allowed')
  })
})
