/**
 * Search auto-suggest module, specific for typeahead dimension search.
 * @ignore
 */
CRSMA = window.CRSMA || {};

/**
 * @namespace "Auto-suggest" Javascript Module of "Commerce Reference Store Mobile Application"
 * @description Search auto-suggest module, specific for typeahead dimension search.
 */
CRSMA.autosuggest = function() {
  /**
   * Is "auto-suggest" panel active?
   * @private
   */
  var autosuggestActive = true;
  /**
   * "Auto-suggest" module options.
   * @private
   */
  var autosuggestOptions;
  /**
   * Search text element, last value.
   * @private
   */
  var lastValue = "";
  /**
   * Search text jQuery element.
   * @private
   */
  var $searchText;
  /**
   * "Auto-suggest" module html container element (jQuery).
   * @private
   */
  var $autosuggestContainer;
  /**
   * @private
   */
  var timeOutId;
  
  /**
   * XMLHttpRequest object, used while the last auto-suggest ajax request 
   * @private
   */
  var xhr;
  
  /**
   * Flag that allows to check if autosuggest is shown
   */
  var suggestionsShown = false;
  
  /**
   * Indicates if popup with error message should appear when ajax error is happened.
   * @private
   */
  var SHOW_AJAX_ERROR = true;

  /**
   * Hide the search suggestion box.
   * 
   * @public
   */
  var hide = function() {
    $autosuggestContainer.hide();
    autosuggestActive = false;
  };

  /**
   * Show the search suggestion box.
   * 
   * @private
   */
  var show = function() {
    if ($autosuggestContainer.is(":hidden")) {
      $autosuggestContainer.show();
      autosuggestActive = true;
    }
  };

  /**
   * Activate the search suggestion box.
   * 
   * @private
   */
  var handleRequest = function() {
    var callback = function() {
      var text = $.trim($searchText.val());
      if (text != lastValue) {
        if (text.length >= autosuggestOptions.minAutoSuggestInputLength) {
          requestData();
        } else {
          hide();
        }
      }
      lastValue = text;
    };

    if (timeOutId) {
      clearTimeout(timeOutId);
    }
    timeOutId = setTimeout(callback, autosuggestOptions.delay);
  };
  
  /**
   * Calls specified function with the switched off AJAX error handling.
   * Restores AJAX error handling in the end.
   * 
   * @private
   */
  var noAjaxError = function(fn) {
    // Suppress AJAX error handling
    SHOW_AJAX_ERROR = false;

    // Function call
    if (fn) {
      fn.call();
    }

    // Restore AJAX error handling
    SHOW_AJAX_ERROR = true;
  };

  /**
   * Send Ajax to backend service to request data.
   * 
   * @private
   */
  var requestData = function() {
    /* Note, that if user types search terms quickly and the speed of the connection is slow, may be the situation 
     * when auto-suggest request should be posted but the previous one hasn't been processed yet.
     * We should abort the previous request because we needn't already in it's results.
     */
    if (xhr && xhr.readyState != 4) {
      noAjaxError(
        function() {
          /* Note, that 'abort' call is wrapped in noAjaxError, that eliminates popup, appearing in ajaxError situation.
           * See $(document).ajaxError(...) handler for details in common.js */
          xhr.abort();
        }
      );
      xhr = null;
    }

    xhr = $.ajax({
      url: composeUrl(),
      dataType: "json",
      async: true,
      success: function(data) {
        showSearchResult(data);
      }
    });
  };

  /**
   * Search suggestion is search term sensitive. So it will take the search
   * term applied on current page and add it into the Ajax request url.
   * 
   * @private
   */
  var composeUrl = function() {
    var url = autosuggestOptions.autoSuggestServiceUrl;
    var searchTerm = $.trim($searchText.val());

    if (url.indexOf("?") == -1) {
      url += "?";
    } else {
      url += "&";
    }
    url += "format=json&Dy=1&assemblerContentCollection=" + autosuggestOptions.collection + "&Ntt=" + searchTerm + "*";

    return url;
  };

  /**
   * Show the search results in the suggestion box.
   * 
   * @param data
   *  auto-suggest data
   * 
   * @private
   */
  var showSearchResult = function(data) {
    var htmlResult = processSearchResult(data);
    if (htmlResult != null) {
      $autosuggestContainer.html(htmlResult);
      show();
      suggestionsShown = true;
    } else {
      // Hide the result box if there is no result
      hide();
      suggestionsShown = false;
    }
  };

  /**
   * Generate rendering HTML according to data.
   * 
   * @param data
   *  auto-suggest data
   *  
   * @private
   */
  var processSearchResult = function(data) {
    var dimSearchResult = null;
    var autoSuggestCartridges = data.contents[0].autoSuggest;

    // If no data returned, returns null
    if (autoSuggestCartridges == null || autoSuggestCartridges.length == 0) {
      return null;
    }

    // Find the dim search result in the cartridge list, only consider one cartridge
    // For auto-suggest dimension search
    for (var j = 0; j < autoSuggestCartridges.length; j++) {
      var cartridge = autoSuggestCartridges[j];
      if (cartridge['@type'] == "DimensionSearchAutoSuggestItem") {
        // Find dim search result
        dimSearchResult = cartridge;
        break;
      }
    }

    if (dimSearchResult != null) {
      return generateHtmlContent(dimSearchResult);
    }
    return null;
  };
  
  /**
   * Deletes param from the specified URL if it exists and returns modified URL.
   *
   * Note, if you plan to change logic inside, check that all functions below draws "true".
   *
   * console.log(removeURLParam('http://someurl', 'a')             == "http://someurl");
   * console.log(removeURLParam('http://someurl?a=1', 'a')         == "http://someurl");
   * console.log(removeURLParam('http://someurl?a=1&b=2', 'b')     == "http://someurl?a=1");
   * console.log(removeURLParam('http://someurl?a=1&b=2', 'a')     == "http://someurl?b=2");
   * console.log(removeURLParam('http://someurl?a=1&b=2&c=3', 'b') == "http://someurl?a=1&c=3");
   *
   * @param {@string} url 
   *  URL.
   * @param {@string} param 
   *  Parameter to remove.
   *  
   * @private
   */
  var removeURLParam = function(url, param) {
    if (url) {
      var re = new RegExp('^(.+)(\\?|&)' + param + '=[^\\?&]+(.?)(.*)$', 'i')
      if (re.test(url)) {
          return RegExp.$3
            ? RegExp.$1 + RegExp.$2 + RegExp.$4
            : RegExp.$1
      } else {
        return url;
      }
    }
  };
  
  /**
   * Deletes parameters from the url.
   *
   * @param {@string} url 
   *  URL.
   * @param params 
   *  Array of string parameters to remove.
   *  
   * @public
   */
  var removeURLParams = function(url, params) {
    var result = url;
    if (params) {
      for (var i = 0; i < params.length; i++) {
        result = removeURLParam(result, params[i]);
      }
    }
    return result;
  };

  /** 
   * Generates HTML content for seachResultItem
   * 
   * @param dimSearchResult
   *  DimensionSearchAutoSuggestItem
   *  
   * @private
   */
  var generateHtmlContent = function(dimSearchResult) {
    var newContent = null;

    // Contains dimension search results
    if (dimSearchResult != null && dimSearchResult.dimensionSearchGroups != null && dimSearchResult.dimensionSearchGroups.length > 0) {
      newContent = "<div>";

      var dimSearchGroupList = dimSearchResult.dimensionSearchGroups;

      for (var i = 0; i < dimSearchGroupList.length; i++) {
        var dimResultGroup = dimSearchGroupList[i];

        // Output dim result of this group here
        for (var j = 0; j < dimResultGroup.dimensionSearchValues.length; j++) {
          var dimResult = dimResultGroup.dimensionSearchValues[j];
          var action = dimResult.navigationState;
          var text = dimResult.label;
          var ancestors = dimResult.ancestors;
          var ancestorsStr = "";
          if (ancestors != null && ancestors.length > 0) {
            for (var n = 0; n < ancestors.length; n++) {
              ancestorsStr += ancestors[n].label + " > ";
            }
          }

          newContent = newContent + '<div class="dimResult" role="link" onclick="window.location=\'' + autosuggestOptions.siteContextPath
            + removeURLParams(action, ['format', 'assemblerContentCollection'])
            + '\'"><div class="suggestion">'
            + ancestorsStr + text + '</div></div>';
        }
      }
      newContent = newContent + "</div>";
    }

    return newContent;
  };

  /**
   * Init method (constructor).
   * 
   * @param options
   *  The options to be applied.
   */
  var init = function(options) {
    var settings = $.extend({ /* default settings */
      searchTextId              : "searchText",
      minAutoSuggestInputLength : 3,
      displayImage              : false,
      delay                     : 250,
      autoSuggestServiceUrl     : "",
      collection                : "",
      siteContextPath           : "",
      containerClass            : "dimSearchSuggContainer"
    }, options || {});

    autosuggestOptions = settings;
    var $elt = $("#" + settings.searchTextId);
    $searchText = $elt;
    $autosuggestContainer = $('<div class="' + autosuggestOptions.containerClass + '"></div>');

    // Append the container to the current page
    $(".searchBar").after($autosuggestContainer);

    // Capture the keyboard events.
    $elt.keydown(function(e) {
      handleRequest();
    });

  };
  
  /**
   * Returns current state of AutosuggestPanel
   * 
   * @return boolean 
   *  Whether panel is shown or not.
   *  
   * @public
   */
  var areSuggestionsShown = function() {
    return suggestionsShown;
  };
  
  /**
   * Shows specified message in pop-up in some style (f.e. 'error').
   *
   * @param {string} type 
   *  message type, f.e. 'error'.
   * @param {string} message 
   *  message text.
   *  
   * @private
   */
  var showPopup = function(type, message) {
    $("#messagePopup").addClass("shown").addClass(type);
    $("#messageText").text(message);
  };

  /**
   * List of public "CRSMA.autosuggest"
   */
  return {
    // Methods
    "init" : init,
    "hide" : hide
  }
}();

/**
 * Adds handling for AJAX Errors.
 */
$(document).ajaxError(function(event, jqXHR, ajaxSettings, thrownError) {
  if (SHOW_AJAX_ERROR) {
    CRSMA.autosuggest.showPopup("error", CRSMA.i18n.getMessage('mobile.js.ajaxError'));
  }
});
CRSMA = window.CRSMA || {};

/**
 * @namespace "Shopping Cart" Javascript Module of "Commerce Reference Store Mobile Application"
 * @description Holds common functionality related to the shopping cart actions.
 */
