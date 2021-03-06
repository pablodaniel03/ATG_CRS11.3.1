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
package atg.projects.store.droplet;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;

import javax.servlet.ServletException;

import atg.commerce.pricing.PricingModelHolder;
import atg.service.collections.filter.CachedCollectionFilter;
import atg.service.collections.filter.FilterException;
import atg.servlet.DynamoHttpServletRequest;
import atg.servlet.DynamoHttpServletResponse;
import atg.servlet.DynamoServlet;

/**
 * Filters out a collection of promotion repository items using the filter
 * mFilter.
 * 
 * This droplet doesn't take input parameters.
 * 
 * Open parameters:
 *   output
 *     Always rendered
 *     
 *  
 * Output parameters:
 *   filteredPromotions
 *     Contains filtered collection of promotions
 * 
 * @author Yekaterina Kostenevich
 * @version $Id: //hosting-blueprint/B2CBlueprint/version/11.3.1/EStore/src/atg/projects/store/droplet/PromotionFilterDroplet.java#3 $Change: 630322 $
 * @updated $DateTime: 2018/04/13 08:11:14 $Author: ykostene $
 *
 */
public class PromotionFilterDroplet extends DynamoServlet{
  /** Class version string */
  public static final String CLASS_VERSION = "$Id: //hosting-blueprint/B2CBlueprint/version/11.3.1/EStore/src/atg/projects/store/droplet/PromotionFilterDroplet.java#3 $Change: 630322 $";
  
  private static final String OPARAM_OUTPUT = "output";
  private static final String FILTERED_PROMOTIONS = "filteredPromotions";
  
  /**
   * property: filter
   */
  private CachedCollectionFilter  mFilter;
  
  /**   
   * @return filter that should be applied for promotions
   */
  public CachedCollectionFilter getFilter() {
    return mFilter;
  }

  /**
   * @param pFilter the CachedCollectionFilter to be set
   */
  public void setFilter(CachedCollectionFilter pFilter) {
    mFilter = pFilter;
  }
  
  /**
   * property: pricingModelHolder
   */
  private PricingModelHolder mPricingModelHolder;
  
  /**
   * @return An object holding the pricing models
   */
  public PricingModelHolder getPricingModelHolder() {
    return mPricingModelHolder;
  }

  /**
   * @param pPricingModelHolder The new pricing model holder to set
   */
  public void setPricingModelHolder(PricingModelHolder pPricingModelHolder) {
    mPricingModelHolder = pPricingModelHolder;
  }
  
  /**
   * This method will call existing initalizeAndFilterPromotions method. 
   * Render oparam output with parameter filteredPromotions. 
   */
  public void service(DynamoHttpServletRequest pRequest, 
    DynamoHttpServletResponse pResponse) throws ServletException, IOException {
    
    Collection filteredPromotions = initalizeSiteGroupPromotions();
    
    pRequest.setParameter(FILTERED_PROMOTIONS, filteredPromotions);
    pRequest.serviceLocalParameter(OPARAM_OUTPUT, pRequest, pResponse);
  }

  /**
   * Populates the mSiteGroupPromotions Collection
   */
  protected Collection initalizeSiteGroupPromotions() {
    // Result collection
    Collection filteredPromotions = new ArrayList();
    // All promotions
    Collection unfilteredCollection = mPricingModelHolder.getAllPromotions();
    
    // Check that there are promotions to filter
    if(unfilteredCollection == null || unfilteredCollection.size() == 0) {
      return filteredPromotions;
    }
        
    // Filter all promotions using filter parameter
    try {
      filteredPromotions = getFilter().filterCollection(unfilteredCollection, null, null);
    }
    catch (FilterException e) {
      if(isLoggingError()){
        logError("Item does not have a sites property: ", e);
      }
    }
    return filteredPromotions;
  }

}
