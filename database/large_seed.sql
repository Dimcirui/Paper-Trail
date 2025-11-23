USE papertrail;

-- Generated Large Seed Data
-- Users
INSERT INTO User (id, userName, email, password, roleId, createdAt, updatedAt) VALUES (10, 'User_10', 'user10@example.com', 'pass', 2, NOW(), NOW()) ON DUPLICATE KEY UPDATE userName=VALUES(userName);
INSERT INTO User (id, userName, email, password, roleId, createdAt, updatedAt) VALUES (11, 'User_11', 'user11@example.com', 'pass', 3, NOW(), NOW()) ON DUPLICATE KEY UPDATE userName=VALUES(userName);
INSERT INTO User (id, userName, email, password, roleId, createdAt, updatedAt) VALUES (12, 'User_12', 'user12@example.com', 'pass', 2, NOW(), NOW()) ON DUPLICATE KEY UPDATE userName=VALUES(userName);
INSERT INTO User (id, userName, email, password, roleId, createdAt, updatedAt) VALUES (13, 'User_13', 'user13@example.com', 'pass', 3, NOW(), NOW()) ON DUPLICATE KEY UPDATE userName=VALUES(userName);
INSERT INTO User (id, userName, email, password, roleId, createdAt, updatedAt) VALUES (14, 'User_14', 'user14@example.com', 'pass', 2, NOW(), NOW()) ON DUPLICATE KEY UPDATE userName=VALUES(userName);
INSERT INTO User (id, userName, email, password, roleId, createdAt, updatedAt) VALUES (15, 'User_15', 'user15@example.com', 'pass', 3, NOW(), NOW()) ON DUPLICATE KEY UPDATE userName=VALUES(userName);
INSERT INTO User (id, userName, email, password, roleId, createdAt, updatedAt) VALUES (16, 'User_16', 'user16@example.com', 'pass', 2, NOW(), NOW()) ON DUPLICATE KEY UPDATE userName=VALUES(userName);
INSERT INTO User (id, userName, email, password, roleId, createdAt, updatedAt) VALUES (17, 'User_17', 'user17@example.com', 'pass', 3, NOW(), NOW()) ON DUPLICATE KEY UPDATE userName=VALUES(userName);
INSERT INTO User (id, userName, email, password, roleId, createdAt, updatedAt) VALUES (18, 'User_18', 'user18@example.com', 'pass', 2, NOW(), NOW()) ON DUPLICATE KEY UPDATE userName=VALUES(userName);
INSERT INTO User (id, userName, email, password, roleId, createdAt, updatedAt) VALUES (19, 'User_19', 'user19@example.com', 'pass', 3, NOW(), NOW()) ON DUPLICATE KEY UPDATE userName=VALUES(userName);
INSERT INTO User (id, userName, email, password, roleId, createdAt, updatedAt) VALUES (20, 'User_20', 'user20@example.com', 'pass', 2, NOW(), NOW()) ON DUPLICATE KEY UPDATE userName=VALUES(userName);
INSERT INTO User (id, userName, email, password, roleId, createdAt, updatedAt) VALUES (21, 'User_21', 'user21@example.com', 'pass', 3, NOW(), NOW()) ON DUPLICATE KEY UPDATE userName=VALUES(userName);
INSERT INTO User (id, userName, email, password, roleId, createdAt, updatedAt) VALUES (22, 'User_22', 'user22@example.com', 'pass', 2, NOW(), NOW()) ON DUPLICATE KEY UPDATE userName=VALUES(userName);
INSERT INTO User (id, userName, email, password, roleId, createdAt, updatedAt) VALUES (23, 'User_23', 'user23@example.com', 'pass', 3, NOW(), NOW()) ON DUPLICATE KEY UPDATE userName=VALUES(userName);
INSERT INTO User (id, userName, email, password, roleId, createdAt, updatedAt) VALUES (24, 'User_24', 'user24@example.com', 'pass', 2, NOW(), NOW()) ON DUPLICATE KEY UPDATE userName=VALUES(userName);
INSERT INTO User (id, userName, email, password, roleId, createdAt, updatedAt) VALUES (25, 'User_25', 'user25@example.com', 'pass', 3, NOW(), NOW()) ON DUPLICATE KEY UPDATE userName=VALUES(userName);
INSERT INTO User (id, userName, email, password, roleId, createdAt, updatedAt) VALUES (26, 'User_26', 'user26@example.com', 'pass', 2, NOW(), NOW()) ON DUPLICATE KEY UPDATE userName=VALUES(userName);
INSERT INTO User (id, userName, email, password, roleId, createdAt, updatedAt) VALUES (27, 'User_27', 'user27@example.com', 'pass', 3, NOW(), NOW()) ON DUPLICATE KEY UPDATE userName=VALUES(userName);
INSERT INTO User (id, userName, email, password, roleId, createdAt, updatedAt) VALUES (28, 'User_28', 'user28@example.com', 'pass', 2, NOW(), NOW()) ON DUPLICATE KEY UPDATE userName=VALUES(userName);
INSERT INTO User (id, userName, email, password, roleId, createdAt, updatedAt) VALUES (29, 'User_29', 'user29@example.com', 'pass', 3, NOW(), NOW()) ON DUPLICATE KEY UPDATE userName=VALUES(userName);

