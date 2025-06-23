import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import {
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  S3Client,
  UploadPartCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "~/env";
import sharp from "sharp";
import { TRPCError } from "@trpc/server";

const b2 = new S3Client({
  endpoint: `https://s3.${env.B2_REGION}.backblazeb2.com`,
  region: env.B2_REGION,
  credentials: {
    accessKeyId: env.B2_KEY_ID,
    secretAccessKey: env.B2_APP_KEY,
  },
});

export const fileRouter = createTRPCRouter({
  initiateUpload: protectedProcedure
    .input(z.object({ filename: z.string(), contentType: z.string() }))
    .mutation(async ({ input }) => {
      const mpuCmd = new CreateMultipartUploadCommand({
        Bucket: env.B2_BUCKET,
        Key: input.filename,
        ContentType: input.contentType,
      });
      const { UploadId } = await b2.send(mpuCmd);
      return { uploadId: UploadId! };
    }),

  getUploadUrl: protectedProcedure
    .input(
      z.object({
        filename: z.string(),
        uploadId: z.string(),
        partNumber: z.number(),
      }),
    )
    .query(async ({ input }) => {
      const upCmd = new UploadPartCommand({
        Bucket: env.B2_BUCKET,
        Key: input.filename,
        UploadId: input.uploadId,
        PartNumber: input.partNumber,
      });
      const url = await getSignedUrl(b2, upCmd, { expiresIn: 3600 });
      return { url, partNumber: input.partNumber };
    }),

  completeUpload: protectedProcedure
    .input(
      z.object({
        filename: z.string(),
        uploadId: z.string(),
        parts: z.array(z.object({ ETag: z.string(), PartNumber: z.number() })),
      }),
    )
    .mutation(async ({ input }) => {
      const cmd = new CompleteMultipartUploadCommand({
        Bucket: env.B2_BUCKET,
        Key: input.filename,
        UploadId: input.uploadId,
        MultipartUpload: {
          Parts: input.parts,
        },
      });
      await b2.send(cmd);
      const url = `${env.CDN_URL}/${input.filename}`;
      return { url };
    }),

  cropImage: protectedProcedure
    .input(
      z.object({
        width: z.number(),
        height: z.number(),
        left: z.number(),
        top: z.number(),
        fileData: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const fileData = input.fileData.split(",")[1];
      if (!fileData)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid file data",
        });
      const fileBuffer = Buffer.from(fileData, "base64");
      const newFileBuffer = await sharp(fileBuffer)
        .extract({ left: 0, top: 0, width: input.width, height: input.height })
        .toBuffer();
      return `data:image/png;base64,${newFileBuffer.toString("base64")}`;
    }),
});
