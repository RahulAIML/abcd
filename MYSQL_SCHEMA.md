# MySQL Schema (Workbench)

This matches your `cvs (2).sql` file.

## 1) Create database

```sql
CREATE DATABASE IF NOT EXISTS astoncv;
```

## 2) Use database

```sql
USE astoncv;
```

## 3) Create table

```sql
CREATE TABLE cvs (
  id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  keyprogramming VARCHAR(255) DEFAULT NULL,
  profile VARCHAR(500) DEFAULT NULL,
  education VARCHAR(500) DEFAULT NULL,
  URLlinks VARCHAR(500) DEFAULT NULL,
  PRIMARY KEY (id)
);
```

## Column names (important)

- id
- name
- email
- password
- keyprogramming
- profile
- education
- URLlinks

## Notes

- `email` is unique
- `password` stores the bcrypt hash
- `keyprogramming` is your programming language field
- `URLlinks` stores LinkedIn/GitHub links

