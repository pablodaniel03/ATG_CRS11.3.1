<%-- 
  This page renders a single property of a cart item as a JSON object with 
  2 properties, 'name' and 'value'. Only render the JSON object when is the 
  propertyValue is not empty.
  
  Required parameters:
    propertyValue
      Value of the property.
    propertyNameKey
      Name of the property.
  
  Optional parameters:
    None.
--%>
<dsp:page>
  <dsp:getvalueof var="value" param="propertyValue"/>
  <dsp:getvalueof var="nameKey" param="propertyNameKey"/>
  
  <c:if test="${!empty value}">
    <json:object>
      <json:property name="name">
        <fmt:message key="${nameKey}"/>
      </json:property>
      <json:property name="value" value="${value}"/>
    </json:object>
  </c:if>
</dsp:page>
<%-- @version $Id: //hosting-blueprint/B2CBlueprint/version/11.3.1/Storefront/j2ee/store.war/cart/json/cartItemProperty.jsp#1 $$Change: 1497274 $--%>
