<%--
  "HorizontalResultsList" cartridge renderer.
  Mobile version.
  
  Includes:
    /mobile/global/gadgets/productsHorizontalList.jsp - Renders the slider

  Required parameters:
    contentItem
      The "ResultsList" content item to render.

  NOTES:
    1) The "mobileStorePrefix", "siteBaseURL" request-scoped variables (request attributes), which are used here,
       are defined in the "mobilePageContainer" tag ("mobilePageContainer.tag" file).
       These variables become available within the <crs:mobilePageContainer> ... </crs:mobilePageContainer> block
       and in all the included pages (gadgets and Endeca cartridges).
--%>
<dsp:page>
  <dsp:importbean bean="/atg/store/droplet/URLProcessor"/>
  <dsp:importbean bean="/atg/multisite/Site" />
  <dsp:importbean bean="/OriginatingRequest" var="originatingRequest"/>

  <dsp:getvalueof var="contentItem" vartype="com.endeca.infront.assembler.ContentItem" value="${originatingRequest.contentItem}"/>
  <dsp:getvalueof var="totalNumRecords" value="${contentItem.totalNumRecs}"/>
  <dsp:getvalueof var="recordsPerPage" value="${contentItem.recsPerPage}" />
  <dsp:getvalueof var="firstRecordNum" value="${contentItem.firstRecNum}"/>
  <dsp:getvalueof var="lastRecordNum" value="${contentItem.lastRecNum}"/>

  <div class="horizontalResultsList">
    <%-- Display the left arrow to go to the previous page, if the user is not on the first page --%>
    <c:if test="${not empty firstRecordNum && firstRecordNum != 1}">
      <div class="navigation leftArrow">
        <%-- Determine the pagination link --%>
        <c:set var="pagingAction" value="${contentItem.pagingActionTemplate.navigationState}"/>
        <dsp:droplet name="URLProcessor">
          <dsp:param name="url" value="${pagingAction}"/>
          <dsp:param name="parameter" value="No"/>
          <dsp:param name="parameterValue" value="${firstRecordNum - recordsPerPage - 1}"/>
          <dsp:oparam name="output">
            <dsp:getvalueof var="element" param="element"/>
            <c:set var="pagingAction" value="${element}"/>
          </dsp:oparam>
        </dsp:droplet> 
        <c:set var="url" value="${siteBaseURL}${contentItem.pagingActionTemplate.contentPath}${pagingAction}"/>
        <a href="${url}" role="button" title="<fmt:message key='mobile.horizontalResultList.a11y.prev'/>"><img class="arrowImage" src="/crsdocroot/content/images/storefront/arrow_left.png"/></a>
      </div>
    </c:if>

    <%-- Display the slider --%>
    <dsp:include page="${mobileStorePrefix}/global/gadgets/productsHorizontalList.jsp">
      <dsp:param name="products" value="${contentItem.records}"/>
    </dsp:include>
  
    <%-- Display the right arrow to go to the next page, if the user is not on the last page --%>
    <c:if test="${lastRecordNum < totalNumRecords}">
      <div class="navigation rightArrow">
        <%-- Determine the pagination link --%>
        <c:set var="pagingAction" value="${contentItem.pagingActionTemplate.navigationState}"/>
        <dsp:droplet name="URLProcessor">
          <dsp:param name="url" value="${pagingAction}"/>
          <dsp:param name="parameter" value="No"/>
          <dsp:param name="parameterValue" value="${lastRecordNum}"/>
          <dsp:oparam name="output">
            <dsp:getvalueof var="element" param="element"/>
            <c:set var="pagingAction" value="${element}"/>
          </dsp:oparam>
        </dsp:droplet>
        <%-- Switch to "Results List" mode as opposed to showing the "Refinement" mode --%>
        <c:set var="pagingAction" value="${fn:replace(pagingAction, '&nav=true', '')}"/>
        <c:set var="url" value="${siteBaseURL}${contentItem.pagingActionTemplate.contentPath}${pagingAction}"/>

        <a href="${url}" role="button" title="<fmt:message key='mobile.horizontalResultList.a11y.next'/>"><img class="arrowImage" src="/crsdocroot/content/images/storefront/arrow_right.png"/></a>
      </div>
    </c:if>
  </div>
</dsp:page>
<%-- @version $Id: //hosting-blueprint/B2CBlueprint/version/11.3.1/Storefront/j2ee/store.war/mobile/cartridges/HorizontalResultsList/HorizontalResultsList.jsp#1 $$Change: 1497274 $--%>