-- Papers
INSERT INTO Paper (id, title, abstract, status, primaryContactId, venueId, submissionDate, publicationDate, createdAt, updatedAt) 
  VALUES (10, 'Research Paper Title 10 on AI', 'This is a simulated abstract for paper 10...', 'Draft', 20, 1, '2025-01-01 10:00:00', '2025-06-01 10:00:00', NOW(), NOW()) 
  ON DUPLICATE KEY UPDATE title=VALUES(title), updatedAt=NOW();
INSERT INTO Paper (id, title, abstract, status, primaryContactId, venueId, submissionDate, publicationDate, createdAt, updatedAt) 
  VALUES (11, 'Research Paper Title 11 on AI', 'This is a simulated abstract for paper 11...', 'Draft', 21, 1, '2024-01-01 10:00:00', '2024-06-01 10:00:00', NOW(), NOW()) 
  ON DUPLICATE KEY UPDATE title=VALUES(title), updatedAt=NOW();
INSERT INTO Paper (id, title, abstract, status, primaryContactId, venueId, submissionDate, publicationDate, createdAt, updatedAt) 
  VALUES (12, 'Research Paper Title 12 on AI', 'This is a simulated abstract for paper 12...', 'UnderReview', 22, 1, '2021-01-01 10:00:00', '2021-06-01 10:00:00', NOW(), NOW()) 
  ON DUPLICATE KEY UPDATE title=VALUES(title), updatedAt=NOW();
INSERT INTO Paper (id, title, abstract, status, primaryContactId, venueId, submissionDate, publicationDate, createdAt, updatedAt) 
  VALUES (13, 'Research Paper Title 13 on AI', 'This is a simulated abstract for paper 13...', 'Withdrawn', 23, 1, '2023-01-01 10:00:00', '2023-06-01 10:00:00', NOW(), NOW()) 
  ON DUPLICATE KEY UPDATE title=VALUES(title), updatedAt=NOW();
INSERT INTO Paper (id, title, abstract, status, primaryContactId, venueId, submissionDate, publicationDate, createdAt, updatedAt) 
  VALUES (14, 'Research Paper Title 14 on AI', 'This is a simulated abstract for paper 14...', 'Submitted', 24, 1, '2023-01-01 10:00:00', '2023-06-01 10:00:00', NOW(), NOW()) 
  ON DUPLICATE KEY UPDATE title=VALUES(title), updatedAt=NOW();
INSERT INTO Paper (id, title, abstract, status, primaryContactId, venueId, submissionDate, publicationDate, createdAt, updatedAt) 
  VALUES (15, 'Research Paper Title 15 on AI', 'This is a simulated abstract for paper 15...', 'Published', 25, 1, '2021-01-01 10:00:00', '2021-06-01 10:00:00', NOW(), NOW()) 
  ON DUPLICATE KEY UPDATE title=VALUES(title), updatedAt=NOW();