CRSMA.cart = function() {
  /**
   * Map for existing bundles.
   * @private
   */
  var itemBlockBundlesMap = {};

  /**
   * Current bundle(viewBlock + editBlock)
   * @private
   */
  var currentBundle;

  /**
   * Returns object with required functions to show remove/share dialog.
   *
   * @param {string} showDialogName the dialog function name (one of the showRemoveDialog/showShareDialog).
   * @private
   */
  var getDialogDescriptor = function(showDialogName) {
    var dialogValue = ".moveDialog";
    var pointerValue = ".moveDialog .moveItems";
    if (showDialogName == "showShareDialog") {
      dialogValue = ".shareDialog";
      pointerValue = ".shareDialog .shareItems";
    }
    return {
      dialog: dialogValue,
      pointer: pointerValue
    }
  }

  /**
   * Shows the dialog for the specified commerce item.
   *
   * @param anchorObject HTML element to calculate dialog position.
   * @param e "click" event object.
   * @param {string} showDialogName dialog function name (one of the showRemoveDialog/showShareDialog).
   * @private
   */
  var showDialogImpl = function(anchorElement, e, showDialogName) {
    e.preventDefault();
    e.stopPropagation();

    var $anchor = $(anchorElement);
    var top = $anchor.offset().top;
    var parenttop = $("#pageContainer").offset().top;
    var right = $(document).width() - ($anchor.offset().left + $anchor.outerWidth());
    var descriptor = getDialogDescriptor(showDialogName);

    $(descriptor.pointer).css({top: top - parenttop, right: right, display: "block"});
    $(descriptor.dialog).show();
    CRSMA.common.toggleModal(true);
  };
  
  /**
   * Boolean, indicating if "dataset" is supported by browser?
   * @private
   */
  var isDatasetSupported = document.createElement("div").dataset !== undefined;

  /**
   * Returns value of specified attribute in dataset[] if it's supported
   * or through getAttribute call if 'dataset' isn't supported.<br>
   * Note, that iOS 4.3.5 still doesn't support data-operations from HTML5.
   *
   * @param {string} pName data-property name to access.
   * @returns {string} data value.
   * @private
   */
  var dataAccessor = function(pName) {
    if (isDatasetSupported) {
      return this[0].dataset[pName];
    }
    return this.attr("data-" + pName);
  };

  /**
   * Creates view/edit bundle object.
   *
   * @param $viewBlockParam jquery selector result.
   * @private
   */
  var createItemViewEditBundle = function($viewBlockParam) {
    var $viewBlock = $viewBlockParam;
    // Extend viewBlock to access "dataset" properties
    $.extend($viewBlock, {dataAttribute: dataAccessor});
    var $editBlock = $viewBlock.next("div.cartItemEdit");

    var $link2ProductDetail4Edit = $("a.productDetailPageLink", $editBlock);
    var ciId = $viewBlock.attr("id").substring("cartItem_".length);

    // SKU properties (concatenate prop1 + ", " + prop2)
    var propertiesHtml = $viewBlock.dataAttribute("skuproperty1");
    var property2 = $viewBlock.dataAttribute("skuproperty2");
    if (propertiesHtml.length > 0 && property2.length > 0) {
      propertiesHtml = propertiesHtml + ", ";
    }
    propertiesHtml = propertiesHtml + property2;
    $("span.properties", $editBlock).children("abbr")
	                                .text(propertiesHtml + " " +
									      $("span.properties", $editBlock).children("abbr")
										                                  .text()
										  );

    // Link to product detail page - for "Edit"
    $link2ProductDetail4Edit.attr("href", $viewBlock.dataAttribute("productpageurl4edit"));

    // Link to product detail page - for "Share"
    var $link2Share = $("#shareLink");
    $link2Share.attr("href", $viewBlock.dataAttribute("productpageurl4share"));

    // "onclick" handler
    $editBlock.click(function() {
      viewEditBundle.toViewMode();
    });

    $("a.moveLink", $editBlock).click(function(e) {
      showDialogImpl(this, e, "showRemoveDialog");
    });
    $("a.shareLink", $editBlock).click(function(e) {
      showDialogImpl(this, e, "showShareDialog");
    });

    // Disable links inside of the item view block
    $("a", $viewBlock).click(function(e) {
      e.preventDefault();
    });

    /**
     * Object for using in edit, view operations.
     *
     * @private
     */
    var viewEditBundle = {
      cartItemId: ciId,
      toViewMode: function() {
        $editBlock.hide();
        $viewBlock.show();
        currentBundle = null;
      },
      toEditMode: function() {
        $viewBlock.hide();
        $editBlock.show();
        if (currentBundle) {
          currentBundle.toViewMode();
        }
        currentBundle = this;
      }
    }

    // Add "viewEditBundle" to map
    itemBlockBundlesMap[ciId] = viewEditBundle;
    return viewEditBundle;
  };

  /**
   * Returns bundle: viewBlock + editBlock.
   *
   * @param $viewBlockParam jQuery selector result.
   * @return html element, presenting viewBlock & editBlock.
   * @private
   */
  var getOrCreateItemViewEditBundle = function($viewBlockParam) {
    var ciId = $viewBlockParam.attr("id").substring("cartItem_".length);
    var viewEditBundle = itemBlockBundlesMap[ciId];
    if (viewEditBundle === undefined) {
      viewEditBundle = createItemViewEditBundle($viewBlockParam);
    }
    return viewEditBundle;
  };

  /**
   * Switches cart item to edit mode.
   *
   * @param pBlock HTML element, presenting cart item.
   * @public
   */
  var showCartItemEditBox = function(pBlock) {
    var $viewBlock = $(pBlock);
    var bundle = getOrCreateItemViewEditBundle($viewBlock);
    bundle.toEditMode();
  };

  /**
   * Sends promotion coupon code to server.
   * @public
   */
  var applyCoupon = function() {
    var $couponCode = $("#promotionCodeInput");
    $couponCode.closest("form").submit();
  };

  /**
   * Apply coupon if user presses <i>Enter</i> on the Coupon field and the
   * coupon value has been changed.
   * @public
   */
  var applyNewCouponOnEnter = function() {
    if (event.keyCode == "13") {
      var enteredCouponCode = $("#promotionCodeInput").attr("value");
      var previousCouponCode = $("#promotionPreviousCode").attr("value");
      if (enteredCouponCode != previousCouponCode) {
        CRSMA.cart.applyCoupon();
      }
    }
  };

  /**
   * Performs "Removes current item from the Shopping Cart" action.
   * @public
   */
  var removeCurrentCartItem = function() {
    $("#removeItemFromOrder").attr("value", currentBundle.cartItemId);
    var formCart = $(document.forms["cartContent"]);
    history.replaceState(new Date());
    formCart.submit();
  };

  /**
   * List of public "CRSMA.cart".
   */
  return {
    // Methods
    "applyCoupon"                        : applyCoupon,
    "applyNewCouponOnEnter"              : applyNewCouponOnEnter,
    "removeCurrentCartItem"              : removeCurrentCartItem,
    "showCartItemEditBox"                : showCartItemEditBox,
  };
}(); // END CRSMA.cart
/**
 * Functionality related to the sorting in a category landing page.
 * @ignore
 */
CRSMA = window.CRSMA || {};

/**
 * @namespace "Category Sort" Javascript Module of "Commerce Reference Store Mobile Application"
 * @description Holds common functionality related to the sorting in a category landing page.
 */
CRSMA.categorysort = function() {
  /**
   * Possible values for the sort key.
   * 
   * @private
   */
  var SORT_KEY = {
    TOP_PICKS: "",
    NAME: "displayName",
    PRICE: "price"
  };

  /**
   * Possible values for the sort order.
   * 
   * @private
   */
  var SORT_ORDER = {
    ASC: "ascending",
    DESC: "descending"
  };
  
  
  /**
   * This methods sets the appropriate value for the sort input element.
   *
   * @param currentSortKey
   *  The current sorting key for the list.
   *  
   * @private
   */
  var sortBy = function(currentSortKey) {
    var previousSort = $("#sort").val();
    var previousSortCriteria = previousSort.split(":");

    switch (currentSortKey) {
      case SORT_KEY.NAME:
        if (previousSortCriteria[0] == SORT_KEY.NAME) {
          if (previousSortCriteria[1] == SORT_ORDER.ASC) {
            $("#sort").val(SORT_KEY.NAME + ":" + SORT_ORDER.DESC);
          } else {
            $("#sort").val(SORT_KEY.NAME + ":" + SORT_ORDER.ASC);
          }
        } else {
          $("#sort").val(SORT_KEY.NAME + ":" + SORT_ORDER.ASC);
        }
        break;

      case SORT_KEY.PRICE:
        if (previousSortCriteria[0] == SORT_KEY.PRICE) {
          if (previousSortCriteria[1] == SORT_ORDER.ASC) {
            $("#sort").val(SORT_KEY.PRICE + ":" + SORT_ORDER.DESC);
          } else {
            $("#sort").val(SORT_KEY.PRICE + ":" + SORT_ORDER.ASC);
          }
        } else {
          $("#sort").val(SORT_KEY.PRICE + ":" + SORT_ORDER.ASC);
        }
        break;

      default:
        $("#sort").val("");
    }
    
    $("#sortByForm").submit();
  };
  
  /**
   * Initializes the actions for each of the sorting buttons.
   * 
   * @public
   */
  var initSortingActions = function() {
    $("#nameSort").click(function() {sortBy(SORT_KEY.NAME);});
    $("#priceSort").click(function() {sortBy(SORT_KEY.PRICE);});
    
    $("#topPicksSort").click(function(e) {
      // disable the Top Picks button if the list is already sorted by Top Picks
      if ($("#sort").val() == "")
        e.preventDefault(); 
      else
        sortBy(SORT_KEY.TOP_PICKS);
    });
  };
  
  
  /**
   * List of public "CRSMA.categorysort".
   */
  return {
    // Methods
    "initSortingActions"  : initSortingActions
  };

}(); // END CRSMA.categorysort
/**
 * Common Javascript functions.
 * @ignore
 */
CRSMA = window.CRSMA || {};

/**
 * @namespace "Common" Javascript Module of "Commerce Reference Store Mobile Application"
 * @description Holds common functionality related to all parts in CRSMA.
 */
CRSMA.common = function() {
  /**
   * Shows or hides html element with 'modalOverlay' id.
   *
   * @param {boolean} showOrHide 
   *  a flag indicating whether to show (true) or hide (false).
   *  
   * @public
   */
  var toggleModal = function(showOrHide) {
    $("#modalOverlay").toggle(showOrHide);
    // If hiding the modal overlay, also hide all direct children
    if (showOrHide == false) {
      $("#modalOverlay > :not(.shadow)").hide();
    }
  };

  /**
   * For every element, catched by selector, adds click handler
   * that makes submit of form after some delay.<br>
   * Called when user clicks on any list item, except border & action ones.
   *
   * @param {string} selectorText 
   *  jquery selector rule.
   * @param {number} pDelay 
   *  Timeout in msec before submitting form (default - 200ms).
   *  
   * @public
   */
  var delayedSubmitSetup = function(selectorText, pDelay) {
    var pDelay = (typeof pDelay === "undefined") ? 200 : pDelay;

    $(selectorText).each(function() {
      var $container = $(this);

      $("li", $container).not("#newItemLI").click(function(event) {
        var target = event.target || event.srcElement;
        if (target.localName === "a") {
          return;
        }
        
        // If the list element is an expired credit card and it is clicked, do not submit form.
        // Instead, dislay error message
        if ($(this).hasClass("expiredCard")){
          $(this).find(".expiredLabel").hide();
          $(this).find(".expiredError").show();
          return;
        }
        
        var $radio = $("input:radio", $(this));
        $radio.attr("checked", "checked");
        $radio.change();

        setTimeout(function() {
          $container.parents("form").submit();
        }, pDelay);
      });
    });
  };

  /**
   * Goes to specified url with delay 500 ms.
   *
   * @param {string} url 
   *  URL.
   *  
   * @returns {boolean} 
   *  always returns true.
   *  
   * @public
   */
  var gotoURL = function(url) {
    setTimeout(
      function() {
        window.location.href = url;
      },
      500);
    return true;
  };

  /**
   * Parses the specified URL or current page URL (if URL is undefined)
   * and returns a dictionary Object that maps decoded parameter names to decoded values.
   *
   * @param {string} url 
   *  the specified URL with params to map.
   *  
   * @return An object with keys and values where keys are the parameter names from the URL.
   * 
   * @public
   */
  var getURLParams = function(url) {
    if (!url) {
      url = window.location.href;
    }

    var params = decodeURI(url);
    var indexOfQuestionMark = params.indexOf('?');
    if (indexOfQuestionMark !== -1) { // if this is whole url, not search part
      params = params.slice(indexOfQuestionMark);
    }

    // A state machine to parse the param string in one pass
    var state = false;
    var key = '';
    var value = '';
    var paramsObject = {};
    // The first character will always be '?', so we skip it
    for (var i = 1; i < params.length; i++) {
      var current = params.charAt(i);
      switch (current) {
        case '=':
          state = !state;
          break;
        case '&':
          state = !state;
          paramsObject[key] = value;
          key = value = '';
          break;
        default:
          if (state) {
            value += current;
          } else {
            key += current;
          }
          break;
      }
    }
    if (key) {
      paramsObject[key] = value; // put the last pair on the "paramsObject"
    }
    return paramsObject;
  };

  /**
   * Hides the "Loading..." message box.
   * 
   * @public
   */
  var hideLoadingWindow = function() {
    $("#modalMessageBox").hide().removeClass("refineOverlay");
    CRSMA.common.toggleModal(false);
  };

  /**
   * Shows modal dialog to confirm delete operation.<br>
   * The dialog position is calculated based on this container element.
   *
   * @param pOffsetContainer 
   *  Container with delete link, clicking on it shows modal dialog.
   *  
   * @public
   */
  var removeItemDialog = function(pOffsetContainer) {
    var $offsetContainer = $(pOffsetContainer);
    var top = $offsetContainer.offset().top - $("#pageContainer").offset().top;
    var right = $(document).width() - $offsetContainer.offset().left - $offsetContainer.outerWidth() - 1; // -1px for the left border

    $("div.moveDialog div.moveItems").css({top: top, right: right, display: "block"});

    // Hide dialog by clicking outside the dialog items box
    $("div.moveDialog").click(function() {
      $(this).hide();
    });

    $("div.moveDialog").show();
    CRSMA.common.toggleModal(true);
  };
  
  /**
   * List of public "CRSMA.common" 
   */
  return {
    // methods
    'delayedSubmitSetup': delayedSubmitSetup,
    'getURLParams'      : getURLParams,
    'gotoURL'           : gotoURL,
    'removeItemDialog'  : removeItemDialog,
    'toggleModal'       : toggleModal,
    'hideLoadingWindow' : hideLoadingWindow
  }
}();


$(window).one("load", function() {
  window.scrollTo(0, 1);
  history.replaceState(new Date());
});

/**
 * Javascript Global Objects extensions.
 */
(function() {
  /**
   * Formats string, replacing parameters {0} {1} etc. by arguments in the specified order. <br>
   * May be used with different quantity of arguments. The arguments are passed as a single array.
   *
   * @example
   * var s = 'May name is {0} {1}';
   * s.format('John', 'Smith'); // My name is John Smith
   */
  String.prototype.format = function(args) {
	// if array args is passed, only then format the string 
    if (args) {
		var formatted = ""; // this will be our formatted string
		var split = this.split('');
		var inParam = false; // state variable
		var paramNumber = '';
		for (var i = 0; i < split.length; i++) {
		  var current = split[i];
		  switch (current) {
			case '{': // begin specifying a parameter
			  inParam = true;
			  break;
			case '}': // done specifying parameter
			  inParam = false;
			  // Insert the parameter or, if it doesn't exist, leave it as it is
			  var param = args[parseInt(paramNumber, 10)] || "{" + paramNumber + "}";
			  formatted += param; // Insert the parameter into the formatted string
			  paramNumber = ""; // make sure to reset the paramNumber
			  break;
			default:
			  if (inParam) {
				paramNumber += current;
			  } else {
				formatted += current;
			  }
			  break;
		  }
		}
	}
	// otherwise return the string unchanged
	else {
		formatted = this;
	}
    return formatted;
  };

  /**
   * This adds a setObject method to the Storage interface so that we can add our
   * HTML fragments into local storage. <br>
   *
   * We should be able to do this without doing this, according to the
   * localstorage spec, but no browser has added support for it yet.
   *
   * @param {string} key 
   *  key
   * @param value 
   *  any object
   *  
   * @memberOf Storage
   * 
   * @namespace
   */
  Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
  };

  /**
   * This adds a getObject method to the Storage interface so that we can get our
   * HTML fragments out of local storage. <br>
   *
   * We should be able to do this without doing this, according to the
   * localstorage spec, but no browser has added support for it yet.
   *
   * @param {string} key 
   *  key
   *  
   * @memberOf Storage
   * 
   * @namespace
   */
  Storage.prototype.getObject = function(key) {
    return this.getItem(key) && JSON.parse(this.getItem(key));
  };
})();
/**
 * Javascript functions used in productsHorizontaList.jsp.
 * 
 * @ignore
 */
