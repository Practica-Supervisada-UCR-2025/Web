import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TextArea } from '@/components/ui/textArea';

describe('TextArea', () => {
  it('renderiza el label y textarea correctamente', () => {
    const handleChange = jest.fn();
    render(
      <TextArea
        id="comentario"
        label="Comentario"
        value="Texto inicial"
        onChange={handleChange}
      />
    );
    expect(screen.getByLabelText(/Comentario/i)).toBeInTheDocument();
  });

  it('muestra el asterisco si es requerido', () => {
    const handleChange = jest.fn();
    render(
      <TextArea
        id="comentario"
        label="Comentario"
        value=""
        required
        onChange={handleChange}
      />
    );
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('llama a onChange cuando se escribe en el textarea', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();

    render(
      <TextArea
        id="comentario"
        label="Comentario"
        value=""
        onChange={handleChange}
      />
    );

    await user.type(screen.getByLabelText(/Comentario/i), 'Hola');
    expect(handleChange).toHaveBeenCalled();
  });

  it('aplica estilos de solo lectura cuando readOnly es true', () => {
    const handleChange = jest.fn();
    render(
      <TextArea
        id="comentario"
        label="Comentario"
        value="Solo lectura"
        readOnly
        onChange={handleChange}
      />
    );
    const textarea = screen.getByLabelText(/Comentario/i);
    expect(textarea).toHaveAttribute('readOnly');
    expect(textarea.className).toMatch(/bg-gray-100/);
    expect(textarea.className).toMatch(/cursor-not-allowed/);
  });

  it('aplica clases de enfoque cuando no hay error ni es readOnly', () => {
    const handleChange = jest.fn();
    render(
      <TextArea
        id="comentario"
        label="Comentario"
        value=""
        onChange={handleChange}
      />
    );
    const textarea = screen.getByLabelText(/Comentario/i);
    expect(textarea.className).toMatch(/focus:ring-[#249dd8]/);
  });

  it('muestra mensaje de error si se proporciona', () => {
    const handleChange = jest.fn();
    render(
      <TextArea
        id="comentario"
        label="Comentario"
        value=""
        error="Este campo es obligatorio"
        onChange={handleChange}
      />
    );
    expect(screen.getByText('Este campo es obligatorio')).toBeInTheDocument();
  });

  it('llama a onBlur si se proporciona', async () => {
    const user = userEvent.setup();
    const handleBlur = jest.fn();
    const handleChange = jest.fn();

    render(
      <TextArea
        id="comentario"
        label="Comentario"
        value=""
        onBlur={handleBlur}
        onChange={handleChange}
      />
    );

    const textarea = screen.getByLabelText(/Comentario/i);
    await user.click(textarea);
    await user.tab(); // pierde el foco
    expect(handleBlur).toHaveBeenCalled();
  });
});
