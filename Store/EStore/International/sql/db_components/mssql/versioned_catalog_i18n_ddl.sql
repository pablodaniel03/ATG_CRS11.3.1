


--  @version $Id: //hosting-blueprint/B2CBlueprint/version/11.3.1/EStore/International/sql/ddlgen/catalog_i18n_ddl.xml#1 $$Change: 1497274 $

create table crs_sku_xlate (
	asset_version	numeric(19)	not null,
	workspace_id	varchar(40)	not null,
	branch_id	varchar(40)	not null,
	is_head	tinyint	not null,
	version_deleted	numeric(1)	not null,
	version_editable	numeric(1)	not null,
	pred_version	numeric(19)	null,
	checkin_date	datetime	null,
	translation_id	varchar(40)	not null,
	display_name	varchar(254)	null,
	type	integer	null,
	description	varchar(254)	null
,constraint crs_sku_xlate_p primary key (translation_id,asset_version))

create index crs_sku_xlate_wsx on crs_sku_xlate (workspace_id)
create index crs_sku_xlate_cix on crs_sku_xlate (checkin_date)

create table crs_clothing_xlate (
	asset_version	numeric(19)	not null,
	translation_id	varchar(40)	not null,
	sku_size	varchar(254)	null,
	color	varchar(254)	null
,constraint crs_clthng_xlate_p primary key (translation_id,asset_version))


create table crs_furni_xlate (
	asset_version	numeric(19)	not null,
	translation_id	varchar(40)	not null,
	wood_finish	varchar(254)	null
,constraint crs_furni_xlate_p primary key (translation_id,asset_version))


create table crs_sku_sku_xlate (
	asset_version	numeric(19)	not null,
	sku_id	varchar(40)	not null,
	locale	varchar(40)	not null,
	translation_id	varchar(40)	not null
,constraint crs_sku_sku_xlt_p primary key (sku_id,locale,asset_version))

create index crs_sku_xlt_tr_id on crs_sku_sku_xlate (translation_id)

create table crs_prd_xlate (
	asset_version	numeric(19)	not null,
	workspace_id	varchar(40)	not null,
	branch_id	varchar(40)	not null,
	is_head	tinyint	not null,
	version_deleted	numeric(1)	not null,
	version_editable	numeric(1)	not null,
	pred_version	numeric(19)	null,
	checkin_date	datetime	null,
	translation_id	varchar(40)	not null,
	display_name	varchar(254)	null,
	description	varchar(254)	null,
	long_description	varchar(4000)	null,
	brief_description	varchar(254)	null,
	promo_tagline	varchar(254)	null,
	usage_instructions	varchar(4000)	null
,constraint crs_prd_xlate_p primary key (translation_id,asset_version))

create index crs_prd_xlate_wsx on crs_prd_xlate (workspace_id)
create index crs_prd_xlate_cix on crs_prd_xlate (checkin_date)

create table crs_prd_prd_xlate (
	asset_version	numeric(19)	not null,
	product_id	varchar(40)	not null,
	locale	varchar(40)	not null,
	translation_id	varchar(40)	not null
,constraint crs_prd_prd_xlt_p primary key (product_id,locale,asset_version))

create index crs_prd_xlt_tr_id on crs_prd_prd_xlate (translation_id)

create table crs_prd_xlate_kwr (
	asset_version	numeric(19)	not null,
	translation_id	varchar(40)	not null,
	sequence_num	integer	not null,
	keyword	varchar(254)	not null
,constraint crs_prd_xlt_kwr_p primary key (translation_id,sequence_num,asset_version))

create index crs_prd_xlt_kwr_tr on crs_prd_xlate_kwr (translation_id)

create table crs_prd_xlate_tips (
	asset_version	numeric(19)	not null,
	translation_id	varchar(40)	not null,
	sequence_num	integer	not null,
	tip_text	varchar(2000)	not null
,constraint crs_prd_xlt_tips_p primary key (translation_id,sequence_num,asset_version))

create index crs_prd_xlt_tips_t on crs_prd_xlate_tips (translation_id)

create table crs_cat_xlate (
	asset_version	numeric(19)	not null,
	workspace_id	varchar(40)	not null,
	branch_id	varchar(40)	not null,
	is_head	tinyint	not null,
	version_deleted	numeric(1)	not null,
	version_editable	numeric(1)	not null,
	pred_version	numeric(19)	null,
	checkin_date	datetime	null,
	translation_id	varchar(40)	not null,
	display_name	varchar(254)	null,
	description	varchar(254)	null,
	long_description	varchar(4000)	null
,constraint crs_cat_xlate_p primary key (translation_id,asset_version))