INSERT INTO Paper (id, title, abstract, status, primaryContactId, venueId, submissionDate, publicationDate, createdAt, updatedAt) 
  VALUES (16, 'Research Paper Title 16 on AI', 'This is a simulated abstract for paper 16...', 'Withdrawn', 26, 1, '2022-01-01 10:00:00', '2022-06-01 10:00:00', NOW(), NOW()) 
  ON DUPLICATE KEY UPDATE title=VALUES(title), updatedAt=NOW();
INSERT INTO Paper (id, title, abstract, status, primaryContactId, venueId, submissionDate, publicationDate, createdAt, updatedAt) 
  VALUES (17, 'Research Paper Title 17 on AI', 'This is a simulated abstract for paper 17...', 'Rejected', 27, 1, '2022-01-01 10:00:00', '2022-06-01 10:00:00', NOW(), NOW()) 
  ON DUPLICATE KEY UPDATE title=VALUES(title), updatedAt=NOW();
INSERT INTO Paper (id, title, abstract, status, primaryContactId, venueId, submissionDate, publicationDate, createdAt, updatedAt) 
  VALUES (18, 'Research Paper Title 18 on AI', 'This is a simulated abstract for paper 18...', 'Published', 28, 1, '2022-01-01 10:00:00', '2022-06-01 10:00:00', NOW(), NOW()) 
  ON DUPLICATE KEY UPDATE title=VALUES(title), updatedAt=NOW();
INSERT INTO Paper (id, title, abstract, status, primaryContactId, venueId, submissionDate, publicationDate, createdAt, updatedAt) 
  VALUES (19, 'Research Paper Title 19 on AI', 'This is a simulated abstract for paper 19...', 'Withdrawn', 29, 1, '2021-01-01 10:00:00', '2021-06-01 10:00:00', NOW(), NOW()) 
  ON DUPLICATE KEY UPDATE title=VALUES(title), updatedAt=NOW();
INSERT INTO Paper (id, title, abstract, status, primaryContactId, venueId, submissionDate, publicationDate, createdAt, updatedAt) 
  VALUES (20, 'Research Paper Title 20 on AI', 'This is a simulated abstract for paper 20...', 'Withdrawn', 10, 1, '2022-01-01 10:00:00', '2022-06-01 10:00:00', NOW(), NOW()) 
  ON DUPLICATE KEY UPDATE title=VALUES(title), updatedAt=NOW();
INSERT INTO Paper (id, title, abstract, status, primaryContactId, venueId, submissionDate, publicationDate, createdAt, updatedAt) 
  VALUES (21, 'Research Paper Title 21 on AI', 'This is a simulated abstract for paper 21...', 'UnderReview', 11, 1, '2025-01-01 10:00:00', '2025-06-01 10:00:00', NOW(), NOW()) 
  ON DUPLICATE KEY UPDATE title=VALUES(title), updatedAt=NOW();
INSERT INTO Paper (id, title, abstract, status, primaryContactId, venueId, submissionDate, publicationDate, createdAt, updatedAt) 
  VALUES (22, 'Research Paper Title 22 on AI', 'This is a simulated abstract for paper 22...', 'Submitted', 12, 1, '2025-01-01 10:00:00', '2025-06-01 10:00:00', NOW(), NOW()) 
  ON DUPLICATE KEY UPDATE title=VALUES(title), updatedAt=NOW();
INSERT INTO Paper (id, title, abstract, status, primaryContactId, venueId, submissionDate, publicationDate, createdAt, updatedAt) 
  VALUES (23, 'Research Paper Title 23 on AI', 'This is a simulated abstract for paper 23...', 'Rejected', 13, 1, '2021-01-01 10:00:00', '2021-06-01 10:00:00', NOW(), NOW()) 
  ON DUPLICATE KEY UPDATE title=VALUES(title), updatedAt=NOW();
INSERT INTO Paper (id, title, abstract, status, primaryContactId, venueId, submissionDate, publicationDate, createdAt, updatedAt) 
  VALUES (24, 'Research Paper Title 24 on AI', 'This is a simulated abstract for paper 24...', 'Published', 14, 1, '2024-01-01 10:00:00', '2024-06-01 10:00:00', NOW(), NOW()) 
  ON DUPLICATE KEY UPDATE title=VALUES(title), updatedAt=NOW();