CRSMA = window.CRSMA || {};

/**
 * @namespace "Products Horizontal List" Javascript module of "Commerce
 *            Reference Store Mobile Application"
 * @description Contains methods used in productsHorizontaList.jsp.
 */
CRSMA.horizontallist = function() {
  /**
   * the width of the cell in pixel
   */
  var cellWidth = 90;
  /**
   * This method initializes the sliders in productsHorizontalList.jsp.
   * 
   * @public
   */
  var createHorizontalListSliders = function() {
    // Set the width of itemContainer to the width of the entire screen.
    // The slider will then takes care of figuring out the appropriate width for the cells inside it.
    var doItemsExist = $(".itemsContainer").length > 0;
    if (doItemsExist) {
      var screenWidth = $(window).width() - 1;
      $(".itemsContainer").css({
        "width" : screenWidth
      });
    }

    var numberOfCells = Math.floor(screenWidth/cellWidth) + 0.5;
    // Initialize all sliders on the page
    $("div[id^='horizontalContainer']").each(function() {
      var id = $(this).attr("id");

      CRSMA.sliders.createSlider({
        gridid : "#" + id,
        numberOfCells : numberOfCells,
        paginated: true,
        onTouchEventException : function(el) {
          $(el).css({
            "height" : "70px",
            "overflow" : "auto"
          });
        }
      });

      // Mark items that are off screen as hidden so that VoiceOver won't read them (accessibility)
      var $cells = $(this).children(".cell");
      $cells.each(function(index) {
        if (index >= numberOfCells) {
          $(this).css({
            display : "none"
          });
        } else{
          $(this).css({
            display : ""
          });
        }
      });
    });

    // Now that the slider has been initialized, let itemContainer inherits its parent's width.
    // This will let the browser figure out the right value when the user switches between portrait and landscape views
    if (doItemsExist) {
      $(".itemsContainer").css({
        "width" : "inherit"
      });
    }
  };
  var displayHorizontalListSliders = function() {
    // Populate slider divs with the content
    $("div[id^='horizontalContainer']").each(function() {
      var id = $(this).attr("id");
      var html = sessionStorage.getObject(id);
      $(id).empty().html(html);
    });
    createHorizontalListSliders();
  }
  var initHorizontalListSliders = function() {
    // Save the content of sliders in session object to retrieve when screen orientation changes
    $("div[id^='horizontalContainer']").each(function() {
      var id = $(this).attr("id");
      var html = $(id).html();
      sessionStorage.removeItem(id);
      sessionStorage.setObject(id, html);
    });
    createHorizontalListSliders();
    // Add this orientationchange/resize event to re-render the sliders so that things are centered correctly
    var orientationSupport = "onorientationchange" in window, orientationEvent = orientationSupport ? "orientationchange" : "resize";
    window.addEventListener(orientationEvent, function() {
      displayHorizontalListSliders();
    }, false);
  };

  /**
   * List of public "CRSMA.horizontallist" methods
   */
  return {
    // methods
    'initHorizontalListSliders' : initHorizontalListSliders
  }
}();
/**
 * I18n Javascript functions.
 * @ignore
 */
CRSMA = window.CRSMA || {};

/**
 * @namespace "Internationalization" module of "Commerce Reference Store Mobile Application"
 * @description Holds methods for handling of string resources on different languages.   
 */
CRSMA.i18n = function() {
  /**
   * Map for localization messages.
   *
   * @private
   */
  var messages = {};

  /**
   * Returns registered message by key.
   * If there are no such message key is returned.
   *
   * @example
   * CRSMA.i18n.getMessage('agent007'); // My name is {1}, {0} {1}
   * CRSMA.i18n.getMessage('agent007', 'James', 'Bond'); // 'My name is Bond, James Bond'
   *
   * @param {string} key
   *  key.
   * @return {string} 
   *  localized message.
   *  
   * @public
   */
  var getMessage = function(key) {
    var message = messages[key];
    if (!message) {
      return key;
    }
    if (arguments.length > 1) {
      message = message.format(Array.prototype.slice.call(arguments, 1));
    }
    return message;
  };

  /**
   * Registers localized message with specified key.
   *
   * @param data
   *  object with messages('key' : 'value').
   *  
   * @public
   */
  var register = function(data) {
    for (var key in data) {
      if (data.hasOwnProperty(key)) {
        messages[key] = data[key];
      }
    }
  };

  return {
    // methods
    'getMessage' : getMessage,
    'register'   : register
  }
}();
/**
 * "Locationsearch" Javascript functions.
 * @ignore
 */
CRSMA = window.CRSMA || {};

/**
 * @namespace "Locationsearch" Javascript Module of "Commerce Reference Store Mobile Application"
 * @description Holds functionality related to location search actions in CRSMA.
 */
CRSMA.locationsearch = function() {
  
  /**
   * Removes Ns and nav query parameters in case geocrumb is getting removed.
   * 
   * @param pUrl - String URL to be modified.
   * @param pGeoProperty - Mdex geo-property field that should be removed.
   * 
   * @return uri without Ns and nav parameters.
   *
   * @public
   */
  var clearGeoSort = function(pUrl, pGeoProperty) {
    var uri = decodeURIComponent(pUrl.replace(/\+/g,  " "));
    var query = {};
    if (uri.indexOf("?") != -1) {
      query = getQueryParamsObject(uri.substring(uri.indexOf("?") + 1, uri.length));
      if (query.Ns && query.Ns.indexOf(pGeoProperty) != -1) {
        delete query.Ns;
      }
      query.nav = "true";
      uri = uri.substring(0, uri.indexOf("?"));
    }
    uri += "?" + decodeURIComponent($.param(query));
    return uri;
  };

  /**
   * Removes nav query parameters from current url before navigating to details
   * page. This ensures that when user navigates back, by default result list 
   * tab is displayed.
   *
   * @public
   */  
  var clearNavParamInHistoryBeforeMove = function() {
    var uri = decodeURIComponent(window.location.href.replace(/\+/g,  " "));
    var query = {};
    if (uri.indexOf("?") != -1) {
      query = getQueryParamsObject(uri.substring(uri.indexOf("?") + 1, uri.length));
      if (query.nav) {
        delete query.nav;
      }
      uri = uri.substring(0, uri.indexOf("?"));
    }
    uri += "?" + decodeURIComponent($.param(query));
    
    history.replaceState({},document.title,uri);
  };
  
  /**
   * This method is used in search near me and distance refinements cartridges 
   * to access shopper's current location and submit form. In case location 
   * service is disabled, appropriate errors are displayed.
   * 
   * @param pRefinement - Facet li for animation.
   * @param pNewRadius - New radius to be applied in geo search.
   * @param pGeoProperty - Mdex geo-property field used for Endeca query.
   * 
   * @public
   */
  var setLocationAndSubmit = function(pRefinement, pNewRadius, pGeoProperty) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(pPosition){
        var uri = decodeURIComponent(window.location.href.replace(/\+/g,  " "));
        var parametersObject;
        if (uri.indexOf("?") == -1){
          parametersObject = {
            Nfg: pGeoProperty + "|" + 
                pPosition.coords.latitude + "|" + 
                pPosition.coords.longitude + "|" + 
                pNewRadius,
            Ns: pGeoProperty + "(" + 
                pPosition.coords.latitude + "," + 
                pPosition.coords.longitude + ")|0",
            nav: "true"
          };
        } else {
          var delim = "?";
          parametersObject = getQueryParamsObject(uri.substring(uri.indexOf("?") + 1, uri.length));
          parametersObject.Nfg = pGeoProperty + "|" + 
              pPosition.coords.latitude + "|" + 
              pPosition.coords.longitude + "|" + 
              pNewRadius;
          parametersObject.Ns = pGeoProperty + "(" + 
              pPosition.coords.latitude + "," + 
              pPosition.coords.longitude + ")|0";
          parametersObject.nav = "true";
          uri = uri.substring(0, uri.indexOf("?"));
        }
        uri += "?" + decodeURIComponent($.param(parametersObject));

        CRSMA.search.applyFacet(pRefinement, uri);
      
      },function(error) {
        if(error.PERMISSION_DENIED) {
          $('#GeoNotSupported')[0].style.display='none';
          $('#GeoRequestDenied')[0].style.display='inline';
        }
      });
    }
    else {
      $('#GeoRequestDenied')[0].style.display='none';
      $('#GeoNotSupported')[0].style.display='inline';
    }
  };  

  /**
   * Turns String URL into query parameters object.
   * @param pQueryString - String URL to be transformed.
   *
   * @return parameters object (object[paramName] = paramValue)
   *
   * @private
   */
  var getQueryParamsObject = function(pQueryString) {
    var parametersObject = {};
    if (pQueryString.length != 0) {
      var paramsArray = pQueryString.split("&");
      for (var i = 0, len = paramsArray.length; i < len; i++) {
        var paramArray = paramsArray[i].split("=");
        parametersObject[paramArray[0]] = unescape(paramArray[1]);
      }
    }
    return parametersObject;
  };

  /**
   * List of "CRSMA.locationsearch" public methods.
   */
  return {
    "clearGeoSort"                     : clearGeoSort,
    "clearNavParamInHistoryBeforeMove" : clearNavParamInHistoryBeforeMove,
    "setLocationAndSubmit"             : setLocationAndSubmit
  }
}();/**
 * Javascript functions used in the mobile page template (mobile page cartridge, page header, and page footer).
 * @ignore
 */
CRSMA = window.CRSMA || {};

/**
 * @namespace 
 *  "Mobile Page Template" Javascript module of "Commerce Reference Store Mobile Application"
 * @description 
 *  Contains methods used in the mobile page template (mobile page cartridge, page header, and page footer).   
 */