create index crs_cat_xlate_wsx on crs_cat_xlate (workspace_id)
create index crs_cat_xlate_cix on crs_cat_xlate (checkin_date)

create table crs_cat_cat_xlate (
	asset_version	numeric(19)	not null,
	category_id	varchar(40)	not null,
	locale	varchar(40)	not null,
	translation_id	varchar(40)	not null
,constraint crs_cat_cat_xlt_p primary key (category_id,locale,asset_version))

create index crs_cat_xlt_tr_id on crs_cat_cat_xlate (translation_id)

create table crs_cat_xlate_kwr (
	asset_version	numeric(19)	not null,
	translation_id	varchar(40)	not null,
	sequence_num	integer	not null,
	keyword	varchar(254)	not null
,constraint crs_cat_tr_kwr_p primary key (translation_id,sequence_num,asset_version))

create index crs_cat_xlt_kwr_tr on crs_cat_xlate_kwr (translation_id)

create table crs_fea_xlate (
	asset_version	numeric(19)	not null,
	workspace_id	varchar(40)	not null,
	branch_id	varchar(40)	not null,
	is_head	tinyint	not null,
	version_deleted	numeric(1)	not null,
	version_editable	numeric(1)	not null,
	pred_version	numeric(19)	null,
	checkin_date	datetime	null,
	translation_id	varchar(40)	not null,
	feature_name	varchar(254)	null,
	display_name	varchar(254)	null,
	description	varchar(254)	null,
	long_description	varchar(4000)	null
,constraint crs_fea_xlate_p primary key (translation_id,asset_version))

create index crs_fea_xlate_wsx on crs_fea_xlate (workspace_id)
create index crs_fea_xlate_cix on crs_fea_xlate (checkin_date)

create table crs_fea_fea_xlate (
	asset_version	numeric(19)	not null,
	feature_id	varchar(40)	not null,
	locale	varchar(40)	not null,
	translation_id	varchar(40)	not null
,constraint crs_fea_fea_xlt_p primary key (feature_id,locale,asset_version))

create index crs_fea_xlt_tr_id on crs_fea_fea_xlate (translation_id)

create table crs_asi_xlate (
	asset_version	numeric(19)	not null,
	workspace_id	varchar(40)	not null,
	branch_id	varchar(40)	not null,
	is_head	tinyint	not null,
	version_deleted	numeric(1)	not null,
	version_editable	numeric(1)	not null,
	pred_version	numeric(19)	null,
	checkin_date	datetime	null,
	translation_id	varchar(40)	not null,
	display_name	varchar(254)	null,
	description	varchar(254)	null,
	source_name	varchar(254)	null
,constraint crs_asi_xlate_p primary key (translation_id,asset_version))

create index crs_asi_xlate_wsx on crs_asi_xlate (workspace_id)
create index crs_asi_xlate_cix on crs_asi_xlate (checkin_date)

create table crs_asi_asi_xlate (
	asset_version	numeric(19)	not null,
	seen_in_id	varchar(40)	not null,
	locale	varchar(40)	not null,
	translation_id	varchar(40)	not null
,constraint crs_asi_asi_xlt_p primary key (seen_in_id,locale,asset_version))

create index crs_asi_xlt_tr_id on crs_asi_asi_xlate (translation_id)

create table crs_prmcnt_xlate (
	asset_version	numeric(19)	not null,
	workspace_id	varchar(40)	not null,
	branch_id	varchar(40)	not null,
	is_head	tinyint	not null,
	version_deleted	numeric(1)	not null,
	version_editable	numeric(1)	not null,
	pred_version	numeric(19)	null,
	checkin_date	datetime	null,
	translation_id	varchar(40)	not null,
	display_name	varchar(254)	null,
	store_display_name	varchar(254)	null,
	description	varchar(1000)	null,
	long_description	varchar(4000)	null,
	link_text	varchar(256)	null,
	link_url	varchar(256)	null
,constraint crs_prmcnt_xlate_p primary key (translation_id,asset_version))

create index crs_prmcnt_xla_wsx on crs_prmcnt_xlate (workspace_id)
create index crs_prmcnt_xla_cix on crs_prmcnt_xlate (checkin_date)

create table crs_prmcnt_prmcnt_xlate (
	asset_version	numeric(19)	not null,
	promo_id	varchar(40)	not null,
	locale	varchar(40)	not null,
	translation_id	varchar(40)	not null
,constraint crs_prmcnt_xlt_p primary key (promo_id,locale,asset_version))

create index crs_prmcnt_xlt_tr_id on crs_prmcnt_prmcnt_xlate (translation_id)


go
