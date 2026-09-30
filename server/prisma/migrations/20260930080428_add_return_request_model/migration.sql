-- CreateEnum
CREATE TYPE "ReturnRequestType" AS ENUM ('RETURN', 'EXCHANGE');

-- CreateEnum
CREATE TYPE "ReturnRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "return_requests" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "ReturnRequestType" NOT NULL,
    "reason" TEXT NOT NULL,
    "details" TEXT,
    "status" "ReturnRequestStatus" NOT NULL DEFAULT 'PENDING',
    "admin_response" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "return_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "return_requests_order_id_idx" ON "return_requests"("order_id");

-- CreateIndex
CREATE INDEX "return_requests_user_id_idx" ON "return_requests"("user_id");

-- CreateIndex
CREATE INDEX "return_requests_status_idx" ON "return_requests"("status");

-- CreateIndex
CREATE INDEX "return_requests_type_idx" ON "return_requests"("type");

-- AddForeignKey
ALTER TABLE "return_requests" ADD CONSTRAINT "return_requests_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_requests" ADD CONSTRAINT "return_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
