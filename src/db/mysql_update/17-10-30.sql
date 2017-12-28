CREATE TABLE `eefocus`.`article_tags` (
  `article_id` INT(10) NOT NULL,
  `tags` VARCHAR(255) NULL,
  PRIMARY KEY (`article_id`));

ALTER TABLE `eefocus`.`article_tags` 
ADD COLUMN `tags_ids` VARCHAR(255) NULL AFTER `article_id`;