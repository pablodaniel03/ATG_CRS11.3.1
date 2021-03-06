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


package atg.projects.store.recommendations.processor;

import javax.jms.JMSException;
import javax.jms.Message;

import atg.adc.ADCException;
import atg.adc.pipeline.ADCEventPipelineProcessor;
import atg.adc.pipeline.ADCPipelineArgs;
import atg.nucleus.ServiceException;
import atg.projects.store.recommendations.adc.StoreADCRequestData;
import atg.repository.ItemDescriptorImpl;
import atg.repository.Repository;
import atg.repository.RepositoryException;
import atg.repository.RepositoryItem;
import atg.userprofiling.dms.ViewItemMessage;

/**
 * This processor retrieves the category repository item from the <code>ViewItem</code>
 * event and stores it into <code>ADCRequestData</code> for further use 
 * by the remaining pipeline processors. The processor extends    
 * <code>atg.adc.pipeline.ADCEventPipelineProcessor</code> class and overrides
 * its <code>processEvent()</code> method.
 * 
 * @author ATG
 * @version $Id: //hosting-blueprint/B2CBlueprint/version/11.3.1/Recommendations/src/atg/projects/store/recommendations/processor/SetCategoryEventProcessor.java#3 $Change: 630322 $
 * @updated $DateTime: 2018/04/13 08:11:14 $Author: ykostene $
 *
 */
public class SetCategoryEventProcessor extends ADCEventPipelineProcessor{
  /** Class version string */
  public static final String CLASS_VERSION = "$Id: //hosting-blueprint/B2CBlueprint/version/11.3.1/Recommendations/src/atg/projects/store/recommendations/processor/SetCategoryEventProcessor.java#3 $Change: 630322 $";
  
  //-------------------------------------
  // Member variables
  //-------------------------------------

  // We store the item descriptor here so we can do an "isInstance()" check of the 
  // items viewed to see if they are categories
  private ItemDescriptorImpl mCategoryItemDescriptor;
  
  //---------------------------------------------------------------------------
  // property:CategoryItemType
  //---------------------------------------------------------------------------
  private String mCategoryItemType;

  /**
   * Sets item descriptor name for category
   * 
   * @param pCategoryItemType the item descriptor name for category
   **/
  public void setCategoryItemType(String pCategoryItemType) {
    mCategoryItemType = pCategoryItemType;
  }

  /**
   * Gets item descriptor name for category
   * 
   * @return The item descriptor name for category
   **/
  public String getCategoryItemType() {
    return mCategoryItemType;
  }
  
  //---------------------------------------------------------------------------
  // property:CatalogRepository
  //---------------------------------------------------------------------------
  private Repository mCatalogRepository;

  /**
   * Sets the catalog repository
   * 
   * @param pCatalogRepository the catalog repository
   **/
  public void setCatalogRepository(Repository pCatalogRepository) {
    mCatalogRepository = pCatalogRepository;
  }

  /**
   * Gets the catalog repository
   * 
   * @return The catalog repository
   **/
  public Repository getCatalogRepository() {
    return mCatalogRepository;
  }
  
  /**
   * Retrieves the category repository item from the <code>ViewItem</code>
   * event and stores it into <code>ADCRequestData</code> for further 
   * use by the remaining pipeline processors.
   *
   * @param pArgs The ADCPipelineArgs for this pipeline execution
   * @param pMessage A JMS message that matches one of the types in the <code>JMSTypes</code>
   *        property.
   * @return MADE_CHANGE if a change was made, NO_CHANGE otherwise
   */
  @Override
  public int processEvent(ADCPipelineArgs pArgs, Message pMessage) {
    ViewItemMessage viewItemEvent;
    
    // Get ViewItem event from the JMS message
    try {
      viewItemEvent = (ViewItemMessage) (getObjectFromMessage(pMessage));
    } catch (ADCException e) {
      if(isLoggingError())
        logError(e);
      return NO_CHANGE;
    } catch (JMSException e) {
      if(isLoggingError())
        logError(e);
      return NO_CHANGE;
    }
    
    if (isLoggingDebug())
      logDebug("Event in message: " + viewItemEvent);

    RepositoryItem item = viewItemEvent.getItem();
    String itemType = viewItemEvent.getItemType();
    if (isLoggingDebug())
      logDebug("ViewItem for item type: " + itemType);

    if (getCategoryItemType().equals(itemType) ||
        (mCategoryItemDescriptor != null && mCategoryItemDescriptor.isInstance(item))) {
      
      // The item in ViewItem event is category so store it into ADC request data
      StoreADCRequestData requestData = (StoreADCRequestData) pArgs.getADCRequestData();
      requestData.setCategoryItem(item);
    }

    return NO_CHANGE;    
  }
  
  /**
   * Initialize and store the category item descriptor.
   **/
  @Override
  public void doStartService ()
       throws ServiceException
  {
    super.doStartService();

    try {
      mCategoryItemDescriptor = (ItemDescriptorImpl) getCatalogRepository().getItemDescriptor(getCategoryItemType());      
    }
    catch(RepositoryException re) {
      throw new ServiceException(re);
    }
    // If the category item descriptor is not an ItemDescriptorImpl, that's OK.
    // We just won't use the instanceOf() test in processEvent()
    catch(ClassCastException cce) {}
  }

}