CRSMA.mobilepage = function() {
  /**
   * Array of possible search bar states.
   * @private
   */
  var states = [];

  /**
   * Zero-based index of active state.
   * @private
   */
  var activeStateIndex;

  /**
   * Links to jquery selector results for perfomance.
   * @private
   */
  var $blockTitle, $blockNavigation;

  /**
   * Hides popup.
   * @public
   */
  var hidePopup = function() {
    $("#messagePopup").addClass("hidden");
  };

  /**
   * Shows 'Contact Us' page.
   *
   * @return {boolean} 
   *  always returns false.
   *
   * @public
   */
  var showContactUsPage = function() {
    var $contactInfo = $("#contactInfo").show();
    CRSMA.common.toggleModal(true);
    return false;
  };

  /**
   * Refreshes search bar titles according to the new state index.
   *
   * @param {integer} stateIndex
   *  New state index.
   *
   * @private
   */
  var adjustStateTo = function(stateIndex) {
    if (typeof activeStateIndex !== "undefined") {
      $('#' + states[activeStateIndex].id).hide();
    }

    var state = states[stateIndex];
    $blockTitle.html("<div id='switchBarLeftButtonTitle'>" + state.buttonTitle + "</div>");
    $blockNavigation.html(state.buttonNavigation);
    $('#' + state.id).show();

    activeStateIndex = stateIndex;
  };

  /**
   * Registers possible search bar states in the internal var.
   *
   * @param pStates 
   *  Array of second states (see usage in code).
   *  
   * @private
   */
  var registerStates = function(pStates) {
    states = pStates;

    for (var i = 0; i < states.length; i++) {
      if (states[i].active) {
        adjustStateTo(i);
        return;
      }
    }
  };
  
  /**
   * Recalculates activeStateIndex and adjusts search bar.
   * 
   * @public
   */
  var toggleSections = function() {
    adjustStateTo(activeStateIndex == 0 ? 1 : 0);
    $("#switchBar").toggleClass("refine");
  };
  
  /**
   * Initializes Endeca "MobilePage" cartridge renderer.
   * Creates bar with 2 blocks:
   * the 1-st one contains information about visible content,
   * the 2-nd one hides active content and shows the next content.
   * 
   * @public
   */
  var initMobilePage = function() {
    $blockTitle = $("<button role='rowheader'></button>");
    $blockNavigation = $('<a href="javascript:void(0)" onclick="CRSMA.mobilepage.toggleSections()"></a>');

    $("#switchBar")
      .addClass("switchBar")
      .append($blockTitle)
      .append($("<button role='button'>").append($blockNavigation))
      .append('<span class="dividerBar"/>');

    var params = CRSMA.common.getURLParams();
    var isRefinementRequest = (params["nav"] != null);
    var isBrowseOrBrandRequest = (params["Ntt"] == null);
    var isBrowseForProduct = (window.location.href.indexOf("/browse") != -1);

    // The "div.searchResults" (the "Results List" cartridge) is NOT present in BLP and in CLP content
    var resultsListCount = -1;
    var searchResults = $("div.searchResults");
    if (searchResults.length > 0) {
      resultsListCount = searchResults[0].dataset["resultsListCount"];
    }

    var navGroupsCount = 0;
    var guidedNav = $("div.guidedNavigation");
    var guidedNavExists = (guidedNav.length > 0);
    if (guidedNavExists) {
      navGroupsCount = guidedNav[0].dataset["navigationGroupsCount"];
    }

    var isMainActive = !isRefinementRequest || (navGroupsCount == 0);

    // Create button text containing each refinement by grabbing content from the DOM
    var buttonTitleTextList = [];
    var crumbContentElementList = $(".crumbContent");
    for (var i = 0; i < crumbContentElementList.length; i ++){
      buttonTitleTextList[i] = $(crumbContentElementList[i]).text().trim();
    }
    var buttonTitleText = buttonTitleTextList.join(", ");

    registerStates([{
      // ResultList
      id: "main",
      buttonTitle: buttonTitleText,
      buttonNavigation: CRSMA.i18n.getMessage("mobile.js.search.refine"),
      active: isMainActive
    },{
      // Breadcrumbs, GuidedNavigation
      id: "secondary",
      buttonTitle: (guidedNavExists ? (isBrowseOrBrandRequest ? (isBrowseForProduct ? CRSMA.i18n.getMessage("mobile.js.search.shop.by") : CRSMA.i18n.getMessage("mobile.js.search.search.by")) : CRSMA.i18n.getMessage("mobile.js.search.refine.by")) : ""),
      buttonNavigation: CRSMA.i18n.getMessage("mobile.js.common.done"),
      active: !isMainActive
    }]);
    $("#switchBar").toggleClass("refine", isRefinementRequest);
    
    // check if further subcategories exist among refinements
    var areCategoryRefinements = $('div.refinementFacetGroupContainer[data-is-category="true"]').length > 0;
    
    // Show popup with "No search results" info 
    // if we are on the refinement's page and there are no search results.
    // Note, that we also check if are category facets for further refinements:
    // It's for situation when user selects Root-category, that hasn't any products, but has subcategories, that have own products."
    if (activeStateIndex == 1 /* secondary*/ && !areCategoryRefinements && resultsListCount == 0) {
      $('#noSearchResultsPopup').show();
      CRSMA.common.toggleModal(true);
    }
  };
  
  /**
   * Returns search term
   * 
   * @private
   */
  var getSearchTerm = function() {
    var escapedTerm = CRSMA.common.getURLParams()["Ntt"];
    var unescapedTerm = "";
    if (escapedTerm) {
      unescapedTerm = '\"' + unescape(escapedTerm.replace(/\+/g, " ")) + '\"';
    }
    return unescapedTerm;
  };
  
  /**
   * Returns selected category on CategoryBrowse page.
   * 
   * @private
   */
  var getCategoryOrBrandName = function() {
    //Try to get Category name
    var categoriesAndSubcategories = $('#product_category .crumbContent .crumbContentText span');
    var lastItemIndex = categoriesAndSubcategories.length - 1;
    //If there are no any Categories - try to get Brand name
    if (lastItemIndex == -1 ) {
      categoriesAndSubcategories = $('#product_brand .crumbContent .crumbContentText span');
      lastItemIndex = categoriesAndSubcategories.length - 1;
    }
    //If still have no smth. to show - return empty string 
    return lastItemIndex != -1 ? categoriesAndSubcategories[lastItemIndex].innerHTML : "";
  };
  
  /**
   * Saves count of items in cart and timestamp for the history.back() handling.
   * 
   * @private
   */
  var saveBadgeData = function(pNewCount) {
    localStorage.setObject("badgeCount", pNewCount);
    localStorage.setObject("badgeTs", new Date());
  }

  /**
   * Takes count of items in cart and call saveBadgeData()
   * 
   * @public
   */
  var saveCartItems = function() {
    var currentBadgeData = $("#cartBadge")[0].innerText;
    saveBadgeData(parseInt(currentBadgeData));
  }
  
  /**
   * Checks if cart items count or cart content changed
   * and refreshes page if necessary.
   * 
   * @public
   */
  var refreshCartDataIfExpired = function(renderTs) {
    if (renderTs) {
      var currentBadgeData = $("#cartBadge")[0].innerText;
      var lsBadgeData = localStorage.getObject("badgeCount");
      var lsBadgeTs = new Date(localStorage.getObject("badgeTs"));

      if (renderTs < lsBadgeTs) {
        var isCartPageOpened = !!$(".cartContainer").length;
        if (isCartPageOpened) {
          location.reload();
        } else {
          refreshCartBadge(lsBadgeData);
        }
      }
    }
  };
  
  /**
   * Chain together multiple animations.<br>
   * Usage: chainAnimations([function, duration],...);
   * 
   * @private
   */
  var chainAnimations = function() {
    var args = Array.prototype.slice.call(arguments);
    var f = args.shift();
    var delay = args.shift();
    var tail = args;
    var callee = arguments.callee;
    if (f) {
      f();
      if (delay) {
        setTimeout(function() {callee.apply(this, tail);}, delay);
      }
    }
  };
  
  /**
   * Refreshes badge count on shopping cart.
   *
   * @param {number} pNewCount
   *  New count.
   *  
   * @see {@link chainAnimations}
   * 
   * @public
   */
  var refreshCartBadge = function(pNewCount) {
    if (pNewCount > 0) {
      var $cartBadge = $("#cartBadge");
      $cartBadge.show(); // in case it's currently hidden
      chainAnimations(
        function(){$cartBadge.toggleClass("highlight").toggleClass("textFade");}, 500,
        function(){$cartBadge.text(pNewCount).toggleClass("textFade");}, 900,
        function(){$cartBadge.toggleClass("highlight")}
      );
    }
    saveBadgeData(pNewCount);
  };

  /**
   * List of public "CRSMA.mobilepage" methods
   */
  return {
    // methods
    'initMobilePage'    : initMobilePage,
    'hidePopup'         : hidePopup,
    'showContactUsPage' : showContactUsPage,
    'refreshCartDataIfExpired' : refreshCartDataIfExpired,
    'refreshCartBadge'  : refreshCartBadge,
    'saveCartItems'     : saveCartItems,
    'toggleSections'    : toggleSections
  }
}();

/* Handling history.back added */
window.onpopstate = function(event) {
  CRSMA.mobilepage.refreshCartDataIfExpired(event.state);
};/**
 * MyAccount Javascript functions.
 * @ignore
 */
CRSMA = window.CRSMA || {};

/**
 * @namespace "MyAccount" Javascript Module of "Commerce Reference Store Mobile Application"
 * @description Holds functionality related to myaccount pages. 
 */
CRSMA.myaccount = function() {
  /**
   * This function shows states dropdown for selected country.
   *
   * @param {string} country 
   *  a selected country.
   * @param {string} state [optional] 
   *  if specified then state will be preselected in the dropdown shown.
   *  
   * @private
   */
  var toggleState = function(country, state) {
    var $currentState = $("select.state:visible");
    var $newState = $("select.state[data-country='" + country + "']");
    // Important to add/remove the 'name' attribute from all selects;
    // otherwise, the URL becomes polluted with empty values
    var nameAttr = $currentState.attr("name");
    $("select.state").removeAttr("name");
    $currentState.val("").addClass("default").toggle();
    $newState.toggleClass("default", !(state && state != ""));
    $newState.val(state).attr('name', nameAttr).toggle();    
  };

  /**
   * Applies 'default' css style to select element if selected option is default one.
   *
   * @param e 
   *  select element
   *  
   * @public
   */
  var changeDropdown = function(e) {
    // We have to copy over the class from the 'option' to the 'select'
    // because Webkit will not honor styles applied to an option element
    var $this = $(e.currentTarget);
    $this.toggleClass("default", $("option:selected", $this).is("option:first-child"));
  };

  /**
   * This function is for the "Day of Birth" (DOB) account property editor.
   * Repopulate the "Day" dropdown, if either the "Month" or "Year" dropdown has changed.
   * Leap years are taken into account.
   *
   * @param e 
   *  select element. The "Month" or "Year" dropdown.
   *  
   * @public
   */
  var changeDOBDropdown = function(e) {
    CRSMA.myaccount.changeDropdown(event);
    var $this = $(e.currentTarget);
    var idTarget = $this.attr("id");
    if (idTarget == "DOB_MonthSelect" || idTarget == "DOB_YearSelect") {
      var dayValue = $("#DOB_DaySelect").val();
      var day = (dayValue != "") ? parseInt(dayValue) : 0;
      var monthValue = $("#DOB_MonthSelect").val();
      var month = (monthValue != "") ? parseInt(monthValue) : 0;
      var $yearElement = $("#DOB_YearSelect");
      var yearValue =$yearElement.val();
      var year = (yearValue != "") ? parseInt(yearValue) : 0;
      
      // update the style for the year depending on whether a number has been selected or not
      if (year > 0) {
        $yearElement.removeClass("default");
      } else {
        $yearElement.addClass("default");
      }

      // Calculate the number of days in a new changed month, taking leap years into account
      if (month > 0 && year > 0) {
        var numberOfDaysInMonth;
        switch (month) {
          case 2:
            if (year % 4 == 0 && (!(year % 100 == 0) || year % 400 == 0)) {
              numberOfDaysInMonth = 29; // Leap year
            } else {
              numberOfDaysInMonth = 28;
            }
            break;
          case 4:
          case 6:
          case 9:
          case 11:
            numberOfDaysInMonth = 30;
            break;
          default:
            numberOfDaysInMonth = 31;
        }

        // Repopulate the "Day" dropdown keeping the default option 
        var dayNew = (day > numberOfDaysInMonth) ? numberOfDaysInMonth : day;
        var $dayDropdown = $("#DOB_DaySelect");
        var $options = $("select[id='DOB_DaySelect'] option");
        var $defaultOption = $options.filter(":first");
        $options.remove();
        
        $defaultOption.appendTo($dayDropdown);
        for (var i = 1; i <= numberOfDaysInMonth; i++) {
          if (dayNew == i) {
            $("<option value=\"" + i + "\" selected=\"true\">" + i + "</option>").appendTo($dayDropdown);
          } else {
            $("<option value=\"" + i + "\">" + i + "</option>").appendTo($dayDropdown);
          }
        }
      }
    }
  };

  /**
   * Sets specified order id and submits a form.
   *
   * @param {string} orderId 
   *  ID of order
   *  
   * @public
   */
  var loadOrderDetails = function(orderId) {
    $("#orderId").attr("value", orderId);
    $("#loadOrderDetailForm").submit();
  };
  
  /**
   * Extracts specified URL (or current if it's absent) with the specified parameter/value
   * and returns encoded URL.
   *
   * @param {string} key 
   *  the name of the parameter to set (any existing entry for that parameter will be replaced).
   * @param {string} value 
   *  the desired value for the parameter.
   * @param {string} url 
   *  the specified URL to add the parameter, if undefined the current page URL is used.
   *  
   * @return {string}
   *  An encoded URL string.
   * 
   * @private
   */
  var addURLParam = function(key, val, url) {
    if (!url) {
      url = window.location.href;
    }
    var params = CRSMA.common.getURLParams(url);
    params[key] = val;
    var loc = url.slice(0,url.indexOf('?'));
    return encodeURI(loc) + "?" + $.param(params); // JQuery.param makes it to be encoded like the encodeURIComponent function does
  };

  /**
   * Displays the full CRS modal redirect dialog. The link to the full CRS in the
   * dialog will contain the orderId parameter.
   *
   * @param orderId 
   *  an 'orderId' parameter value to add to the link to the full CRS site
   *  
   * @public
   */
  var toggleRedirectWithOrderId = function(orderId) {
    var $modalDialog = $("#modalMessageBox");
    var link = $("a", $modalDialog);
    link.attr("href", addURLParam("orderId", orderId, link.attr("href")));
    $modalDialog.show();
    CRSMA.common.toggleModal(true);
    window.scroll(0, 1);
  };

  /**
   * Attaches value from email input to the url value (email parameter)
   * 
   * @param {string} emailFieldId 
   *  id of email input tag
   * @param {string} urlId 
   *  id of url hidden tag
   *  
   * @public
   */
  var copyEmailToUrl = function(emailFieldId, urlId) {
    $('#' + urlId).val($('#' + urlId).val() + '&email=' + $('#' + emailFieldId).val());
  };

  /**
   * This function is a handler for country dropdown change event. It toggles
   * state dropdown and invokes standard handler.
   *
   * @param event 
   *  change event
   *  
   * @public
   */
  var selectCountry = function(event) {
    toggleState($(event.currentTarget).val());
    CRSMA.myaccount.changeDropdown(event);
  };

  /**
   * This function is a handler for state dropdown change event. It toggles state
   * dropdown and populate appropriate country in country dropdown.
   *
   * @param event 
   *  change event
   *  
   * @public
   */
  var selectState = function(event) {
    var $countrySelect = $("#countrySelect");
    var state = $(event.currentTarget).val();
    var country = $("option:selected", event.currentTarget).attr("data-country");
    $("select.state:not(:visible)").removeAttr("name");
    if (country && country != "") {
      $countrySelect.val(country).removeClass("default");
      toggleState(country, state);
    }
    changeDropdown(event);
  };
  
  /**
   * Displays the modal dialog and scrolls it's content to the start.
   * 
   * @public
   */
  var toggleCantDeleteAddressDialog = function() {
    $("#modalMessageBox").show();
    CRSMA.common.toggleModal(true);
    window.scroll(0,1);
  };

  /**
   * List of public "CRSMA.myaccount" methods
   */
  return {
    'changeDropdown'            : changeDropdown,
    'changeDOBDropdown'         : changeDOBDropdown,
    'copyEmailToUrl'            : copyEmailToUrl,
    'loadOrderDetails'          : loadOrderDetails,
    'selectCountry'             : selectCountry,
    'selectState'               : selectState, 
    'toggleCantDeleteAddressDialog' : toggleCantDeleteAddressDialog,
    'toggleRedirectWithOrderId'     : toggleRedirectWithOrderId
  }
}();
/**
 * Product Javascript functions.
 * @ignore
 */
CRSMA = window.CRSMA || {};

/**
 * @namespace "Product" Javascript Module of "Commerce Reference Store Mobile Application"
 * @description Holds functionality related to product detail pages, like
 * adding product to the cart, updating it there etc.
 */
