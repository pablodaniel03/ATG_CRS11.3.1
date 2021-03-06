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

package atg.projects.store.assembler;

import java.io.IOException;

import javax.servlet.ServletException;

import atg.droplet.GenericFormHandler;
import atg.servlet.DynamoHttpServletRequest;
import atg.servlet.DynamoHttpServletResponse;

/**
 * The purpose of this form handler is to add some additional properties to
 * Endeca-specific search. Typically, Endeca's Assembler module assembles 
 * parameters from a request but we don't want to follow this approach for 
 * additional properties/parameters. The form handler should be used instead.
 *
 * @author Andrew Gavrushenko
 * @version $Id: //hosting-blueprint/B2CBlueprint/version/11.3.1/Endeca/Assembler/src/atg/projects/store/assembler/SearchFormHandler.java#3 $$Change: 1536476 $
 * @updated $DateTime: 2018/04/13 08:11:14 $$Author: releng $
 */
public class SearchFormHandler extends GenericFormHandler {
  
  //-------------------------------------------
  /** Class version string */
  protected static final String CLASS_VERSION = 
    "$Id: //hosting-blueprint/B2CBlueprint/version/11.3.1/Endeca/Assembler/src/atg/projects/store/assembler/SearchFormHandler.java#3 $$Change: 1536476 $";

  //----------------------------------------------------------------------------
  // PROPERTIES
  //----------------------------------------------------------------------------

  //-------------------------------
  // property: siteIds
  //-------------------------------
  private String[] mSiteIds = null;

  /**
   * @returns the site IDs which are used as search constraints.
   */
  public String[] getSiteIds() {
    return mSiteIds;
  }

  /**
   * @param pSiteIds - The site IDs which are used as search constraints.
   */
  public void setSiteIds(String[] pSiteIds) {
    mSiteIds = pSiteIds;
  }
  
  //------------------------------------------
  // property: searchedSites
  //------------------------------------------
  private SearchedSites mSearchedSites = null;

  /**
   * @return a bean thats used to indicate the scope of the current search.
   */
  public SearchedSites getSearchedSites() {
    return mSearchedSites;
  }

  /**
   * @param pSearchedSites - A bean thats used to indicate the scope of the current search.
   */
  public void setSearchedSites(SearchedSites pSearchedSites) {
    mSearchedSites = pSearchedSites;
  }
  
  //-------------------------------
  // property: siteScope
  //-------------------------------
  private String mSiteScope = null;

  /**
   * @return a parameter used to indicate the current scope of the search is correct. 
   *         Set by the form invoking the handler.
   */
  public String getSiteScope() {
    return mSiteScope;
  }

  /**
   * @param pSiteScope - A parameter used to indicate the current scope of the search is correct. 
   *                     Set by the form invoking the handler.
   */
  public void setSiteScope(String pSiteScope) {
    mSiteScope = pSiteScope;
  }
  
  //----------------------------------------------------------------------------
  // METHODS
  //----------------------------------------------------------------------------

  //----------------------------------------------------------------------------
  /**
   * Contains logic that will be executed when a search is performed.
   * 
   * @param pRequest The current HTTP request.
   * @param pResponse The current HTTP response.
   * 
   * @return true if there are no errors.
   * 
   * @throws IOException
   * @throws ServletException
   */
  public boolean handleSearch(DynamoHttpServletRequest pRequest,
                              DynamoHttpServletResponse pResponse) throws IOException, ServletException {
    // Set the value of the SearchedSites bean
    getSearchedSites().setSiteIds(getSiteIds());
    return true;
  }
}