INSERT INTO Paper (id, title, abstract, status, primaryContactId, venueId, submissionDate, publicationDate, createdAt, updatedAt) 
  VALUES (25, 'Research Paper Title 25 on AI', 'This is a simulated abstract for paper 25...', 'UnderReview', 15, 1, '2023-01-01 10:00:00', '2023-06-01 10:00:00', NOW(), NOW()) 
  ON DUPLICATE KEY UPDATE title=VALUES(title), updatedAt=NOW();
INSERT INTO Paper (id, title, abstract, status, primaryContactId, venueId, submissionDate, publicationDate, createdAt, updatedAt) 
  VALUES (26, 'Research Paper Title 26 on AI', 'This is a simulated abstract for paper 26...', 'Rejected', 16, 1, '2020-01-01 10:00:00', '2020-06-01 10:00:00', NOW(), NOW()) 
  ON DUPLICATE KEY UPDATE title=VALUES(title), updatedAt=NOW();
INSERT INTO Paper (id, title, abstract, status, primaryContactId, venueId, submissionDate, publicationDate, createdAt, updatedAt) 
  VALUES (27, 'Research Paper Title 27 on AI', 'This is a simulated abstract for paper 27...', 'Accepted', 17, 1, '2025-01-01 10:00:00', '2025-06-01 10:00:00', NOW(), NOW()) 
  ON DUPLICATE KEY UPDATE title=VALUES(title), updatedAt=NOW();
INSERT INTO Paper (id, title, abstract, status, primaryContactId, venueId, submissionDate, publicationDate, createdAt, updatedAt) 
  VALUES (28, 'Research Paper Title 28 on AI', 'This is a simulated abstract for paper 28...', 'Rejected', 18, 1, '2021-01-01 10:00:00', '2021-06-01 10:00:00', NOW(), NOW()) 
  ON DUPLICATE KEY UPDATE title=VALUES(title), updatedAt=NOW();
INSERT INTO Paper (id, title, abstract, status, primaryContactId, venueId, submissionDate, publicationDate, createdAt, updatedAt) 
  VALUES (29, 'Research Paper Title 29 on AI', 'This is a simulated abstract for paper 29...', 'Published', 19, 1, '2022-01-01 10:00:00', '2022-06-01 10:00:00', NOW(), NOW()) 
  ON DUPLICATE KEY UPDATE title=VALUES(title), updatedAt=NOW();
INSERT INTO Paper (id, title, abstract, status, primaryContactId, venueId, submissionDate, publicationDate, createdAt, updatedAt) 
  VALUES (30, 'Research Paper Title 30 on AI', 'This is a simulated abstract for paper 30...', 'Rejected', 20, 1, '2025-01-01 10:00:00', '2025-06-01 10:00:00', NOW(), NOW()) 
  ON DUPLICATE KEY UPDATE title=VALUES(title), updatedAt=NOW();
INSERT INTO Paper (id, title, abstract, status, primaryContactId, venueId, submissionDate, publicationDate, createdAt, updatedAt) 
  VALUES (31, 'Research Paper Title 31 on AI', 'This is a simulated abstract for paper 31...', 'Submitted', 21, 1, '2020-01-01 10:00:00', '2020-06-01 10:00:00', NOW(), NOW()) 
  ON DUPLICATE KEY UPDATE title=VALUES(title), updatedAt=NOW();
INSERT INTO Paper (id, title, abstract, status, primaryContactId, venueId, submissionDate, publicationDate, createdAt, updatedAt) 
  VALUES (32, 'Research Paper Title 32 on AI', 'This is a simulated abstract for paper 32...', 'Withdrawn', 22, 1, '2022-01-01 10:00:00', '2022-06-01 10:00:00', NOW(), NOW()) 
  ON DUPLICATE KEY UPDATE title=VALUES(title), updatedAt=NOW();
INSERT INTO Paper (id, title, abstract, status, primaryContactId, venueId, submissionDate, publicationDate, createdAt, updatedAt) 
  VALUES (33, 'Research Paper Title 33 on AI', 'This is a simulated abstract for paper 33...', 'Accepted', 23, 1, '2022-01-01 10:00:00', '2022-06-01 10:00:00', NOW(), NOW()) 
  ON DUPLICATE KEY UPDATE title=VALUES(title), updatedAt=NOW();
