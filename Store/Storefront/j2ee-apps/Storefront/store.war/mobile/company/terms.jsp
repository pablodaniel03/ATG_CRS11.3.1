<%--
  This page is the company "Terms & Conditions" page.

  Page includes:
    None

  Required Parameters:
    None

  Optional Parameters:
    None

  NOTES:
    1) The "storeName" request-scoped variable (request attribute), which is used here, is defined
       in the "mobilePageContainer" tag ("mobilePageContainer.tag" file).
       This variable becomes available within the <crs:mobilePageContainer> ... </crs:mobilePageContainer> block
       and in all the included pages (gadgets and Endeca cartridges).
--%>

<%-- This is not a gadget page and does is not surrounded by the <crs:mobilePageContainer> tag,
     so we must set the storeName variable here 
--%>
<crs:getMessage var="storeName" key="common.storeName"/>
<dsp:page>
  <fmt:message var="pageTitle" key="mobile.common.privacyAndTerms"/>
  <crs:mobilePageContainer titleString="${pageTitle}">
    <jsp:body>
      <div class="infoHeader">
        <fmt:message key="mobile.company.privacyAndTerms.privacy.header"/>
      </div>
      <div class="infoContent">
        <p><crs:outMessage key="company_privacy.privacyPolicyInfo1" storeName="${storeName}"/></p>
        <p><crs:outMessage key="company_privacy.privacyPolicyInfo2"/></p>
        <p><crs:outMessage key="company_privacy.privacyPolicyDate"/></p>
      </div>

      <div class="infoHeader">
        <fmt:message key="mobile.company.privacyAndTerms.terms.header"/>
      </div>
      <div class="infoContent">
        <p><crs:outMessage key="company_terms.welcomeNote" storeName="${storeName}"/></p>
        <h3><crs:outMessage key="company_terms.siteContents"/></h3>
        <p><crs:outMessage key="company_terms.siteContentsInfo1" storeName="${storeName}"/></p>
        <p><crs:outMessage key="company_terms.siteContentsInfo2"/></p>

        <h3><crs:outMessage key="company_terms.userComment"/></h3>
        <p><crs:outMessage key="company_terms.userCommentInfo1" storeName="${storeName}"/></p>
        <p><crs:outMessage key="company_terms.userCommentInfo2"/></p>

        <h3><crs:outMessage key="company_terms.revisions"/></h3>
        <p><crs:outMessage key="company_terms.revisionInfo"/></p>
        <p><crs:outMessage key="company_terms.revisionInfo1"/></p>

        <h3><crs:outMessage key="company_terms.inaccuracyDisclaimer"/></h3>
        <p><crs:outMessage key="company_terms.inaccuracyDisclaimerInfo" storeName="${storeName}"/></p>

        <h3><crs:outMessage key="company_terms.linkToOtherWebSites"/></h3>
        <p><crs:outMessage key="company_terms.linkToOtherWebSitesInfo" storeName="${storeName}"/></p>

        <h3><crs:outMessage key="company_terms.disclaimer"/></h3>
        <p><crs:outMessage key="company_terms.disclaimerInfo" storeName="${storeName}"/></p>

        <h3><crs:outMessage key="company_terms.jurisdiction"/></h3>
        <p><crs:outMessage key="company_terms.jurisdictionInfo" storeName="${storeName}"/></p>

        <h3><crs:outMessage key="company_terms.termination"/></h3>
        <p><crs:outMessage key="company_terms.terminationInfo" storeName="${storeName}"/></p>
      </div>

      <div class="infoHeader">
        <fmt:message var="submitLabel" key="mobile.common.button.continue"/>
        <input type="submit" class="mainActionButton" value="${submitLabel}" onclick="history.back()"/>
      </div>
    </jsp:body>
  </crs:mobilePageContainer>
</dsp:page>
<%-- @version $Id: //hosting-blueprint/B2CBlueprint/version/11.3.1/Storefront/j2ee/store.war/mobile/company/terms.jsp#1 $$Change: 1497274 $ --%>
