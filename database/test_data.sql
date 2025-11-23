USE papertrail;

-- Clear existing test data to avoid duplicates
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE Paper;
TRUNCATE TABLE Venue;
TRUNCATE TABLE User;
TRUNCATE TABLE Role;
TRUNCATE TABLE Topic;
TRUNCATE TABLE `Grant`;
TRUNCATE TABLE Authorship;
TRUNCATE TABLE PaperTopic;
TRUNCATE TABLE PaperGrant;
TRUNCATE TABLE Revision;
TRUNCATE TABLE ActivityLog;

SET FOREIGN_KEY_CHECKS = 1;

-- Basic Tables

    -- 1. Insert Roles (Research Admin, Principal Investigator, Contributor, Viewer)
INSERT INTO Role (id, roleName) VALUES 
(1, 'Research Admin'), 
(2, 'Principal Investigator'), 
(3, 'Contributor'), 
(4, 'Viewer');

    -- 2. Insert Venues
INSERT INTO Venue (id, venueName, type, ranking) VALUES
(1, 'Nature', 'Journal', 'Q1'),
(2, 'ICML (International Conference on Machine Learning)', 'Conference', 'A*'),
(3, 'arXiv', 'Preprint', 'N/A'),
(4, 'IEEE Transactions on Pattern Analysis', 'Journal', 'Q1'),
(5, 'CVPR', 'Conference', 'A*');

    -- 3. Insert Topics
INSERT INTO Topic (id, topicName) VALUES
(1, 'Artificial Intelligence'),
(2, 'Computer Vision'),
(3, 'Genomics'),
(4, 'Distributed Systems'),
(5, 'Ethics in AI');

    -- 4. Insert Grants
INSERT INTO `Grant` (id, grantName, sponsor, startDate, endDate, reportingRequirements) VALUES
(1, 'NSF-2023-AI-Safety', 'National Science Foundation', '2023-01-01', '2026-12-31', 'Annual Report'),
(2, 'NIH-Bio-Data', 'National Institutes of Health', '2022-06-01', '2025-05-31', 'Quarterly Financials'),
(3, 'Google Research Award', 'Google', '2024-01-01', '2024-12-31', 'Final Impact Statement');

-- Users
INSERT INTO User (id, userName, email, password, roleId, affiliation, orcid) VALUES
    -- Admin
(1, 'AdminUser', 'admin@papertrail.edu', 'pass', 1, 'University Admin Office', NULL),
    -- PIs
(2, 'Prof. Alice Smith', 'alice@papertrail.edu', 'pass', 2, 'Computer Science Dept', '0000-0001-XXXX-XXXX'),
(3, 'Dr. Bob Jones', 'bob@papertrail.edu', 'pass', 2, 'Biology Dept', '0000-0002-YYYY-YYYY'),
    -- Contributors
(4, 'Carol (PhD Student)', 'carol@papertrail.edu', 'pass', 3, 'CS Lab A', NULL),
(5, 'Dave (Postdoc)', 'dave@papertrail.edu', 'pass', 3, 'Bio Lab B', NULL),
(6, 'Eve (External)', 'eve@partner.org', 'pass', 3, 'Partner Institute', NULL),
    -- Viewer
(7, 'Frank Viewer', 'frank@guest.com', 'pass', 4, NULL, NULL);

-- Papers
    -- Published
INSERT INTO Paper (id, title, abstract, status, submissionDate, publicationDate, primaryContactId, venueId, isDeleted) VALUES
(1, 'Deep Learning for Sparse Data', 'This paper explores novel architectures for handling sparse datasets in high-dimensional spaces.', 'Published', '2023-02-15', '2023-08-20', 2, 2, FALSE);
    -- Under Review
INSERT INTO Paper (id, title, abstract, status, submissionDate, publicationDate, primaryContactId, venueId, isDeleted) VALUES
(2, 'Genomic Sequences in Algae', 'A comprehensive study of algae genome variations using new sequencing techniques.', 'UnderReview', '2024-01-10', NULL, 3, 1, FALSE);
    -- Draft
