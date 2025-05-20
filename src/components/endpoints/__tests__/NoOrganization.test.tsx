
import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../test/utils';
import { NoOrganization } from '../NoOrganization';

describe('NoOrganization', () => {
  it('should render the no organization message', () => {
    render(<NoOrganization />);
    
    expect(
      screen.getByText(/No organization selected/i)
    ).toBeInTheDocument();
  });
  
  it('should have the correct styling', () => {
    render(<NoOrganization />);
    
    const container = screen.getByText(/No organization selected/i).parentElement;
    expect(container).toHaveClass('bg-amber-50');
    expect(container).toHaveClass('border-amber-200');
  });
});
