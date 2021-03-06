


--  @version $Id: //hosting-blueprint/B2CBlueprint/version/11.3.1/Mobile/DCS-CSR/sql/ddlgen/storeannouncements_ddl.xml#1 $$Change: 1497274 $

create table crs_store_ancmnt (
	id	varchar2(40)	not null,
	title	varchar2(254)	null,
	content	clob	null,
	creation_time	date	null,
	enabled	number(1)	not null
,constraint crs_ancmnt_key_p primary key (id));


create table crs_store_ancmnt_sts (
	store_id	varchar2(40)	not null,
	announcement_id	varchar2(40)	not null
,constraint crs_ancmnt_s_key_p primary key (announcement_id,store_id)
,constraint csr_store_ancmnt_f foreign key (announcement_id) references crs_store_ancmnt (id));

create index csr_store_ancmnt_x on crs_store_ancmnt_sts (announcement_id);



