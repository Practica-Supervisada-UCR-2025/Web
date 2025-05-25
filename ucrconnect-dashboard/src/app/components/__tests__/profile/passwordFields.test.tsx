import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PasswordFields } from '../../profile/passwordFields'

describe('PasswordFields component', () => {
  const mockFormData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }

  const mockErrors = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }

  const setup = (formData = mockFormData, errors = mockErrors) => {
    const onChange = jest.fn()
    render(<PasswordFields formData={formData} errors={errors} onChange={onChange} />)
    return { onChange }
  }

  it('renders all password fields with correct labels', () => {
    setup()

    expect(screen.getByLabelText(/contraseña actual/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/nueva contraseña/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirmar contraseña/i)).toBeInTheDocument()
  })

  it('calls onChange when input changes', () => {
    const { onChange } = setup()
    const input = screen.getByLabelText(/nueva contraseña/i)
    fireEvent.change(input, { target: { value: 'newPass123' } })
    expect(onChange).toHaveBeenCalled()
  })

  it('displays error messages when errors are present', () => {
    const formData = { ...mockFormData }
    const errors = {
      currentPassword: 'Este campo es obligatorio',
      newPassword: '',
      confirmPassword: 'Las contraseñas no coinciden'
    }

    setup(formData, errors)

    expect(screen.getByText(/este campo es obligatorio/i)).toBeInTheDocument()
    expect(screen.getByText(/las contraseñas no coinciden/i)).toBeInTheDocument()
  })

  it('toggles password visibility when visibility button is clicked', () => {
    setup()
    const input = screen.getByLabelText(/contraseña actual/i)
    const toggleButton = screen.getAllByRole('button')[0]

    expect(input).toHaveAttribute('type', 'password')

    fireEvent.click(toggleButton)

    expect(input).toHaveAttribute('type', 'text')
  })

  it('does not display error messages if no errors are present', () => {
    setup()
    expect(screen.queryByText(/este campo es obligatorio/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/las contraseñas no coinciden/i)).not.toBeInTheDocument()
  })
})
