ALTER TABLE books
    ADD COLUMN added_by UUID REFERENCES users(id);