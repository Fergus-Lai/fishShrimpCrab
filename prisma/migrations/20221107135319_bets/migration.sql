-- CreateTable
CREATE TABLE "Bets" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "target" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "tableID" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Bets_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Bets" ADD CONSTRAINT "Bets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bets" ADD CONSTRAINT "Bets_tableID_fkey" FOREIGN KEY ("tableID") REFERENCES "Table"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
