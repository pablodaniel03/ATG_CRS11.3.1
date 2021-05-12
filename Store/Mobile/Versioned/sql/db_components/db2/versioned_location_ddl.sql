


--  @version $Id: //hosting-blueprint/B2CBlueprint/version/11.3.1/Mobile/sql/ddlgen/location_ddl.xml#1 $$Change: 1497274 $

create table crs_ibeacon_alert (
	asset_version	numeric(19)	not null,
	workspace_id	varchar(40)	not null,
	branch_id	varchar(40)	not null,
	is_head	numeric(1)	not null,
	version_deleted	numeric(1)	not null,
	version_editable	numeric(1)	not null,
	pred_version	numeric(19)	default null,
	checkin_date	timestamp	default null,
	alert_id	varchar(40)	not null,
	name	varchar(254)	default null,
	alert_text	varchar(160)	default null,
	alert_key	varchar(254)	default null,
	link_url	varchar(254)	default null,
	is_push	numeric(1,0)	default null
,constraint crsbeaconalert_pk primary key (alert_id,asset_version));

create index crs_ibeacon_al_wsx on crs_ibeacon_alert (workspace_id);
create index crs_ibeacon_al_cix on crs_ibeacon_alert (checkin_date);

create table crs_ibeacon (
	asset_version	numeric(19)	not null,
	workspace_id	varchar(40)	not null,
	branch_id	varchar(40)	not null,
	is_head	numeric(1)	not null,
	version_deleted	numeric(1)	not null,
	version_editable	numeric(1)	not null,
	pred_version	numeric(19)	default null,
	checkin_date	timestamp	default null,
	ibeacon_id	varchar(40)	not null,
	name	varchar(254)	default null,
	uuid	varchar(254)	not null,
	major	varchar(254)	default null,
	minor	varchar(254)	default null,
	identifier	varchar(254)	default null
,constraint crsbeacon_pk primary key (ibeacon_id,asset_version));

create index crs_ibeacon_wsx on crs_ibeacon (workspace_id);
create index crs_ibeacon_cix on crs_ibeacon (checkin_date);

create table crs_ibcn_stores (
	sec_asset_version	numeric(19)	not null,
	asset_version	numeric(19)	not null,
	ibeacon_id	varchar(40)	not null,
	location_id	varchar(40)	not null
,constraint crsibcnstores_pk primary key (ibeacon_id,location_id,asset_version,sec_asset_version));


create table crs_ibcnalrt_entr (
	asset_version	numeric(19)	not null,
	ibeacon_id	varchar(40)	not null,
	alert_id	varchar(40)	not null,
	sequence_num	integer	not null
,constraint crsibcnalrtentr_p primary key (ibeacon_id,sequence_num,asset_version));


create table crs_ibcnalrt_exit (
	asset_version	numeric(19)	not null,
	ibeacon_id	varchar(40)	not null,
	alert_id	varchar(40)	not null,
	sequence_num	integer	not null
,constraint crsibcnalrtexit_p primary key (ibeacon_id,sequence_num,asset_version));

commit;


