DROP TABLE IF EXISTS `weather`;
CREATE TABLE `climate` (
  `pudDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `time` int(11) DEFAULT NULL,
  `temp` float DEFAULT NULL
)
