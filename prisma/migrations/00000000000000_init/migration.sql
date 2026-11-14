-- CreateTable
CREATE TABLE "contact_submissions" (
    "id" TEXT NOT NULL,
    "emailHash" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "captchaValidated" BOOLEAN NOT NULL DEFAULT false,
    "ipAddress" VARCHAR(45),
    "userAgent" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "telemetry_events" (
    "id" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "telemetry_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rate_limit_states" (
    "id" TEXT NOT NULL,
    "requestCount" INTEGER NOT NULL DEFAULT 0,
    "windowStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastRequest" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rate_limit_states_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contact_submissions_emailHash_idx" ON "contact_submissions"("emailHash");

-- CreateIndex
CREATE INDEX "contact_submissions_submittedAt_idx" ON "contact_submissions"("submittedAt");

-- CreateIndex
CREATE INDEX "telemetry_events_sessionId_idx" ON "telemetry_events"("sessionId");

-- CreateIndex
CREATE INDEX "telemetry_events_timestamp_idx" ON "telemetry_events"("timestamp");

-- CreateIndex
CREATE INDEX "telemetry_events_eventType_idx" ON "telemetry_events"("eventType");

-- CreateIndex
CREATE INDEX "rate_limit_states_lastRequest_idx" ON "rate_limit_states"("lastRequest");