CRSMA.product = function() {
  var $addToCartForm;
  var isUpdateCart;
  var $updateCartForm;
  var $skuIdField;
  var $actionsContainer;
  var $addToCartButton;
  var $buttonText;

  var $emailMeContainer;
  var $emailMeConfirm;
  var $emailMeForm;
  var $emailMeSkuField;
  var $emailMeAddress;
  var $emailMeAddressRow;
  var $rememberCheckbox;
  var $rememberInput;

  var $priceContainer;
  var initialPriceDisplay;

  /**
   * Map of pairs (skuid, skuFields) or something like (color:size, skufields)
   * for page with several pickers on the page.
   * @private
   */
  var productSKUs = {};

  /**
   * Array of pickers types, used on a page (f.e. color, size).
   * @private
   */
  var pickerTypes = [];

  /**
   * "true" means the "actionHandler" should display Shopping Cart page.
   * @private
   */
  var goToViewCart = false;

  /**
   * Object, containing currently selected SKU properties.
   * @private
   */
  var selectedSku = null;

  /**
   * Mobile site-specific context path, which also includes "/mobile/" suffix at the end.
   * @private
   */
  var productionURL;

  /**
   * Initializes CRSMA.product context variables.
   * Should be used on DOM ready.
   *
   * @param {string} pProductionURL
   *  The site production base URL ("/mobile/" path suffix is also included).
   *
   * @public
   */
  var init = function(pProductionURL) {
    productionURL = pProductionURL;

    $addToCartForm = $("#addToCartForm");
    isUpdateCart = ($addToCartForm.length == 0);
    // See mobile/browse/productDetail.jsp ??? the update cart form will only be present
    // when the add to cart form is not
    $updateCartForm = $("#updateCart");
    $skuIdField = $("input#addToCart_skuId");
    $actionsContainer = $("#addToCartButton");
    $addToCartButton = $("button", $actionsContainer);
    $buttonText = $("span#buttonText", $actionsContainer);

    $emailMeContainer = $("#emailMePopup");
    $emailMeConfirm =$("#emailMeConfirm");
    $emailMeForm = $("form", $emailMeContainer);
    $emailMeSkuField = $("#emailMeSkuId", $emailMeForm);
    $emailMeAddress = $("#rememberMeEmailAddress", $emailMeForm);
    $emailMeAddressRow = $("#emailAddressRow", $emailMeForm);
    $rememberCheckbox = $("#rememberCheckbox", $emailMeForm)[0];
    $rememberInput = $("input[name='rememberEmail']", $emailMeForm);

    $priceContainer = $("#pickerPrice");
    initialPriceDisplay = $priceContainer.html();
  };

  /**
   * Updates product and sale prices.
   *
   * @param {string} salePrice
   *  sale price.
   * @param {string} oldPrice
   *  product price.
   *
   * @private
   */
   var updatePrice = function(salePrice, oldPrice) {
    var price = "<p><strong>" + salePrice + "</strong>";
    if (oldPrice) {
      price = price + "<br>" + CRSMA.i18n.getMessage("mobile.js.price.old") + "<span> </span><span>" + oldPrice + "</span>";
    }
    price = price + "</p>";
    $priceContainer.html(price);
  };

  /**
   * This function is called asynchronously on callback after product SKU is added to the cart.
   * On success it changes cart handler for viewing the cart and it's label, increases cart badge counter.
   * On failure logs error in console.
   *
   * @param responseData
   *  JSON response, contains new cart item count and form errors (if any).
   *
   * @private
   */
  var addToCartCallback = function(responseData) {
    var error = responseData.addToCartError;
    if (error) {
      console.log(error);
    } else {
      goToViewCart = true;
      $addToCartButton.text(CRSMA.i18n.getMessage("mobile.js.navigation_shoppingCart.viewCart"));
      CRSMA.mobilepage.refreshCartBadge(responseData.cartItemCount);
    }
  };

  /**
   * Product action handler.
   *
   * According to the parameters:
   *  - Navigates to Shopping Cart page (displays "Shopping Cart")
   *  - Adds product to the cart
   *  - Updates product in the cart
   *  - Shows pop-up with warning text about product unavailability.
   *
   * @param event
   *  Event object
   *
   * @public
   */
  var actionHandler = function(event) {
    event.stopPropagation();

    // Non-empty viewCart url means, that product was successfully added to the cart 
    // and user hasn't changed anything on the page since that time
    if (goToViewCart) {
      window.location.replace(productionURL + "cart/cart.jsp");
      return;
    }

    // Usually "selectedSku" is filled when pickers or quantity are changed.
    // But if user immediately clicks "Add to cart", "selectedSku" may be not initialized
    selectedSku = getSelectedSku();

    // If product is "out of stock", we don't add it to the cart.
    // Show popup with information for customer, that product is absent and offers
    // email providing if user wants to receive notification when product will be in stock
    if (selectedSku.status == "outofstock") {
      $emailMeAddressRow.toggleClass("errorState", false); // clear previous error state, if any
      $emailMeContainer.show();
      $emailMeConfirm.hide();
      CRSMA.common.toggleModal(true);
      return;
    }

    // We there if the product has one of the following statuses (available, backorder, preorder)
    // and it could be added to the cart or updated
    if (isUpdateCart) {
      // Update product in the cart
      $updateCartForm.submit(); // when updating the cart, just submit the form normally
    } else {
      // Add product to the cart
      $.post(
        $addToCartForm.attr("action"),
        $addToCartForm.serialize(),
        addToCartCallback
      );
    }
  };

  /**
   * Updates product price, sale price, label on a button, which adds product to cart,
   * product status for preorderable, backorderable, outofstock products and button handler.
   * May be used only when user completes selection of SKU.
   *
   * @param {string} buttonLabel
   *  label like "Add to Cart", "Update Cart" etc.
   * @param {string} buttonText
   *  sku status, for example, "Available Soon".
   * @param {Object} skuFields
   *  SKU-Object.
   *
   * @private
   */
  var refreshProductInfo = function(buttonLabel, buttonText, skuFields) {
    updatePrice(skuFields.productPrice, skuFields.salePrice);

    if (skuFields.status == "outofstock") {
      $emailMeSkuField.val(skuFields.skuId);
    } else {
      $skuIdField.val(skuFields.skuId);
    }

    $addToCartButton.text(buttonLabel).removeAttr("disabled");

    $buttonText.text(buttonText);
  };

  /**
   * Makes submit from popup, appearing when user tries to add "unavailable" product to the cart.
   * On success, closes popup.
   * On failure, shows errors inside.
   *
   * @param event
   *  Event object
   *
   * @public
   */
  var emailMeSubmit = function(event) {
    event.preventDefault();
    if ($rememberCheckbox.checked) {
      $rememberInput.val($emailMeAddress.val());
    }
    $.post(
      $emailMeForm.attr("action"),
      $emailMeForm.serialize(),
      function(errors) {
        if (errors.length > 0) {
          $emailMeAddressRow.toggleClass("errorState", true);
        } else {
          $emailMeAddressRow.toggleClass("errorState", false);
          $emailMeContainer.hide();
          $emailMeConfirm.show();
        }
      },
      "json"
    );
  };

  /**
   * Returns currently selected SKU or null if some pickers aren't specified.
   * Note, that for single sku page it always returns not-null object.
   *
   * @return JSON-object with the SKU fields or null.
   *
   * @private
   */
  var getSelectedSku = function() {
    var sku;
    if (pickerTypes.length > 0) {
      // Product with pickers
      var key = "";
      for (var i = 0; i < pickerTypes.length; i++) {
        var prop = pickerTypes[i];
        var $input = $("select[name='" + prop + "']");
        if ($input.length > 0) {
          key += $input.val() + ":";
        }
      }
      sku = productSKUs[key.slice(0, -1)]; // remove the trailing colon
    } else {
      // Single SKU page
      for (var key in productSKUs) {
        sku = productSKUs[key]; // Get first one
        break;
      }
    }
    return sku;
  };

  /**
   * Gets executed every time a picker value (or sometimes quantity) is changed to
   * determine which SKU has been selected, if any.
   * The function will search for "select" elements on the page with corresponding names.<br/>
   * NOTE, that order is important for constructing the key !
   *
   * @private
   */
  var checkForSelectedSku = function() {
    var sku = getSelectedSku();
    if (sku) { // If this is not a valid SKU selection, sku will be null
      onSkuSelect(sku);
    } else {
      // Disable the button if this is not a valid selection
      $addToCartButton.attr("disabled", "disabled");
    }
  };

  /**
   * It's called when user completes selection of SKU.<br/>
   * Refreshes SKU details info on a page according to the selected SKU status,
   * prepares cart button for future submit.
   *
   * @param sku
   *  SKU fields object
   *
   * @private
   */
  var onSkuSelect = function(sku) {
    selectedSku = sku;

    switch (sku.status) {
    case "available":
      refreshProductInfo(
        CRSMA.i18n.getMessage(isUpdateCart ? "mobile.js.productDetails.updatecart" : "mobile.js.common.button.addToCartText"),
        "", sku);
      break;

    case "preorder":
      refreshProductInfo(
        CRSMA.i18n.getMessage(isUpdateCart ? "mobile.js.productDetails.updatecart" : "mobile.js.button.preorderLabel"),
        CRSMA.i18n.getMessage("mobile.js.button.preorderText"), sku);
      break;

    case "backorder":
      refreshProductInfo(
        CRSMA.i18n.getMessage(isUpdateCart ? "mobile.js.productDetails.updatecart" : "mobile.js.common.button.addToCartText"),
        CRSMA.i18n.getMessage("mobile.js.button.backorderText"), sku);
      break;

    case "outofstock":
      refreshProductInfo(
        CRSMA.i18n.getMessage("mobile.js.common.temporarilyOutOfStock"),
        CRSMA.i18n.getMessage("mobile.js.button.emailMeText"), sku);
      break;
    }
  };

  /**
   * Called when a picker value has changed.
   *
   * @param event
   *  Event object.
   *
   * @public
   */
  var pickerSelect = function(event) {
    var $this = $(event.currentTarget);
    // We need to set "title" attribute for select to make VoiceOver read it as "Name - Value"
    var defaultText = $("option:disabled", $this).attr("label");
    var noValue = ($this.val() == "");
    if (noValue) {
      // Revert to initial display if there is no valid selection
      $priceContainer.html(initialPriceDisplay);
    }
    // We need to set the appropriate title for the current selection
    $this.attr("title", noValue ? "" : defaultText);
    // If no value has been selected, toggle "selected" off. Otherwise, toggle it on
    $(event.currentTarget).toggleClass("selected", !noValue);
    checkForSelectedSku(); // check if this is a complete SKU selection
    goToViewCart = false;
  };

  /**
   * Called when the quantity picker value has been changed.
   *
   * @public
   */
  var quantitySelect = function(event) {
    var $qtyField = $("#addToCart_qty");
    var selectedQty = $("select[name='qty']").val();
    $qtyField.val(selectedQty);
    checkForSelectedSku();
    goToViewCart = false;
  };

  /**
   * This function toggles product view between normal and enlarged.
   *
   * @public
   */
  var toggleProductView = function() {
    $("#productImage").click(function () {
      var $detailsContainer = $(".itemPickers");
      $detailsContainer.toggleClass("productEnlarged");
    });
  };

  /**
   * Expand or collapse pickers according to the specified boolean flag.
   *
   * @param {boolean} pShowOrHide
   *  indicates show or hide should be used.
   *
   * @public
   */
  var expandPickers = function(pShowOrHide) {
    $("li.itemPickers").toggleClass("expanded", pShowOrHide);
  };

  /**
   * Parses JSON-array and initializes the productSKUs-map.<br/>
   *
   * Each item in JSON-array is the object with properties:
   * <ul>
   *   <li>key - unique key, identifying sku, f.e. "Blue:L" or "xsku2051"</li>
   *   <li>value - map of properties:
   *     <ul>
   *       <li>salePrice    - sale price</li>
   *       <li>productPrice - product price</li>
   *       <li>skuid        - sku repository id</li>
   *       <li>status       - one from (available, preorder, backorder, outofstock)</li>
   *     </ul>
   *   </li>
   * </ul>
   *
   * @param skus
   *  JSON array with the SKU key and value.
   *
   * @public
   */
  var registerSKUs = function(skus) {
    for (var i = 0; i < skus.length; i++) {
      var sku = skus[i];
      productSKUs[sku.key] = sku.value;
    }
  };

  /**
   * Adds picker type to the list.
   *
   * @param {string} type
   *  picker type, f.e. "color", "size" etc.
   *
   * @public
   */
  var registerPickerType = function(type) {
    pickerTypes.push(type);
  };

  /**
   * List of "CRSMA.product" public methods.
   */
  return {
    "actionHandler"     : actionHandler,
    "emailMeSubmit"     : emailMeSubmit,
    "expandPickers"     : expandPickers,
    "init"              : init,
    "pickerSelect"      : pickerSelect,
    "quantitySelect"    : quantitySelect,
    "registerSKUs"      : registerSKUs,
    "registerPickerType": registerPickerType,
    "toggleProductView" : toggleProductView
  }
}();
CRSMA = window.CRSMA || {};

