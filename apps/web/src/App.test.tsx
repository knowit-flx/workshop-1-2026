import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
  Object.defineProperty(HTMLElement.prototype, "scrollTo", {
    value: vi.fn(),
    writable: true,
    configurable: true
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("App", () => {
  it("renders empty state on first load", () => {
    render(<App />);
    expect(screen.getByText("Start a conversation")).toBeTruthy();
    expect((screen.getByRole("button", { name: "Send" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("sends a message and renders assistant reply", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        message: {
          role: "assistant",
          content: "Hi there!"
        }
      })
    } as Response);

    render(<App />);
    fireEvent.change(screen.getByPlaceholderText("Type a message…"), {
      target: { value: "Hello" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getByText("Hi there!")).toBeTruthy());
    expect(screen.getByText("Hello")).toBeTruthy();
  });

  it("shows API error details when request fails", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: "Bad request" })
    } as Response);

    render(<App />);
    fireEvent.change(screen.getByPlaceholderText("Type a message…"), {
      target: { value: "Hello" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() => expect(screen.getByText("Error")).toBeTruthy());
    expect(screen.getByText("400: Bad request")).toBeTruthy();
  });

  it("shows validation error when backend payload is malformed", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        message: {
          role: "user",
          content: 123
        }
      })
    } as Response);

    render(<App />);
    fireEvent.change(screen.getByPlaceholderText("Type a message…"), {
      target: { value: "Hello" }
    });
    fireEvent.keyDown(screen.getByPlaceholderText("Type a message…"), {
      key: "Enter",
      shiftKey: true
    });

    await waitFor(() => expect(screen.getByText("Bad response from server")).toBeTruthy());
  });
});
