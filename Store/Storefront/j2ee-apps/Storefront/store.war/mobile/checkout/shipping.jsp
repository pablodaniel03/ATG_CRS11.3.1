<%--
  Renders the user Shipping addresses for selection in "Checkout".

  Page includes:
    /mobile/checkout/shippingInitialize.jsp - Shipping data initialization
    /mobile/checkout/shippingAddresses.jsp - List of saved addresses
    /mobile/address/checkoutAddressDetail.jsp - "Add Shipping Address" form

  Required parameters:
    None

  Optional parameters:
    None

  NOTES:
    1) The "mobileStorePrefix" request-scoped variable (request attribute), which is used here,
       is defined in the "mobilePageContainer" tag ("mobilePageContainer.tag" file).
       This variable becomes available within the <crs:mobilePageContainer> ... </crs:mobilePageContainer> block
       and in all the included pages (gadgets and Endeca cartridges).
--%>
<dsp:page>
  <dsp:importbean bean="/atg/commerce/order/purchase/RepriceOrderDroplet"/>
  <dsp:importbean bean="/atg/commerce/order/purchase/ShippingGroupFormHandler"/>

  <dsp:getvalueof var="mobileStorePrefix" bean="/atg/store/StoreConfiguration.mobileStorePrefix"/>

  <%-- Reprice before any page rendering occurs --%>
  <dsp:droplet name="RepriceOrderDroplet">
    <dsp:param name="pricingOp" value="ITEMS"/>
  </dsp:droplet>

  <%-- If the order has any hard goods shipping groups, figure out which hard goods page to use --%>
  <dsp:getvalueof var="anyHardgoodShippingGroups" vartype="java.lang.Boolean" bean="ShippingGroupFormHandler.anyHardgoodShippingGroups"/>
  <c:choose>
    <c:when test="${anyHardgoodShippingGroups}">
      <%--
        "shippingInitialize.jsp" returns the following parameters:
          permittedAddresses
            Contains the permitted Shipping addresses
      --%>
      <dsp:include page="shippingInitialize.jsp"/>

      <c:choose>
        <c:when test="${not empty permittedAddresses}">
          <dsp:include page="shippingAddresses.jsp">
            <dsp:param name="permittedAddresses" value="${permittedAddresses}"/>
          </dsp:include>
        </c:when>
        <c:otherwise>
          <dsp:include page="${mobileStorePrefix}/address/checkoutAddressDetail.jsp">
            <dsp:param name="addrOper" value="add"/>
            <dsp:param name="addrType" value="shipping"/>
          </dsp:include>
        </c:otherwise>
      </c:choose>
    </c:when>
    <c:otherwise>
      <%-- If there are nothing to buy - redirect to Shopping Cart --%>
      <c:redirect url="../cart/cart.jsp"/>
    </c:otherwise>
  </c:choose>
</dsp:page>
<%-- @version $Id: //hosting-blueprint/B2CBlueprint/version/11.3.1/Storefront/j2ee/store.war/mobile/checkout/shipping.jsp#1 $$Change: 1497274 $--%>
