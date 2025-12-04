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

DROP PROCEDURE IF EXISTS sp_hard_delete_paper $$
CREATE PROCEDURE sp_hard_delete_paper(
  IN p_paper_id INT,
  IN p_actor_id INT
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    SET @allow_hard_delete = NULL;
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;
  SET @allow_hard_delete = TRUE;

  DELETE FROM ActivityLog WHERE paperId = p_paper_id;
  DELETE FROM Revision WHERE paperId = p_paper_id;
  DELETE FROM PaperGrant WHERE paperId = p_paper_id;
  DELETE FROM PaperTopic WHERE paperId = p_paper_id;
  DELETE FROM Authorship WHERE paperId = p_paper_id;
  DELETE FROM Paper WHERE id = p_paper_id;

  SET @allow_hard_delete = NULL;
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
  IF @allow_hard_delete IS NULL OR @allow_hard_delete = FALSE THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Papers use soft deletes. Call sp_soft_delete_paper instead.';
  END IF;
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
GRANT EXECUTE ON PROCEDURE papertrail.sp_hard_delete_paper TO 'role_research_admin';
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
