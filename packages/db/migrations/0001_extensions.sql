-- Extensions required by the schema.
-- postgis: geographic radius search (spec §8/§30)
-- pgcrypto: gen_random_uuid() for UUID primary keys
create extension if not exists postgis;
create extension if not exists pgcrypto;
