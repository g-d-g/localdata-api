SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;
COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';
--CREATE EXTENSION IF NOT EXISTS plv8 WITH SCHEMA pg_catalog;
--COMMENT ON EXTENSION plv8 IS 'PL/JavaScript (v8) trusted procedural language';
CREATE EXTENSION IF NOT EXISTS dblink WITH SCHEMA public;
COMMENT ON EXTENSION dblink IS 'connect to other PostgreSQL databases from within a database';
CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA public;
COMMENT ON EXTENSION pg_stat_statements IS 'track execution statistics of all SQL statements executed';
CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;
COMMENT ON EXTENSION postgis IS 'PostGIS geometry, geography, and raster spatial types and functions';
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;
COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';

SET search_path = public, pg_catalog;
SET default_tablespace = '';
SET default_with_oids = false;

CREATE TABLE features (
    id uuid DEFAULT uuid_generate_v1() NOT NULL,
    source text,
    type text,
    object_id text,
    short_name text,
    long_name text,
    info json,
    "timestamp" timestamp without time zone DEFAULT now(),
    geom geography(Geometry,4326)
);

COPY features (id, source, type, object_id, short_name, long_name, info, "timestamp", geom) FROM stdin;
538b56c8-5563-11e3-b551-12313d2775db	detroit-parcels	parcels	10004927.	3378 14TH ST	3378 14TH ST, Detroit, MI	{"address": {"number": "3378", "streetName": "14TH ST"}}	2012-10-08 00:00:00	0106000020E610000001000000010300000001000000100000004C5E621D28C554C031E2C1845D2B45407D90BFEE27C554C0753341A25D2B45407D90BFEE27C554C0753341A25D2B45404A67BD3D20C554C052AAE678622B45404A67BD3D20C554C052AAE678622B454084D0E00920C554C06108EB9D622B454084D0E00920C554C06108EB9D622B45409C96830C1FC554C0AADC17225F2B45409C96830C1FC554C0AADC17225F2B4540C52860401FC554C0378213FD5E2B4540C52860401FC554C0378213FD5E2B4540969D61F126C554C0A8946E265A2B4540969D61F126C554C0A8946E265A2B454002FD292527C554C0D0240D095A2B454002FD292527C554C0D0240D095A2B45404C5E621D28C554C031E2C1845D2B4540
538b6618-5563-11e3-aa17-12313d2775db	detroit-parcels	parcels	10005422.	3026 15TH ST	3026 15TH ST, Detroit, MI	{"address": {"number": "3026", "streetName": "15TH ST"}}	2012-10-08 00:00:00	0106000020E61000000100000001030000000100000010000000A7CBA9A927C554C05D4EDE770A2B4540A2F0E17527C554C021C03F950A2B4540A2F0E17527C554C021C03F950A2B454035BAF7E421C554C001B1DA180E2B454035BAF7E421C554C001B1DA180E2B4540C1D32FB121C554C0B90D3C360E2B4540C1D32FB121C554C0B90D3C360E2B4540125AA7BD20C554C0B7EB76E80A2B4540125AA7BD20C554C0B7EB76E80A2B45405F5E83F120C554C0088B72C30A2B45405F5E83F120C554C0088B72C30A2B45400BF7588226C554C01A017B47072B45400BF7588226C554C01A017B47072B45407ACD20B626C554C0CE92192A072B45407ACD20B626C554C0CE92192A072B4540A7CBA9A927C554C05D4EDE770A2B4540
538b9552-5563-11e3-91a5-12313d2775db	detroit-parcels	parcels	10005421.	3018 15TH ST	3018 15TH ST, Detroit, MI	{"address": {"number": "3018", "streetName": "15TH ST"}}	2012-10-08 00:00:00	0106000020E610000001000000010300000001000000100000007ACD20B626C554C0CE92192A072B45400BF7588226C554C01A017B47072B45400BF7588226C554C01A017B47072B45405F5E83F120C554C0088B72C30A2B45405F5E83F120C554C0088B72C30A2B4540125AA7BD20C554C0B7EB76E80A2B4540125AA7BD20C554C0B7EB76E80A2B4540E0BE58CF1FC554C0B8922C93072B4540E0BE58CF1FC554C0B8922C93072B4540199C200320C554C0DD3CCB75072B4540199C200320C554C0DD3CCB75072B4540ABB8F59325C554C06F10D4F9032B4540ABB8F59325C554C06F10D4F9032B4540BAABD1C725C554C00C9ECFD4032B4540BAABD1C725C554C00C9ECFD4032B45407ACD20B626C554C0CE92192A072B4540
538bbb4a-5563-11e3-9440-12313d2775db	detroit-parcels	parcels	10005420.	3010 15TH ST	3010 15TH ST, Detroit, MI	{"address": {"number": "3010", "streetName": "15TH ST"}}	2012-10-08 00:00:00	0106000020E61000000100000001030000000100000012000000BAABD1C725C554C00C9ECFD4032B4540ABB8F59325C554C06F10D4F9032B4540ABB8F59325C554C06F10D4F9032B4540199C200320C554C0DD3CCB75072B4540199C200320C554C0DD3CCB75072B4540E0BE58CF1FC554C0B8922C93072B4540E0BE58CF1FC554C0B8922C93072B4540A133F6E01EC554C077318545042B4540A133F6E01EC554C077318545042B45406CA7AC0F1FC554C07CF66220042B45406CA7AC0F1FC554C07CF66220042B454089606C0B21C554C0F9BE70E3022B454089606C0B21C554C0F9BE70E3022B454036CEA6A524C554C096088AA4002B454036CEA6A524C554C096088AA4002B4540461449D424C554C014C20A87002B4540461449D424C554C014C20A87002B4540BAABD1C725C554C00C9ECFD4032B4540
538bd56c-5563-11e3-bbaf-12313d2775db	detroit-parcels	parcels	10005419.001	3000 15TH ST	3000 15TH ST, Detroit, MI	{"address": {"number": "3000", "streetName": "15TH ST"}}	2012-10-08 00:00:00	0106000020E6100000010000000103000000010000000E000000461449D424C554C014C20A87002B454036CEA6A524C554C096088AA4002B454036CEA6A524C554C096088AA4002B454089606C0B21C554C0F9BE70E3022B454089606C0B21C554C0F9BE70E3022B454022788BF720C554C072FA3D9E022B454022788BF720C554C072FA3D9E022B4540A199D63020C554C0953F9FE2FF2A4540A199D63020C554C0953F9FE2FF2A4540A1D7091D20C554C06972C995FF2A4540A1D7091D20C554C06972C995FF2A4540EA36E6E523C554C011B56339FD2A4540EA36E6E523C554C011B56339FD2A4540461449D424C554C014C20A87002B4540
6a960868-5563-11e3-90f2-12313d2775db	detroit-streetlights	lighting	4960	14TH 2S MARTIN L KING ES	14TH 2S MARTIN L KING ES, Detroit, MI	{}	2013-10-26 15:29:53.446928	0101000020E61000008DB8FFFF1FC554C0FD86FFFF452B4540
6a9614a2-5563-11e3-9399-12313d2775db	detroit-streetlights	lighting	5256	15TH N BUTTERNUT ES	15TH N BUTTERNUT ES, Detroit, MI	{}	2013-10-26 15:29:53.446928	0101000020E61000009D67000025C554C00177FFFF0B2B4540
6a964742-5563-11e3-9120-12313d2775db	detroit-streetlights	lighting	5089	AE  16TH S BUTTERNUT	AE  16TH S BUTTERNUT, Detroit, MI	{}	2013-10-26 15:29:53.446928	0101000020E6100000F52F000027C554C02F550000EC2A4540
6b00696a-5563-11e3-aea3-12313d2775db	detroit-streetlights	lighting	102484	MARTIN L KING WB 2W WABASH SS	MARTIN L KING WB 2W WABASH SS, Detroit, MI	{}	2013-10-26 15:29:53.446928	0101000020E6100000120F000022C554C07CF2FFFF732B4540
6b517d28-5563-11e3-a630-12313d2775db	detroit-streetlights	lighting	5310	BUTTERNUT & 15TH NW	BUTTERNUT & 15TH NW, Detroit, MI	{}	2013-10-26 15:29:53.446928	0101000020E610000068DFFFFF24C554C088C9FFFFFD2A4540
6b565d20-5563-11e3-8af8-12313d2775db	detroit-streetlights	lighting	5077	AE  14TH S MARTIN L KING	AE  14TH S MARTIN L KING, Detroit, MI	{}	2013-10-26 15:29:53.446928	0101000020E6100000BA71FFFF1EC554C0CE44FFFF672B4540
6b5661d0-5563-11e3-b39e-12313d2775db	detroit-streetlights	lighting	5080	AE  15TH N BUTTERNUT	AE  15TH N BUTTERNUT, Detroit, MI	{}	2013-10-26 15:29:53.446928	0101000020E61000006D0F000020C554C070C4FFFF192B4540
6b5a287e-5563-11e3-8ccc-12313d2775db	detroit-streetlights	lighting	94941	MARTIN L KING EB 2W WABASH NS	MARTIN L KING EB 2W WABASH NS, Detroit, MI	{}	2013-10-26 15:29:53.446928	0101000020E6100000F910000020C554C0CED2FFFF732B4540
6b5dd956-5563-11e3-8f1f-12313d2775db	detroit-streetlights	lighting	5078	AE  15TH S ASH	AE  15TH S ASH, Detroit, MI	{}	2013-10-26 15:29:53.446928	0101000020E61000008A28000027C554C09A36FFFF2B2B4540
6b5dec0c-5563-11e3-952c-12313d2775db	detroit-streetlights	lighting	5075	AE  14TH N MARTIN L KING	AE  14TH N MARTIN L KING, Detroit, MI	{}	2013-10-26 15:29:53.446928	0101000020E6100000E533000027C554C0E0B80000822B4540
\.

COPY spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text) FROM stdin;
\.

ALTER TABLE ONLY features
    ADD CONSTRAINT features_pkey PRIMARY KEY (id);
CREATE INDEX features_source_idx ON features USING btree (source);
CREATE INDEX features_timestamp_idx ON features USING btree ("timestamp");
CREATE INDEX features_type_idx ON features USING btree (type);
CREATE INDEX idx_gist_geom ON features USING gist (geom);
REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO PUBLIC;

