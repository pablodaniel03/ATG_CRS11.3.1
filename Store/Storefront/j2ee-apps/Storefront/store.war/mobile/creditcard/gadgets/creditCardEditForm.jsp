<%--
  Renders content of credit card form, "Edit Credit Card".

  Page includes:
    /mobile/address/gadgets/addressAddEdit.jsp - Renders address form (except "Nickname" field)

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
  <%-- Request parameters - to variables --%>
  <dsp:getvalueof var="page" param="page"/>

  <dsp:importbean bean="/atg/userprofiling/ProfileFormHandler"/>
  <dsp:importbean bean="/atg/userprofiling/Profile"/>

  <%-- ========== Handle form exceptions ========== --%>
  <dsp:getvalueof var="formExceptions" bean="ProfileFormHandler.formExceptions"/>
  <jsp:useBean id="errorMap" class="java.util.HashMap"/>
  <c:if test="${not empty formExceptions}">
    <c:forEach var="formException" items="${formExceptions}">
      <c:set var="errorCode" value="${formException.errorCode}"/>
      <c:set var="propertyName" value="${formException.propertyName}"/>
      <%--
        "Nickname" may have different names: "newNickname", "creditCardNickname"
      --%>
      <c:if test="${propertyName == 'newNickname'}">
        <c:set var="propertyName" value="creditCardNickname"/>
      </c:if>
      <c:choose>
        <c:when test="${errorCode == 'missingRequiredValue'}">
          <c:set target="${errorMap}" property="${propertyName}" value="mandatoryField"/>
        </c:when>
        <c:when test="${errorCode == 'errorInvalidCreditCard'}">
          <c:set target="${errorMap}" property="${propertyName}" value="invalidValue"/>
        </c:when>
        <c:when test="${errorCode == 'errorDuplicateCCNickname'}">
          <c:set target="${errorMap}" property="${propertyName}" value="duplicate"/>
        </c:when>
      </c:choose>
    </c:forEach>
  </c:if>

  <ul class="dataList" summary="" role="presentation" datatable="0">
    <li>
      <%-- "Nickname" --%>
      <div class="left65 ${not empty errorMap['creditCardNickname'] ? 'errorState' : ''}">
        <span class="content">
          <dsp:input type="hidden" bean="ProfileFormHandler.editValue.nickname"/>
          <fmt:message var="nicknameLabel" key="mobile.creditcard.input.placeholder.nickName"/>
          <dsp:input bean="ProfileFormHandler.editValue.newNickname" placeholder="${nicknameLabel}" aria-label="${nicknameLabel}"
                     type="text" required="true" maxlength="42"/>
        </span>
        <c:if test="${not empty errorMap['creditCardNickname']}">
          <span class="errorMessage">
            <fmt:message key="mobile.common.error.${errorMap['creditCardNickname']}"/>
          </span>
        </c:if>
      </div>
      <%-- "Credit Card Type" + "Credit Card last 4 numbers" --%>
      <dsp:getvalueof var="creditCardType" bean="ProfileFormHandler.editValue.creditCardType" vartype="java.lang.String"/>
      <fmt:message var="creditCardType" key="mobile.creditcard.dropdown.${creditCardType}"/>

      <dsp:getvalueof var="creditCardNumber" bean="ProfileFormHandler.editValue.creditCardNumber"/>
      <c:set var="creditCardNumberLength" value="${fn:length(creditCardNumber)}"/>
      <c:set var="creditCardLastNumbers" value="${fn:substring(creditCardNumber, creditCardNumberLength - 4, creditCardNumberLength)}"/>
      <div class="right35">
        <div style="padding: 0.5em 0.2em 0.2em 0.2em">
          <label class="hint">${creditCardType} <fmt:message key="mobile.common.ellipsis"/> ${creditCardLastNumbers}</label>
        </div>
      </div>
    </li>
    <li ${not empty errorMap['expirationMonth'] || not empty errorMap['expirationYear'] ? 'class="errorState"' : ''}>
      <%-- "Expiration Date" --%>
      <div class="left40">
        <div class="content">
          <label class="hint left"><fmt:message key="mobile.creditcard.label.expirationDate"/></label>
        </div>
      </div>
      <div class="right60">
        <div class="content">
          <div class="month">
            <label for="cardExpirationDateMonthSelect" onclick=""/>
            <%-- This makes VoiceOver to pausing before select element reading --%>
            <dsp:getvalueof var="monthValue" bean="ProfileFormHandler.editValue.expirationMonth"/>
            <dsp:select id="cardExpirationDateMonthSelect" bean="ProfileFormHandler.editValue.expirationMonth"
                        required="true" class="selectForm ${empty monthValue ? 'default' : ''}"
                        onchange="CRSMA.myaccount.changeDropdown(event)">
              <dsp:option value=""><fmt:message key="mobile.common.month"/></dsp:option>
              <%-- Display months --%>
              <c:forEach var="count" begin="1" end="12" step="1">
                <dsp:option value="${count}"><fmt:message key="mobile.common.month${count}"/></dsp:option>
              </c:forEach>
            </dsp:select>
          </div>
          <div class="dateDelimiter"><label class="hint">/&nbsp;</label></div>
          <div class="year">
            <dsp:getvalueof var="yearValue" bean="ProfileFormHandler.editValue.expirationMonth"/>
            <crs:yearList numberOfYears="16"
                          bean="/atg/userprofiling/ProfileFormHandler.editValue.expirationYear"
                          selectRequired="true" yearString="true" iclass="selectForm ${empty yearValue ? 'default' : ''}"
                          onchange="CRSMA.myaccount.changeDropdown(event)"/>
          </div>
        </div>
        <c:choose>
          <c:when test="${not empty errorMap['expirationMonth']}">
            <span class="errorMessage"><fmt:message key="mobile.common.error.${errorMap['expirationMonth']}"/></span>
          </c:when>
          <c:when test="${not empty errorMap['expirationYear']}">
            <span class="errorMessage"><fmt:message key="mobile.common.error.${errorMap['expirationYear']}"/></span>
          </c:when>
        </c:choose>
      </div>
    </li>

    <%-- Default card --%>
    <dsp:getvalueof var="targetCardKey" vartype="java.lang.String" bean="ProfileFormHandler.editCard"/>
    <%-- "ProfileFormHandler.editCard" has been previously set in caller page (credit cards list) --%>
    <dsp:getvalueof var="userCards" vartype="java.util.Map" bean="Profile.creditCards"/>
    <dsp:getvalueof var="defaultCardId" vartype="java.lang.String" bean="Profile.defaultCreditCard.id"/>

    <c:choose>
      <c:when test="${page == 'myaccount'}">
        <li>
          <div class="content">
            <dsp:input type="checkbox" bean="ProfileFormHandler.editValue.newCreditCard"
                       checked="${defaultCardId == userCards[targetCardKey].repositoryId}" id="defaultCreditCard"/>
            <label for="defaultCreditCard" onclick=""><fmt:message key="mobile.creditcard.label.defaultCard"/></label>
          </div>
        </li>
      </c:when>
      <c:when test="${page == 'checkout'}">
        <dsp:input type="hidden" bean="ProfileFormHandler.editValue.newCreditCard" value="${defaultCardId == userCards[targetCardKey].repositoryId}"/>
      </c:when>  
      <c:otherwise/>
    </c:choose>

    <li>
      <%-- "Delete" button --%>
      <div class="deleteContainer">
        <fmt:message var="deleteText" key="mobile.creditcard.link.deleteCard"/>
        <div role="button" onclick="CRSMA.common.removeItemDialog($(this).parent());" title="${deleteText}" class="icon-Remove">
          ${deleteText}
        </div>
      </div>
    </li>
  </ul>

  <ul class="dataList" summary="" role="presentation" datatable="0">
    <%-- "Address" form --%>
    <dsp:include page="${mobileStorePrefix}/address/gadgets/addressAddEdit.jsp">
      <dsp:param name="formHandlerComponent" value="atg/userprofiling/ProfileFormHandler.billAddrValue"/>
      <dsp:param name="restrictionDroplet" value="/atg/store/droplet/ShippingRestrictionsDroplet"/>
      <dsp:param name="errorMap" value="${errorMap}"/>
    </dsp:include>
  </ul>

  <%-- "Submit" button --%>
  <div class="centralButton">
    <fmt:message var="submitLabel" key="mobile.creditcard.button.save"/>
    <dsp:input bean="ProfileFormHandler.updateCard" type="hidden" value="true"/>
    <input type="submit" class="mainActionButton" value="${submitLabel}"/>
  </div>
</dsp:page>
<%-- @version $Id: //hosting-blueprint/B2CBlueprint/version/11.3.1/Storefront/j2ee/store.war/mobile/creditcard/gadgets/creditCardEditForm.jsp#1 $$Change: 1497274 $--%>
