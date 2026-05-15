-- CreateEnum
CREATE TYPE "VideoPlatform" AS ENUM ('youtube', 'vimeo', 'tiktok', 'instagram', 'other');

-- CreateTable
CREATE TABLE "GameVideo" (
    "id" TEXT NOT NULL,
    "game_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "platform" "VideoPlatform" NOT NULL,
    "video_id" TEXT,
    "title" TEXT,
    "description" TEXT,
    "thumbnail" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameVideo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GameVideo_game_id_idx" ON "GameVideo"("game_id");

-- AddForeignKey
ALTER TABLE "GameVideo" ADD CONSTRAINT "GameVideo_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;
