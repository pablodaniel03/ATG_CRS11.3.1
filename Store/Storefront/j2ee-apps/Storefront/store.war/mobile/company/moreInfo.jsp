<%--
  This page displays settings and link to additional into of the Merchant (privacy & terms, shipping & returns, etc).

  Page includes:
    /mobile/includes/gadgets/phone.jsp - "Phone" link page
    /mobile/includes/gadgets/email.jsp - "Email" link page

  Required parameters:
    None

  Optional parameters:
    None

  NOTES:
    1) The "mobileStorePrefix", "siteContextPath" request-scoped variables (request attributes), which are used here,
       are defined in the "mobilePageContainer" tag ("mobilePageContainer.tag" file).
       These variables become available within the <crs:mobilePageContainer> ... </crs:mobilePageContainer> block
       and in all the included pages (gadgets and Endeca cartridges).
--%>
<dsp:page>
  <dsp:getvalueof var="storeLocationsPath" bean="/atg/endeca/assembler/cartridge/manager/LocationActionPathProvider.defaultExperienceManagerNavigationActionPath"/>
  <dsp:importbean bean="/atg/dynamo/droplet/ComponentExists"/>
  <dsp:importbean bean="/atg/dynamo/servlet/dafpipeline/MobileDetectionInterceptor"/>
  <dsp:importbean bean="/atg/multisite/Site"/> 
  <dsp:getvalueof var="currentSite" bean="Site.name"/>

  <fmt:message var="pageTitle" key="mobile.moreInfo.pageTitle"/>
  <crs:mobilePageContainer titleString="${pageTitle}">
    <jsp:body>
      <div class="dataContainer">
        <ul class="dataList">
          <li>
            <%-- "Contact Us" --%>
            <div class="contactUsPart">
              <span><fmt:message key="mobile.common.button.contactUs"/></span>
            </div>
            <%-- "Phone" --%>
            <div class="contactUsPart">
              <dsp:include page="${mobileStorePrefix}/includes/gadgets/phone.jsp"/>
            </div>
            <%-- "Email" --%>
            <div class="contactUsPart">
              <dsp:include page="${mobileStorePrefix}/includes/gadgets/email.jsp"/>
            </div>
          </li>
          <%-- "MyAccount" --%>
          <li>
            <dsp:a page="${mobileStorePrefix}/myaccount/profile.jsp" class="icon-ArrowRight">
              <span class="content"><fmt:message key="mobile.moreInfo.account"/></span>
            </dsp:a>
          </li>
          <%-- "Site" --%>
          <li>
            <dsp:a page="${mobileStorePrefix}/company/sites.jsp" class="icon-ArrowRight">
              <span class="content">
                <fmt:message key="mobile.common.label.site"/>
                <span class="currentLanguage"><dsp:valueof value="${currentSite}"/></span>
              </span>
            </dsp:a>
          </li>
          <%-- "Store Locations" --%>
          <li>
            <dsp:a page="${mobileStorePrefix}${storeLocationsPath}" class="icon-ArrowRight">
              <span class="content"><fmt:message key="mobile.moreInfo.storeLocations"/></span>
            </dsp:a>
          </li>
          <%-- Only show the "Languages" option if the "EStore.International" module is present --%>
          <dsp:droplet name="ComponentExists">
            <dsp:param name="path" value="/atg/modules/InternationalStore"/>
            <dsp:oparam name="true">
              <%-- "Languages" --%>
              <li>
                <dsp:a page="${mobileStorePrefix}/company/languages.jsp" class="icon-ArrowRight">
                  <span class="content">
                    <fmt:message key="mobile.moreInfo.languages"/>
                    <dsp:getvalueof var="requestLocale" bean="/OriginatingRequest.requestLocale"/>
                    <span class="currentLanguage"><dsp:valueof value="${requestLocale.capitalizedDisplayLanguage}"/></span>
                  </span>
                </dsp:a>
              </li>
            </dsp:oparam>
          </dsp:droplet>
          <%-- "Shipping & Returns" --%>
          <li>
            <dsp:a page="${mobileStorePrefix}/company/shipping.jsp" class="icon-ArrowRight">
              <span class="content"><fmt:message key="mobile.moreInfo.shippingAndReturns"/></span>
            </dsp:a>
          </li>
          <%-- "Privacy & Terms" --%>
          <li>
            <dsp:a page="${mobileStorePrefix}/company/terms.jsp" class="icon-ArrowRight">
              <span class="content"><fmt:message key="mobile.common.privacyAndTerms"/></span>
            </dsp:a>
          </li>
          <%-- "Go to full site" --%>
          <li>
            <dsp:getvalueof var="enableFullSiteParam" bean="MobileDetectionInterceptor.enableFullSiteParam"/>
            <dsp:a href="${siteContextPath}" class="icon-ArrowRight">
              <dsp:param name="${enableFullSiteParam}" value="true"/>
              <span class="content"><fmt:message key="mobile.moreInfo.fullSite"/></span>
            </dsp:a>
          </li>
          <%-- "About Us" --%>
          <li>
            <dsp:a page="${mobileStorePrefix}/company/aboutUs.jsp" class="icon-ArrowRight">
              <span class="content"><fmt:message key="mobile.moreInfo.aboutUs"/></span>
            </dsp:a>
          </li>
        </ul>
      </div>

      <script>
        <%-- Hide the footer on this page --%>
        $(document).ready(function() {
          $("#footer").hide();
        });
      </script>
    </jsp:body>
  </crs:mobilePageContainer>
</dsp:page>
<%-- @version $Id: //hosting-blueprint/B2CBlueprint/version/11.3.1/Storefront/j2ee/store.war/mobile/company/moreInfo.jsp#1 $$Change: 1497274 $ --%>
