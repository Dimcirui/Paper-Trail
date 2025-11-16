USE papertrail;

-- 1. Insert Roles (Research Admin, Principal Investigator, Contributor, Viewer)
INSERT INTO Role (id, roleName) VALUES 
(1, 'Research Admin'), 
(2, 'Principal Investigator'), 
(3, 'Contributor'), 
(4, 'Viewer')
ON DUPLICATE KEY UPDATE roleName=VALUES(roleName);

-- 2. Insert Users (For testing: Primary Contact, Author, Actor)
-- ID 1 is for AdminUser/PrimaryContact, IDs 101/102 are for Authorship tests
INSERT INTO User (id, userName, email, password, roleId, createdAt, updatedAt) VALUES
(1, 'AdminUser', 'admin@example.com', 'hashed_pass_1', 1, NOW(), NOW()),
(101, 'AuthorOne', 'author1@example.com', 'hashed_pass_101', 3, NOW(), NOW()), 
(102, 'AuthorTwo', 'author2@example.com', 'hashed_pass_102', 3, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
    userName=VALUES(userName), 
    updatedAt=NOW();

-- 3. Insert a Paper record (for testing deletion and authorship assignment)
INSERT INTO Paper (id, title, primaryContactId, status, createdAt, updatedAt) 
VALUES (1, 'Test Paper for Deletion', 1, 'Draft', NOW(), NOW())
ON DUPLICATE KEY UPDATE 
    title=VALUES(title), 
    updatedAt=NOW();

-- 4. Insert another Paper (for testing overview and status update)
INSERT INTO Paper (id, title, primaryContactId, status, abstract, createdAt, updatedAt) 
VALUES (2, 'Overview Test Paper', 1, 'Submitted', 'This is an abstract.', NOW(), NOW())
ON DUPLICATE KEY UPDATE 
    title=VALUES(title), 
    updatedAt=NOW();

-- 5. Insert a Venue (for testing overview)
INSERT INTO Venue (id, venueName) VALUES
(1, 'International Conference on Research')
ON DUPLICATE KEY UPDATE venueName=VALUES(venueName);

-- 6. Update Paper 2 to link Venue
UPDATE Paper SET venueId = 1, updatedAt = NOW() WHERE id = 2;