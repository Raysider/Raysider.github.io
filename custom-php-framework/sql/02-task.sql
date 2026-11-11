create table task
(
    id integer primary key autoincrement,
    title varchar(255) not null,
    description text not null,
    status varchar(50) not null
);