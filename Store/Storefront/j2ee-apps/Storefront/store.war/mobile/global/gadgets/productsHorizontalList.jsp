<%--
  This gadgets is intended to be a universal one for rendering a list of products in a slider. The including
  page will only have to provide a list of records and the page will know how to read them based on their
  class name.

  It is currently used in different pages in the application to render different types of records. For
  example it renders Related Products(GSAItem), Recently Viewed products (GSAItem), Featured Items
  specified by a targeter (Entry), items specified in a HorizontalSpotlight cartridge(Record), and items
  specified in a HorizontalResultList cartridge (Record).

  Required parameters:
    products
      List of products to render.

  Optional parameters:
    index
      The index of the slider. This is only needed if there are more than one slider on the page.

  NOTES:
    1) The "mobileStorePrefix" request-scoped variable (request attribute), which is used here,
       is defined in the "mobilePageContainer" tag ("mobilePageContainer.tag" file).
       This variable becomes available within the <crs:mobilePageContainer> ... </crs:mobilePageContainer> block
       and in all the included pages (gadgets and Endeca cartridges).
--%>
<dsp:page>
  <dsp:importbean bean="/atg/commerce/catalog/ProductLookup" />
  <dsp:importbean bean="/atg/userprofiling/Profile" />
  <%-- Request parameters - to variables --%>
  <dsp:getvalueof var="products" param="products" />

  <dsp:getvalueof var="index" param="index" />
  <c:if test="${empty index}">
    <c:set var="index" value="1" />
  </c:if>

  <dsp:getvalueof var="itemDetail" param="itemDetail" />
  <c:if test="${not empty itemDetail}">
    <c:set var="classDetail" value="details" />
  </c:if>

  <div class="itemsContainer ${classDetail}">
    <div id="horizontalContainer${index}">
      <c:forEach var="record" items="${products}">
        <div class="cell">
          <c:choose>
            <c:when test="${record.getClass().name == 'atg.adapter.gsa.GSAItem' || record.getClass().name == 'java.util.HashMap$Entry'}">
              <c:choose>
                <c:when test="${record.getClass().name == 'java.util.HashMap$Entry'}">
                  <dsp:param name="product" value="${record.value}" />
                </c:when>
                <c:otherwise>
                  <dsp:param name="product" value="${record}" />
                  <c:if test="${fn:startsWith(record, 'recentlyViewed')}">
                    <dsp:param name="product" value="${record.product}" />
                  </c:if>
                </c:otherwise>
              </c:choose>
              
              <dsp:getvalueof var="productImageUrl" param="product.smallImage.url"/>
              <dsp:getvalueof var="productName" param="product.displayName"/>
              
              <%-- Generates URL for the product, the URL is stored in the "productUrl" request-scoped variable --%>
              <dsp:include page="${mobileStorePrefix}/global/gadgets/productLinkGenerator.jsp">
                <dsp:param name="product" param="product" />
              </dsp:include>
            </c:when>
            <c:when test="${record.getClass().name == 'com.endeca.infront.cartridge.model.Record' || record.getClass().name == 'atg.adapter.version.CurrentVersionItem'}">
              <%-- Save the product's repository id so it can be used later to lookup the product from the database --%>
              <c:set var="productId">
                <c:choose>
                  <c:when test="${record.getClass().name == 'com.endeca.infront.cartridge.model.Record'}">${record.attributes['product.repositoryId']}</c:when>
                  <c:when test="${record.getClass().name == 'atg.adapter.version.CurrentVersionItem'}">${record.repositoryId}</c:when>
                </c:choose>
              </c:set>

              <%--
                Get the product item using the repository id which we fetched earlier.

                Input Parameters:
                  id
                    The ID of the product we want to look up.

                Open Parameters:
                  output
                    Serviced when no errors occur.

                Output Parameters:
                  element
                    The product whose ID matches the 'id' input parameter.
              --%>
              <dsp:droplet name="ProductLookup">
                <dsp:param name="id" value="${productId}" />
                <dsp:param name="filterBySite" value="false" />
                <dsp:param name="filterByCatalog" value="false" />

                <dsp:oparam name="output">
                  <dsp:setvalue param="product" paramvalue="element" />
                  <dsp:getvalueof var="templateUrl" param="product.template.url" />
                  <%-- Display only products with properly configured template --%>
                  <c:if test="${not empty templateUrl}">                    
                    <dsp:getvalueof var="productImageUrl" param="product.smallImage.url" />
                    <dsp:getvalueof var="productName" param="product.displayName" />

                    <%-- Generate the product's URL. The value will be stored in the "productUrl" request-scoped variable --%>
                    <dsp:include page="${mobileStorePrefix}/global/gadgets/productLinkGenerator.jsp">
                      <dsp:param name="product" param="product" />
                    </dsp:include>
                  </c:if>
                </dsp:oparam>
              </dsp:droplet>
            </c:when>
            <%-- This is the case the products are in atg.contents.items format --%>
            <c:otherwise>
              <c:set var="productId" value="${record.repositoryId}"/>
              <c:set var="productImageUrl" value="${record.thumbnailImage.url}"/>
              <c:set var="productName" value="${record.displayName}"/>
              <dsp:droplet name="ProductLookup">
                <dsp:param name="id" value="${productId}" />
                <dsp:param name="filterBySite" value="false" />
                <dsp:param name="filterByCatalog" value="false" />

                <dsp:oparam name="output">
                  <dsp:setvalue param="product" paramvalue="element" />
                  <%-- Generate the product's URL. The value will be stored in the "productUrl" request-scoped variable --%>
                  <dsp:include page="${mobileStorePrefix}/global/gadgets/productLinkGenerator.jsp">
                    <dsp:param name="product" param="product" />
                  </dsp:include>
                </dsp:oparam>
              </dsp:droplet>
            </c:otherwise>
          </c:choose>
          
          <%-- If the itemDetail is true, then set url and image accordingly --%>
          <c:if test="${not empty itemDetail}">
            <div class="productSite">
              <dsp:getvalueof var="currentSiteId" bean="/atg/multisite/Site.id"/>
              <c:if test="${currentSiteId != record.siteId}">
                  <c:out value="${record.siteName}"/>
              </c:if>
            </div>
          </c:if>
          
          <%-- Ensure there is an image for the product --%>
          <c:if test="${empty productImageUrl}">
            <c:set var="productImageUrl" value="/crsdocroot/content/images/products/small/MissingProduct_small.jpg" />
          </c:if>

          <%-- Display the clickable image --%>
          <a href="${fn:escapeXml(productUrl)}">
            <div class="productImage">
              <img src="${productImageUrl}" alt="${productName}" class="cellImage" />
            </div>
            
            <dsp:getvalueof var="profileSalePriceList" bean="Profile.salePriceList" />
            <c:if test="${not empty itemDetail}">
              <c:set var="productTitle" value="${record.displayName}"/>
              <fmt:parseNumber var="highestListPrice" value="${record.highestListPrice}"/>
              <fmt:parseNumber var="lowestListPrice" value="${record.lowestListPrice}"/>
              <fmt:parseNumber var="lowestSalePrice" value="${record.lowestSalePrice}"/>
              <fmt:parseNumber var="highestSalePrice" value="${record.highestSalePrice}"/>
              
              <span class="productTitle">
                <c:out value="${record.displayName}" />
              </span>
              
              <c:choose>
                <c:when test="${highestListPrice != highestSalePrice || lowestListPrice != lowestSalePrice}">
                  <c:set var="salePriceClass" value="itemDetailSalePrice" />  
                  <c:set var="itemOnSale" value="true"/>   
                </c:when>
                <c:otherwise>
                  <c:set var="salePriceClass" value="" />  
                  <c:set var="itemOnSale" value=""/>   
                </c:otherwise>              
              </c:choose>
              
              <span class="productPrice ${salePriceClass}">
                <dsp:include page="/global/gadgets/formattedPrice.jsp">
                  <dsp:param name="price" value="${lowestSalePrice}" />
                </dsp:include>
                <c:if test="${not empty itemOnSale}">
                  <fmt:message key="mobile.common.sale" />
                </c:if>
                
            </c:if>
          </a>
        </div>
      </c:forEach>
    </div>
  </div>

  <script>
    $(document).ready(function() {
      CRSMA.horizontallist.initHorizontalListSliders();
    });
  </script>
</dsp:page>
<%-- @version $Id: //hosting-blueprint/B2CBlueprint/version/11.3.1/Storefront/j2ee/store.war/mobile/global/gadgets/productsHorizontalList.jsp#1 $$Change: 1497274 $--%>
