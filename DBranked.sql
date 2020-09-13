DROP DATABASE IF EXISTS ranked;
CREATE DATABASE ranked;
use ranked;

CREATE TABLE races (
  raceID int(3) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (raceID)
);

CREATE TABLE people (
  peopleID int(3) NOT NULL AUTO_INCREMENT,
  raceID int(3) NOT NULL,
  PRIMARY KEY (peopleID),
  FOREIGN KEY (raceID) REFERENCES races(raceID)
);

CREATE TABLE items (
  itemID int(3) NOT NULL AUTO_INCREMENT,
  peopleID int(3) NOT NULL,
  name char(50) NOT NULL,
  priority int(2) NOT NULL,
  PRIMARY KEY (itemID),
  FOREIGN KEY (peopleID) REFERENCES people(peopleID)
);

INSERT INTO races() VALUES ();

INSERT INTO people (raceID) VALUES ('1'), ('1'), ('1'), ('1');

INSERT INTO items (peopleID, name, priority)
  VALUES (1, 'yugioh', 1), (1, 'digimon', 2), (1, 'pokemon', 3),
  (2, 'yugioh', 2), (2, 'digimon', 3), (2, 'pokemon', 1),
  (3, 'yugioh', 3), (3, 'digimon', 2), (3, 'pokemon', 1),
  (4, 'yugioh', 2), (4, 'digimon', 1), (4, 'pokemon', 3);
