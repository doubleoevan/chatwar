import { describe, expect, it, vi } from "vitest";
import {
  API_KEYS_STORAGE_KEY,
  getApiKey,
  getApiKeys,
  removeApiKey,
  storeApiKey,
} from "@/utils/apiKeys";

describe("utils/apiKeys", () => {
  it("returns {} when nothing is stored", () => {
    expect(getApiKeys()).toEqual({});
  });

  it("stores a trimmed key and can read it back", () => {
    const openAiKey = "openai-key";
    storeApiKey("openai", `  ${openAiKey}  `);
    expect(getApiKey("openai")).toBe(openAiKey);
  });

  it("does nothing if apiKey is empty/whitespace", () => {
    storeApiKey("openai", "   ");
    expect(getApiKeys()).toEqual({});
  });

  it("merges with existing keys (does not overwrite other providers)", () => {
    const openAiKey = "openai-key";
    const anthropicKey = "anthropic-key";
    storeApiKey("openai", openAiKey);
    storeApiKey("anthropic", anthropicKey);
    expect(getApiKeys()).toEqual({
      openai: openAiKey,
      anthropic: anthropicKey,
    });
  });

  it("removes a key but preserves others", () => {
    const openAiKey = "openai-key";
    const anthropicKey = "anthropic-key";
    storeApiKey("openai", openAiKey);
    storeApiKey("anthropic", anthropicKey);
    removeApiKey("openai");
    expect(getApiKeys()).toEqual({ anthropic: anthropicKey });
    expect(getApiKey("openai")).toBeNull();
  });

  it("returns {} when stored JSON is invalid", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    localStorage.setItem(API_KEYS_STORAGE_KEY, "{nope not json");
    expect(getApiKeys()).toEqual({});
    expect(warn).toBeCalledTimes(1);
    warn.mockRestore();
  });

  it("returns {} when stored value is an array", () => {
    localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(["nope array"]));
    expect(getApiKeys()).toEqual({});
  });

  it("returns {} when stored value is not an object", () => {
    localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify("nope string"));
    expect(getApiKeys()).toEqual({});
  });
});
