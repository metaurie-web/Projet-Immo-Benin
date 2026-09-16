-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Listing" (
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
    "status" TEXT NOT NULL DEFAULT 'en_ligne',
    "owner" TEXT NOT NULL,
    "ownerSince" TEXT NOT NULL,
    "ownerCount" INTEGER NOT NULL,
    "ownerId" TEXT,
    "rating" TEXT NOT NULL,
    "reviewsCount" INTEGER NOT NULL,
    "photos" JSONB NOT NULL,
    "costRows" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Listing_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Listing" ("advance", "city", "costRows", "createdAt", "deposit", "description", "featured", "furnished", "id", "landmark", "meter", "owner", "ownerCount", "ownerSince", "parking", "photos", "price", "publishedAt", "quartier", "rating", "ref", "reviewsCount", "rooms", "title", "totalIn", "type", "updatedAt", "water") SELECT "advance", "city", "costRows", "createdAt", "deposit", "description", "featured", "furnished", "id", "landmark", "meter", "owner", "ownerCount", "ownerSince", "parking", "photos", "price", "publishedAt", "quartier", "rating", "ref", "reviewsCount", "rooms", "title", "totalIn", "type", "updatedAt", "water" FROM "Listing";
DROP TABLE "Listing";
ALTER TABLE "new_Listing" RENAME TO "Listing";
CREATE UNIQUE INDEX "Listing_ref_key" ON "Listing"("ref");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
