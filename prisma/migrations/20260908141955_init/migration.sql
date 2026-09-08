-- CreateTable
CREATE TABLE "Listing" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ref" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "quartier" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "rooms" INTEGER NOT NULL,
    "furnished" BOOLEAN NOT NULL,
    "meter" TEXT NOT NULL,
    "water" TEXT NOT NULL,
    "parking" BOOLEAN NOT NULL,
    "advance" TEXT NOT NULL,
    "deposit" TEXT NOT NULL,
    "landmark" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "totalIn" INTEGER NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "ownerSince" TEXT NOT NULL,
    "ownerCount" INTEGER NOT NULL,
    "rating" TEXT NOT NULL,
    "reviewsCount" INTEGER NOT NULL,
    "photos" JSONB NOT NULL,
    "costRows" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Review" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "listingRef" TEXT NOT NULL,
    "who" TEXT NOT NULL,
    "when" TEXT NOT NULL,
    "stars" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Review_listingRef_fkey" FOREIGN KEY ("listingRef") REFERENCES "Listing" ("ref") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Listing_ref_key" ON "Listing"("ref");
