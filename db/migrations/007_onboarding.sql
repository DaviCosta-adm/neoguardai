ALTER TABLE assinaturas
  ADD COLUMN IF NOT EXISTS onboarding_completo BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS onboarding_em TIMESTAMPTZ;

-- Instituições já existentes não precisam passar pelo wizard.
UPDATE assinaturas
SET onboarding_completo = TRUE,
    onboarding_em = COALESCE(onboarding_em, NOW())
WHERE onboarding_completo = FALSE;
