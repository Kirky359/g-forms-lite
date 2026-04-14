-- Add requireEmail setting to Form
ALTER TABLE "Form" ADD COLUMN "requireEmail" BOOLEAN NOT NULL DEFAULT false;

-- Add respondentEmail to Response for identity tracking and duplicate prevention (optional, per-form setting)
ALTER TABLE "Response" ADD COLUMN "respondentEmail" TEXT;

-- Unique index: one submission per (form, email). NULL values are distinct in
-- PostgreSQL unique indexes, so anonymous submissions (NULL) are still allowed
-- when requireEmail is false.
CREATE UNIQUE INDEX "Response_formId_respondentEmail_key" ON "Response"("formId", "respondentEmail");