


--  @version $Id: //hosting-blueprint/B2CBlueprint/version/11.3.1/EStore/International/sql/ddlgen/multisite_i18n_ddl.xml#1 $$Change: 1497274 $

create table crs_i18n_site_attr (
	id	varchar2(40)	not null,
	default_lang	varchar2(2)	null
,constraint crs_i18nsite_pattr primary key (id)
,constraint crs_i18nsite_fattr foreign key (id) references site_configuration (id));




