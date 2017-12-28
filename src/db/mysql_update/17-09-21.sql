CREATE SCHEMA `eefocus` DEFAULT CHARACTER SET utf8 ;

CREATE TABLE `eefocus`.`article_keywords` (
  `article_id` INT(10) UNSIGNED NOT NULL,
  `keywords` VARCHAR(500) NULL,
  PRIMARY KEY (`article_id`));