CRSMA.promo = function() {
  /*
   * Index of current selected Promo.
   * @private
   */
  var currentPromoIndex = 0;
 
  /**
   * Creates the "Promotional item" slider.
   * 
   * @private
   */
  var createPromotionalItemSlider = function(pGridId) {
    CRSMA.sliders.createSlider({
      gridid : pGridId,
      numberOfCells : 1,
      touchSensitivity : 6000,
      snapToGrid : true,
      extension : {
        /**
         * Calculates the middle cell based on the left position and do the
         * appropriate action.
         * 
         * @public
         */
        postTouchMove : {
          value : function(/* int */pLeft) {
            if (pLeft <= 0) {
              pLeft = (pLeft < 0) ? -pLeft : pLeft;
              var currentCell = Math.round(pLeft / this.colWidth);
              if (typeof this.currentCenterCell === "undefined") {
                this.currentCenterCell = currentCell;
                EventManager.publish("sliderMoveEvent", {
                  "caller" : "promo",
                  "focusedCellIndex" : currentCell
                });
                return;
              };
              if (this.currentCenterCell !== currentCell) {
                this.currentCenterCell = currentCell;
                EventManager.publish("sliderMoveEvent", {
                  "caller" : "promo",
                  "focusedCellIndex" : currentCell
                });
              }
            }
          }
        },

        /**
         * Calculates which items are on the screen, and set their display
         * to hidden.
         * 
         * @public
         */
        postTouchEnd : {
          value : function(/* int */pLeft, /* string */pDuration) {
            this.postTouchMove(pLeft);
            var sliderObject = this;
            var strippedDuration = pDuration.substring(0, pDuration.length - 1) * 1000;

            setTimeout(function() {
              if (!sliderObject.touching && pLeft <= 0) {
                pLeft = (pLeft < 0) ? -pLeft : pLeft;
                var cellsOffPage = Math.round(pLeft / sliderObject.colWidth);
                var end = cellsOffPage + 1;
                $.each(sliderObject.cells, function(index) {
                  var $cell = $(this);
                  if (index > cellsOffPage && index <= end) {
                    $cell.show();
                  }
                });
              }
            }, strippedDuration);
          }
        }
      }
    });
  };

  /*
   * Changes the class on the circle id to signify whether it's on or off.
   *
   * @param {string} pGridId
   *  Circle id.
   * @param {boolean} pStatus
   *  Indicator if circle is on.
   *  
   * @private
   */
  var setCircleStatus = function(pGridId, pStatus) {
    var $circleItem = $("#pageCircle_" + pGridId);
    var addClassValue = "BLANK";
    var removeClassValue = "ON";
    if (pStatus) {
      addClassValue = "ON";
      removeClassValue = "BLANK";
    }
    $circleItem.removeClass(removeClassValue).addClass(addClassValue);
  };

  /*
   * Handler for slider event.
   *
   * @param pEvent 
   *  Event object 
   * @param pParams
   * 
   * @private 
   */
  var sliderEventHandler = function(pEvent, pParams) {
    var caller = pParams.caller;
    var index = pParams.focusedCellIndex;
    if (caller === "promo") {
      setCircleStatus(index, true);
      setCircleStatus(currentPromoIndex, false);
      currentPromoIndex = index;
	  var div = document.getElementById("voiceOverText");
	  var totalPg = $("#homeTopSlotContent").children(".cell").size();
	  var currentPg = index + 1;
      div.innerHTML = CRSMA.i18n.getMessage('mobile.js.heroImage.pageNumber', currentPg, totalPg);
    }
  };

  /*
   * Event Manager object.
   * 
   * @namespace EventManager @public
   */
  var EventManager = {
    /*
     * Attaches handler to the specified event in the context of EventManager.
     * 
     * @param {string} event event name. @param fn function.
     * 
     * @public
     */
    subscribe : function(event, fn) {
      $(this).bind(event, fn);
    },
    /*
     * Executes handler, binded previously to the specified event with
     * parameters.
     * 
     * @param {string} event event name. @param params parameters to pass along
     * to the event handler.
     * 
     * @public
     */
    publish : function(event, params) {
      $(this).trigger(event, params);
    }
  };

  EventManager.subscribe("sliderMoveEvent", sliderEventHandler);
 
  /**
   * Displays promotional content item from the "sessionStorage".
   * 
   * @private
   */
  var displayPromotionalContentItems = function(pGridId) {
    var html = sessionStorage.getObject("promotionalContent");
    $(pGridId).empty().html(html);
    createPromotionalItemSlider(pGridId);
  };

  var initPromoSlider = function() {
    // Save the promotional content items and create the slider
    var html = $("#homeTopSlotContent").html();
    sessionStorage.removeItem("promotionalContent");
    sessionStorage.setObject("promotionalContent", html);
    createPromotionalItemSlider("#homeTopSlotContent");

    // Add this orientationchange/resize event to re-render the parents/child so
    // that things are centered correctly
    var orientationSupport = "onorientationchange" in window, orientationEvent = orientationSupport ? "orientationchange" : "resize";
    window.addEventListener(orientationEvent, function() {
      displayPromotionalContentItems("#homeTopSlotContent");
    }, false);
	var div = document.getElementById("voiceOverText");
	var totalPg = $("#homeTopSlotContent").children(".cell").size();
	var currentPg = 1;
    div.innerHTML = CRSMA.i18n.getMessage('mobile.js.heroImage.pageNumber', currentPg, totalPg);
	
  };

  /**
   * "CRSMA.promo" public list
   */
  return {
    // Methods
    "initPromoSlider" : initPromoSlider
  }
}();/**
 * Javascript functions used to support Returns.
 * @ignore
 */
CRSMA = window.CRSMA || {};

/**
 * @namespace 
 *  "Stores" Javascript module of "Commerce Reference Store Mobile Application"
 * @description 
 *  Contains methods used in Return functionality 
 */
CRSMA.returns = function() {

  var $universalReasonSlct;  
  var $continueBtn;  
  var $returnAllCheckbox;  
  var $reasonSelects;  
  var $quantitySelects;
  
  /**
   * Checks if variables are not initted and inits them.
   * 
   * @public
   */
  var init = function() {
    $universalReasonSlct = $(".universalReasonSlct");
    $continueBtn = $("#continueBtn");
    $returnAllCheckbox = $("#selectAll");
    $reasonSelects = $(".reasonSlct");
    $quantitySelects = $(".quantitySlct");
    
    $returnAllCheckbox.change(onSelectAllChecked);
    $reasonSelects.change(checkSelectsData);
    $quantitySelects.change(checkSelectsData);
    $universalReasonSlct.change(onSelectAllChanged);
    checkSelectsData();
  };
  
  /**
   * Sets max value for quantity selects
   * 
   * @private
   */  
  var selectQuantityMaxValues = function() {
    $quantitySelects.each(function() {
      $(this).children('option:last-child').attr('selected', 'true');
    });
  };
  
  /**
   * Sets initial values for reason selects
   * 
   * @private
   */
  var selectReasonInitialValues = function() {
    $reasonSelects.each(function() {
      $(this).children('option:first-child').attr('selected', 'true');
    });
    $universalReasonSlct.children('option:first-child').attr('selected', 'true');
  };
  
  /**
   * Sets param value for all reason selects
   * 
   * @param
   *  selectedOptionValue - option value for selecting
   * @private
   */
  var selectReasonSetValues = function(selectedOptionValue) {
    $reasonSelects.each(function() {
      $(this).children("option[value=" + selectedOptionValue + "]").attr('selected', 'true');
    });
  };
  
  /**
   * Sets initial values for quantity selects
   * 
   * @private
   */
  var selectQuantityInitialValues = function() {
    $quantitySelects.each(function() {
      $(this).children('option:first-child').attr('selected', 'true');
    });
  };

  /**
   * Check if select has selected value
   * 
   * @private
   * @param
   *  obj - select to check
   */
  var isSelected = function(obj) {
    return !($(obj).children('option:first-child').attr('selected'));
  };

  /**
   * Checks all selects for correct data
   * For each return item quantity select and reason select 
   * should be both selected or unselected 
   * 
   * @private
   */
  var checkSelectsData = function() {
    var brokenPairExists = false;
    var checkedPairExists = false;
    $reasonSelects.each(function() {
      var isReasonSelected = isSelected(this);
      /* if both are in one state (selected or not) */
      if ( isReasonSelected !== isSelected($(this).siblings(".quantitySlct")) ) {
        brokenPairExists = true;
      }
      if (isReasonSelected) {checkedPairExists = true};
    });
    if (!brokenPairExists && checkedPairExists) {
      $continueBtn.removeAttr('disabled');
    } else {
      $continueBtn.attr("disabled", "disabled");
    }
  };

  /**
   * Checks states after every change and makes
   * changes in layout
   * 
   * @private
   */
  var onSelectAllChecked = function() {
    if ($(this).attr('checked') === 'checked') {
      $universalReasonSlct.removeClass("hidden");
      $reasonSelects.attr("disabled", "disabled");
      $quantitySelects.attr("disabled", "disabled");
      selectReasonInitialValues();
      selectQuantityMaxValues();
      if (!isSelected($universalReasonSlct)) {$continueBtn.attr("disabled", "disabled");};
    } else {
      selectQuantityInitialValues();
      selectReasonInitialValues();
      $universalReasonSlct.addClass("hidden");
      $reasonSelects.removeAttr('disabled');
      $quantitySelects.removeAttr('disabled');
      $continueBtn.attr("disabled", "disabled");
    }
  };

  /**
   * Checks states after UniversalReasonSelect changed and
   * changes in layout
   * 
   * @private
   */
  var onSelectAllChanged = function() {
    if ($returnAllCheckbox.attr('checked') === 'checked' && isSelected(this)) {
      $continueBtn.removeAttr('disabled');
      var selectedOptionValue = $(this).children('option:selected').attr("value");
      selectReasonSetValues(selectedOptionValue);
    } else {
      selectReasonInitialValues();
      $continueBtn.attr("disabled", "disabled");
    }
  };
  
  /**
   * List of public "CRSMA.returns" methods
   */
  return {
    // methods
    "init"                : init
  }
}();
/**
 * "Search" Javascript functions.
 * @ignore
 */
CRSMA = window.CRSMA || {};

/**
 * @namespace "Search" Javascript Module of "Commerce Reference Store Mobile Application"
 * @description Holds functionality related to search actions in CRSMA.
 */
