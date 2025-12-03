-- Stored procedures, triggers, events, and permissions for PaperTrail
-- Run with: mysql -u root -p < database/stored_procedures.sql

CREATE DATABASE IF NOT EXISTS papertrail;
USE papertrail;

SET @OLD_SQL_NOTES = @@sql_notes;
SET @@sql_notes = 0;

DELIMITER $$

DROP PROCEDURE IF EXISTS sp_create_paper $$
CREATE PROCEDURE sp_create_paper(
  IN p_title VARCHAR(255),
  IN p_abstract TEXT,
  IN p_status ENUM('Draft','Submitted','UnderReview','Accepted','Published','Rejected','Withdrawn'),
  IN p_submission_date DATETIME,
  IN p_publication_date DATETIME,
  IN p_pdf_url VARCHAR(500),
  IN p_primary_contact_id INT,
  IN p_venue_id INT,
  IN p_actor_id INT
)
BEGIN
  DECLARE v_paper_id INT;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  INSERT INTO Paper (
    title,
    abstract,
    status,
    submissionDate,
    publicationDate,
    pdfUrl,
    primaryContactId,
    venueId
  ) VALUES (
    p_title,
    p_abstract,
    IFNULL(p_status, 'Draft'),
    p_submission_date,
    p_publication_date,
    p_pdf_url,
    p_primary_contact_id,
    p_venue_id
  );

  SET v_paper_id = LAST_INSERT_ID();

  INSERT INTO ActivityLog (paperId, userId, actionType, actionDetail)
  VALUES (v_paper_id, p_actor_id, 'PAPER_CREATED', CONCAT('Paper "', p_title, '" created via stored procedure.'));

  COMMIT;

  SELECT * FROM Paper WHERE id = v_paper_id;
END $$

