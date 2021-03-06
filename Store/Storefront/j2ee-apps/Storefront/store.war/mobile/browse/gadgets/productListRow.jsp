<%--
  This JSP renders single row in product search results pages.

  Page includes:
    /mobile/global/gadgets/productLinkGenerator.jsp - Product link generator
    /global/gadgets/formattedPrice.jsp - Price formatter

  Required parameters:
    product
      Product repository item whose details are displayed

  Optional parameters:
    None

  NOTES:
    1) The "mobileStorePrefix" request-scoped variable (request attribute), which is used here,
       is defined in the "mobilePageContainer" tag ("mobilePageContainer.tag" file).
       This variable becomes available within the <crs:mobilePageContainer> ... </crs:mobilePageContainer> block
       and in all the included pages (gadgets and Endeca cartridges).
--%>
<dsp:page>
  <dsp:importbean bean="/atg/commerce/pricing/priceLists/PriceDroplet"/>
  <dsp:importbean bean="/atg/userprofiling/Profile"/>

  <dsp:include page="${mobileStorePrefix}/global/gadgets/productLinkGenerator.jsp">
    <dsp:param name="product" param="product"/>
  </dsp:include>

  <li class="icon-ArrowRight" id="searchItem">
    <dsp:a href="${fn:escapeXml(productUrl)}" class="listRowLink">
      <span class="searchResult">
        <dsp:getvalueof var="productName" param="product.displayName"/>
        <dsp:getvalueof var="productImageUrl" param="product.thumbnailImage.url"/>

        <c:if test="${empty productImageUrl}">
          <c:set var="productImageUrl" value="/crsdocroot/content/images/products/thumb/MissingProduct_thumb.jpg"/>
        </c:if>

        <img src="${productImageUrl}" alt="${productName}"/>

        <p class="searchResultProduct">
          <span class="productName"><c:out value="${productName}"/></span>
          <%--
            The 1-st call to price droplet is going to get the price from the profile price list
            or the default price list.
          --%>
          <dsp:droplet name="PriceDroplet">
            <dsp:param name="product" param="product"/>
            <dsp:param name="sku" param="product.childSKUs[0]"/>

            <dsp:oparam name="output">
              <dsp:setvalue param="theListPrice" paramvalue="price"/>
              <%-- Is there a sale price? --%>
              <dsp:getvalueof var="profileSalePriceList" bean="Profile.salePriceList"/>
              <c:choose>
                <c:when test="${not empty profileSalePriceList}">
                  <dsp:droplet name="PriceDroplet">
                    <dsp:param name="priceList" bean="Profile.salePriceList"/>

                    <dsp:oparam name="output">
                      <dsp:getvalueof var="listPrice" vartype="java.lang.Double" param="price.listPrice"/>
                      <dsp:getvalueof var="price" vartype="java.lang.Double" param="theListPrice.listPrice"/>
                      <span class="productPrice">
                        <dsp:include page="/global/gadgets/formattedPrice.jsp">
                          <dsp:param name="price" value="${listPrice}"/>
                        </dsp:include>
                      </span>
                      <span class="oldPrice">
                        <fmt:message key="mobile.common.priceWas"/><span> </span>
                        <dsp:include page="/global/gadgets/formattedPrice.jsp">
                          <dsp:param name="price" value="${price}"/>
                        </dsp:include>
                      </span>
                    </dsp:oparam>

                    <dsp:oparam name="empty">
                      <dsp:getvalueof var="price" vartype="java.lang.Double" param="theListPrice.listPrice"/>
                      <span class="productPrice">
                        <dsp:include page="/global/gadgets/formattedPrice.jsp">
                          <dsp:param name="price" value="${price}"/>
                        </dsp:include>
                      </span>
                    </dsp:oparam>
                  </dsp:droplet>
                </c:when>
                <c:otherwise>
                  <c:out value="otherwise"/>
                  <span class="productPrice">
                    <dsp:include page="/global/gadgets/formattedPrice.jsp">
                      <dsp:param name="price" value="${price}"/>
                    </dsp:include>
                  </span>
                </c:otherwise>
              </c:choose>
            </dsp:oparam>
          </dsp:droplet>
        </p>
      </span>
      <div class="shadow">&nbsp;</div>
    </dsp:a>
  </li>
</dsp:page>
<%-- @version $Id: //hosting-blueprint/B2CBlueprint/version/11.3.1/Storefront/j2ee/store.war/mobile/browse/gadgets/productListRow.jsp#1 $$Change: 1497274 $--%>