CRSMA.search = function() {
  /**
   * Pins and range elements.
   * @private
   */
  var $leftPinElem, $rightPinElem, $rangeElem;

  /**
   * PriceSlider ranges.
   * @private
   */
  var fullRange, activeRange;

  /**
   * Timeout identifier for PriceSlider delay submit.
   * @private
   */
  var sliderSubmitTimeoutId;

  /**
   * Timeout identifier for "Search" field, "onBlur" handler.
   * @private
   */
  var searchBlurTimeoutId;

  /**
   * PriceSlider elements.
   * @private
   */
  var $minPriceContainer, $maxPriceContainer;

  /**
   * PriceSlider dimensions.
   * @private
   */
  var containerWidth, pinWidth, valueToCoordinatesRatio, activeOffset;
  var previousOffset = 0, layoutStrategy;

  /**
   * PriceSlider property name.
   * @private
   */
  var pricePropertyName;

  /**
   * PriceSlider container.
   * @private
   */
  var container;

  /**
   * Flag for "Search" field. Default to false.
   * @private
   */
  var isSearchInit = false;

  /**
   * "Search" field element.
   * @private
   */
  var $searchField;

  /**
   * Indicator of remove Breadcrumb request state.
   * Not allows to click on another crumb during request sending for previous
   */
  var removeRequestInProgress = false;

  /**
   * Indicator of add Refinement request state.
   * Not allows to click on another refinement during request sending for previous
   */
  var addRequestInProgress = false;

  /**
   * Validates range.
   *
   * @param {object} range
   *  Slider range.
   *  
   * @private
   */
  var validateAndFixRange = function(range) {
    var validRange = {
      min : fullRange.min,
      max : fullRange.max
    };
    if (range) {
      if (range.min && range.min > fullRange.min) {
        validRange.min = range.min;
      }
      if (range.min > fullRange.max) {
        validRange.min = fullRange.max;
      }

      if ((range.max || range.max == 0) && range.max < fullRange.max) {
        validRange.max = range.max;
      }
      if ((range.max || range.max == 0) && range.max < fullRange.min) {
        validRange.max = fullRange.min;
      }
      if (validRange.max < validRange.min) {
        validRange.max = validRange.min;
      }
    }
    return validRange;
  };

  /**
   * Converts slider range to slider offset.
   *
   * @param {object} range
   *  Slider range.
   *
   * @return {object} offset
   *  Slider offset.
   *
   * @private
   */
  var rangeToOffset = function(range) {
    var rangeLength = range.max - range.min;
    var offset = {
      left : Math.round((range.min - fullRange.min) * valueToCoordinatesRatio),
      right : Math.round((fullRange.max - range.max) * valueToCoordinatesRatio)
    };

    return offset;
  };

  /**
   * Converts slider offset to slider range.
   *
   * @param {object} offset
   *  Slider offset.
   *
   * @return {object} 
   *  range - Slider range.
   *
   * @private
   */
  var offsetToRange = function(offset) {
    var offsetLength = offset.right - offset.left;
    var range = {
      min : Math.round(offset.left / valueToCoordinatesRatio),
      max : Math.round((containerWidth - offset.right) / valueToCoordinatesRatio)
    };

    return range;
  };

  /**
   * Setting layout of elements.
   * 
   * @private
   */
  var layoutElements = function() {
    var offset = activeOffset;
    $leftPinElem.css({left: offset.left + "px", right: ""});
    $rightPinElem.css({left: "", right: offset.right + "px"});
    $rangeElem.css({left: offset.left + "px", width: containerWidth - offset.left - offset.right + "px"});
  };

  /**
   * Swaps pins if overlapsed.
   *
   * @param left
   *  Slider left offset.
   * @param right
   *  Slider right offset.
   *
   * @private
   */
  var adjustRangeIfOverlapses = function(left, right) {
    if (left + right >= containerWidth) {
      var swap = left;
      left = containerWidth - right;
      right = containerWidth - swap;

      swap = $leftPinElem;
      $leftPinElem = $rightPinElem;
      $rightPinElem = swap;
      layoutStrategy = arguments.callee.caller === adjustOffsetForRightPinMove ? adjustOffsetForLeftPinMove : adjustOffsetForRightPinMove;
    }
    activeOffset.left = left;
    activeOffset.right = right > 0 ? right : 0;
  };

  /**
   * Adjusts offset for left pin.
   *
   * @param delta
   *  Offset delta.
   *
   * @private
   */
  var adjustOffsetForLeftPinMove = function(delta) {
    var newLeft = activeOffset.left + delta;
    var maxAllowedValidOffset = Math.round((fullRange.max - 1)*valueToCoordinatesRatio);
    if (newLeft < 0) {
      activeOffset.left = 0;
      return false;
    }
    if (newLeft > maxAllowedValidOffset) {
      activeOffset.left = maxAllowedValidOffset;
      return false;
    }
    adjustRangeIfOverlapses(newLeft, activeOffset.right);
    return true;
  };

  /**
   * Adjusts offset for right pin.
   *
   * @param delta
   *  Offset delta.
   *
   * @private
   */
  var adjustOffsetForRightPinMove = function(delta) {
    var newRight = activeOffset.right - delta;
    var maxAllowedValidOffset = Math.round((fullRange.max - 1)*valueToCoordinatesRatio);
    if (newRight > maxAllowedValidOffset) {
      newRight = maxAllowedValidOffset;
      return false;
    }
    if (newRight < 0) {
      newRight = 0;
      return false;
    }
    adjustRangeIfOverlapses(activeOffset.left, newRight);

    return true;
  };

  /**
   * Adjusts offset for range move.
   *
   * @param delta
   *  Offset delta.
   *
   * @private
   */
  var adjustOffsetForActiveRangeMove = function(delta) {
    if ((activeOffset.left + delta) > 0 && (activeOffset.right - delta) > 0) {
      return adjustOffsetForLeftPinMove(delta) && adjustOffsetForRightPinMove(delta);
    }
    return false;
  };

  /**
   * Returns clientX(touch and click events difference hide).
   *
   * @param {object} event
   *  Slider event.
   *
   * @private
   */
  var getClientXValue = function(event) {
    var clientXvalue = event.clientX;
    if (typeof clientXvalue === "undefined" || clientXvalue == null) {
      clientXvalue = event.originalEvent.touches[0].clientX;
    }
    return clientXvalue;
  };

  /**
   * Slider movement handler.
   *
   * @param {object} event
   *  Slider event.
   *
   * @private
   */
  var movementHandler = function(event) {
    if (layoutStrategy && layoutStrategy(getClientXValue(event) - previousOffset)) {
      previousOffset = getClientXValue(event);
      layoutElements();
    }
    displayPriceRange();
  };

  /**
   * Shows new calculated price range when slider moved.
   *
   * @private
   */
  var displayPriceRange = function() {
    var range = offsetToRange(activeOffset);
    $minPriceContainer.text(range.min);
    $maxPriceContainer.text(range.max);
    $leftPinElem.attr("aria-valuenow", range.min);
    $rightPinElem.attr("aria-valuenow", range.max);
  };

  /**
   * Handler for slider end movement.
   *
   * @param {object} event
   *  Slider event.
   *
   * @private
   */
  var movementEndHandler = function(event) {
    layoutStrategy = undefined;
    $(document).unbind("touchmove mousemove", movementHandler)
               .unbind("touchend mouseup", movementEndHandler);
    delaySubmit(1000);
  };

  /**
   * Submit price range facet.
   *
   * @param {object} range
   *  Price range.
   *
   * @private
   */
  var submitPriceRange = function(range) {
    uri = document.location.pathname;
    var delim = "?";
    var parametersObject = getQueryParamsObject(window.location.search.substring(1));
    parametersObject["Nf"] = pricePropertyName + "|BTWN+" + range.min + "+" + range.max;
    parametersObject["nav"] = "true";

    searchString = decodeURIComponent(jQuery.param(parametersObject));
    document.location = uri + delim + searchString;
  };

  /**
   * Waits and submit price range (one request for several price range modifications).
   *
   * @param delayParam
   *  Time to wait.
   *
   * @private
   */
  var delaySubmit = function(delayParam) {
    if (sliderSubmitTimeoutId) {
      clearTimeout(sliderSubmitTimeoutId);
    }
    sliderSubmitTimeoutId = setTimeout(function() {
      var range = offsetToRange(activeOffset);
      submitPriceRange(range);
      sliderSubmitTimeoutId = null;
    }, delayParam);
  };

  /**
   * Handler for slider end movement.
   *
   * @param {object} event
   *  Slider event.
   *
   * @private
   */
  var movementStartHandler = function(event) {
    event.preventDefault();
    if ($leftPinElem.get(0) === event.target) {
      layoutStrategy = adjustOffsetForLeftPinMove;
    }
    if ($rightPinElem.get(0) === event.target) {
      layoutStrategy = adjustOffsetForRightPinMove;
    }
    if ($rangeElem.get(0) === event.target) {
      layoutStrategy = adjustOffsetForActiveRangeMove;
    }
    previousOffset = getClientXValue(event);
    $(document).bind("touchmove mousemove", movementHandler)
               .bind("touchend mouseup", movementEndHandler);
  };

  /**
   * Allows to get width property of hidden element.
   *
   * @param {object}
   *  Element.
   *
   * @private
   */
  var getWidth = function($item) {
    var props = {visibility : "hidden", display : "block"};
    var $hiddenParents = $item.parents().andSelf().not(":visible");
    var oldProps = [];
    $hiddenParents.each(function() {
      var old = {};
      for (var name in props) {
        old[name] = this.style[name];
        this.style[name] = props[name];
      }
      oldProps.push(old);
    });

    var width = $item.outerWidth();
    $hiddenParents.each(function(i) {
      var old = oldProps[i];
      for (var name in props) {
        this.style[name] = old[name];
      }
    });
    return width;
  };

  /**
   * Constructor for price range slider.
   *
   * @param {object} containerElement
   *  Slider container.
   * @param {object} passedFullRange
   *  Slider price full range.
   * @param {object} passedActiveRange
   *  Slider price initial range.
   *
   * @public
   */
  var initRangeFilter = function(containerElement, passedFullRange, passedActiveRange, pricePropertyNameParam) {
    pricePropertyName = pricePropertyNameParam;
    fullRange = passedFullRange;
    container = containerElement;

    $leftPinElem = $(".range-min-value", container);
    $rightPinElem = $(".range-max-value", container);
    $rangeElem = $(".active-range", container);
    var $priceContainers = $(".price", container);
    $minPriceContainer = $($priceContainers.get(0));
    $maxPriceContainer = $($priceContainers.get(1));

    $leftPinElem.add($rightPinElem)
                .add($rangeElem)
                .bind("touchstart mousedown", movementStartHandler);

    pinWidth = $leftPinElem.outerWidth();
    activeRange = validateAndFixRange(passedActiveRange);

    $leftPinElem.attr("aria-valuemin", fullRange.min);
    $leftPinElem.attr("aria-valuemax", fullRange.max);
    $rightPinElem.attr("aria-valuemin", fullRange.min);
    $rightPinElem.attr("aria-valuemax", fullRange.max);

    drawSlider();

    // When device orientation changed - slider should be recalculated and redrawn
    $(window).bind("orientationchange", function() {
      drawSlider();
    });
  };

  /**
   * Draws slider for active range.
   *
   * @private
   */
  var drawSlider = function() {
    containerWidth = getWidth(container.find(".slider-wrapper")) - pinWidth;
    valueToCoordinatesRatio = containerWidth / (fullRange.max - fullRange.min);

    $leftPinElem.attr("aria-valuenow", activeRange.min);
    $rightPinElem.attr("aria-valuenow", activeRange.max);

    activeOffset = rangeToOffset(activeRange);
    layoutElements();
    displayPriceRange();
  };

  /**
   * Adds/removes "searchFocus" class to element with "mainHeader" id and initializes search-related elements
   * if they are not yet initialized.
   *
   * @public
   */
  var searchOnFocus = function() {
    initSearchIfNotInited();
    $("#mainHeader").addClass("searchFocus");
  };

  /**
   * Initializes the search field.
   *
   * @private
   */
  var initSearchIfNotInited = function() {
    if (!isSearchInit) {
      $searchField = $("#searchText");
      $("#searchForm").submit(function() {
        return !isSearchFieldEmpty();
      });
      $searchField.bind("blur", searchOnBlur);
      isSearchInit = true;
    }
  };

  /**
   * Checks if "Search" field is empty.
   *
   * @private
   */
  var isSearchFieldEmpty = function() {
    return ($searchField.attr('value').length == 0);
  };

  /**
   * Applies facet and adding animation.
   *
   * @param {object} pDimValueLI
   *  Facet line (LI tag).
   * @param {object} pNavLink
   *  Link for applying.
   *
   * @public
   */
  var applyFacet = function(pDimValueLI, pNavLink) {
    if (!addRequestInProgress) {
      var $li = $(pDimValueLI);

      // When first animation(scaling) ends - make changes for other lines
      $li.bind("webkitTransitionEnd", function() {
        var liHeightOffset = $li.height() * -1;
        if ($li.is(":last-child")) {
          $li.prev().css({"margin-bottom" : liHeightOffset});
          return;
        }
        if ($li.is(":first-child")) {
          $li.next().css({"border-top" : "none"});
        }
        $li.next().css({"margin-top" : liHeightOffset});
      });

      // When all animation sequence ends - apply facet
      $li.bind("webkitAnimationEnd", function() {
        // Hide dimension container when the last dimension value is selected in RefinementMenu
        if ($li.parent().children("li").length == 1) {
          $li.parent().parent().hide();
        }

        document.location = setNavState(pNavLink);
      });

      // Start animation
      $li.addClass("animateScaleAndFlyUp");
      addRequestInProgress = true;
    }
  };

  /**
   * Checks if navigation state parameter is set and sets it if not.
   *
   * @param pNavLink - String URL to check and setup if needed.
   *
   * @return {string} 
   *  URL
   *
   * @public
   */
  var setNavState = function(pNavLink) {
    var params = getQueryParamsObject(pNavLink);
    if (params["nav"]) {
      return pNavLink;
    }
    return pNavLink + "&nav=true";
  };

  /**
   * Turns String URL into query parameters object.
   * @param pQueryString - String URL to be transformed.
   *
   * @return parameters object (object[paramName] = paramValue)
   *
   * @private
   */
  var getQueryParamsObject = function(pQueryString) {
    var parametersObject = {};
    if (pQueryString.length != 0) {
      var paramsArray = pQueryString.split("&");
      for (var i = 0, len = paramsArray.length; i < len; i++) {
        var paramArray = paramsArray[i].split("=");
        parametersObject[paramArray[0]] = unescape(paramArray[1]);
      }
    }
    return parametersObject;
  }

  /**
   * Removes crumb and adding animation.
   *
   * @param {object} object
   *  Line with crumb.
   * @param {object} link
   *  Link for remove.
   *
   * @public
   */
  var removeCrumb = function(object, link) {
    if (!removeRequestInProgress) {
      var $li = $(object);
      // Clone Li and remove original - allows to avoid overlapping during flight
      var $cloneLi = $li.clone();
      var of = $li.offset();
      $cloneLi.css({position: "absolute", top: of.top, left: of.left, margin: 0, width: $li.width(), height: $li.height()})
          .appendTo($li.parent());
      $li.stop(true).remove();
      // Calculate flightDestinationCoordinates according to crumb category if no category - fly to the bottom of the screen
      var flightDestinationTopOffset = 350;
      var crumbCategoryName = $cloneLi.attr("id");
      var $ulCategory = $("#ul_" + crumbCategoryName);
      if ($ulCategory.length > 0) {
        var ulCategoryTopOffset = $ulCategory.offset().top;
        var ulCategoryheight = $ulCategory.height();
        // Calculating destination to the center of the list
        flightDestinationTopOffset = ulCategoryTopOffset + ulCategoryheight / 2;
      }
      // When all animation sequence ends - remove crumb
      $cloneLi.bind("webkitAnimationEnd", function() {
        document.location = link;
      });
      // Start animation
      $cloneLi.addClass("animateScaleAndFlyDown");
      $cloneLi.css({"-webkit-transition-property": "top", "-webkit-transition-duration": "1.5s", "top": flightDestinationTopOffset});
      removeRequestInProgress = true;
    }
  };

  /**
   * Disables crumb subCategories.
   *
   * @param {object} object
   *  Anchor with crumb.
   * @param {object} link
   *  Link for remove.
   *
   * @public
   */
  var disableSubCategoryCrumbs = function(object, link) {
    var $crumbLink = $(object);
    $crumbLink.nextAll().addClass("disabledCrumb");
    event.stopPropagation();
    setTimeout(function() {document.location = link;}, 200);
  };

  /**
   * "Search" field, "onBlur" handler.
   *
   * @private
   */
  var searchOnBlur = function() {
    if (isSearchFieldEmpty()) {
      $("#mainHeader").removeClass("searchFocus");
//      CRSMA.autosuggest.hide();
    }
  };

  /**
   * Sets focus on "Search" field.
   *
   * @private
   */
  var focusOnSearchField = function() {
    $searchField.focus();
  };

  /**
   * @public
   */
  var getItems = function(url) {
    $.ajax({
      type : "GET",
      dataType : "html",
      url : url,
      success : function(data) {
        // Find "Show more" link
        var $showMore = $("ul.searchResults > li.moreResults");

        // Remember previous sibling for "Show More"
        var $last = $showMore.prev();

        $showMore.remove();

        // Check new items in response data
        var $newFeed = $(data).find("li#searchItem, li.moreResults");

        // Add new items to the current list
        $newFeed.insertAfter($last);
        updatePaginationInfo();
      }
    });
  };

  /**
   * @public
   */
  var updatePaginationInfo = function() {
    var itemsEndCount = $("li#searchItem").size();

    var $paginationInfo = $("#paginationInfo");
    var pagiantionTextArray = $paginationInfo[0].innerText.split(" ");
    pagiantionTextArray[2] = itemsEndCount;
    $paginationInfo[0].innerText = pagiantionTextArray.join(" ");
  };

  /**
   * Initilize the callback for the Top Picks sort button.
   *
   * @public
   */
  var initSortByTopPicks = function() {
    $("#topPicksURL").click(function(e) {
      // Disable the Top Picks hyperlink if the list is already sorted by Top Picks
      if ($("#currentSort").val() == "topPicks")
        e.preventDefault();
    });
  };

  /**
   * List of "CRSMA.search" public methods.
   */
  return {
    "searchOnFocus"            : searchOnFocus,
    "applyFacet"               : applyFacet,
    "removeCrumb"              : removeCrumb,
    "disableSubCategoryCrumbs" : disableSubCategoryCrumbs,
    "initRangeFilter"          : initRangeFilter,
    "initSortByTopPicks"       : initSortByTopPicks,
    "getItems"                 : getItems,
    "updatePaginationInfo"     : updatePaginationInfo,
    "setNavState"              : setNavState
  }
}();
/**
 * Oracle ATG modified the touchslider.js code from
 * https://github.com/zgrossbart/jstouchslide in the creation of this file.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 * @ignore 
 */
