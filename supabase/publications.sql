-- ============================================================================
-- CL3. RESEARCH HUB — publications (Supabase DDL)
-- Backs the Publications table inside the Research Sub-Workspace.
-- ============================================================================

CREATE TABLE publications (
    id       SERIAL PRIMARY KEY,
    stt      TEXT NULL,
    pub_year TEXT NULL,
    title    TEXT NULL,
    authors  TEXT NULL,
    journal  TEXT NULL,   -- shown as "Journal / Publisher"
    category TEXT NULL,

    -- Fields edited from the expandable row panel. These were UI-only (and so
    -- lost on any other device) until the columns below were added.
    section       TEXT NULL,
    pub_time      TEXT NULL,
    ueh_declared  TEXT NULL,
    ueh_reward    TEXT NULL,
    citation      TEXT NULL,                          -- APA; auto-generated in the UI when blank
    indexing_cols JSONB NOT NULL DEFAULT '{}'::jsonb, -- { ssci, scie, ahci, scopus, esci }
    details       JSONB NOT NULL DEFAULT '{}'::jsonb, -- { framework, glocal, human, tech, urban }
    updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE publications ENABLE ROW LEVEL SECURITY;

-- Anyone may read the publication index; writes are restricted to a top admin
-- or the head of Scientific Research via can_manage_group(). See the policies
-- named "publications read/write/update/delete" in the project.
CREATE POLICY "public read publications"
ON publications FOR SELECT
USING (true);
