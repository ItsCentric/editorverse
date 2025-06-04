import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { HydrateClient } from "~/trpc/server";
import Feed from "./_components/feed";

export default async function Home() {
  return (
    <HydrateClient>
      <main>
        <div className="mx-auto my-8 max-w-xl md:my-16">
          <Tabs defaultValue="suggested" className="flex-1">
            <TabsList className="mb-4 w-full rounded-none md:rounded-full">
              <TabsTrigger value="suggested">Suggested</TabsTrigger>
              <TabsTrigger value="following">Following</TabsTrigger>
            </TabsList>
            <TabsContent value="suggested">
              <Feed />
            </TabsContent>
            <TabsContent value="following">
              <Feed />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </HydrateClient>
  );
}