CRSMA = window.CRSMA || {};

/**
 * @namespace "Sliders" javascript Module of "CRS Mobile Application".
 * @description Holds functionality related to sliders.
 * It's based on <a href="https://github.com/zgrossbart/jstouchslide">"touchslider.js"</a> plugin code,
 * that was adjusted for CRS-M needs.<br>
 *
 * Provides single method {@link CRSMA.sliders-createSlider} with multiple options.
 */
CRSMA.sliders = function() {
  /**
   * Base slider object, based on 'jstouchslide' code.
   * @private
   */
  var baseSlider = {
    /**
     * This function just binds the touch functions to the grid.
     * It is very important to stop the default, stop the propagation and return false.
     * If we don't, then the touch events might cause the regular browser behavior for touches
     * and the screen will start sliding around.
     *
     * @param {string} pGridId
     * @param {number} pTouchSensitivity
     * @param {boolean} pSnapToGrid
     * @param {boolean} pPaginated
     * @param {number} pListWidth
     * @param {number} pColWidth
     * @param {number} pParentWidth
     * @public
     */
    makeTouchable: function(/*string*/pGridId, /*int*/pTouchSensitivity, /*boolean*/ pSnapToGrid, /*boolean*/ pPaginated, /*int*/pListWidth, /*int*/pColWidth, /*int*/pParentWidth) {
      var sliderObject = this;

      this.parentContainerWidth = pParentWidth;
      this.width = pListWidth;
      this.colWidth = pColWidth;
      this.snapToGrid = pSnapToGrid;
      this.paginated = pPaginated;
      var postTouchMoveApply = null;
      if (sliderObject.postTouchMove != null) {
        /** @ignore JSdoc tag doesn't add function below to the jsdoc report */
        postTouchMoveApply = function() {
          sliderObject.postTouchMove.apply(sliderObject, arguments);
        };
      }
      var postTouchEndApply = null;
      if (sliderObject.postTouchEnd != null) {
        /** @ignore JSdoc tag doesn't add function below to the jsdoc report */
        postTouchEndApply = function() {
          sliderObject.postTouchEnd.apply(sliderObject, arguments);
        };
      }

      $(pGridId).each(function() {
        sliderObject.cells = $(this).children(".cell");

        this.ontouchstart = function(pEvent) {
          sliderObject.touchStart($(this), pEvent, pTouchSensitivity);
          return true;
        };
        this.ontouchend = function(pEvent) {
          pEvent.preventDefault();
          pEvent.stopPropagation();
          if (sliderObject.sliding) {
            sliderObject.sliding = false;
            sliderObject.touchEnd($(this), pEvent, pTouchSensitivity, postTouchEndApply);
            return false;
          } else {
            // We never slide so we can just return true and perform the default touch end
            return true;
          }
        };
        this.ontouchmove = function(pEvent) {
          return sliderObject.touchMove($(this), pEvent, postTouchMoveApply);
        };
      });
    },

    /**
     * A helper to cut off the 'px' at the end of the "left" CSS attribute and parse the result as a number.
     *
     * @param p$Elem jQuery element to get and parse "left" CSS attribute.
     * @public
     */
    getLeft: function(/*JQuery*/p$Elem) {
      var attrLeft = p$Elem.css("left");
      return parseInt(attrLeft.substring(0, attrLeft.length - 2), 10);
    },

    /**
     * When the touch starts, we add our sliding class a record a few variables about where the touch started.
     * We also record the start time so we can do momentum.
     *
     * @param p$Elem JQuery element
     * @param pEvent event object
     * @public
     */
    touchStart: function(/*JQuery*/p$Elem, /*event*/pEvent) {
      $.each(this.cells, function() {
        $(this).show();
      });

      p$Elem.css("-webkit-transition-duration", "0");

      this.startX = pEvent.targetTouches[0].clientX;
      this.startY = pEvent.targetTouches[0].clientY;
      this.startLeft = this.getLeft(p$Elem);
      this.touchStartTime = new Date().getTime();
      this.touching = true;
    },

    /**
     * When the touch ends we need to adjust the grid for momentum and to snap to the grid.
     * We also need to make sure they didn't drag farther than the end of the list in either direction.
     *
     * @param p$Elem jQuery object
     * @param pEvent event object
     * @param {number} pTouchSensitivity
     * @param pCallBack function
     * @public
     */
    touchEnd: function(/*JQuery*/p$Elem, /*event*/pEvent, /*int*/pTouchSensitivity, /*function*/pCallBack) {
      if (this.getLeft(p$Elem) > 0) {
        // This means they dragged to the right past the first item
        this.doSlide(p$Elem, 0, "2s", null);
        p$Elem.parent().removeClass("sliding");
        this.startX = null;
        this.startY = null;
        this.touching = false;
        if(this.paginated){
          $(".leftArrow").show();
        }
      } else if ((Math.abs(this.getLeft(p$Elem)) + p$Elem.parent().width()) > this.width) {
        // This means they dragged to the left past the last item
        if ((this.width - p$Elem.parent().width()) > 0) {
          this.doSlide(p$Elem, "-" + (this.width - p$Elem.parent().width()), "2s", null);
        } else {
          this.doSlide(p$Elem, 0, "2s", null);
        }
        p$Elem.parent().removeClass("sliding");
        this.startX = null;
        this.startY = null;
        this.touching = false;
        if(this.paginated){
          $(".rightArrow").show();
        }
      } else {
        // This means they were just dragging within the bounds of the grid
        // and we just need to handle the momentum and snap to the grid
        this.slideMomentum(p$Elem, pEvent, pTouchSensitivity, pCallBack);
      }
    },

    /**
     * If the user drags their finger really fast we want to push the slider
     * a little farther since they were pushing a large amount.
     *
     * @param p$Elem jQuery element
     * @param pEvent event object
     * @param {number} pTouchSensitivity
     * @param pCallBack function
     * @public
     */
    slideMomentum: function(/*jQuery*/p$Elem, /*event*/pEvent, /*int*/pTouchSensitivity, /*function*/pCallBack) {
      var slideAdjust = (new Date().getTime() - this.touchStartTime) * 10;
      var leftValue = this.getLeft(p$Elem);
      var abs = Math.abs;

      // Calculate the momentum by taking the amount of time they were sliding and comparing
      // it to the distance they slide. If they slide a small distance quickly or a large
      // distance slowly then they have almost no momentum.
      // If they slide a long distance fast then they have a lot of momentum.
      var changeX = pTouchSensitivity * (abs(this.startLeft) - abs(leftValue));
      slideAdjust = Math.round(changeX / slideAdjust);
      var newLeft = slideAdjust + leftValue;

      // We need to calculate the closest column so we can figure out where to snap the grid to
      var t = newLeft % this.colWidth;
      if(this.snapToGrid) {
    	if (abs(t) > (this.colWidth / 2)) {
    	  // Show the next cell
          newLeft -= (this.colWidth - abs(t));
        } else {
          // Stay on the current cell
          newLeft -= t;
        }
      }      

      var newLeftValue;
      if (this.slidingLeft) {
        // Sliding to the left
        var maxLeft = parseInt("-" + (this.width - this.parentContainerWidth), 10);
        newLeftValue = Math.max(maxLeft, newLeft);
      } else {
        // Sliding to the right
        newLeftValue = Math.min(0, newLeft);
      }
      this.doSlide(p$Elem, newLeftValue, "0.5s", pCallBack);

      p$Elem.parent().removeClass("sliding");
      this.startX = null;
      this.startY = null;
      this.touching = false;
      /**
       * If slider is paginated,  hide the pagination arrows because the user didn't slide to either end
       */
      if(this.paginated){
        $(".rightArrow").hide();
        $(".leftArrow").hide();
      }
     
    },

    /**
     * Slides the elem to the left position over a certain duration.
     *
     * @param p$Elem jQuery element to slide to the left.
     * @param {number} pX Number of pixels to slide to the left.
     * @param {string} pDuration Transition duration, msec.
     * @param pCallBack Function to call if not null.
     * @public
     */
    doSlide: function(/*jQuery*/p$Elem, /*int*/pX, /*string*/pDuration, /*function*/pCallBack) {
      p$Elem.css({
        left: pX + "px",
        "-webkit-transition-property": "left",
        "-webkit-transition-duration": pDuration
      });

      if (pCallBack != null) {
        pCallBack(pX, pDuration);
      }
    },

    /**
     * While they are actively dragging we just need to adjust the position of the grid
     * using the place they started and the amount they've moved.
     *
     * @param p$Elem jQuery element
     * @param pEvent event object
     * @param pCallBack callback function
     * @public
     */
    touchMove: function(/*JQuery*/p$Elem, /*event*/pEvent, /*function*/pCallBack) {
      var dx = this.startX - pEvent.targetTouches[0].clientX;
      var dy = this.startY - pEvent.targetTouches[0].clientY;
      // This is faster than calling Math.abs()
      var absDX = dx < 0 ? -dx : dx;
      var absDY = dy < 0 ? -dy : dy;
      // We need to guess so to whether the user is trying to go up and down or left or right
      if (absDX > 0 && absDX > absDY) {
        if (!this.sliding) {
          p$Elem.parent().addClass("sliding");
        }

        this.sliding = true;
        // We guess that you are sliding left or right so we need to disable the default touch actions,
        // so the page doesn't move
        pEvent.preventDefault();
        pEvent.stopPropagation();

        var leftValue;
        if (this.startX > pEvent.targetTouches[0].clientX) {
          // Sliding to the left
          leftValue = (dx - this.startLeft);
          p$Elem.css("left", "-" + leftValue + "px");
          this.slidingLeft = true;
          // We only want to attempt to re-highlight the center cell if we have moved enough that it has changed
          if (pCallBack != null && absDX >= this.colWidth) {
            pCallBack(-1 * leftValue);
          }
        } else {
          // Sliding to the right
          leftValue = (pEvent.targetTouches[0].clientX - this.startX + this.startLeft);
          p$Elem.css("left", leftValue + "px");
          this.slidingLeft = false;
          if (pCallBack != null && absDX >= this.colWidth) {
            pCallBack(leftValue);
          }
        }
        return false;
      }
      return true;
    },

    /**
     * Start by creating the sliding grid out of the specified element.
     * Look for each child with a class of cell when we create the slide panel.
     */
    createSlidePanel : function(/*string*/gridid, /*string*/cellPrefix, /*int*/numberOfCellsToDisplay, /*int*/touchSensitivity, /*boolean*/ snapToGrid, /*boolean*/ paginated, /*function*/onTouchEventException) {
      var parentContainerWidth = $(gridid).parent().width();
      var cellWidth = parentContainerWidth / numberOfCellsToDisplay;
      var thisObject = this;

      $(gridid).each(function() {
        $(this).css({
          'position': 'relative',
          'left': '0'
        });

        var x = 0;
        var $cells = $(this).children(".cell");
        $cells.each(function(index) {
          $(this).css({
            width: cellWidth + "px",
            height: "90%",
            position: "absolute",
            left: x + "px"
          });

          x += cellWidth;
        });

        if (numberOfCellsToDisplay == 1) {
          $cells.slice(1).hide();
        }

        try {
          document.createEvent("TouchEvent");
          // Now that we've finished the layout we'll make our panel respond to all of the touch events
          thisObject.makeTouchable(gridid, touchSensitivity, snapToGrid, paginated, x, cellWidth, parentContainerWidth);
        } catch (e) {
          // Then we aren't on a device that supports touch
          onTouchEventException.call();
        }
      });
    }
  };

  /**
   * Creates slider with the specified options.<br>
   *
   * Options below may be specified:
   * <ul>
   *   <li><b>gridid</b> - string, identifying html container</li>
   *   <li><b>cellPrefix</b>  - string, empty by default</li>
   *   <li><b>numberOfCells</b> - number of cell to display, 4 by default</li>
   *   <li><b>snapToGrid</b> - boolean whether slider snaps to grid at the end of touch </li>
   *   <li><b>paginated</b> - boolean whether slider contains only a single page of large number of products </li>
   *   <li><b>touchSensitivity</b> - number (3000 by default)</li>
   *   <li><b>onTouchEventException</b> - callback function, that is called if device doesn't
   *       support 'Touch' event. Empty by default.
   *       Usually is used for changing of html-container CSS styles</li>
   *   <li><b>extension</b> - object with functions, that are added (or overrided) to the {@link CRSMA.sliders-baseSlider}</li>
   * </ul> 
   *
   * Example:
   *
   * @param options object with parameters
   * @example
   * CRSMA.sliders.createSlider({
   *   gridid  :  '#relatedItemsContainer',
   *   onTouchEventException : function(el) {
   *     $(el).css({
   *       'height'  : '70px',
   *       'overflow': 'auto'
   *     });
   *   }
   * });
   *
   * @public
   */
  var createSlider = function(options) {
    var settings = $.extend({/* default settings */
      gridid                : '',
      cellPrefix            : '',
      numberOfCells         : 4,
      touchSensitivity      : 3000,
      snapToGrid			      : false,
      paginated             : false,
      onTouchEventException : function(/*html element*/el) {/* empty handler for devices, not supporting Touch events */},
      extension             : {},
    }, options || {});

    var sliderClass = Object.create(baseSlider, settings.extension);
    sliderClass.createSlidePanel(settings.gridid, settings.cellPrefix, settings.numberOfCells,
        settings.touchSensitivity, settings.snapToGrid, settings.paginated, settings.onTouchEventException);
    return sliderClass;
  };

  /**
   * List of "CRSMA.sliders" public methods.
   */
  return {
    'createSlider' : createSlider
  }
}();
