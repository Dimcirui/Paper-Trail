-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateEnum
CREATE TYPE "PaperStatus" AS ENUM ('Draft', 'Submitted', 'UnderReview', 'Accepted', 'Published', 'Rejected', 'Withdrawn');

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "roleName" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "userName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "affiliation" TEXT,
    "orcid" TEXT,
    "roleId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Paper" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "abstract" TEXT,
    "status" "PaperStatus" NOT NULL DEFAULT 'Draft',
    "submissionDate" TIMESTAMP(3),
    "publicationDate" TIMESTAMP(3),
    "pdfUrl" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "embedding" vector(1536),
    "primaryContactId" INTEGER NOT NULL,
    "venueId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Paper_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Venue" (
    "id" SERIAL NOT NULL,
    "venueName" TEXT NOT NULL,
    "type" TEXT,
    "ranking" TEXT,

    CONSTRAINT "Venue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Authorship" (
    "id" SERIAL NOT NULL,
    "authorOrder" INTEGER NOT NULL DEFAULT 1,
    "contributionNotes" TEXT,
    "paperId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Authorship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" SERIAL NOT NULL,
    "topicName" TEXT NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaperTopic" (
    "id" SERIAL NOT NULL,
    "paperId" INTEGER NOT NULL,
    "topicId" INTEGER NOT NULL,

    CONSTRAINT "PaperTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Grant" (
    "id" SERIAL NOT NULL,
    "grantName" TEXT NOT NULL,
    "sponsor" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "reportingRequirements" TEXT,

    CONSTRAINT "Grant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaperGrant" (
    "id" SERIAL NOT NULL,
    "paperId" INTEGER NOT NULL,
    "grantId" INTEGER NOT NULL,

    CONSTRAINT "PaperGrant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Revision" (
    "id" SERIAL NOT NULL,
    "paperId" INTEGER NOT NULL,
    "versionLabel" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" INTEGER,

    CONSTRAINT "Revision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" SERIAL NOT NULL,
    "paperId" INTEGER NOT NULL,
    "userId" INTEGER,
    "actionType" TEXT NOT NULL,
    "actionDetail" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_roleName_key" ON "Role"("roleName");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "idx_user_role" ON "User"("roleId");

-- CreateIndex
CREATE INDEX "idx_paper_status" ON "Paper"("status");

-- CreateIndex
CREATE INDEX "idx_paper_primary_contact" ON "Paper"("primaryContactId");

-- CreateIndex
CREATE INDEX "idx_paper_venue" ON "Paper"("venueId");

-- CreateIndex
CREATE UNIQUE INDEX "Venue_venueName_key" ON "Venue"("venueName");

-- CreateIndex
CREATE INDEX "idx_authorship_order" ON "Authorship"("paperId", "authorOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Authorship_paperId_userId_key" ON "Authorship"("paperId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_topicName_key" ON "Topic"("topicName");

-- CreateIndex
CREATE INDEX "idx_paper_topic_topic" ON "PaperTopic"("topicId");

-- CreateIndex
CREATE UNIQUE INDEX "PaperTopic_paperId_topicId_key" ON "PaperTopic"("paperId", "topicId");

-- CreateIndex
CREATE UNIQUE INDEX "Grant_grantName_sponsor_key" ON "Grant"("grantName", "sponsor");

-- CreateIndex
CREATE INDEX "idx_paper_grant_grant" ON "PaperGrant"("grantId");

-- CreateIndex
CREATE UNIQUE INDEX "PaperGrant_paperId_grantId_key" ON "PaperGrant"("paperId", "grantId");

-- CreateIndex
CREATE INDEX "idx_revision_paper" ON "Revision"("paperId");

-- CreateIndex
CREATE INDEX "idx_revision_author" ON "Revision"("authorId");

-- CreateIndex
CREATE INDEX "idx_activity_paper" ON "ActivityLog"("paperId");

-- CreateIndex
CREATE INDEX "idx_activity_user" ON "ActivityLog"("userId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paper" ADD CONSTRAINT "Paper_primaryContactId_fkey" FOREIGN KEY ("primaryContactId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paper" ADD CONSTRAINT "Paper_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Authorship" ADD CONSTRAINT "Authorship_paperId_fkey" FOREIGN KEY ("paperId") REFERENCES "Paper"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Authorship" ADD CONSTRAINT "Authorship_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaperTopic" ADD CONSTRAINT "PaperTopic_paperId_fkey" FOREIGN KEY ("paperId") REFERENCES "Paper"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaperTopic" ADD CONSTRAINT "PaperTopic_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaperGrant" ADD CONSTRAINT "PaperGrant_paperId_fkey" FOREIGN KEY ("paperId") REFERENCES "Paper"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaperGrant" ADD CONSTRAINT "PaperGrant_grantId_fkey" FOREIGN KEY ("grantId") REFERENCES "Grant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Revision" ADD CONSTRAINT "Revision_paperId_fkey" FOREIGN KEY ("paperId") REFERENCES "Paper"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Revision" ADD CONSTRAINT "Revision_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_paperId_fkey" FOREIGN KEY ("paperId") REFERENCES "Paper"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