INSERT INTO Paper (id, title, abstract, status, submissionDate, publicationDate, primaryContactId, venueId, isDeleted) VALUES
(3, 'Preliminary Notes on Transformer Efficiency', 'Drafting ideas about attention mechanism optimization. Work in progress.', 'Draft', NULL, NULL, 4, NULL, FALSE);
    -- Rejected
INSERT INTO Paper (id, title, abstract, status, submissionDate, publicationDate, primaryContactId, venueId, isDeleted) VALUES
(4, 'Analysis of Failed Systems', 'Post-mortem analysis of distributed system crashes.', 'Rejected', '2022-11-01', NULL, 2, 5, FALSE);
    -- Withdrawn
INSERT INTO Paper (id, title, abstract, status, submissionDate, publicationDate, primaryContactId, venueId, isDeleted) VALUES
(5, 'Legacy Project 2020', 'Old data that is no longer relevant.', 'Withdrawn', '2020-05-01', NULL, 3, 3, TRUE);
    -- Submitted
INSERT INTO Paper (id, title, abstract, status, submissionDate, publicationDate, primaryContactId, venueId, isDeleted) VALUES
(6, 'Ethical Implications of LLMs', 'Surveying the societal impact of large language models.', 'Submitted', '2024-03-01', NULL, 2, 4, FALSE);

-- Junction Tables
    -- Authorships
        -- Paper 1 Authors: Prof. Alice (1st), Carol (2nd), Eve (3rd)
INSERT INTO Authorship (paperId, userId, authorOrder, contributionNotes) VALUES
(1, 2, 1, 'Conceived the idea and supervised'),
(1, 4, 2, 'Ran experiments and wrote code'),
(1, 6, 3, 'Provided external dataset');
        -- Paper 2 Authors: Dave (1st), Dr. Bob (2nd)
INSERT INTO Authorship (paperId, userId, authorOrder, contributionNotes) VALUES
(2, 5, 1, 'Lead writer'),
(2, 3, 2, 'PI supervision');
        -- Paper 3 Authors: Carol (1st)
INSERT INTO Authorship (paperId, userId, authorOrder) VALUES (3, 4, 1);

    -- Paper Topics
INSERT INTO PaperTopic (paperId, topicId) VALUES
(1, 1), (1, 2), -- Paper 1 is AI & CV
(2, 3),         -- Paper 2 is Genomics
(3, 1),         -- Paper 3 is AI
(4, 4),         -- Paper 4 is Distributed Systems
(6, 1), (6, 5); -- Paper 6 is AI & Ethics

    -- Paper Grants
INSERT INTO PaperGrant (paperId, grantId) VALUES
(1, 1), -- Paper 1 funded by NSF
(2, 2), -- Paper 2 funded by NIH
(6, 3); -- Paper 6 funded by Google

-- Revisions
INSERT INTO Revision (paperId, versionLabel, notes, authorId, createdAt) VALUES
(1, 'v1.0', 'Initial draft submitted for internal review', 4, '2023-01-10 10:00:00'),
(1, 'v1.1', 'Fixed typo in abstract', 2, '2023-01-15 14:00:00'),
(2, 'v0.9', 'Draft ready for PI review', 5, '2023-12-20 09:00:00');

-- Activity Logs
INSERT INTO ActivityLog (paperId, userId, actionType, actionDetail, timestamp) VALUES
(1, 2, 'PAPER_CREATED', 'Created initial record', '2023-01-01 09:00:00'),
(1, 2, 'PAPER_STATUS_UPDATED', 'Status changed to Submitted', '2023-02-15 10:00:00'),
(1, 1, 'PAPER_STATUS_UPDATED', 'Status changed to Published', '2023-08-20 12:00:00'),
(5, 3, 'PAPER_SOFT_DELETED', 'User requested deletion of legacy paper', '2021-01-01 00:00:00');