INSERT INTO Paper (id, title, abstract, status, primaryContactId, venueId, submissionDate, publicationDate, createdAt, updatedAt) 
  VALUES (34, 'Research Paper Title 34 on AI', 'This is a simulated abstract for paper 34...', 'UnderReview', 24, 1, '2025-01-01 10:00:00', '2025-06-01 10:00:00', NOW(), NOW()) 
  ON DUPLICATE KEY UPDATE title=VALUES(title), updatedAt=NOW();
INSERT INTO Paper (id, title, abstract, status, primaryContactId, venueId, submissionDate, publicationDate, createdAt, updatedAt) 
  VALUES (35, 'Research Paper Title 35 on AI', 'This is a simulated abstract for paper 35...', 'Published', 25, 1, '2021-01-01 10:00:00', '2021-06-01 10:00:00', NOW(), NOW()) 
  ON DUPLICATE KEY UPDATE title=VALUES(title), updatedAt=NOW();
INSERT INTO Paper (id, title, abstract, status, primaryContactId, venueId, submissionDate, publicationDate, createdAt, updatedAt) 
  VALUES (36, 'Research Paper Title 36 on AI', 'This is a simulated abstract for paper 36...', 'Accepted', 26, 1, '2023-01-01 10:00:00', '2023-06-01 10:00:00', NOW(), NOW()) 
  ON DUPLICATE KEY UPDATE title=VALUES(title), updatedAt=NOW();
INSERT INTO Paper (id, title, abstract, status, primaryContactId, venueId, submissionDate, publicationDate, createdAt, updatedAt) 
  VALUES (37, 'Research Paper Title 37 on AI', 'This is a simulated abstract for paper 37...', 'Draft', 27, 1, '2020-01-01 10:00:00', '2020-06-01 10:00:00', NOW(), NOW()) 
  ON DUPLICATE KEY UPDATE title=VALUES(title), updatedAt=NOW();
INSERT INTO Paper (id, title, abstract, status, primaryContactId, venueId, submissionDate, publicationDate, createdAt, updatedAt) 
  VALUES (38, 'Research Paper Title 38 on AI', 'This is a simulated abstract for paper 38...', 'Submitted', 28, 1, '2023-01-01 10:00:00', '2023-06-01 10:00:00', NOW(), NOW()) 
  ON DUPLICATE KEY UPDATE title=VALUES(title), updatedAt=NOW();
INSERT INTO Paper (id, title, abstract, status, primaryContactId, venueId, submissionDate, publicationDate, createdAt, updatedAt) 
  VALUES (39, 'Research Paper Title 39 on AI', 'This is a simulated abstract for paper 39...', 'Published', 29, 1, '2024-01-01 10:00:00', '2024-06-01 10:00:00', NOW(), NOW()) 
  ON DUPLICATE KEY UPDATE title=VALUES(title), updatedAt=NOW();
INSERT INTO Paper (id, title, abstract, status, primaryContactId, venueId, submissionDate, publicationDate, createdAt, updatedAt) 
  VALUES (40, 'Research Paper Title 40 on AI', 'This is a simulated abstract for paper 40...', 'Accepted', 10, 1, '2021-01-01 10:00:00', '2021-06-01 10:00:00', NOW(), NOW()) 
  ON DUPLICATE KEY UPDATE title=VALUES(title), updatedAt=NOW();
INSERT INTO Paper (id, title, abstract, status, primaryContactId, venueId, submissionDate, publicationDate, createdAt, updatedAt) 
  VALUES (41, 'Research Paper Title 41 on AI', 'This is a simulated abstract for paper 41...', 'Accepted', 11, 1, '2020-01-01 10:00:00', '2020-06-01 10:00:00', NOW(), NOW()) 
  ON DUPLICATE KEY UPDATE title=VALUES(title), updatedAt=NOW();
INSERT INTO Paper (id, title, abstract, status, primaryContactId, venueId, submissionDate, publicationDate, createdAt, updatedAt) 
  VALUES (42, 'Research Paper Title 42 on AI', 'This is a simulated abstract for paper 42...', 'Accepted', 12, 1, '2020-01-01 10:00:00', '2020-06-01 10:00:00', NOW(), NOW()) 
  ON DUPLICATE KEY UPDATE title=VALUES(title), updatedAt=NOW();
