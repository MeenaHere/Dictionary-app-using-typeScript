import "@testing-library/jest-dom";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, describe, it } from 'vitest';
import App from '../App';


describe('App Component', () => {
  it('should render the heading', () => {
    render(<App />);
    //get h1 tag and check it has Dictionary word
    const h1tag = screen.getByRole('heading');
    expect(h1tag).toBeInTheDocument();
    expect(within(h1tag).getByText(/Dictionary/))
  });
  
   it('toggle dark mode on icon click', async () => {
    render(<App />);
    
    // check initial theme
    const theme = screen.getByTestId('main-div');
    expect(theme).toHaveClass('bg-white text-black');
    expect(localStorage.getItem('darkMode')).toBe('false');

    // click icon to change dark mode
    const themeToggle = screen.getByTestId('toggle-theme'); 
    userEvent.click(themeToggle);
    
    // wait for theme to change
    await waitFor(() => {
      const darkTheme = screen.getByTestId('main-div');
      expect(darkTheme).toHaveClass('bg-gray-900 text-white');
      expect(localStorage.getItem('darkMode')).toBe('true');
    });
  });

  it('renders the Form component correctly', () => {
    render(<App />);
    //get the input and button
    const formInput = screen.getByRole('textbox');
    const formButton = screen.getByRole('button');
    //check it is the document
    expect(formInput).toBeInTheDocument();
    expect(formButton).toBeInTheDocument();
  });
});
