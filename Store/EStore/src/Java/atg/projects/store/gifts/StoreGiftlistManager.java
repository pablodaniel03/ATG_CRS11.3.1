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


package atg.projects.store.gifts;

import java.util.List;

import atg.commerce.CommerceException;
import atg.commerce.gifts.GiftlistManager;
import atg.commerce.order.CommerceItemRelationship;
import atg.commerce.order.HardgoodShippingGroup;
import atg.commerce.order.ShippingGroup;
import atg.commerce.pricing.PricingException;
import atg.commerce.pricing.PricingTools;
import atg.projects.store.order.GiftWrapCommerceItem;
import atg.projects.store.order.StoreOrderImpl;
import atg.projects.store.order.StoreOrderManager;

/**
 * This class performs specific to CRS actions with gift lists in addition to
 * those which are provided in parent class.
 * 
 * @author ATG
 * @version $Id: //hosting-blueprint/B2CBlueprint/version/11.3.1/EStore/src/atg/projects/store/gifts/StoreGiftlistManager.java#3 $$Change: 1536476 $
 * @updated $DateTime: 2018/04/13 08:11:14 $$Author: releng $
 */
public class StoreGiftlistManager extends GiftlistManager {

  // -------------------------------------
  // Class version string
  // -------------------------------------

  public static final String CLASS_VERSION = "$Id: //hosting-blueprint/B2CBlueprint/version/11.3.1/EStore/src/atg/projects/store/gifts/StoreGiftlistManager.java#3 $$Change: 1536476 $";

  /**
   * Prefix for the HardgoodShippingGroup's description. For more details see
   * {@link #createShippingGroupFromGiftlist(String)}.
   */
  private String mGiftShippingGroupDescriptionPrefix = "[Gift]";

  /**
   * @return the description prefix.
   */
  public String getGiftShippingGroupDescriptionPrefix() {
    return mGiftShippingGroupDescriptionPrefix;
  }

  /**
   * Use this method to set the description prefix - it is used in
   * {@link #createShippingGroupFromGiftlist(String)}
   * 
   * @param pGiftShippingGroupDescriptionPrefix - the giftShippingGroupDescriptionPrefix to set
   * 
   * @see #createShippingGroupFromGiftlist(String)
   */
  public void setGiftShippingGroupDescriptionPrefix(String pGiftShippingGroupDescriptionPrefix) {
    mGiftShippingGroupDescriptionPrefix = pGiftShippingGroupDescriptionPrefix;
  }

  //----------------------------------------
  // property: pricingTools
  //----------------------------------------
  private PricingTools mPricingTools;
  
  /**
   * @return the pricing tools component.
   */
  public PricingTools getPricingTools(){
    return mPricingTools;
  }

  /**
   * @param pPricingTools - The pricing tools component.
   */
  public void setPricingTools(PricingTools pPricingTools){
    mPricingTools = pPricingTools;
  }
  
  /**
   * This method creates {@link HardgoodShippingGroup} for the gift list. 
   * The description of created shipping group is made up of 
   * {@link #getGiftShippingGroupDescriptionPrefix()} + giftlistEventName.
   * 
   * @param pGiftlistId - GiftlistId based on which a ShippingGroup will be created.
   * 
   * @return an instance of {@link HardgoodShippingGroup}.
   * 
   * @throws CommerceException indicates that a severe error occurred while performing a commerce operation.
   */
  public HardgoodShippingGroup createShippingGroupFromGiftlist(String pGiftlistId) throws CommerceException {
    
    HardgoodShippingGroup shippingGroup = super.createShippingGroupFromGiftlist(pGiftlistId);
    String giftlistEventName = null;
    
    if (pGiftlistId != null && shippingGroup != null) {
      giftlistEventName = getGiftlistEventName(pGiftlistId);
      shippingGroup.setDescription(getGiftShippingGroupDescriptionPrefix() + giftlistEventName);
    }
    
    return shippingGroup;
  }

  /**
   * Checks whether the given gift list ID is profile's wish list. 
   * 
   * @param pProfileId - The profile ID
   * @param pGiftlistId - The gift list ID
   * 
   * @return true if the gift list ID is in the profile's wish list, otherwise false.
   */
  public boolean isProfileWishlist(String pProfileId, String pGiftlistId){
    
    if (pProfileId !=  null && pGiftlistId != null){
      return getWishlistId(pProfileId).equals(pGiftlistId);   
    }
    
    return false;
  }
  
  /**
   * @return a boolean indicating if a shipping group has the gift list description prefix.
   */
  public boolean hasGiftAddress(ShippingGroup pShippingGroup){   
    // We check the description. The reason we don't look for GiftlistHandlingInstructions
    // is because these are passed around shipping groups. They may initially be present in
    // a shipping group thats associated with a commerce item from a gift list but if but if
    // a non-gift address is selected it will be updated with these instructions. 
    String description = pShippingGroup.getDescription();
    String giftPrefix = getGiftShippingGroupDescriptionPrefix(); 
   
    if((description != null && giftPrefix != null) && (description).startsWith(giftPrefix)){
      return true;
    }
    
    return false;
  }
  
  /**
   * When an order only contains a GiftWrapCommerceItem, remove it. If no CommerceItems
   * belong to an order but a gift note flag is still set to true, set it to false. 
   * 
   * @param pOrder - The order that will have invalid gift services removed from.
   */
  public void removeInvalidGiftServices(StoreOrderImpl pOrder) throws CommerceException {

    if (pOrder.getShippingGroupCount() == 1) {
      try {
        // Reprice the order to ensure that it is up to date. This will also ensure that any invalid 
        // GWP commerce items have been removed before trying to remove any invalid gift services. 
        getPricingTools().priceOrderTotal(pOrder);
      }
      catch (PricingException pe) {
        vlogError(pe, "There was a problem repricing order: {0}", pOrder.getId());
      }
      
      StoreOrderManager orderManager = (StoreOrderManager) getOrderManager();
      // Update the order to ensure that it has the correct number of commerce items.
      // This is necessary after the reprice as GWP items could have been removed.
      orderManager.updateOrder(pOrder);
      
      List<ShippingGroup> shippingGroups = pOrder.getShippingGroups();
      ShippingGroup shippingGroup = shippingGroups.get(0);
      
      // When the only item left in the order is a GiftWrapCommerceItem, remove it 
      // along with the gift message (if set).
      if (shippingGroup.getCommerceItemRelationshipCount() == 1) {
        CommerceItemRelationship commerceItemRelationship = 
          (CommerceItemRelationship) shippingGroup.getCommerceItemRelationships().get(0);
        
        if (commerceItemRelationship.getCommerceItem() instanceof GiftWrapCommerceItem) {
          vlogDebug("Removing gift services from order: {0}", pOrder.getId());
          orderManager.addRemoveGiftServices(pOrder, false, false, null, null);
        }
      }
      else if (shippingGroup.getCommerceItemRelationshipCount() == 0 && pOrder.isShouldAddGiftNote() == true) {
        pOrder.setShouldAddGiftNote(false);
      }
    }
  }
  
}
