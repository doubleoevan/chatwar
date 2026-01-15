-- CreateEnum
CREATE TYPE "ProviderId" AS ENUM ('openai', 'anthropic', 'gemini', 'xai', 'deepseek', 'perplexity');

-- CreateTable
CREATE TABLE "ProviderVote" (
    "id" TEXT NOT NULL,
    "winnerProviderId" "ProviderId" NOT NULL,
    "winnerModelId" TEXT NOT NULL,
    "winnerModelLabel" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "competitors" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,

    CONSTRAINT "ProviderVote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProviderVote_createdAt_idx" ON "ProviderVote"("createdAt");
