create table if not exists accounts (
   id                     serial primary key,
   account_number         varchar(12) unique not null,
   full_name              varchar(100) not null,
   pin_hash               text not null,
   balance                numeric(12,2) not null default 0 check ( balance >= 0 ),
   daily_withdrawal_limit numeric(12,2) not null default 25000,
   failed_login_attempts  int not null default 0,
   locked_until           timestamp null,
   created_at             timestamp not null default now()
);

create table if not exists transactions (
   id                 serial primary key,
   account_id         int
      references accounts ( id )
         on delete cascade,
   type               varchar(20) not null check ( type in ( 'DEPOSIT',
                                               'WITHDRAWAL',
                                               'TRANSFER_OUT',
                                               'TRANSFER_IN',
                                               'INQUIRY' ) ),
   amount             numeric(12,2) not null,
   balance_after      numeric(12,2) not null,
   related_account_id int null
      references accounts ( id ),
   reference_id       varchar(30) unique not null,
   created_at         timestamp not null default now()
);

create table if not exists login_audit (
   id           serial primary key,
   account_id   int
      references accounts ( id ),
   success      boolean not null,
   ip_address   varchar(45),
   attempted_at timestamp not null default now()
);