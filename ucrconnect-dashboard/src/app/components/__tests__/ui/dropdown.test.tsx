import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dropdown } from '@/components/ui/dropdown';

const options = [
  { label: 'Option A', value: 'a' },
  { label: 'Option B', value: 'b' },
];

describe('Dropdown', () => {
  it('renders and handles changes', async () => {
    const handleChange = jest.fn();
    render(
      <Dropdown
        id="dropdown"
        label="Select Option"
        value="a"
        options={options}
        onChange={handleChange}
      />
    );

    const select = screen.getByLabelText('Select Option');
    await userEvent.selectOptions(select, 'b');
    expect(handleChange).toHaveBeenCalledWith('b');
  });

  it('renders as disabled', () => {
    render(
      <Dropdown
        id="dropdown"
        label="Select Option"
        value="a"
        options={options}
        onChange={() => {}}
        disabled
      />
    );

    const select = screen.getByLabelText('Select Option');
    expect(select).toBeDisabled();
  });
});
