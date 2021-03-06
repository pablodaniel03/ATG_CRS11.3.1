<%-- 
  Renders order "Payment Method" and "Billing Address".

  Page includes:
    /mobile/creditcard/gadgets/creditCardRenderer.jsp - Renderer of credit card info

  Required parameters:
    order
      Order which payment data need to be displayed
    isCheckout
      Indicator if this order is about to checkout or has already been placed.
      Possible values:
        'true' = is about to checkout
        'false' = placed order

  NOTES:
    1) The "mobileStorePrefix" request-scoped variable (request attribute), which is used here,
       is defined in the "mobilePageContainer" tag ("mobilePageContainer.tag" file).
       This variable becomes available within the <crs:mobilePageContainer> ... </crs:mobilePageContainer> block
       and in all the included pages (gadgets and Endeca cartridges).
--%>
<dsp:page>
  <%-- Request parameters - to variables --%>
  <%-- Get the payment group for billing address and payment method --%>
  <dsp:getvalueof var="paymentGroupRelationships" param="order.paymentGroupRelationships"/>
  <dsp:getvalueof var="order" param="order"/>
  <dsp:getvalueof var="isCheckout" param="isCheckout"/>

  <dsp:param name="paymentGroupClassType" value=""/>
  <c:forEach var="paymentGroupRelationship" items="${paymentGroupRelationships}">
    <dsp:param name="rel" value="${paymentGroupRelationship}"/>
    <dsp:setvalue param="checkPaymentGroup" paramvalue="rel.paymentGroup"/>
    <dsp:getvalueof var="paymentGroupClassType" param="checkPaymentGroup.paymentGroupClassType"/>
    <c:if test="${paymentGroupClassType == 'creditCard'}">
      <dsp:setvalue param="paymentGroup" paramvalue="checkPaymentGroup"/>
    </c:if>
  </c:forEach>

  <c:set var="linkToEditPage" value="../../checkout/billing.jsp"/>
  <fmt:message var="title" key="mobile.checkout.label.payWith"/>

  <div id="payment">
    <c:choose>
      <c:when test="${isCheckout}">
        <h2><dsp:a page="${linkToEditPage}">${title}</dsp:a></h2>
        <div class="roundedBox">
          <dsp:a page="${linkToEditPage}" title="${title}">
            <span class="content icon-ArrowRight">
              <c:choose>
                <c:when test="${paymentGroupClassType == 'creditCard'}">
                  <dsp:include page="${mobileStorePrefix}/creditcard/gadgets/creditCardRenderer.jsp">
                    <dsp:param name="creditCard" param="paymentGroup"/>
                    <dsp:param name="showFullInfo" value="true"/>
                  </dsp:include>
                </c:when>
                <c:otherwise><fmt:message key="mobile.checkout.message.paidStoreCredit"/></c:otherwise>
              </c:choose>
            </span>
          </dsp:a>
        </div>
      </c:when>
      <c:otherwise>
        <h2>${title}</h2>
        <div class="roundedBox">
          <span class="content">
            <c:choose>
              <c:when test="${order.storeCreditsAppliedTotal < order.priceInfo.total}">
                <dsp:include page="${mobileStorePrefix}/creditcard/gadgets/creditCardRenderer.jsp">
                  <dsp:param name="creditCard" param="paymentGroup"/>
                  <dsp:param name="showFullInfo" value="true"/>
                </dsp:include>
              </c:when>
              <c:otherwise><fmt:message key="mobile.checkout.message.paidStoreCredit"/></c:otherwise>
            </c:choose>
          </span>
        </div>
      </c:otherwise>
    </c:choose>
  </div>
</dsp:page>
<%-- @version $Id: //hosting-blueprint/B2CBlueprint/version/11.3.1/Storefront/j2ee/store.war/mobile/global/gadgets/reviewPayment.jsp#1 $$Change: 1497274 $--%>
