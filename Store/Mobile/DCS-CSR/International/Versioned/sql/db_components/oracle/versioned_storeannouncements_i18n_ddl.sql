


--  @version $Id: //hosting-blueprint/B2CBlueprint/version/11.3.1/Mobile/DCS-CSR/International/sql/ddlgen/storeannouncements_i18n_ddl.xml#1 $$Change: 1497274 $

create table crs_ancmnt_cntnt_xlate (
	asset_version	number(19)	not null,
	workspace_id	varchar2(40)	not null,
	branch_id	varchar2(40)	not null,
	is_head	number(1)	not null,
	version_deleted	number(1)	not null,
	version_editable	number(1)	not null,
	pred_version	number(19)	null,
	checkin_date	timestamp	null,
	translation_id	varchar2(40)	not null,
	title	varchar2(254)	null,
	content	clob	null
,constraint crs_ancmnt_xkey_p primary key (translation_id,asset_version));

create index crs_ancmnt_cnt_wsx on crs_ancmnt_cntnt_xlate (workspace_id);
create index crs_ancmnt_cnt_cix on crs_ancmnt_cntnt_xlate (checkin_date);

create table crs_ancmnt_xlate (
	asset_version	number(19)	not null,
	announcement_id	varchar2(40)	not null,
	locale	varchar2(40)	not null,
	translation_id	varchar2(40)	not null
,constraint crs_ancmnt_xlt_p primary key (announcement_id,locale,asset_version));

create index crs_ancmnt_xlt_tr_id on crs_ancmnt_xlate (translation_id);



