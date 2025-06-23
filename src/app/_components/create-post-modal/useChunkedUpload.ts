import { useMutation, useQueryClient } from "@tanstack/react-query";
import pLimit from "p-limit";
import { useTRPC } from "~/trpc/react";

type UploadVideoOptions = {
  onUploadStart?: () => void;
  onUploadSuccess?: (data: { url: string }) => void;
  onUploadError?: (error: any) => void;
  chunkSize?: number;
  concurrencyLimit?: number;
};

export function useChunkedUpload(options?: UploadVideoOptions) {
  const trpc = useTRPC();
  const initiateUpload = useMutation(
    trpc.file.initiateUpload.mutationOptions({
      onMutate: options?.onUploadStart,
      onError: options?.onUploadError,
    }),
  );
  const queryClient = useQueryClient();
  const completeUpload = useMutation(
    trpc.file.completeUpload.mutationOptions({
      onSuccess: options?.onUploadSuccess,
      onError: options?.onUploadError,
    }),
  );

  const CHUNK_SIZE = (options?.chunkSize ?? 10) * 1024 * 1024; // MB

  return async (file: File, filename?: string) => {
    const coalescedFilename = filename ?? file.name;
    try {
      const { uploadId } = await initiateUpload.mutateAsync({
        filename: coalescedFilename,
        contentType: file.type,
      });
      const chunks = [];

      for (let i = 0; i < file.size; i += CHUNK_SIZE) {
        chunks.push(file.slice(i, i + CHUNK_SIZE));
      }
      console.log("Chunks created successfully!", chunks);

      const limit = pLimit(options?.concurrencyLimit ?? 4);
      const parts = await Promise.all(
        chunks.map((chunk, i) =>
          limit(async () => {
            const urlQueryOptions = trpc.file.getUploadUrl.queryOptions({
              filename: coalescedFilename,
              uploadId,
              partNumber: i + 1,
            });
            const { url, partNumber } =
              await queryClient.fetchQuery(urlQueryOptions);
            console.log(`Uploading chunk ${i + 1} to ${url}`);
            const res = await fetch(url, { method: "PUT", body: chunk });
            if (!res.ok) {
              throw new Error("Failed to upload chunk");
            }
            console.log("Chunk uploaded successfully!", res);
            const etag = res.headers.get("ETag");
            if (etag === null) {
              throw new Error("ETag is null");
            }
            console.log(`ETag for chunk ${i + 1}: ${etag}`);
            return { ETag: etag, PartNumber: partNumber };
          }),
        ),
      );
      console.log("All chunks uploaded successfully!", parts);
      const { url } = await completeUpload.mutateAsync({
        filename: coalescedFilename,
        uploadId,
        parts,
      });
      console.log("Upload completed successfully!", url);
      return url;
    } catch (error) {
      console.error("Error during upload:", error);
      throw error;
    }
  };
}
