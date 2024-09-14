import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeAll, afterEach, afterAll, expect, describe, it } from 'vitest';
import userEvent from "@testing-library/user-event";
import { setupServer } from 'msw/node';
import { http, HttpResponse } from "msw";
import Form from '../components/Form';
import mockData from "../mockData.json"

// Set up the mock server
const server = setupServer(
  http.get("https://api.dictionaryapi.dev/api/v2/entries/en/word", () => {
    return HttpResponse.json(mockData);
  })
);

// Start the server before all tests
beforeAll(() => server.listen());

// Reset any request handlers that are declared in a test.
afterEach(() => server.resetHandlers());

// Stop the server after all tests
afterAll(() => server.close());

describe('Form Component', () => {

  it('renders the form with input and search button', () => {
    render(<Form />);
    //get the input and button
    const input = screen.getByRole('textbox');
    const button = screen.getByRole('button');

    // test if input and button is in the doc
    expect(input).toBeInTheDocument();
    expect(button).toBeInTheDocument();
  });

  it('updates input value when typing', () => {
    render(<Form />);

    const input = screen.getByRole('textbox');
    //eneter in the input field
    fireEvent.change(input, { target: { value: 'example' } });

    //check if the typed input is present in input field
    expect(input).toHaveValue('example');
  });

  it('displays definitions and audio when search is successful', async () => {
    render(<Form />);

    // Enter search term
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'word' } });

    // Click the search button
    const button = screen.getByRole('button', { name: /search/i }); 
    userEvent.click(button);

    // Wait for async actions 
    await waitFor(() => {
      expect(screen.getByText((content) => {
        return content.includes('The smallest unit of language that has a particular meaning and can be expressed by itself; the smallest discrete, meaningful unit of language. (contrast morpheme.)');
      })).toBeInTheDocument();      

      const audio = screen.getByTestId('audio');
      expect(audio).toBeInTheDocument();

      const sourceElement = audio.querySelector('source');
      expect(sourceElement).toHaveAttribute('src', 'https://api.dictionaryapi.dev/media/pronunciations/en/word-us.mp3');
      expect(sourceElement).toHaveAttribute('type', 'audio/mp3');   
  });
  });

  it('displays an error message when no definitions are found', async () => {
    render(<Form />);
    
    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: 'ttt' } });

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Definition not found/)).toBeInTheDocument();
    //  expect(screen.getByText(/Definitions:/)).toBeInTheDocument();
    });
  });

  it('displays a error message when input is empty', () => {
    render(<Form />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    //test without entering anything and check that it has same expected value
    expect(screen.getByText(/Enter a word to search/)).toBeInTheDocument();
  });

  it('save favorite word in session storage', async () => {
    render(<Form />);

    // Enter word to search
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'word' } });

    // Click the search button
    const button = screen.getByRole('button', { name: /search/i }); 
    userEvent.click(button);

    // Wait for search result to diplay
    await waitFor(() => {
      expect(screen.getByText(/Definitions:/)).toBeInTheDocument();
    });

    // Get the favorite icon
    const favoriteIcon = screen.getByTestId('favorite'); 

    // Click the favorite icon to save as favorite
    fireEvent.click(favoriteIcon);
    expect(sessionStorage.getItem('word')).toBe('true');

    // Click the favorite icon again to unsave as favorite
    fireEvent.click(favoriteIcon);
    expect(sessionStorage.getItem('word')).toBeNull();
  });
});