DROP PROCEDURE IF EXISTS sp_update_paper_status $$
CREATE PROCEDURE sp_update_paper_status(
  IN p_paper_id INT,
  IN p_new_status ENUM('Draft','Submitted','UnderReview','Accepted','Published','Rejected','Withdrawn'),
  IN p_actor_id INT
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  UPDATE Paper
  SET status = p_new_status,
      updatedAt = NOW()
  WHERE id = p_paper_id;

  INSERT INTO ActivityLog (paperId, userId, actionType, actionDetail)
  VALUES (p_paper_id, p_actor_id, 'PAPER_STATUS_UPDATED', CONCAT('Status changed to ', p_new_status));

  COMMIT;
END $$

DROP PROCEDURE IF EXISTS sp_soft_delete_paper $$
CREATE PROCEDURE sp_soft_delete_paper(
  IN p_paper_id INT,
  IN p_actor_id INT
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  UPDATE Paper
  SET isDeleted = TRUE,
      status = 'Withdrawn',
      updatedAt = NOW()
  WHERE id = p_paper_id;

  INSERT INTO ActivityLog (paperId, userId, actionType, actionDetail)
  VALUES (p_paper_id, p_actor_id, 'PAPER_SOFT_DELETED', 'Soft delete requested via stored procedure.');

  COMMIT;
END $$

DROP PROCEDURE IF EXISTS sp_assign_author $$
CREATE PROCEDURE sp_assign_author(
  IN p_paper_id INT,
  IN p_user_id INT,
  IN p_author_order INT,
  IN p_notes TEXT,
  IN p_actor_id INT
)
BEGIN
  DECLARE v_author_order INT;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;
  SET v_author_order = COALESCE(
    p_author_order,
    (
      SELECT IFNULL(MAX(authorOrder), 0) + 1
      FROM Authorship
      WHERE paperId = p_paper_id
      FOR UPDATE
    )
  );

  INSERT INTO Authorship (paperId, userId, authorOrder, contributionNotes)
  VALUES (p_paper_id, p_user_id, v_author_order, p_notes)
  ON DUPLICATE KEY UPDATE
    authorOrder = IF(p_author_order IS NULL, authorOrder, VALUES(authorOrder)),
    contributionNotes = VALUES(contributionNotes);

  INSERT INTO ActivityLog (paperId, userId, actionType, actionDetail)
  VALUES (p_paper_id, p_actor_id, 'AUTHORSHIP_UPDATED', CONCAT('Linked user ', p_user_id, ' to paper ', p_paper_id));

  COMMIT;
END $$

DROP PROCEDURE IF EXISTS sp_record_revision $$
CREATE PROCEDURE sp_record_revision(
  IN p_paper_id INT,
  IN p_version_label VARCHAR(100),
  IN p_notes TEXT,
  IN p_author_id INT
)
BEGIN
  INSERT INTO Revision (paperId, versionLabel, notes, authorId)
  VALUES (p_paper_id, p_version_label, p_notes, p_author_id);
END $$

DROP PROCEDURE IF EXISTS sp_add_grant_to_paper $$
CREATE PROCEDURE sp_add_grant_to_paper(
  IN p_paper_id INT,
  IN p_grant_id INT,
  IN p_actor_id INT
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  INSERT INTO PaperGrant (paperId, grantId)
  VALUES (p_paper_id, p_grant_id)
  ON DUPLICATE KEY UPDATE grantId = VALUES(grantId);

  INSERT INTO ActivityLog (paperId, userId, actionType, actionDetail)
  VALUES (p_paper_id, p_actor_id, 'PAPER_GRANT_LINKED', CONCAT('Linked grant ', p_grant_id));

  COMMIT;
END $$

DROP PROCEDURE IF EXISTS sp_get_paper_overview $$
CREATE PROCEDURE sp_get_paper_overview(IN p_paper_id INT)
BEGIN
  SELECT
    p.id,
    p.title,
    p.status,
    p.submissionDate,
    p.publicationDate,
    p.isDeleted,
    pc.userName AS primaryContactName,
    v.venueName
  FROM Paper p
    LEFT JOIN `User` pc ON p.primaryContactId = pc.id
    LEFT JOIN Venue v ON p.venueId = v.id
  WHERE p.id = p_paper_id;

  SELECT
    a.authorOrder,
    u.userName,
    u.email,
    a.contributionNotes
  FROM Authorship a
    INNER JOIN `User` u ON u.id = a.userId
  WHERE a.paperId = p_paper_id
  ORDER BY a.authorOrder;

  SELECT
    r.versionLabel,
    r.notes,
    r.createdAt,
    u.userName AS authorName
  FROM Revision r
    LEFT JOIN `User` u ON u.id = r.authorId
  WHERE r.paperId = p_paper_id
  ORDER BY r.createdAt DESC;

  SELECT
    al.actionType,
    al.actionDetail,
    al.timestamp,
    u.userName
  FROM ActivityLog al
    LEFT JOIN `User` u ON u.id = al.userId
  WHERE al.paperId = p_paper_id
  ORDER BY al.timestamp DESC;
END $$

DROP PROCEDURE IF EXISTS sp_create_activity $$
CREATE PROCEDURE sp_create_activity(
  IN p_paper_id INT,
  IN p_user_id INT,
  IN p_action_type VARCHAR(50),
  IN p_action_detail TEXT
)
BEGIN
  INSERT INTO ActivityLog (paperId, userId, actionType, actionDetail)
  VALUES (p_paper_id, p_user_id, p_action_type, p_action_detail);
END $$

DROP TRIGGER IF EXISTS trg_revision_activity $$
CREATE TRIGGER trg_revision_activity
AFTER INSERT ON Revision
FOR EACH ROW
BEGIN
  INSERT INTO ActivityLog (paperId, userId, actionType, actionDetail)
  VALUES (NEW.paperId, NEW.authorId, 'REVISION_ADDED', CONCAT('Revision ', NEW.versionLabel, ' created.'));
END $$

DROP TRIGGER IF EXISTS trg_prevent_paper_delete $$
CREATE TRIGGER trg_prevent_paper_delete
BEFORE DELETE ON Paper
FOR EACH ROW
BEGIN
  SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Papers use soft deletes. Call sp_soft_delete_paper instead.';
END $$

DROP EVENT IF EXISTS evt_flag_overdue_grants $$
CREATE EVENT evt_flag_overdue_grants
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP + INTERVAL 1 DAY
DO
  UPDATE `Grant` g
    INNER JOIN PaperGrant pg ON pg.grantId = g.id
    INNER JOIN Paper p ON p.id = pg.paperId
  SET g.reportingRequirements = COALESCE(g.reportingRequirements, 'Awaiting final report')
  WHERE g.endDate IS NOT NULL
    AND g.endDate < CURDATE()
    AND g.reportingRequirements IS NULL;
$$

DROP EVENT IF EXISTS evt_log_stale_drafts $$
CREATE EVENT evt_log_stale_drafts
ON SCHEDULE EVERY 1 WEEK
DO
  INSERT INTO ActivityLog (paperId, userId, actionType, actionDetail)
  SELECT
    p.id,
    NULL,
    'STALE_DRAFT',
    CONCAT('Paper has been in Draft for ', TIMESTAMPDIFF(DAY, p.createdAt, NOW()), ' days.')
  FROM Paper p
  WHERE p.status = 'Draft'
    AND p.createdAt < DATE_SUB(NOW(), INTERVAL 30 DAY)
    AND p.isDeleted = FALSE;
$$

DELIMITER ;

SET GLOBAL event_scheduler = ON;

-- Role-based security for stored procs
DROP ROLE IF EXISTS 'role_research_admin';
DROP ROLE IF EXISTS 'role_principal_investigator';
DROP ROLE IF EXISTS 'role_contributor';
DROP ROLE IF EXISTS 'role_viewer';

CREATE ROLE 'role_research_admin', 'role_principal_investigator', 'role_contributor', 'role_viewer';

GRANT EXECUTE ON PROCEDURE papertrail.sp_create_paper TO 'role_research_admin', 'role_principal_investigator';
GRANT EXECUTE ON PROCEDURE papertrail.sp_update_paper_status TO 'role_research_admin', 'role_principal_investigator';
GRANT EXECUTE ON PROCEDURE papertrail.sp_soft_delete_paper TO 'role_research_admin';
GRANT EXECUTE ON PROCEDURE papertrail.sp_assign_author TO 'role_research_admin', 'role_principal_investigator';
GRANT EXECUTE ON PROCEDURE papertrail.sp_record_revision TO 'role_research_admin', 'role_principal_investigator', 'role_contributor';
GRANT EXECUTE ON PROCEDURE papertrail.sp_add_grant_to_paper TO 'role_research_admin';
GRANT EXECUTE ON PROCEDURE papertrail.sp_get_paper_overview TO 'role_research_admin', 'role_principal_investigator', 'role_contributor', 'role_viewer';
GRANT EXECUTE ON PROCEDURE papertrail.sp_create_activity TO 'role_research_admin';

-- Example application users (temporary passwords logged for immediate rotation)
DROP USER IF EXISTS 'papertrail_admin'@'%';
DROP USER IF EXISTS 'papertrail_pi'@'%';
DROP USER IF EXISTS 'papertrail_contrib'@'%';
DROP USER IF EXISTS 'papertrail_viewer'@'%';

SET @papertrail_admin_password = COALESCE(@papertrail_admin_password, UUID());
SET @papertrail_pi_password = COALESCE(@papertrail_pi_password, UUID());
SET @papertrail_contrib_password = COALESCE(@papertrail_contrib_password, UUID());
SET @papertrail_viewer_password = COALESCE(@papertrail_viewer_password, UUID());

-- MySQL 8.0 does not permit the direct use of user variables (@variable) as the value for IDENTIFIED BY in CREATE USER.
-- Therefore, we use prepared statements to dynamically construct and execute the CREATE USER commands.

-- CREATE USER 'papertrail_admin'@'%' IDENTIFIED BY @papertrail_admin_password;
-- CREATE USER 'papertrail_pi'@'%' IDENTIFIED BY @papertrail_pi_password;
-- CREATE USER 'papertrail_contrib'@'%' IDENTIFIED BY @papertrail_contrib_password;
-- CREATE USER 'papertrail_viewer'@'%' IDENTIFIED BY @papertrail_viewer_password;

SET @sql = CONCAT('CREATE USER ''papertrail_admin''@''%'' IDENTIFIED WITH mysql_native_password BY ''', @papertrail_admin_password, '''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = CONCAT('CREATE USER ''papertrail_pi''@''%'' IDENTIFIED WITH mysql_native_password BY ''', @papertrail_pi_password, '''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = CONCAT('CREATE USER ''papertrail_contrib''@''%'' IDENTIFIED WITH mysql_native_password BY ''', @papertrail_contrib_password, '''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = CONCAT('CREATE USER ''papertrail_viewer''@''%'' IDENTIFIED WITH mysql_native_password BY ''', @papertrail_viewer_password, '''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


ALTER USER 'papertrail_admin'@'%' PASSWORD EXPIRE;
ALTER USER 'papertrail_pi'@'%' PASSWORD EXPIRE;
ALTER USER 'papertrail_contrib'@'%' PASSWORD EXPIRE;
ALTER USER 'papertrail_viewer'@'%' PASSWORD EXPIRE;

GRANT 'role_research_admin' TO 'papertrail_admin'@'%';
GRANT 'role_principal_investigator' TO 'papertrail_pi'@'%';
GRANT 'role_contributor' TO 'papertrail_contrib'@'%';
GRANT 'role_viewer' TO 'papertrail_viewer'@'%';

SET DEFAULT ROLE ALL TO 'papertrail_admin'@'%', 'papertrail_pi'@'%', 'papertrail_contrib'@'%', 'papertrail_viewer'@'%';

SELECT 'papertrail_admin' AS user, @papertrail_admin_password AS temporary_password
UNION ALL
SELECT 'papertrail_pi', @papertrail_pi_password
UNION ALL
SELECT 'papertrail_contrib', @papertrail_contrib_password
UNION ALL
SELECT 'papertrail_viewer', @papertrail_viewer_password;

SET @@sql_notes = @OLD_SQL_NOTES;
USE papertrail;

-- Reset existing data for a clean high-volume seed
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE ActivityLog;
TRUNCATE TABLE Revision;
TRUNCATE TABLE PaperGrant;
TRUNCATE TABLE PaperTopic;
TRUNCATE TABLE Authorship;
TRUNCATE TABLE Paper;
TRUNCATE TABLE `Grant`;
TRUNCATE TABLE Topic;
TRUNCATE TABLE Venue;
TRUNCATE TABLE User;
TRUNCATE TABLE Role;
SET FOREIGN_KEY_CHECKS = 1;

-- Core lookup tables
INSERT INTO Role (id, roleName) VALUES
  (1, 'Research Admin'),
  (2, 'Principal Investigator'),
  (3, 'Contributor'),
  (4, 'Viewer')
ON DUPLICATE KEY UPDATE roleName = VALUES(roleName);

INSERT INTO Venue (id, venueName, type, ranking) VALUES
  (1, 'Nature Machine Intelligence', 'Journal', 'Q1'),
  (2, 'ICML (International Conference on Machine Learning)', 'Conference', 'A*'),
  (3, 'NeurIPS', 'Conference', 'A*'),
  (4, 'AAAI Conference on Artificial Intelligence', 'Conference', 'A'),
  (5, 'ACM SIGGRAPH Asia', 'Conference', 'A'),
  (6, 'IEEE Robotics and Automation Letters', 'Journal', 'Q1'),
  (7, 'Science Translational Medicine', 'Journal', 'Q1'),
  (8, 'USENIX NSDI', 'Conference', 'A*'),
  (9, 'KDD (Knowledge Discovery and Data Mining)', 'Conference', 'A*'),
  (10, 'Nature Climate Change', 'Journal', 'Q1')
ON DUPLICATE KEY UPDATE venueName = VALUES(venueName), type = VALUES(type), ranking = VALUES(ranking);

INSERT INTO Topic (id, topicName) VALUES
  (1, 'Climate Modeling'),
  (2, 'Responsible AI'),
  (3, 'Clinical Informatics'),
  (4, 'Computational Genomics'),
  (5, 'Embodied Robotics'),
  (6, 'Distributed Systems'),
  (7, 'Geospatial Intelligence'),
  (8, 'Autonomous Vehicles'),
  (9, 'Sustainable Energy Systems'),
  (10, 'Human-AI Collaboration')
ON DUPLICATE KEY UPDATE topicName = VALUES(topicName);

INSERT INTO `Grant` (id, grantName, sponsor, startDate, endDate, reportingRequirements) VALUES
  (1, 'NSF CNS-23190 SecureEdge', 'National Science Foundation', '2023-01-01', '2026-12-31', 'Annual research and financial report'),
  (2, 'DARPA AIRLIFT', 'U.S. DARPA', '2022-09-01', '2025-08-31', 'Quarterly milestone briefings'),
  (3, 'Chan Zuckerberg Biohub Microbiome', 'CZI', '2023-04-01', '2026-03-31', 'Semi-annual progress update'),
  (4, 'DOE Climate Futures Initiative', 'Department of Energy', '2021-07-01', '2024-06-30', 'Annual impact statement'),
  (5, 'Wellcome Trust Digital Health Frontier', 'Wellcome Trust', '2022-02-01', '2025-01-31', 'Annual ethics statement'),
  (6, 'Toyota Research Embodied AI', 'Toyota Research Institute', '2023-06-01', '2026-05-31', 'Quarterly progress demos')
ON DUPLICATE KEY UPDATE grantName = VALUES(grantName), sponsor = VALUES(sponsor);

-- Staff roster (PI ids 200-231, contributors 300-349, admin 100, viewer 400)
INSERT INTO User (id, userName, email, password, roleId, affiliation, orcid, createdAt, updatedAt) VALUES
  (100, 'PaperTrail Admin', 'admin@papertrail.local', 'pass', 1, 'PaperTrail Program Office', NULL, NOW(), NOW()),
  (400, 'Advisory Viewer', 'viewer@papertrail.local', 'pass', 4, 'External Advisory Board', NULL, NOW(), NOW()),
  (200, 'Dr. Priya Natarajan', 'priya.natarajan@yale.edu', 'pass', 2, 'Yale Cognitive Systems Lab', '0000-0002-1825-0097', NOW(), NOW()),
  (201, 'Dr. Miguel Alvarez', 'miguel.alvarez@mit.edu', 'pass', 2, 'MIT CSAIL', '0000-0002-7746-9232', NOW(), NOW()),
  (202, 'Dr. Helena Park', 'helena.park@stanford.edu', 'pass', 2, 'Stanford HAI', '0000-0003-4521-1121', NOW(), NOW()),
  (203, 'Dr. Omar Rahman', 'omar.rahman@uchicago.edu', 'pass', 2, 'UChicago Data Science Institute', '0000-0002-7784-8871', NOW(), NOW()),
  (204, 'Dr. Aisha Mensah', 'aisha.mensah@berkeley.edu', 'pass', 2, 'Berkeley Sky Computing', '0000-0003-1901-5533', NOW(), NOW()),
  (205, 'Dr. Rui Tan', 'rui.tan@cmu.edu', 'pass', 2, 'CMU Robotics Institute', '0000-0001-2222-3333', NOW(), NOW()),
  (206, 'Dr. Mateo Garcia', 'mateo.garcia@ox.ac.uk', 'pass', 2, 'Oxford Big Data Institute', '0000-0001-1098-2245', NOW(), NOW()),
  (207, 'Dr. Emily Cho', 'emily.cho@utoronto.ca', 'pass', 2, 'University of Toronto Vector Lab', '0000-0002-3566-9988', NOW(), NOW()),
  (208, 'Dr. Leila Farah', 'leila.farah@epfl.ch', 'pass', 2, 'EPFL AI Center', '0000-0001-5520-8874', NOW(), NOW()),
  (209, 'Dr. Noah Trivedi', 'noah.trivedi@cmu.edu', 'pass', 2, 'CMU Robotics Institute', '0000-0001-4444-1234', NOW(), NOW()),
  (210, 'Dr. Sofia Duarte', 'sofia.duarte@usp.br', 'pass', 2, 'USP Smart Cities Lab', '0000-0002-0404-5566', NOW(), NOW()),
  (211, 'Dr. Ethan Morales', 'ethan.morales@usc.edu', 'pass', 2, 'USC Climate Futures', '0000-0002-7654-3311', NOW(), NOW()),
  (212, 'Dr. Luna Petrov', 'luna.petrov@microsoft.com', 'pass', 2, 'Microsoft Research AI for Good', '0000-0003-7654-9087', NOW(), NOW()),
  (213, 'Dr. Olivia Strauss', 'olivia.strauss@cornell.edu', 'pass', 2, 'Cornell Tech Urban Tech Hub', '0000-0003-1199-8876', NOW(), NOW()),
  (214, 'Dr. Kai Matsuda', 'kai.matsuda@tokyo-u.ac.jp', 'pass', 2, 'UTokyo Autonomous Systems', '0000-0002-8888-4444', NOW(), NOW()),
  (215, 'Dr. Amara Li', 'amara.li@ust.hk', 'pass', 2, 'HKUST Robotics Lab', '0000-0001-5555-1212', NOW(), NOW()),
  (216, 'Dr. Jasper Osei', 'jasper.osei@kaist.ac.kr', 'pass', 2, 'KAIST AI Institute', '0000-0003-0101-0101', NOW(), NOW()),
  (217, 'Dr. Chiara Romano', 'chiara.romano@polimi.it', 'pass', 2, 'Polimi Intelligent Systems', '0000-0002-2222-4545', NOW(), NOW()),
  (218, 'Dr. Isaac Adeyemi', 'isaac.adeyemi@uib.no', 'pass', 2, 'UiB Climate Analytics', '0000-0002-1299-8876', NOW(), NOW()),
  (219, 'Dr. Harper Quinn', 'harper.quinn@utexas.edu', 'pass', 2, 'UT Austin Heart Lab', '0000-0002-8263-1176', NOW(), NOW()),
  (220, 'Dr. Damien Rousseau', 'damien.rousseau@inria.fr', 'pass', 2, 'INRIA RobotLearn', '0000-0001-7755-4499', NOW(), NOW()),
  (221, 'Dr. Saanvi Rao', 'saanvi.rao@iitd.ac.in', 'pass', 2, 'IIT Delhi Sustainable Tech Lab', '0000-0003-8855-4499', NOW(), NOW()),
  (222, 'Dr. Gabriel Mendes', 'gabriel.mendes@uc.cl', 'pass', 2, 'UC Chile Andes Computing', '0000-0001-1122-9933', NOW(), NOW()),
  (223, 'Dr. Vera Klug', 'vera.klug@tum.de', 'pass', 2, 'TUM Autonomous Systems Lab', '0000-0002-3333-2154', NOW(), NOW()),
  (300, 'Lena Becker', 'lena.becker@tum.de', 'pass', 3, 'TUM Autonomous Systems Lab', NULL, NOW(), NOW()),
  (301, 'Jonas Weaver', 'jonas.weaver@berkeley.edu', 'pass', 3, 'Berkeley Sky Computing', NULL, NOW(), NOW()),
  (302, 'Sara Keita', 'sara.keita@ox.ac.uk', 'pass', 3, 'Oxford Big Data Institute', NULL, NOW(), NOW()),
  (303, 'Noah Trivedi Jr.', 'noah.trivedi.jr@cmu.edu', 'pass', 3, 'CMU Robotics Institute', NULL, NOW(), NOW()),
  (304, 'Priya Sethi', 'priya.sethi@iitd.ac.in', 'pass', 3, 'IIT Delhi Sustainable Tech Lab', NULL, NOW(), NOW()),
  (305, 'Andre Pacheco', 'andre.pacheco@usp.br', 'pass', 3, 'USP Smart Cities Lab', NULL, NOW(), NOW()),
  (306, 'Emily Vance', 'emily.vance@utexas.edu', 'pass', 3, 'UT Austin Heart Lab', NULL, NOW(), NOW()),
  (307, 'Hiro Asakura', 'hiro.asakura@tokyo-u.ac.jp', 'pass', 3, 'UTokyo Autonomous Systems', NULL, NOW(), NOW()),
  (308, 'Maria Chen', 'maria.chen@stanford.edu', 'pass', 3, 'Stanford HAI', NULL, NOW(), NOW()),
  (309, 'David Ortiz', 'david.ortiz@usc.edu', 'pass', 3, 'USC Climate Futures', NULL, NOW(), NOW()),
  (310, 'Chloe Renaud', 'chloe.renaud@inria.fr', 'pass', 3, 'INRIA RobotLearn', NULL, NOW(), NOW()),
  (311, 'Nikhil Deshmukh', 'nikhil.deshmukh@cmu.edu', 'pass', 3, 'CMU Robotics Institute', NULL, NOW(), NOW()),
  (312, 'Izzy Khan', 'izzy.khan@utexas.edu', 'pass', 3, 'UT Austin Heart Lab', NULL, NOW(), NOW()),
  (313, 'Selene Ortega', 'selene.ortega@cornell.edu', 'pass', 3, 'Cornell Tech Urban Tech Hub', NULL, NOW(), NOW()),
  (314, 'Renata Silva', 'renata.silva@usp.br', 'pass', 3, 'USP Smart Cities Lab', NULL, NOW(), NOW()),
  (315, 'Yuki Matsumoto', 'yuki.matsumoto@tokyo-u.ac.jp', 'pass', 3, 'UTokyo Autonomous Systems', NULL, NOW(), NOW()),
  (316, 'Tessa Briggs', 'tessa.briggs@ucl.ac.uk', 'pass', 3, 'UCL AI Centre', NULL, NOW(), NOW()),
  (317, 'Omar Aliyu', 'omar.aliyu@uib.no', 'pass', 3, 'UiB Climate Analytics', NULL, NOW(), NOW()),
  (318, 'Maeve Ross', 'maeve.ross@berkeley.edu', 'pass', 3, 'Berkeley Sky Computing', NULL, NOW(), NOW()),
  (319, 'Malik Johnson', 'malik.johnson@columbia.edu', 'pass', 3, 'Columbia Zuckerman Institute', NULL, NOW(), NOW()),
  (320, 'Ivy Zhang', 'ivy.zhang@ust.hk', 'pass', 3, 'HKUST Robotics Lab', NULL, NOW(), NOW()),
  (321, 'Leo Raman', 'leo.raman@iitd.ac.in', 'pass', 3, 'IIT Delhi Sustainable Tech Lab', NULL, NOW(), NOW()),
  (322, 'Anya Kuznetsov', 'anya.kuznetsov@epfl.ch', 'pass', 3, 'EPFL AI Center', NULL, NOW(), NOW()),
  (323, 'Victor Nwosu', 'victor.nwosu@kaist.ac.kr', 'pass', 3, 'KAIST AI Institute', NULL, NOW(), NOW()),
  (324, 'Greta Ivanova', 'greta.ivanova@polimi.it', 'pass', 3, 'Polimi Intelligent Systems', NULL, NOW(), NOW()),
  (325, 'Caleb Thornton', 'caleb.thornton@usc.edu', 'pass', 3, 'USC Climate Futures', NULL, NOW(), NOW()),
  (326, 'Lara Kline', 'lara.kline@microsoft.com', 'pass', 3, 'Microsoft Research AI for Good', NULL, NOW(), NOW()),
  (327, 'Andre Liu', 'andre.liu@cmu.edu', 'pass', 3, 'CMU Robotics Institute', NULL, NOW(), NOW()),
  (328, 'Sahana Prakash', 'sahana.prakash@iitd.ac.in', 'pass', 3, 'IIT Delhi Sustainable Tech Lab', NULL, NOW(), NOW()),
  (329, 'Tariq Mahmood', 'tariq.mahmood@asu.edu', 'pass', 3, 'ASU Solar Futures Lab', NULL, NOW(), NOW()),
  (330, 'Bianca Costa', 'bianca.costa@uc.cl', 'pass', 3, 'UC Chile Andes Computing', NULL, NOW(), NOW()),
  (331, 'Riley Thompson', 'riley.thompson@utexas.edu', 'pass', 3, 'UT Austin Heart Lab', NULL, NOW(), NOW()),
  (332, 'Helena Zhou', 'helena.zhou@mit.edu', 'pass', 3, 'MIT CSAIL', NULL, NOW(), NOW()),
  (333, 'Mateo Velasquez', 'mateo.velasquez@utoronto.ca', 'pass', 3, 'Vector Institute', NULL, NOW(), NOW()),
  (334, 'Keiko Yamashita', 'keiko.yamashita@tokyo-u.ac.jp', 'pass', 3, 'UTokyo Autonomous Systems', NULL, NOW(), NOW()),
  (335, 'Nora Kassim', 'nora.kassim@ust.hk', 'pass', 3, 'HKUST Robotics Lab', NULL, NOW(), NOW()),
  (336, 'Diego Fuentes', 'diego.fuentes@kaist.ac.kr', 'pass', 3, 'KAIST AI Institute', NULL, NOW(), NOW()),
  (337, 'Ivana Jovic', 'ivana.jovic@polimi.it', 'pass', 3, 'Polimi Intelligent Systems', NULL, NOW(), NOW()),
  (338, 'Lucas Barrett', 'lucas.barrett@ox.ac.uk', 'pass', 3, 'Oxford Big Data Institute', NULL, NOW(), NOW()),
  (339, 'Mira Schultz', 'mira.schultz@cmu.edu', 'pass', 3, 'CMU Robotics Institute', NULL, NOW(), NOW()),
  (340, 'Aditya Menon', 'aditya.menon@iitd.ac.in', 'pass', 3, 'IIT Delhi Sustainable Tech Lab', NULL, NOW(), NOW())
ON DUPLICATE KEY UPDATE userName = VALUES(userName), email = VALUES(email), affiliation = VALUES(affiliation), updatedAt = VALUES(updatedAt);

-- Automated high-volume paper generation (150 records + relationships)
DELIMITER $$
DROP PROCEDURE IF EXISTS seed_real_world $$
CREATE PROCEDURE seed_real_world()
BEGIN
  DECLARE i INT DEFAULT 0;
  DECLARE paper_id INT;
  DECLARE status_label VARCHAR(20);
  DECLARE topic_id INT;
  DECLARE secondary_topic INT;
  DECLARE venue_id INT;
  DECLARE grant_id INT;
  DECLARE submission_date DATE;
  DECLARE publication_date DATE;
  DECLARE title_text VARCHAR(255);
  DECLARE abstract_text TEXT;
  DECLARE pi_id INT;
  DECLARE contrib_a INT;
  DECLARE contrib_b INT;
  DECLARE version_label VARCHAR(20);
  DECLARE base_title VARCHAR(255);
  DECLARE focus_label VARCHAR(255);
  DECLARE venue_total INT;
  DECLARE topic_total INT;
  DECLARE grant_total INT;
  DECLARE base_date DATE DEFAULT '2020-01-01';
  DECLARE v_rand DECIMAL(10,4); -- Random placeholder

  SELECT COUNT(*) INTO venue_total FROM Venue;
  SELECT COUNT(*) INTO topic_total FROM Topic;
  SELECT COUNT(*) INTO grant_total FROM `Grant`;

  WHILE i < 150 DO
    SET paper_id = 2000 + i;
    
    -- [Optimized] Weighted Status Distribution
    SET v_rand = RAND();
    IF v_rand < 0.35 THEN SET status_label = 'Published';
    ELSEIF v_rand < 0.55 THEN SET status_label = 'Rejected';
    ELSEIF v_rand < 0.70 THEN SET status_label = 'Draft';
    ELSEIF v_rand < 0.80 THEN SET status_label = 'Submitted';
    ELSEIF v_rand < 0.90 THEN SET status_label = 'UnderReview';
    ELSEIF v_rand < 0.97 THEN SET status_label = 'Accepted';
    ELSE SET status_label = 'Withdrawn';
    END IF;

    -- [Optimized] Weighted Topic Distribution (Favor ID 1-4)
    SET v_rand = RAND();
    IF v_rand < 0.6 THEN 
        SET topic_id = 1 + FLOOR(RAND() * 4); -- Topics 1-4 (60% chance)
    ELSE 
        SET topic_id = 5 + FLOOR(RAND() * (topic_total - 4)); -- Topics 5-10
    END IF;
    SET secondary_topic = ((topic_id + 2) MOD topic_total) + 1;

    -- [Optimized] Weighted Venue Distribution (Favor ID 1-3)
    SET v_rand = RAND();
    IF v_rand < 0.5 THEN 
        SET venue_id = 1 + FLOOR(RAND() * 3); -- Venues 1-3 (50% chance)
    ELSE 
        SET venue_id = 4 + FLOOR(RAND() * (venue_total - 3)); -- Venues 4-10
    END IF;

    -- [Optimized] Grant Distribution (Favor Grant 1)
    IF RAND() < 0.4 THEN 
        SET grant_id = 1; 
    ELSE 
        SET grant_id = 1 + FLOOR(RAND() * grant_total);
        IF grant_id > grant_total THEN SET grant_id = grant_total; END IF;
    END IF;

    -- [Optimized] Variable Time Intervals (Random 1-20 days)
    SET submission_date = DATE_ADD(base_date, INTERVAL (i * (1 + FLOOR(RAND() * 20))) DAY);
    
    SET publication_date = CASE
      WHEN status_label IN ('Accepted', 'Published') THEN DATE_ADD(submission_date, INTERVAL (90 + FLOOR(RAND() * 180)) DAY)
      ELSE NULL
    END;

    SET pi_id = 200 + (i MOD 24);
    SET contrib_a = 300 + (i MOD 40);
    SET contrib_b = 320 + (i MOD 20);

    SET base_title = ELT(
      (i MOD 15) + 1,
      'Edge Genomics Workflows',
      'Auditable Responsible AI Pipelines',
      'Clinical LLM Copilots',
      'Embodied Field Robotics',
      'Self-Healing Distributed Systems',
      'Geospatial Change Detection',
      'Autonomous Fleet Safety',
      'Energy-Twin Analytics',
      'Human-AI Decision Studios',
      'Extreme Weather Digital Twins',
      'Neural Cellular Biofoundry',
      'Coastal Resilience Observatories',
      'Planetary Health Monitoring Stack',
      'Bio-inspired Soft Manipulation',
      'Quantum-Assisted Climate Forecasts'
    );

    SET focus_label = ELT(
      ((i DIV 15) MOD 10) + 1,
      'MIT CSAIL',
      'Stanford HAI',
      'Berkeley Sky Computing',
      'CMU Robotics Institute',
      'Oxford Big Data Institute',
      'UT Austin Energy Consortium',
      'EPFL Alpine Research',
      'UC Chile Andes Lab',
      'Tokyo U Autonomous Systems',
      'UChicago Data Science Institute'
    );

    SET title_text = CONCAT(
      base_title,
      ' - ',
      focus_label,
      ' Cohort ',
      2020 + (i MOD 5),
      ' | Program ',
      LPAD(i + 1, 3, '0')
    );

    SET abstract_text = CONCAT(
      'Longitudinal study "',
      base_title,
      '" exploring ',
      LOWER(ELT(topic_id,
        'climate modeling at continental scales',
        'transparent AI governance',
        'clinical documentation support',
        'portable genomics analyses',
        'field robotics deployments',
        'distributed infrastructure reliability',
        'planetary geospatial intelligence',
        'autonomy verification',
        'adaptive energy models',
        'human-AI teaming')),
      ' and led with ',
      focus_label,
      ', leveraging datasets gathered between ',
      2020 + (i MOD 3),
      ' and ',
      2023 + (i MOD 3),
      '.'
    );

    INSERT INTO Paper (
      id, title, abstract, status, submissionDate, publicationDate,
      primaryContactId, venueId, isDeleted, createdAt, updatedAt
    )
    VALUES (
      paper_id, title_text, LEFT(abstract_text, 191), status_label,
      submission_date, publication_date, pi_id, venue_id, FALSE, NOW(), NOW()
    )
    ON DUPLICATE KEY UPDATE
      title = VALUES(title),
      abstract = LEFT(VALUES(abstract), 191),
      status = VALUES(status),
      submissionDate = VALUES(submissionDate),
      publicationDate = VALUES(publicationDate),
      primaryContactId = VALUES(primaryContactId),
      venueId = VALUES(venueId),
      updatedAt = VALUES(updatedAt);

    INSERT INTO PaperTopic (paperId, topicId)
      VALUES (paper_id, topic_id)
    ON DUPLICATE KEY UPDATE topicId = VALUES(topicId);

    INSERT INTO PaperTopic (paperId, topicId)
      VALUES (paper_id, secondary_topic)
    ON DUPLICATE KEY UPDATE topicId = VALUES(topicId);

    INSERT INTO PaperGrant (paperId, grantId)
      VALUES (paper_id, grant_id)
    ON DUPLICATE KEY UPDATE grantId = VALUES(grantId);

    INSERT INTO Authorship (paperId, userId, authorOrder, contributionNotes) VALUES
      (paper_id, pi_id, 1, 'Principal investigator and correspondence'),
      (paper_id, contrib_a, 2, 'Lead engineer / first author'),
      (paper_id, contrib_b, 3, 'Experimentation and evaluation')
    ON DUPLICATE KEY UPDATE contributionNotes = VALUES(contributionNotes);

    SET version_label = CONCAT('v', ((i MOD 3) + 1), '.0');
    INSERT INTO Revision (paperId, versionLabel, notes, authorId, createdAt)
    VALUES (
      paper_id,
      version_label,
      CONCAT('Iteration ', version_label, ' prepared for ', status_label, ' stage.'),
      contrib_a,
      DATE_ADD(submission_date, INTERVAL 7 DAY)
    );

    INSERT INTO ActivityLog (paperId, userId, actionType, actionDetail, timestamp) VALUES
      (paper_id, pi_id, 'PAPER_CREATED', 'Record created through real-world seed script.', submission_date),
      (paper_id, pi_id, 'PAPER_STATUS_UPDATED', CONCAT('Status set to ', status_label), DATE_ADD(submission_date, INTERVAL 5 DAY));

    SET i = i + 1;
  END WHILE;
END $$
DELIMITER ;

CALL seed_real_world();
DROP PROCEDURE seed_real_world;