import { TavilySearch } from "@langchain/tavily";

let searchTool;

export function getSearchTool() {
  if (!searchTool) {
    searchTool = new TavilySearch({
      maxResults: 5,
      topic: "general",
      includeImages: true,
    });
  }
  return searchTool;
}
