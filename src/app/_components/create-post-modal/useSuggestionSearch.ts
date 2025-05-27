import { useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/react";

export default function useSuggestionSearch() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  async function userSearch(query: string) {
    const queryOptions = trpc.user.searchForUser.queryOptions(query);
    const result = await queryClient.fetchQuery(queryOptions);
    return result.map((user) => ({
      id: user.id,
      name: user.username,
    }));
  }

  async function categorySearch(query: string) {
    const queryOptions = trpc.post.searchPostCategories.queryOptions(query);
    const result = await queryClient.fetchQuery(queryOptions);
    return result.map((category) => ({
      id: category.id,
      name: category.name,
    }));
  }

  return {
    userSearch,
    categorySearch,
  };
}
