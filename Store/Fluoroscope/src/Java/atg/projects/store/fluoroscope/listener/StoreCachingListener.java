/*<ORACLECOPYRIGHT>
 * Copyright (C) 1994, 2018, Oracle and/or its affiliates. All rights reserved.
 * Oracle and Java are registered trademarks of Oracle and/or its affiliates. 
 * Other names may be trademarks of their respective owners.
 * UNIX is a registered trademark of The Open Group.
 *
 * This software and related documentation are provided under a license agreement 
 * containing restrictions on use and disclosure and are protected by intellectual property laws. 
 * Except as expressly permitted in your license agreement or allowed by law, you may not use, copy, 
 * reproduce, translate, broadcast, modify, license, transmit, distribute, exhibit, perform, publish, 
 * or display any part, in any form, or by any means. Reverse engineering, disassembly, 
 * or decompilation of this software, unless required by law for interoperability, is prohibited.
 *
 * The information contained herein is subject to change without notice and is not warranted to be error-free. 
 * If you find any errors, please report them to us in writing.
 *
 * U.S. GOVERNMENT RIGHTS Programs, software, databases, and related documentation and technical data delivered to U.S. 
 * Government customers are "commercial computer software" or "commercial technical data" pursuant to the applicable 
 * Federal Acquisition Regulation and agency-specific supplemental regulations. 
 * As such, the use, duplication, disclosure, modification, and adaptation shall be subject to the restrictions and 
 * license terms set forth in the applicable Government contract, and, to the extent applicable by the terms of the 
 * Government contract, the additional rights set forth in FAR 52.227-19, Commercial Computer Software License 
 * (December 2007). Oracle America, Inc., 500 Oracle Parkway, Redwood City, CA 94065.
 *
 * This software or hardware is developed for general use in a variety of information management applications. 
 * It is not developed or intended for use in any inherently dangerous applications, including applications that 
 * may create a risk of personal injury. If you use this software or hardware in dangerous applications, 
 * then you shall be responsible to take all appropriate fail-safe, backup, redundancy, 
 * and other measures to ensure its safe use. Oracle Corporation and its affiliates disclaim any liability for any 
 * damages caused by use of this software or hardware in dangerous applications.
 *
 * This software or hardware and documentation may provide access to or information on content, 
 * products, and services from third parties. Oracle Corporation and its affiliates are not responsible for and 
 * expressly disclaim all warranties of any kind with respect to third-party content, products, and services. 
 * Oracle Corporation and its affiliates will not be responsible for any loss, costs, 
 * or damages incurred due to your access to or use of third-party content, products, or services.
 </ORACLECOPYRIGHT>*/



package atg.projects.store.fluoroscope.listener;

import atg.service.fluoroscope.listener.CachingListener;
import atg.service.fluoroscope.listener.EventContext;
import atg.servlet.DynamoHttpServletRequest;
import atg.servlet.ServletUtil;

/**
 * CRS extension of CachingListener. It allows getting event context ID for the current request
 * before any sensor event occurred.
 * 
 * @see CachingListener
 * 
 * @author ATG
 * @version $Id: //hosting-blueprint/B2CBlueprint/version/11.3.1/Fluoroscope/src/atg/projects/store/fluoroscope/listener/StoreCachingListener.java#3 $$Change: 1536476 $ 
 * @updated $DateTime: 2018/04/13 08:11:14 $$Author: releng $
 */
public class StoreCachingListener extends CachingListener {
  public static final String CLASS_VERSION = "$Id: //hosting-blueprint/B2CBlueprint/version/11.3.1/Fluoroscope/src/atg/projects/store/fluoroscope/listener/StoreCachingListener.java#3 $$Change: 1536476 $";

  /** 
   * The helper method that allows to get event context ID for the request
   * before any sensor event occurred. In the case when event context has been
   * already created for the specified request it's retrieved from the corresponding
   * request's attribute. Otherwise the ID of event context is calculated based on the
   * request URI and thread ID.
   *
   * @param pRequest the HTTP request for which the event context ID should be returned.
   */
  public String getEventContextIdForRequest(DynamoHttpServletRequest pRequest) {
    
    String attrContext = isSessionScoped() ? ATTR_SESSION_EVENT_CONTEXT :
      ATTR_GLOBAL_EVENT_CONTEXT;
    
    EventContext context = (EventContext)pRequest.getAttribute(attrContext) ;
  
    if (context == null) {
      // make an unbounded context for this request
      String contextId = calculateContextId();
      String strContextName = contextId;
      int count = 2;
      while (null != getEventContext(strContextName)) {
        strContextName = contextId + "-" + (count++);
      }
      return strContextName;
    }
    
    return context.getContextId();
  }
  
  /**
   * Calculate a context id based on the requestURI, or failing that,
   * the thread name.
   * @return the calculated context ID
   */
  protected String calculateContextId() {
    
    DynamoHttpServletRequest request = ServletUtil.getCurrentRequest();
    if (request != null) {
      return request.getRequestURI() + "-" +
        Thread.currentThread().getId();
    }
    return Thread.currentThread().getName() + "-" +
      Thread.currentThread().getId();
  }
}