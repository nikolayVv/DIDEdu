DROP TABLE IF EXISTS users;

CREATE TABLE users (
   id INT AUTO_INCREMENT  PRIMARY KEY,
   first_name VARCHAR(250) NOT NULL,
   last_name VARCHAR(250) NOT NULL,
   email VARCHAR(250) NOT NULL
);

INSERT INTO users (first_name, last_name, email) VALUES
 ('John01', 'Smith01', 'jsmith01@outlook.com'),
 ('John02', 'Smith02', 'jsmith02@outlook.com'),
 ('John03', 'Smith03', 'jsmith03@outlook.com'),
 ('John04', 'Smith04', 'jsmith04@outlook.com'),
 ('John05', 'Smith05', 'jsmith05@outlook.com'),
 ('John06', 'Smith06', 'jsmith06@outlook.com'),
 ('John07', 'Smith07', 'jsmith07@outlook.com'),
 ('John08', 'Smith08', 'jsmith08@outlook.com'),
 ('John09', 'Smith09', 'jsmith09@outlook.com'),
 ('John10', 'Smith10', 'jsmith10@outlook.com'),
 ('John11', 'Smith11', 'jsmith11@outlook.com'),
 ('John12', 'Smith12', 'jsmith12@outlook.com'),
 ('John13', 'Smith13', 'jsmith13@outlook.com'),
 ('John14', 'Smith14', 'jsmith14@outlook.com'),
 ('John15', 'Smith15', 'jsmith15@outlook.com'),
 ('John16', 'Smith16', 'jsmith16@outlook.com'),
 ('John17', 'Smith17', 'jsmith17@outlook.com'),
 ('John18', 'Smith18', 'jsmith18@outlook.com'),
 ('John19', 'Smith19', 'jsmith19@outlook.com'),
 ('John20', 'Smith20', 'jsmith20@outlook.com'),
 ('John21', 'Smith21', 'jsmith21@outlook.com'),
 ('John22', 'Smith22', 'jsmith22@outlook.com'),
 ('Edward', 'Edi', 'edi@test.com');