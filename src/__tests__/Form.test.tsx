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

describe("Form Component", () => {
  //this test is crucial as these are the most important elemnt that are used by the user to intract with the app.
  it("renders the form with input and search button", () => {
    render(<Form />);
    //get the input and button
    const input = screen.getByRole("textbox");
    const button = screen.getByRole("button");

    // test if input and button is in the doc
    expect(input).toBeInTheDocument();
    expect(button).toBeInTheDocument();
  });

  //This test ensure that user is properly able to right in the input field.
  it("updates input value when typing", () => {
    render(<Form />);

    const input = screen.getByRole("textbox");
    //eneter in the input field
    fireEvent.change(input, { target: { value: "example" } });

    //check if the typed input is present in input field
    expect(input).toHaveValue("example");
  });

  // this test is essential as it will test the core functionality of the app that user will successfuly able to search what it want and all the filed like audio, and definitions are available after search

  it("displays definitions and audio when search is successful", async () => {
    render(<Form />);

    // Enter search term
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "word" } });

    // Click the search button
    const button = screen.getByRole("button", { name: /search/i });
    userEvent.click(button);

    // Wait for async actions
    await waitFor(() => {
      expect(
        screen.getByText((content) => {
          return content.includes(
            "The smallest unit of language that has a particular meaning and can be expressed by itself; the smallest discrete, meaningful unit of language. (contrast morpheme.)"
          );
        })
      ).toBeInTheDocument();

      const audio = screen.getByTestId("audio");
      expect(audio).toBeInTheDocument();

      const sourceElement = audio.querySelector("source");
      expect(sourceElement).toHaveAttribute(
        "src",
        "https://api.dictionaryapi.dev/media/pronunciations/en/word-us.mp3"
      );
      expect(sourceElement).toHaveAttribute("type", "audio/mp3");
    });
  });

  // this test is impotant as it will check that the error message is correctly displayed if the definition is not found
  it("displays an error message when no definitions are found", async () => {
    render(<Form />);

    const input = screen.getByRole("textbox");

    await userEvent.type(input, "ttt");

    const button = screen.getByRole("button");
    userEvent.click(button);

    // Use findByText to wait for the "Definition not found" message to appear
    expect(
      await screen.findByText(/Definition not found/i)
    ).toBeInTheDocument();
  });

  //this test verify that it should show correct error message if user doent enter anything to search
  it("displays a error message when input is empty", async () => {
    render(<Form />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    //test without entering anything and check that it has same expected value
    expect(
      await screen.findByText("Enter a word to search")
    ).toBeInTheDocument();
  });

  // Test for save and remove the word favorite list in session storage
  it("saves and removes favorite word in sessionStorage correctly", async () => {
    render(<Form />);

    // Enter search term
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "word" } });

    // Click the search button
    const button = screen.getByRole("button", { name: /search/i });
    userEvent.click(button);

    // Wait for search result to display
    expect(await screen.findByText("Definitions:")).toBeInTheDocument();

    // Get the favorite icon
    const favoriteIcon = screen.getByTestId("favorite");

    // Click the favorite icon to save as favorite
    userEvent.click(favoriteIcon);

    // Save the word in session storage
    sessionStorage.setItem("favorites", JSON.stringify("word"));

    // Check if the word is added to sessionStorage
    const favoriteWordAfterAddingToSession = JSON.parse(
      sessionStorage.getItem("favorites") || "[]"
    );
    expect(favoriteWordAfterAddingToSession).toContain("word");

    // Click the favorite icon again to remove from favorites
    userEvent.click(favoriteIcon);

    // Remove from the word from session storage and set it to emty array
    sessionStorage.setItem("favorites", JSON.stringify([]));

    // Check if the word is removed from sessionStorage
    const updatedFavorites = JSON.parse(
      sessionStorage.getItem("favorites") || "[]"
    );
    expect(updatedFavorites).not.toContain("word");
  });
});
