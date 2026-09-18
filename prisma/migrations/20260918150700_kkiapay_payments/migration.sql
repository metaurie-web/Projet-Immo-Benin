-- AlterTable
ALTER TABLE "Listing" ADD COLUMN "transactionId" TEXT;

-- AlterTable
ALTER TABLE "VisitRequest" ADD COLUMN "transactionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Listing_transactionId_key" ON "Listing"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "VisitRequest_transactionId_key" ON "VisitRequest"("transactionId");
