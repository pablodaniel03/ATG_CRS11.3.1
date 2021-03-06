<%-- 
  This page displays the copyright information of the Store.
  
  Required Parameters - 
    copyrightDivId
      id for the div containing the copyright message. 
--%>

<dsp:page>

  <dsp:getvalueof var="copyrightDivId" param="copyrightDivId"/>

  <div id="<c:out value='${copyrightDivId}'/>">
    <fmt:message key="common.copyright"/>
  </div>

</dsp:page>
<%-- @version $Id: //hosting-blueprint/B2CBlueprint/version/11.3.1/Storefront/j2ee/store.war/global/gadgets/copyright.jsp#1 $$Change: 1497274 $ --%>