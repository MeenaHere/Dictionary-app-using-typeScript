import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, describe, it } from "vitest";
import App from "../App";

describe("App Component", () => {
  //The purpose of this test is to verify that the main heading/logo of the app is present as it is key identifier
  it("should render the heading", async () => {
    render(<App />);

    // Check dictionary word is present
    expect(await screen.findByText("Dictionary")).toBeInTheDocument();
  });

  //This test is very important to check the accessibility of light and dark mode  and correct classes are applied on clicking particular class
  it("toggle dark mode on icon click", async () => {
    render(<App />);

    // check initial theme
    const theme = screen.getByTestId("main-div");
    expect(theme).toHaveClass("bg-white text-black");
    expect(localStorage.getItem("darkMode")).toBe("false");

    // click icon to change dark mode
    const themeToggle = screen.getByTestId("toggle-theme");
    userEvent.click(themeToggle);

    // wait for theme to change
    await waitFor(() => {
      const darkTheme = screen.getByTestId("main-div");
      expect(darkTheme).toHaveClass("bg-gray-900 text-white");
      expect(localStorage.getItem("darkMode")).toBe("true");
    });
  });

  //This test  verify that the form componnent is render when we see the main page so with this test we see that the input field and button is loaded when the app renders

  it("renders the Form component correctly", () => {
    render(<App />);
    //get the input and button
    const formInput = screen.getByRole("textbox");
    const formButton = screen.getByRole("button");
    //check it is the document
    expect(formInput).toBeInTheDocument();
    expect(formButton).toBeInTheDocument();
  });
});