INSERT INTO Paper (id, title, abstract, status, primaryContactId, venueId, submissionDate, publicationDate, createdAt, updatedAt) 
  VALUES (43, 'Research Paper Title 43 on AI', 'This is a simulated abstract for paper 43...', 'Submitted', 13, 1, '2022-01-01 10:00:00', '2022-06-01 10:00:00', NOW(), NOW()) 
  ON DUPLICATE KEY UPDATE title=VALUES(title), updatedAt=NOW();
INSERT INTO Paper (id, title, abstract, status, primaryContactId, venueId, submissionDate, publicationDate, createdAt, updatedAt) 
  VALUES (44, 'Research Paper Title 44 on AI', 'This is a simulated abstract for paper 44...', 'Published', 14, 1, '2020-01-01 10:00:00', '2020-06-01 10:00:00', NOW(), NOW()) 
  ON DUPLICATE KEY UPDATE title=VALUES(title), updatedAt=NOW();
INSERT INTO Paper (id, title, abstract, status, primaryContactId, venueId, submissionDate, publicationDate, createdAt, updatedAt) 
  VALUES (45, 'Research Paper Title 45 on AI', 'This is a simulated abstract for paper 45...', 'Withdrawn', 15, 1, '2025-01-01 10:00:00', '2025-06-01 10:00:00', NOW(), NOW()) 
  ON DUPLICATE KEY UPDATE title=VALUES(title), updatedAt=NOW();
INSERT INTO Paper (id, title, abstract, status, primaryContactId, venueId, submissionDate, publicationDate, createdAt, updatedAt) 
  VALUES (46, 'Research Paper Title 46 on AI', 'This is a simulated abstract for paper 46...', 'Published', 16, 1, '2024-01-01 10:00:00', '2024-06-01 10:00:00', NOW(), NOW()) 
  ON DUPLICATE KEY UPDATE title=VALUES(title), updatedAt=NOW();
INSERT INTO Paper (id, title, abstract, status, primaryContactId, venueId, submissionDate, publicationDate, createdAt, updatedAt) 
  VALUES (47, 'Research Paper Title 47 on AI', 'This is a simulated abstract for paper 47...', 'Draft', 17, 1, '2023-01-01 10:00:00', '2023-06-01 10:00:00', NOW(), NOW()) 
  ON DUPLICATE KEY UPDATE title=VALUES(title), updatedAt=NOW();
INSERT INTO Paper (id, title, abstract, status, primaryContactId, venueId, submissionDate, publicationDate, createdAt, updatedAt) 
  VALUES (48, 'Research Paper Title 48 on AI', 'This is a simulated abstract for paper 48...', 'Withdrawn', 18, 1, '2025-01-01 10:00:00', '2025-06-01 10:00:00', NOW(), NOW()) 
  ON DUPLICATE KEY UPDATE title=VALUES(title), updatedAt=NOW();
INSERT INTO Paper (id, title, abstract, status, primaryContactId, venueId, submissionDate, publicationDate, createdAt, updatedAt) 
  VALUES (49, 'Research Paper Title 49 on AI', 'This is a simulated abstract for paper 49...', 'Accepted', 19, 1, '2025-01-01 10:00:00', '2025-06-01 10:00:00', NOW(), NOW()) 
  ON DUPLICATE KEY UPDATE title=VALUES(title), updatedAt=NOW();
INSERT INTO Paper (id, title, abstract, status, primaryContactId, venueId, submissionDate, publicationDate, createdAt, updatedAt) 
  VALUES (50, 'Research Paper Title 50 on AI', 'This is a simulated abstract for paper 50...', 'Published', 20, 1, '2023-01-01 10:00:00', '2023-06-01 10:00:00', NOW(), NOW()) 
  ON DUPLICATE KEY UPDATE title=VALUES(title), updatedAt=NOW();
