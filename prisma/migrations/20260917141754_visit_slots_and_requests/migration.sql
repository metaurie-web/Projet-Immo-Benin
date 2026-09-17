-- CreateTable
CREATE TABLE "VisitSlot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "listingRef" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VisitSlot_listingRef_fkey" FOREIGN KEY ("listingRef") REFERENCES "Listing" ("ref") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VisitRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "listingRef" TEXT NOT NULL,
    "slotLabel" TEXT NOT NULL,
    "requesterId" TEXT,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'en_attente',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VisitRequest_listingRef_fkey" FOREIGN KEY ("listingRef") REFERENCES "Listing" ("ref") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VisitRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
