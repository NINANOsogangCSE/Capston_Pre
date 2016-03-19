DROP TABLE IF EXISTS `weather`;
CREATE TABLE `weather` (
  `pudDate` timestamp null DEFAULT current_timestamp,
  `time` int DEFAULT NULL,
  `temp` float DEFAULT NULL
)
