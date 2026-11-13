import { TavilySearch } from "@langchain/tavily";

let searchTool;

export function getSearchTool() {
  if (!searchTool) {
    searchTool = new TavilySearch({
      maxResults: 3,
      topic: "general",
      searchDepth: "basic",
      includeAnswer: true,
      includeImages: true,
      includeRawContent: false,
    });
  }
  return searchTool;
}
