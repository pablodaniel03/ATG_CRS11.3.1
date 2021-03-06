


--  @version $Id: //hosting-blueprint/B2CBlueprint/version/11.3.1/EStore/International/sql/ddlgen/storecontent_i18n_ddl.xml#1 $$Change: 1497274 $

create table crs_short_txt_xlate (
	asset_version	bigint	not null,
	workspace_id	varchar(40)	not null,
	branch_id	varchar(40)	not null,
	is_head	tinyint	not null,
	version_deleted	tinyint	not null,
	version_editable	tinyint	not null,
	pred_version	bigint	null,
	checkin_date	datetime	null,
	translation_id	varchar(254)	not null,
	text_type	integer	null,
	text_template	varchar(4000)	null
,constraint crs_txt_xlate_p primary key (translation_id,asset_version));

create index crs_short_txt__wsx on crs_short_txt_xlate (workspace_id);
create index crs_short_txt__cix on crs_short_txt_xlate (checkin_date);

create table crs_long_txt_xlate (
	asset_version	bigint	not null,
	translation_id	varchar(254)	not null,
	text_template	longtext	null
,constraint crs_lng_txt_xlt_p primary key (translation_id,asset_version));


create table crs_txt_txt_xlate (
	asset_version	bigint	not null,
	text_id	varchar(40)	not null,
	locale	varchar(40)	not null,
	translation_id	varchar(254)	not null
,constraint crs_txt_txt_xlt_p primary key (text_id,locale,asset_version));

create index crs_txt_xlt_tr_id on crs_txt_txt_xlate (translation_id);
commit;


