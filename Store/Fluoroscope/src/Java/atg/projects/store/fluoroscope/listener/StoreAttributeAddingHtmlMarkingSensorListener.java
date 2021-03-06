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

import java.io.OutputStream;
import java.io.PrintWriter;
import java.util.Queue;

import javax.servlet.ServletOutputStream;

import atg.service.fluoroscope.SensorEvent;
import atg.service.fluoroscope.listener.AttributeAddingHtmlMarkingSensorListener;
import atg.service.fluoroscope.listener.HtmlInsertingFilterParser;
import atg.service.fluoroscope.listener.SensorEventHtmlInserterFactory;
import atg.servlet.DynamoHttpServletRequest;

/**
 * CRS extension of the <code>AttributeAddingHtmlMarkingSensorListener</code>.
 * This implementation redefines HtmlInsertingFilterParser to be used. CRS version of this parser can
 * enable/disable URL encoding based on configuration file.
 * 
 * @see AttributeAddingHtmlMarkingSensorListener
 * @see AttributeAddingHtmlInsertingResponseOutputWrapper
 * @see HtmlInsertingFilterParser
 * @author ATG
 * @version $Id: //hosting-blueprint/B2CBlueprint/version/11.3.1/Fluoroscope/src/atg/projects/store/fluoroscope/listener/StoreAttributeAddingHtmlMarkingSensorListener.java#3 $$Change: 1536476 $ 
 * @updated $DateTime: 2018/04/13 08:11:14 $$Author: releng $
 */
public class StoreAttributeAddingHtmlMarkingSensorListener extends AttributeAddingHtmlMarkingSensorListener {
  // Class version.
  public static String CLASS_VERSION = "$Id: //hosting-blueprint/B2CBlueprint/version/11.3.1/Fluoroscope/src/atg/projects/store/fluoroscope/listener/StoreAttributeAddingHtmlMarkingSensorListener.java#3 $$Change: 1536476 $";
  
  private boolean mShouldEncodeUrls;
  
  /**
   * <code>shouldEncodeUrls</code> property. This property defines, if <code>HtmlInsertingFilterParser</code>
   * should encode all relative URLs with current <code>DynamoHttpServletRequest</code> instance. 
   * @return <code>shouldEncodeUrls</code> property value.
   * @see DynamoHttpServletRequest#encodeURL(String)
   */
  public boolean isShouldEncodeUrls() {
    return mShouldEncodeUrls;
  }

  public void setShouldEncodeUrls(boolean pShouldEncodeUrls) {
    mShouldEncodeUrls = pShouldEncodeUrls;
  }

  @Override
  protected HtmlInsertingResponseOutputWrapper createHtmlInsertingResponseOutputWrapper() {
    // Always use CRS version of wrapper.
    return new StoreAttributeAddingHtmlInsertingResponseOutputWrapper();
  }

  private class StoreAttributeAddingHtmlInsertingResponseOutputWrapper extends AttributeAddingHtmlInsertingResponseOutputWrapper {
    @Override
    protected HtmlInsertingFilterParser createHtmlInsertingFilterParser(DynamoHttpServletRequest pRequest,
        PrintWriter pPrintWriter) {
      // CRS wrapper whould use CRS parser.
      return new StoreHtmlInsertingFilterParser(pPrintWriter, pRequest, getEventQueueForRequest(pRequest),
          getHtmlInserterFactoryForRequest(pRequest));
    }

    @Override
    protected HtmlInsertingFilterParser createHtmlInsertingFilterParser(DynamoHttpServletRequest pRequest,
        ServletOutputStream pOutputStream) {
      // CRS wrapper should use CRS parser.
      return new StoreHtmlInsertingFilterParser(pOutputStream, pRequest, getEventQueueForRequest(pRequest),
          getHtmlInserterFactoryForRequest(pRequest));
    }
  }

  private class StoreHtmlInsertingFilterParser extends HtmlInsertingFilterParser {
    public StoreHtmlInsertingFilterParser(OutputStream pStream, DynamoHttpServletRequest pRequest,
        Queue<SensorEvent> pEventQueue, SensorEventHtmlInserterFactory pHtmlInserterFactory) {
      super(pStream, pRequest, pEventQueue, pHtmlInserterFactory);
    }

    public StoreHtmlInsertingFilterParser(PrintWriter pWriter, DynamoHttpServletRequest pRequest, Queue<SensorEvent> pEventQueue,
        SensorEventHtmlInserterFactory pHtmlInserterFactory) {
      super(pWriter, pRequest, pEventQueue, pHtmlInserterFactory);
    }

    @Override
    protected boolean shouldEncodeUrls() {
      // Make decision whether we should encode URLs or not on base of current configuration.
      return isShouldEncodeUrls();
    }
  }
}
