-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('available', 'out_of_print', 'lost', 'unknown');

-- CreateEnum
CREATE TYPE "YearCertainty" AS ENUM ('exact', 'circa', 'decade', 'unknown');

-- CreateEnum
CREATE TYPE "OriginType" AS ENUM ('original', 'localization', 'adaptation');

-- CreateEnum
CREATE TYPE "PublisherStatus" AS ENUM ('active', 'inactive', 'unknown');

-- CreateEnum
CREATE TYPE "PersonRole" AS ENUM ('author', 'designer', 'artist', 'illustrator', 'developer', 'graphic_designer', 'sculptor', 'editor', 'writer', 'insert_designer');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('book', 'article', 'newspaper', 'interview', 'archive', 'website', 'other');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('cover', 'board', 'pieces', 'card', 'rulebook', 'advertisement', 'other');

-- CreateEnum
CREATE TYPE "CollectionStatus" AS ENUM ('owned', 'wishlist', 'played', 'previously_owned');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('user', 'moderator', 'admin');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('draft', 'published', 'archived');

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "alternate_titles" TEXT[],
    "year_published" INTEGER,
    "year_certainty" "YearCertainty" NOT NULL DEFAULT 'exact',
    "year_display" TEXT,
    "min_players" INTEGER,
    "max_players" INTEGER,
    "min_age" INTEGER,
    "min_playtime" INTEGER,
    "max_playtime" INTEGER,
    "description" TEXT,
    "historical_context" TEXT,
    "research_notes" TEXT,
    "status" "GameStatus" NOT NULL DEFAULT 'unknown',
    "origin_country" TEXT,
    "origin_type" "OriginType",
    "bgg_url" TEXT,
    "bgg_weight" DOUBLE PRECISION,
    "original_language" TEXT,
    "other_languages" TEXT[],
    "is_self_published" BOOLEAN NOT NULL DEFAULT false,
    "funding_source" TEXT,
    "awards" TEXT,
    "publisher_id" TEXT,
    "distributor_id" TEXT,
    "avg_rating" DOUBLE PRECISION,
    "rating_count" INTEGER NOT NULL DEFAULT 0,
    "content_status" "ContentStatus" NOT NULL DEFAULT 'draft',
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameEdition" (
    "id" TEXT NOT NULL,
    "game_id" TEXT NOT NULL,
    "edition_name" TEXT,
    "year" INTEGER,
    "year_certainty" "YearCertainty" NOT NULL DEFAULT 'exact',
    "publisher_id" TEXT,
    "first_print_run" INTEGER,
    "total_print_run" INTEGER,
    "edition_number" INTEGER,
    "languages" TEXT[],
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameEdition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Person" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "nickname" TEXT,
    "display_name" TEXT NOT NULL,
    "nationality" TEXT,
    "gender" TEXT,
    "field_of_study" TEXT,
    "birth_year" INTEGER,
    "death_year" INTEGER,
    "is_deceased" BOOLEAN NOT NULL DEFAULT false,
    "biography" TEXT,
    "photo_url" TEXT,
    "content_status" "ContentStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GamePerson" (
    "id" TEXT NOT NULL,
    "game_id" TEXT NOT NULL,
    "person_id" TEXT NOT NULL,
    "role" "PersonRole" NOT NULL,

    CONSTRAINT "GamePerson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Publisher" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nickname" TEXT,
    "country" TEXT,
    "city" TEXT,
    "website" TEXT,
    "founded_year" INTEGER,
    "closed_year" INTEGER,
    "status" "PublisherStatus" NOT NULL DEFAULT 'unknown',
    "former_name" TEXT,
    "historical_notes" TEXT,
    "was_contacted" BOOLEAN,
    "internal_notes" TEXT,
    "content_status" "ContentStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Publisher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mechanic" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mechanic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameMechanic" (
    "game_id" TEXT NOT NULL,
    "mechanic_id" TEXT NOT NULL,

    CONSTRAINT "GameMechanic_pkey" PRIMARY KEY ("game_id","mechanic_id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameCategory" (
    "game_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,

    CONSTRAINT "GameCategory_pkey" PRIMARY KEY ("game_id","category_id")
);

-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL,
    "type" "MediaType" NOT NULL,
    "game_id" TEXT,
    "person_id" TEXT,
    "publisher_id" TEXT,
    "url" TEXT NOT NULL,
    "filename" TEXT,
    "alt_text" TEXT,
    "circa_year" TEXT,
    "source_description" TEXT,
    "copyright_notes" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Source" (
    "id" TEXT NOT NULL,
    "type" "SourceType" NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT,
    "year" INTEGER,
    "publisher_name" TEXT,
    "url" TEXT,
    "page_reference" TEXT,
    "archive_location" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntitySource" (
    "id" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    "game_id" TEXT,
    "person_id" TEXT,
    "publisher_id" TEXT,
    "notes" TEXT,

    CONSTRAINT "EntitySource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimelineEvent" (
    "id" TEXT NOT NULL,
    "year" INTEGER,
    "year_display" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "game_id" TEXT,
    "person_id" TEXT,
    "publisher_id" TEXT,
    "content_status" "ContentStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TimelineEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "avatar_url" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'user',
    "is_banned" BOOLEAN NOT NULL DEFAULT false,
    "ban_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollectionItem" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "game_id" TEXT NOT NULL,
    "status" "CollectionStatus" NOT NULL,
    "personal_rating" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CollectionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "game_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "body" TEXT,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForumThread" (
    "id" TEXT NOT NULL,
    "game_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "is_locked" BOOLEAN NOT NULL DEFAULT false,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ForumThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForumPost" (
    "id" TEXT NOT NULL,
    "thread_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ForumPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "url" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameSuggestion" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "year" INTEGER,
    "publisher_name" TEXT,
    "author_name" TEXT,
    "bgg_url" TEXT,
    "notes" TEXT,
    "is_reviewed" BOOLEAN NOT NULL DEFAULT false,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "reviewer_notes" TEXT,
    "game_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Game_slug_key" ON "Game"("slug");

-- CreateIndex
CREATE INDEX "Game_slug_idx" ON "Game"("slug");

-- CreateIndex
CREATE INDEX "Game_year_published_idx" ON "Game"("year_published");

-- CreateIndex
CREATE INDEX "Game_status_idx" ON "Game"("status");

-- CreateIndex
CREATE INDEX "Game_content_status_idx" ON "Game"("content_status");

-- CreateIndex
CREATE INDEX "GameEdition_game_id_idx" ON "GameEdition"("game_id");

-- CreateIndex
CREATE UNIQUE INDEX "Person_slug_key" ON "Person"("slug");

-- CreateIndex
CREATE INDEX "Person_slug_idx" ON "Person"("slug");

-- CreateIndex
CREATE INDEX "Person_display_name_idx" ON "Person"("display_name");

-- CreateIndex
CREATE INDEX "GamePerson_game_id_idx" ON "GamePerson"("game_id");

-- CreateIndex
CREATE INDEX "GamePerson_person_id_idx" ON "GamePerson"("person_id");

-- CreateIndex
CREATE UNIQUE INDEX "GamePerson_game_id_person_id_role_key" ON "GamePerson"("game_id", "person_id", "role");

-- CreateIndex
CREATE UNIQUE INDEX "Publisher_slug_key" ON "Publisher"("slug");

-- CreateIndex
CREATE INDEX "Publisher_slug_idx" ON "Publisher"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Mechanic_slug_key" ON "Mechanic"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Mechanic_name_key" ON "Mechanic"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE INDEX "MediaAsset_game_id_idx" ON "MediaAsset"("game_id");

-- CreateIndex
CREATE INDEX "MediaAsset_person_id_idx" ON "MediaAsset"("person_id");

-- CreateIndex
CREATE INDEX "MediaAsset_publisher_id_idx" ON "MediaAsset"("publisher_id");

-- CreateIndex
CREATE INDEX "EntitySource_source_id_idx" ON "EntitySource"("source_id");

-- CreateIndex
CREATE INDEX "EntitySource_game_id_idx" ON "EntitySource"("game_id");

-- CreateIndex
CREATE INDEX "EntitySource_person_id_idx" ON "EntitySource"("person_id");

-- CreateIndex
CREATE INDEX "EntitySource_publisher_id_idx" ON "EntitySource"("publisher_id");

-- CreateIndex
CREATE INDEX "TimelineEvent_year_idx" ON "TimelineEvent"("year");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "CollectionItem_user_id_idx" ON "CollectionItem"("user_id");

-- CreateIndex
CREATE INDEX "CollectionItem_game_id_idx" ON "CollectionItem"("game_id");

-- CreateIndex
CREATE UNIQUE INDEX "CollectionItem_user_id_game_id_status_key" ON "CollectionItem"("user_id", "game_id", "status");

-- CreateIndex
CREATE INDEX "Review_game_id_idx" ON "Review"("game_id");

-- CreateIndex
CREATE INDEX "Review_user_id_idx" ON "Review"("user_id");

-- CreateIndex
CREATE INDEX "Review_is_approved_idx" ON "Review"("is_approved");

-- CreateIndex
CREATE UNIQUE INDEX "Review_game_id_user_id_key" ON "Review"("game_id", "user_id");

-- CreateIndex
CREATE INDEX "ForumThread_game_id_idx" ON "ForumThread"("game_id");

-- CreateIndex
CREATE INDEX "ForumPost_thread_id_idx" ON "ForumPost"("thread_id");

-- CreateIndex
CREATE INDEX "Notification_user_id_is_read_idx" ON "Notification"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "GameSuggestion_is_reviewed_is_approved_idx" ON "GameSuggestion"("is_reviewed", "is_approved");

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_publisher_id_fkey" FOREIGN KEY ("publisher_id") REFERENCES "Publisher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_distributor_id_fkey" FOREIGN KEY ("distributor_id") REFERENCES "Publisher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameEdition" ADD CONSTRAINT "GameEdition_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameEdition" ADD CONSTRAINT "GameEdition_publisher_id_fkey" FOREIGN KEY ("publisher_id") REFERENCES "Publisher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GamePerson" ADD CONSTRAINT "GamePerson_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GamePerson" ADD CONSTRAINT "GamePerson_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameMechanic" ADD CONSTRAINT "GameMechanic_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameMechanic" ADD CONSTRAINT "GameMechanic_mechanic_id_fkey" FOREIGN KEY ("mechanic_id") REFERENCES "Mechanic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameCategory" ADD CONSTRAINT "GameCategory_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameCategory" ADD CONSTRAINT "GameCategory_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "Game"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_publisher_id_fkey" FOREIGN KEY ("publisher_id") REFERENCES "Publisher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntitySource" ADD CONSTRAINT "EntitySource_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "Source"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntitySource" ADD CONSTRAINT "EntitySource_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "Game"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntitySource" ADD CONSTRAINT "EntitySource_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntitySource" ADD CONSTRAINT "EntitySource_publisher_id_fkey" FOREIGN KEY ("publisher_id") REFERENCES "Publisher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineEvent" ADD CONSTRAINT "TimelineEvent_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "Game"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineEvent" ADD CONSTRAINT "TimelineEvent_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineEvent" ADD CONSTRAINT "TimelineEvent_publisher_id_fkey" FOREIGN KEY ("publisher_id") REFERENCES "Publisher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionItem" ADD CONSTRAINT "CollectionItem_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionItem" ADD CONSTRAINT "CollectionItem_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumThread" ADD CONSTRAINT "ForumThread_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumThread" ADD CONSTRAINT "ForumThread_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumPost" ADD CONSTRAINT "ForumPost_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "ForumThread"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumPost" ADD CONSTRAINT "ForumPost_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameSuggestion" ADD CONSTRAINT "GameSuggestion_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
