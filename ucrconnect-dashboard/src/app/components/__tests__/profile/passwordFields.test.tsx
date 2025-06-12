import { render, screen, fireEvent } from '@testing-library/react'
import { PasswordFields } from '../../profile/passwordFields'

const mockFormData = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
}

const mockErrors = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
}

describe('PasswordFields', () => {
  const handleChange = jest.fn()

  it('renders all password fields', () => {
    render(
      <PasswordFields
        formData={mockFormData}
        errors={{}}
        onChange={handleChange}
      />
    )

    expect(screen.getByLabelText('Contraseña actual')).toBeInTheDocument()
    expect(screen.getByLabelText('Nueva contraseña')).toBeInTheDocument()
    expect(screen.getByLabelText('Confirmar contraseña')).toBeInTheDocument()
  })

  it('toggles visibility of each password field', () => {
    render(
      <PasswordFields
        formData={mockFormData}
        errors={{}}
        onChange={handleChange}
      />
    )

    const buttons = screen.getAllByRole('button')
    buttons.forEach((button, i) => {
      const input = screen.getAllByLabelText(/contraseña/i)[i]
      expect(input).toHaveAttribute('type', 'password')
      fireEvent.click(button)
      expect(input).toHaveAttribute('type', 'text')
    })
  })

  it('displays error messages', () => {
    const errorForm = {
      currentPassword: 'Requerido',
      newPassword: 'Muy corta',
      confirmPassword: 'No coincide',
    }

    render(
      <PasswordFields
        formData={mockFormData}
        errors={errorForm}
        onChange={handleChange}
      />
    )

    expect(screen.getByText('Requerido')).toBeInTheDocument()
    expect(screen.getByText('Muy corta')).toBeInTheDocument()
    expect(screen.getByText('No coincide')).toBeInTheDocument()
  })

  it('calls onChange on input', () => {
    render(
      <PasswordFields
        formData={mockFormData}
        errors={{}}
        onChange={handleChange}
      />
    )

    const inputs = screen.getAllByLabelText(/contraseña/i)
    inputs.forEach((input, index) => {
      fireEvent.change(input, { target: { value: 'abc123' } })
      expect(handleChange).toHaveBeenCalled()
    })
  })
})