INSERT INTO Paper (id, title, abstract, status, primaryContactId, venueId, submissionDate, publicationDate, createdAt, updatedAt) 
  VALUES (51, 'Research Paper Title 51 on AI', 'This is a simulated abstract for paper 51...', 'Submitted', 21, 1, '2021-01-01 10:00:00', '2021-06-01 10:00:00', NOW(), NOW()) 
  ON DUPLICATE KEY UPDATE title=VALUES(title), updatedAt=NOW();
INSERT INTO Paper (id, title, abstract, status, primaryContactId, venueId, submissionDate, publicationDate, createdAt, updatedAt) 
  VALUES (52, 'Research Paper Title 52 on AI', 'This is a simulated abstract for paper 52...', 'Rejected', 22, 1, '2021-01-01 10:00:00', '2021-06-01 10:00:00', NOW(), NOW()) 
  ON DUPLICATE KEY UPDATE title=VALUES(title), updatedAt=NOW();
INSERT INTO Paper (id, title, abstract, status, primaryContactId, venueId, submissionDate, publicationDate, createdAt, updatedAt) 
  VALUES (53, 'Research Paper Title 53 on AI', 'This is a simulated abstract for paper 53...', 'Accepted', 23, 1, '2021-01-01 10:00:00', '2021-06-01 10:00:00', NOW(), NOW()) 
  ON DUPLICATE KEY UPDATE title=VALUES(title), updatedAt=NOW();
INSERT INTO Paper (id, title, abstract, status, primaryContactId, venueId, submissionDate, publicationDate, createdAt, updatedAt) 
  VALUES (54, 'Research Paper Title 54 on AI', 'This is a simulated abstract for paper 54...', 'Withdrawn', 24, 1, '2022-01-01 10:00:00', '2022-06-01 10:00:00', NOW(), NOW()) 
  ON DUPLICATE KEY UPDATE title=VALUES(title), updatedAt=NOW();
INSERT INTO Paper (id, title, abstract, status, primaryContactId, venueId, submissionDate, publicationDate, createdAt, updatedAt) 
  VALUES (55, 'Research Paper Title 55 on AI', 'This is a simulated abstract for paper 55...', 'Draft', 25, 1, '2023-01-01 10:00:00', '2023-06-01 10:00:00', NOW(), NOW()) 
  ON DUPLICATE KEY UPDATE title=VALUES(title), updatedAt=NOW();
INSERT INTO Paper (id, title, abstract, status, primaryContactId, venueId, submissionDate, publicationDate, createdAt, updatedAt) 
  VALUES (56, 'Research Paper Title 56 on AI', 'This is a simulated abstract for paper 56...', 'Accepted', 26, 1, '2022-01-01 10:00:00', '2022-06-01 10:00:00', NOW(), NOW()) 
  ON DUPLICATE KEY UPDATE title=VALUES(title), updatedAt=NOW();
INSERT INTO Paper (id, title, abstract, status, primaryContactId, venueId, submissionDate, publicationDate, createdAt, updatedAt) 
  VALUES (57, 'Research Paper Title 57 on AI', 'This is a simulated abstract for paper 57...', 'Draft', 27, 1, '2023-01-01 10:00:00', '2023-06-01 10:00:00', NOW(), NOW()) 
  ON DUPLICATE KEY UPDATE title=VALUES(title), updatedAt=NOW();
INSERT INTO Paper (id, title, abstract, status, primaryContactId, venueId, submissionDate, publicationDate, createdAt, updatedAt) 
  VALUES (58, 'Research Paper Title 58 on AI', 'This is a simulated abstract for paper 58...', 'Withdrawn', 28, 1, '2024-01-01 10:00:00', '2024-06-01 10:00:00', NOW(), NOW()) 
  ON DUPLICATE KEY UPDATE title=VALUES(title), updatedAt=NOW();
INSERT INTO Paper (id, title, abstract, status, primaryContactId, venueId, submissionDate, publicationDate, createdAt, updatedAt) 
  VALUES (59, 'Research Paper Title 59 on AI', 'This is a simulated abstract for paper 59...', 'Rejected', 29, 1, '2020-01-01 10:00:00', '2020-06-01 10:00:00', NOW(), NOW()) 
  ON DUPLICATE KEY UPDATE title=VALUES(title), updatedAt=NOW();
