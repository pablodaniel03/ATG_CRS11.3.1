<%--
  "RefinementMenu" cartridge renderer.
  Mobile version.

  Includes:
    /mobile/global/util/getNavLink.jsp - Endeca-specific navigation link generator

  Required Parameters:
    contentItem
      The "RefinementMenu" content item to render.

  NOTES:
    1) The "mobileStorePrefix" request-scoped variable (request attribute), which is used here,
       is defined in the "mobilePageContainer" tag ("mobilePageContainer.tag" file).
       This variable becomes available within the <crs:mobilePageContainer> ... </crs:mobilePageContainer> block
       and in all the included pages (gadgets and Endeca cartridges).
--%>
<dsp:page>
  <dsp:importbean bean="/OriginatingRequest" var="originatingRequest"/>
  <dsp:getvalueof var="contentItem" vartype="com.endeca.infront.assembler.ContentItem" value="${originatingRequest.contentItem}"/>

  <c:if test="${not empty contentItem.refinements}">
    <endeca:previewAnchor contentItem="${contentItem}">
      <div class="refinementFacetGroupContainer" data-is-category="${contentItem.dimensionName == 'product.category'}">
        <%-- Facet group name --%>
        <span class="refinementFacetGroupName">
          <fmt:message>mobile.${not empty contentItem.dimensionName ? contentItem.dimensionName : contentItem.name}</fmt:message>
        </span>

        <ul class="refinementDataList" id="ul_${fn:replace(contentItem.name, '.', '_')}">
          <%-- Facet rows --%>
          <c:forEach var="refinement" items="${contentItem.refinements}">
            <dsp:include page="${mobileStorePrefix}/global/util/getNavLink.jsp">
              <dsp:param name="navAction" value="${refinement}"/>
            </dsp:include>
            <li onclick="CRSMA.search.applyFacet(this, '${navLink}')" role="link" aria-describedby="addId">
              <div class="refinementContent">
                <div class="refinementLabel">${refinement.label}</div>
                <div class="refinementCount">${refinement.count}</div>
              </div>
            </li>
          </c:forEach>
        </ul>

        <%-- "Show More" item --%>
        <c:set var="hasMoreLink" value="${not empty contentItem.moreLink.navigationState}"/>
        <c:if test="${hasMoreLink}">
          <dsp:include page="${mobileStorePrefix}/global/util/getNavLink.jsp">
            <dsp:param name="navAction" value="${contentItem.moreLink}"/>
          </dsp:include>
          <span class="refinementShowMoreLess">
            <a href="javascript:void(0);" onclick="document.location = CRSMA.search.setNavState('${navLink}');">
              <fmt:message key="mobile.refinement.link.showMore"/>
            </a>
          </span>
        </c:if>

        <%-- "Show Less" item --%>
        <c:set var="hasLessLink" value="${not empty contentItem.lessLink.navigationState}"/>
        <c:if test="${hasLessLink}">
          <dsp:include page="${mobileStorePrefix}/global/util/getNavLink.jsp">
            <dsp:param name="navAction" value="${contentItem.lessLink}"/>
          </dsp:include>
          <span class="refinementShowMoreLess">
            <a href="javascript:void(0);" onclick="document.location = CRSMA.search.setNavState('${navLink}');">
              <fmt:message key="mobile.refinement.link.showLess"/>
            </a>
          </span>
        </c:if>
      </div>

      <div id="addId" style="display:none">
        <fmt:message>mobile.refinement.a11y.add</fmt:message>
      </div>
    </endeca:previewAnchor>
  </c:if>
</dsp:page>
<%-- @version $Id: //hosting-blueprint/B2CBlueprint/version/11.3.1/Storefront/j2ee/store.war/mobile/cartridges/RefinementMenu/RefinementMenu.jsp#1 $$Change: 1497274 $--%>
