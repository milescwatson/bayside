--create_database.sql
CREATE DATABASE IF NOT EXISTS `bayside`;

DROP TABLE IF EXISTS `bayside`.`integrations`;
CREATE TABLE `bayside`.`integrations`(
   id INTEGER PRIMARY KEY,
   name varchar(32) not null unique
);
INSERT INTO `bayside`.`integrations`(id, name) VALUES (1, 'msa');

DROP TABLE IF EXISTS `bayside`.`integrationData`;
CREATE TABLE `bayside`.`integrationData` (
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    `timestamp` DATETIME NOT NULL,
    `data` TEXT,
    `integration` VARCHAR(32),
    constraint fk_valid_integrations foreign key (`integration`) references `integrations` (name)
)

-- Future: Store user credentials, store cookie value to avoid excessively creating new sessions