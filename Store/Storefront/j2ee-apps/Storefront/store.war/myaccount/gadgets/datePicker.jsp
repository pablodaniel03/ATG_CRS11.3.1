<%--  Renders the drop down containing the date fields based on the locale.     Required Parameters:    formHandlerComponentMonth      This needs to be a full component Path plus property.             e.g. /atg/store/profile/RegistrationFormHandler.month    formHandlerComponentDay      This needs to be a full component Path plus property.             e.g. /atg/store/profile/RegistrationFormHandler.date    formHandlerComponentYear      This needs to be a full component Path plus property.             e.g. /atg/store/profile/RegistrationFormHandler.year               Optional Parameters:    displayDateLables      If set to true, date labals (Day, Month, Year) will be displayed in dropdown.      Default value is false.         --%>  <dsp:page>     <dsp:importbean bean="/atg/core/i18n/LocaleTools"/>    <dsp:getvalueof var="formHandlerComponentMonth" param="formHandlerComponentMonth" />  <dsp:getvalueof var="formHandlerComponentDay" param="formHandlerComponentDay" />  <dsp:getvalueof var="formHandlerComponentYear" param="formHandlerComponentYear" />  <dsp:getvalueof var="dayTitleKey" param="dayTitleKey" />  <dsp:getvalueof var="monthTitleKey" param="monthTitleKey" />  <dsp:getvalueof var="yearTitleKey" param="yearTitleKey" />  <dsp:getvalueof var="startYear" param="startYear" />  <dsp:getvalueof var="numberOfYears" param="numberOfYears" />  <dsp:getvalueof var="displayDateLables" param="displayDateLables" />    <dsp:getvalueof  var="dateTokens" bean="LocaleTools.userFormattingLocaleHelper.dateTokens"/>    <%-- Creates a list containing day,month,year sequence for the date drop down field to be displayed based on the locale selected--%>  <c:forEach var="pattern" items="${dateTokens}" >                      <c:if test='${pattern == "M"}'>       <fmt:message var="monthTitle" key="${monthTitleKey}"/>            <dsp:select bean="${formHandlerComponentMonth}" id="atg_store_eventMonth"                  name="atg_store_eventMonth" required="false" iclass="required"                   title="${monthTitle}" onchange="atg.store.datePicker.setNumberOfDays(true);">                          <c:if test="${displayDateLables}">                    <dsp:option selected="true">            <fmt:message key="common.month"/>          </dsp:option>        </c:if>                          <!-- Displays month -->        <c:forEach var="count" begin="1" end="12" step="1" varStatus="status">          <dsp:option value="${count-1}">            <fmt:message key="common.month${count}"/>          </dsp:option>        </c:forEach>                      </dsp:select>    </c:if>                        <c:if test='${pattern == "D"}'>       <fmt:message var="dayTitle" key="${dayTitleKey}"/>      <fmt:message var="dayLabel" key="common.day"/>      <dsp:getvalueof var="currentDay" bean="${formHandlerComponentDay}"/>      <dsp:select bean="${formHandlerComponentDay}" name="atg_store_eventDay"                  id="atg_store_eventDay" required="false" iclass="custom_selectday"                  title="${dayTitle}"/>    </c:if>                       <!-- Displays year -->    <c:if test='${pattern == "Y"}'>       <fmt:message var="yearTitle" key="${yearTitleKey}"/>      <crs:yearList startYear="${startYear}"  numberOfYears="${numberOfYears}"                     bean="${formHandlerComponentYear}"                    id="atg_store_eventYear"                    selectRequired="false" yearString="${displayDateLables}" iclass="required"                    title="${yearTitle}" onchange="atg.store.datePicker.setNumberOfDays(true);"/>    </c:if>      </c:forEach>    <script type="text/javascript">     dojo.provide("atg.store.datePicker");     atg.store.datePicker = {                <%--        This function sets the correct number of days in the dropdown box, depending         on what is chosen in the month and year dropdowns. This also takes leap years         into account.                                                                                                            The 'isModified' parameter will be true when the page loads and will tell us to         set the previously saved day value. When this parameter is false and the updated        month/year is invalid with the day value, the selected index will just be set to 0.                                                     --%>      setNumberOfDays: function(isModified) {    	var displayDateLables = '${displayDateLables}';         // Get the current year 'value' from the dropdown        var y = dojo.byId('atg_store_eventYear');        var year = y.options[y.selectedIndex].text;                // Create an array of months so we can use the month dropdown's selected index        // to retrieve the correct month format for creating a new JS Date object.        var months = this.createMonths();                // Create an array of days in month so we can use the days dropdown's selected index        // to retrieve the correct amount of days in month        var daysInMonths = this.createDaysInMonths();                // Get the current month 'index' from the dropdown        var m = dojo.byId('atg_store_eventMonth')                var month = '';        // If Year and Month are not specified display 31 days        var daysInMonth = 31;                // Get the selected month and amount of days in the month.        if (m.selectedIndex > 0 && displayDateLables) {          month = months[m.selectedIndex - 1];           daysInMonth = daysInMonths[m.selectedIndex - 1];        }        else if (!displayDateLables) {          month = months[m.selectedIndex];           daysInMonth = daysInMonths[m.selectedIndex];        }                  if (!isNaN(year) && (dojo.indexOf(months, month) > -1)) {          // Create a new JS Date object with our retrieved date details.          var date = new Date(month + "01, " + year);          daysInMonth = dojo.date.getDaysInMonth(date);        }              var daysElement = dojo.byId('atg_store_eventDay');        // Get the day value now so it can be persisted when the day dropdown options have been reset.        var modifiedDateDayIndex = daysElement.selectedIndex;        // Populate the day dropdown box with options corresponding to the month/year.        this.createOptionsForDays(daysInMonth, daysElement);        if (isModified) {               if ((modifiedDateDayIndex + 1) > daysInMonth) {            // Invalid day, reset            modifiedDateDayIndex = 0;          }          daysElement.selectedIndex = modifiedDateDayIndex;        }      },      <%--        This function creates the appropriate number of days as dropdown box options.                                                                                                 The 'daysInMonth' parameter is the actual number of days to be populated into             days dropdown box. The 'daysElement' is the days dropdown element to be populated.      --%>      createOptionsForDays: function(daysInMonth, daysElement) {         this.resetDays();                var displayDateLables = '${displayDateLables}';        var j = 0;        if (displayDateLables) {          var dayLabel = '${dayLabel}';          daysElement.options[0] = new Option(dayLabel, dayLabel);          j = 1;        }                var currentDay = '${currentDay}';        for (var i = j; i < daysInMonth + 1; i++) {          daysElement.options[i] = new Option(i + (1 - j), i + (1 - j));          if (i + (1 - j) == currentDay) {            daysElement.selectedIndex = i;            daysElement.options[i].selected = 'true';          }        }      },      <%--        Clear the days dropdown box.      --%>      resetDays: function() {        var daysElement = dojo.byId('atg_store_eventDay');        daysElement.selectedIndex = 0;          for (var i = 0; i < daysElement.options.length; i++) {            daysElement.options[i] = null;          }          daysElement.options.length = null;      },      <%--        This function creates and returns a new array of month strings.      --%>      createMonths: function() {        return new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");      },             <%--        This function creates and returns a new array of default amount of days in months.      --%>      createDaysInMonths: function() {        return new Array(31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);      }     };    atg.store.datePicker.setNumberOfDays(false);       </script>       </dsp:page><%-- @version $Id: //hosting-blueprint/B2CBlueprint/version/11.3.1/Storefront/j2ee/store.war/myaccount/gadgets/datePicker.jsp#1 $$Change: 1497274 $--%>