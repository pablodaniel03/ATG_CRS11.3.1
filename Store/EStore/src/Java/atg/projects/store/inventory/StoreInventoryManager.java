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


package atg.projects.store.inventory;

import atg.commerce.inventory.InventoryException;
import atg.commerce.inventory.MissingInventoryItemException;
import atg.commerce.inventory.RepositoryInventoryManager;
import atg.core.util.ResourceUtils;
import atg.core.util.StringUtils;
import atg.projects.store.catalog.StoreCatalogProperties;
import atg.projects.store.profile.StorePropertyManager;
import atg.repository.MutableRepository;
import atg.repository.MutableRepositoryItem;
import atg.repository.Repository;
import atg.repository.RepositoryException;
import atg.repository.RepositoryItem;
import atg.repository.RepositoryView;
import atg.repository.rql.RqlStatement;
import atg.service.util.CurrentDate;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.List;


/**
 * This class is an extension of the RepositoryInventoryManager. It will be responsible for
 * writing to the inventory repository. This should only happen from the fulfillment server.
 *
 * @author ATG
 * @version $Id: //hosting-blueprint/B2CBlueprint/version/11.3.1/EStore/src/atg/projects/store/inventory/StoreInventoryManager.java#3 $
 * @updated $DateTime: 2018/04/13 08:11:14 $$Author: releng $
 */
public class StoreInventoryManager extends RepositoryInventoryManager implements StoreInventoryManagerInterface {

  //---------------------------------------------------------
  // Constants
  //---------------------------------------------------------
  
  public static final String PARAM_SITE_ID = "siteId";
  public static final String PARAM_LOCATION_ID = "locationId";
  
  /** Class version string. */
  public static final String CLASS_VERSION = "$Id: //hosting-blueprint/B2CBlueprint/version/11.3.1/EStore/src/atg/projects/store/inventory/StoreInventoryManager.java#3 $$Change: 1536476 $";
  
  /** Resource Bundle Name **/
  static final String RESOURCE_BUNDLE_NAME="atg.commerce.inventory.Resources";

  /** Resource Bundle **/
  private static java.util.ResourceBundle sResourceBundle = atg.core.i18n.LayeredResourceBundle.getBundle(RESOURCE_BUNDLE_NAME, atg.service.dynamo.LangLicense.getLicensedDefault());
  
  /** Resource keys for error messages */
  public static final String NO_SUCH_ITEM = "noSuchItem";
  public static final String NO_PARENT_PRODUCT_FOUND = "parentProductNotFound";

  /**
   * RQL query for duplicating item.
   */
  public static final String RQL_QUERY_DUPLICATE_BACK_IN_STOCK_ITEM = 
      "catalogRefId = ?0 AND emailAddress = ?1 AND productId = ?2 AND locationId IS NULL";
  
  public static final String RQL_QUERY_DUPLICATE_BACK_IN_STOCK_ITEM_WITH_LOCATION = 
    "catalogRefId = ?0 AND emailAddress = ?1 AND productId = ?2";
 
  /**
   * Default threshold level constant.
   */
  public static final long DEFAULT_THRESHOLD_LEVEL = 0;

  //---------------------------------------------------------
  // Properties
  //---------------------------------------------------------
  
  /** 
   * property: propertyManager
   */
  private StorePropertyManager mPropertyManager;

  /**
   * @return the StorePropertyManager.
   */
  public StorePropertyManager getPropertyManager() {
    return mPropertyManager;
  }

  /**.
   * @param pPropertyManager the StorePropertyManager to set.
   */
  public void setPropertyManager(StorePropertyManager pPropertyManager) {
    mPropertyManager = pPropertyManager;
  }
    
  /**
   * property: defaultThresholdLevel
   */
  private long mDefaultThresholdLevel = DEFAULT_THRESHOLD_LEVEL;
  
  /**
   * @param pDefaultThresholdLevel - the default value if the stock level of an item is not defined.
   */
  public void setDefaultThresholdLevel(long pDefaultThresholdLevel) {
    mDefaultThresholdLevel = pDefaultThresholdLevel;
  }

  /**
   * @return the default value if the stock level of an item is not defined.
   */
  public long getDefaultThresholdLevel() {
    return mDefaultThresholdLevel;
  }

  /**
   * property: orderRepository
   */
  private Repository mOrderRepository = null;
  
  /**
   * @return order repository.
   */
  public Repository getOrderRepository() {
    return mOrderRepository;
  }

  /**
   * @param pOrderRepository - order repository.
   */
  public void setOrderRepository(Repository pOrderRepository) {
    mOrderRepository = pOrderRepository;
  }

  /**
   * property: catalogProperties.
   */
  private StoreCatalogProperties mCatalogProperties;
  
  /**
   * @return catalog properties.
   */
  public StoreCatalogProperties getCatalogProperties() {
    return mCatalogProperties;
  }

  /**
   * @param pCatalogProperties - catalog properties to set.
   */
  public void setCatalogProperties(StoreCatalogProperties pCatalogProperties) {
    mCatalogProperties = pCatalogProperties;
  }
  
  /**
   * property: currentDate
   */
  private CurrentDate mCurrentDate;
  
  /**
   * Sets the CurrentDate component.
   */
  public void setCurrentDate(CurrentDate pCurrentDate) { 
    mCurrentDate = pCurrentDate; 
  }
  
  /**
   * Gets the CurrentDate component.
   */
  public CurrentDate getCurrentDate() { 
    return mCurrentDate; 
  }
  
  //---------------------------------------------------------------------------
  // property: logMissingInventoryExceptionsAsError

  /** 
   * Whether inventory exceptions should be logged as an error.
   * If they are not logged as error, they will be logged on debug
   * level.  This is used typically to avoid missing items in the inventory
   * from being logged as errors.  Set to false by default.
   */
  boolean mLogMissingInventoryExceptionsAsError = true;

  /**
   * Set the logMissingInventoryExceptionsAsError property.
   */
  public void setLogMissingInventoryExceptionsAsError(boolean pLogMissingInventoryExceptionsAsError) {
    mLogMissingInventoryExceptionsAsError = pLogMissingInventoryExceptionsAsError;
  }

  /**
   * Return the logMissingInventoryExceptionsAsError property.
   */
  public boolean isLogMissingInventoryExceptionsAsError() {
    return mLogMissingInventoryExceptionsAsError;
  }
  
  //---------------------------------------------------------
  // Methods
  //---------------------------------------------------------
  
  /**
   * This method will send an "UpdateInventory" message if the item changes from Out of stock 
   * to In stock with this method.
   *
   * @param  pSkuId - The id of the SKU whose stockLevel is being set.
   * @param  pQuantity - The amount to set the stockLevel to.
   * 
   * @return INVENTORY_STATUS_SUCCEED if the item's stock level was set successfully. 
   *         INVENTORY_STATUS_ITEM_NOT_FOUND if no item could be found for the SKU.
   *         
   * @throws InventoryException if there was an error while attempting to return the inventory information.
   */
  public int setStockLevel(String pSkuId, long pQuantity, String pLocationId) throws InventoryException {
    vlogDebug("setStockLevel skuId: {0}, quantity: {1}, locationId: {2}", pSkuId, pQuantity, pLocationId);

    int oldStatus = queryAvailabilityStatus(pSkuId, pLocationId);
    int result = super.setStockLevel(pSkuId, pQuantity, pLocationId);
    int newStatus = queryAvailabilityStatus(pSkuId, pLocationId);

    if ((oldStatus == AVAILABILITY_STATUS_OUT_OF_STOCK) && (newStatus == AVAILABILITY_STATUS_IN_STOCK)) {
      List list = new ArrayList(1);
      list.add(pSkuId);
      inventoryWasUpdated(list, pLocationId);
    }

    return result;
  }

  /**
   * This method will send an "UpdateInventory" message if the item changes from Out of stock to 
   * In stock with this method.
   *
   * @param  pSkuId The id of the SKU whose stockLevel is being increased.
   * @param  pQuantity The amount to increase the stockLevel to.
   * 
   * @return INVENTORY_STATUS_SUCCEED if the item's stock level was set successfully. 
   *          INVENTORY_STATUS_ITEM_NOT_FOUND if no item could be found for the SKU.
   *          
   * @throws InventoryException if there was an error while attempting to return the inventory information.
   */
  public int increaseStockLevel(String pSkuId, long pQuantity, String pLocationId) throws InventoryException {
    vlogDebug("increaseStockLevel skuId: {0}, quantity: {1}, locationId: {2}", pSkuId, pQuantity, pLocationId);

    int oldStatus = queryAvailabilityStatus(pSkuId, pLocationId);
    int result = super.increaseStockLevel(pSkuId, pQuantity, pLocationId);
    int newStatus = queryAvailabilityStatus(pSkuId, pLocationId);

    if ((oldStatus == AVAILABILITY_STATUS_OUT_OF_STOCK) && (newStatus == AVAILABILITY_STATUS_IN_STOCK)) {
      List list = new ArrayList(1);
      list.add(pSkuId);
      inventoryWasUpdated(list, pLocationId);
    }

    return result;
  }

  /**
   * <p>
   *   Derive the availabilityStatus based on the properties of the item.  Always derives the status, 
   *   does not check the current value of availabilityStatus. 
   * </p>
   * <p>
   *   Uses these rules: (a negative level indicates infinite supply)
   *   <ul>
   *     <li><code>if (stockLevel > stockThreshold) return IN_STOCK;</li>
   *     <li>else if (backorderLevel > backorderThreshold) return BACKORDERABLE;</li>
   *     <li>else if (preorderLevel > preorderThreshold) return PREORDERABLE;</li>
   *     <li>else return OUT_OF_STOCK; </code></li>
   *   </ul>
   * </p>
   * 
   * @param pSkuId - The SKU we are deriving the status for.
   * 
   * @return The derived status.
   * 
   * @throws InventoryException if there was an error while attempting to return the inventory information.
   */
  protected int deriveAvailabilityStatus(String pSkuId, String pLocationId) throws InventoryException {
    vlogDebug("Inside deriveAvailabilityStatus: skuId {0}, locationId {1}", pSkuId, pLocationId);

    RepositoryItem inventory;

    try {
      inventory = getInventoryItem(pSkuId, pLocationId);
    } 
    catch (RepositoryException e) {
      throw new InventoryException(e);
    }

    long stockLevel = 
      getInventoryLevel(inventory, getStockLevelPropertyName(), getDefaultStockLevel());
    long stockThreshold = 
      getInventoryLevel(inventory, getStockThresholdPropertyName(), getDefaultThresholdLevel());
    long backorderLevel = 
      getInventoryLevel(inventory, getBackorderLevelPropertyName(), getDefaultBackorderLevel());
    long backorderThreshold = 
      getInventoryLevel(inventory, getBackorderThresholdPropertyName(), getDefaultThresholdLevel());
    long preorderLevel = 
      getInventoryLevel(inventory, getPreorderLevelPropertyName(), getDefaultPreorderLevel());
    long preorderThreshold =
      getInventoryLevel(inventory, getPreorderThresholdPropertyName(), getDefaultThresholdLevel());

    if (isLoggingDebug()) {
      logDebug("stockLevel=" + stockLevel);
      logDebug("stockThreshold=" + stockThreshold);
      logDebug("backorderLevel=" + backorderLevel);
      logDebug("backorderThreshold=" + backorderThreshold);
      logDebug("preorderLevel=" + preorderLevel);
      logDebug("preorderThreshold=" + preorderThreshold);
    }

    if ((stockLevel == -1) || (stockLevel > stockThreshold)) {
      if (isLoggingDebug()) {
        logDebug("item is in stock");
      }

      return getAvailabilityStatusInStockValue();
    } 
    else if ((backorderLevel == -1) || (backorderLevel > backorderThreshold)) {
      if (isLoggingDebug()) {
        logDebug("item is backorderable");
      }

      return getAvailabilityStatusBackorderableValue();
    } 
    else if ((preorderLevel == -1) || (preorderLevel > preorderThreshold)) {
      if (isLoggingDebug()) {
        logDebug("item is preorderable");
      }

      return getAvailabilityStatusPreorderableValue();
    } 
    else {
      if (isLoggingDebug()) {
        logDebug("no quantities for any level");
      }

      return getAvailabilityStatusOutOfStockValue();
    }
  }
  
  /* (non-Javadoc)
   * @see atg.projects.store.inventory.StoreInventoryManagerInterface#isItemInStock(java.lang.String)
   */
  @Override
  public boolean isItemInStock(String pSkuId) throws InventoryException {
    return isItemInStock(pSkuId, null);
  }
  
  /* (non-Javadoc)
   * @see atg.projects.store.inventory.StoreInventoryManagerInterface#isItemInStock(java.lang.String, java.lang.String)
   */
  @Override
  public boolean isItemInStock(String pSkuId, String pLocationId) throws InventoryException {
    
    boolean itemInStock = false;
    RepositoryItem inventoryItem;
    
    try {
      inventoryItem = getInventoryItem(pSkuId, pLocationId);
      long stockLevel = getInventoryLevel(inventoryItem, 
                                          getStockLevelPropertyName(), 
                                          getDefaultStockLevel());
      
      long stockThreshold = getInventoryLevel(inventoryItem, 
                                              getStockThresholdPropertyName(), 
                                              getDefaultThresholdLevel());
      
      if ((stockLevel == -1) || (stockLevel > stockThreshold)) {
        vlogDebug("Item {0} is in stock", pSkuId);
        itemInStock = true;
      } 
    } 
    catch (RepositoryException e) {
      throw new InventoryException(e);
    }
    
    return itemInStock;
  }

  /* (non-Javadoc)
   * @see atg.projects.store.inventory.StoreInventoryManagerInterface#queryAvailabilityStatus(atg.repository.RepositoryItem, java.lang.String)
   */
  @Override
  public int queryAvailabilityStatus(RepositoryItem pProduct, String pSkuId) throws InventoryException {
    return queryAvailabilityStatus(pProduct, pSkuId, null);
  }
  
  /* (non-Javadoc)
   * @see atg.projects.store.inventory.StoreInventoryManagerInterface#queryAvailabilityStatus(atg.repository.RepositoryItem, java.lang.String, java.lang.String)
   */
  @Override
  public int queryAvailabilityStatus(RepositoryItem pProduct, String pSkuId, String pLocationId) throws InventoryException {
    vlogDebug("Inside newDeriveAvailabilityStatus: {0}, {1}", pSkuId, pLocationId);

    RepositoryItem inventory;
    
		/**
		 * BUG 13285094- Deriving the SKU Bundle Inventory status while placing the
		 * order
		 */
		if (isBundle(pSkuId)) {
			return deriveBundleAvailabilityStatus(pSkuId);
		}
		
    try {
      inventory = getInventoryItem(pSkuId, pLocationId);
    } 
    catch (RepositoryException e) {
      throw new InventoryException(e);
    }

    StoreCatalogProperties catalogProps = getCatalogProperties();
    
    Boolean preorderable = 
      (Boolean) pProduct.getPropertyValue(catalogProps.getPreorderablePropertyName());
    Date preorderEndDate = 
      (Date) pProduct.getPropertyValue(catalogProps.getPreorderEndDatePropertyName());
    Boolean useInventoryForPreorder = 
     (Boolean) pProduct.getPropertyValue(catalogProps.getUseInventoryForPreorderPropertyName());
    
    long stockLevel = 
      getInventoryLevel(inventory, getStockLevelPropertyName(), getDefaultStockLevel());
    long stockThreshold = 
      getInventoryLevel(inventory, getStockThresholdPropertyName(), getDefaultThresholdLevel());
    long backorderLevel = 
      getInventoryLevel(inventory, getBackorderLevelPropertyName(), getDefaultBackorderLevel());
    long backorderThreshold = 
      getInventoryLevel(inventory, getBackorderThresholdPropertyName(), getDefaultThresholdLevel());
    long preorderLevel = 
      getInventoryLevel(inventory, getPreorderLevelPropertyName(), getDefaultPreorderLevel());
    long preorderThreshold = 
      getInventoryLevel(inventory, getPreorderThresholdPropertyName(), getDefaultThresholdLevel());

    if (isLoggingDebug()) {
      logDebug("preorderable=" + preorderable);
      logDebug("preorderEndDate=" + preorderEndDate);
      logDebug("useInventoryForPreorder=" + useInventoryForPreorder);
      logDebug("stockLevel=" + stockLevel);
      logDebug("stockThreshold=" + stockThreshold);
      logDebug("backorderLevel=" + backorderLevel);
      logDebug("backorderThreshold=" + backorderThreshold);
      logDebug("preorderLevel=" + preorderLevel);
      logDebug("preorderThreshold=" + preorderThreshold);
    }

    // Get the current system time.
    CurrentDate cd = getCurrentDate();
    Date currentDate = cd.getTimeAsDate();
    
    // Check to see if the item is marked as pre-orderable.  If so, then it
    // either can be pre-ordered or else is has "sold out" of the pre-order limit.
    if (preorderable != null && preorderable.booleanValue() &&
        (((preorderEndDate != null) && preorderEndDate.after(currentDate)) ||
        ((preorderEndDate == null) &&
        (!useInventoryForPreorder.booleanValue() || ((stockLevel == 0) && (preorderLevel != 0)))))) {
      
      if (!useInventoryForPreorder.booleanValue() || 
          (preorderLevel == -1) || 
          (preorderLevel > preorderThreshold)) {
        
        if (isLoggingDebug()) {
          logDebug("item is preorderable");
        }

        return getAvailabilityStatusPreorderableValue();
      } 
      else {
        if (isLoggingDebug()) {
          logDebug("item is out of stock (preorders used up)");
        }

        return getAvailabilityStatusOutOfStockValue();
      }
    }

    // Once we've reached here the item cannot be pre-orderable, so we can ignore the preorderLevel.
    if ((stockLevel == -1) || (stockLevel > stockThreshold)) {
      if (isLoggingDebug()) {
        logDebug("item is in stock");
      }

      return getAvailabilityStatusInStockValue();
    } 
    else if ((backorderLevel > backorderThreshold) || (backorderLevel == -1)) {
      if (isLoggingDebug()) {
        logDebug("item is backorderable");
      }

      return getAvailabilityStatusBackorderableValue();
    } 
    else {
      if (isLoggingDebug()) {
        logDebug("item is out of stock (normal stock)");
      }

      return getAvailabilityStatusOutOfStockValue();
    }
  }
  
  /**
   * Override base method to honor not only inventory item but product's preorderable
   * settings when determining availability status.
   */
  public int queryAvailabilityStatus(String pSkuId, String pLocationId) throws InventoryException {
    RepositoryItem sku;
    
    try {
      sku = getCatalogRefItem(pSkuId);
    }
    catch (RepositoryException e) {
      throw new InventoryException(e);
    }
    
    if (sku == null){
      String errorMsg = ResourceUtils.getMsgResource(NO_SUCH_ITEM, RESOURCE_BUNDLE_NAME, sResourceBundle, new Object[] {pSkuId});
      throw new InventoryException(errorMsg);
    }
    
    @SuppressWarnings("unchecked")
    Collection<RepositoryItem> parentProducts = (Collection<RepositoryItem>) sku.getPropertyValue(getCatalogProperties().getParentProductsPropertyName());
    
    if (parentProducts == null || parentProducts.size() == 0){
      String errorMsg = ResourceUtils.getMsgResource(NO_PARENT_PRODUCT_FOUND, RESOURCE_BUNDLE_NAME, sResourceBundle, new Object[] {pSkuId});
      throw new InventoryException(errorMsg);
    }
    
    return queryAvailabilityStatus(parentProducts.iterator().next(), pSkuId, pLocationId);
  }

  /**
   * Get the availabilityDate for a product.
   *
   * @param pProduct - The product we are getting the availability date for.
   * 
   * @return The availabilityDate which may be null.
   */
  public Date getPreorderAvailabilityDate(RepositoryItem pProduct) {
    if (isLoggingDebug()) {
      logDebug("Inside getPreorderAvailabilityDate");
    }

    return (Date) pProduct.getPropertyValue(getCatalogProperties().getPreorderEndDatePropertyName());
  }

  /**
   * Get the availabilityDate from the inventory data for a SKU item.
   *
   * @param pSkuId - The SKU we are getting the availability date for.
   * 
   * @return The availabilityDate which may be null.
   * 
   * @throws InventoryException if there was an error while attempting to return the inventory information.
   */
  public Date getBackorderAvailabilityDate(String pSkuId) throws InventoryException {
    return queryAvailabilityDate(pSkuId);
  }

  /**
   * Given the inventory item of note get the inventory level for the particular property.
   *
   * @param pInventory - The inventory repository Item to work with.
   * @param pInventoryLevelPropertyName - the property name of the inventory property that denotes the level.
   * @param pDefaultLevel a default level if the property is not set.
   * 
   * @return Returns the inventory level stored for the property or the default if not found.
   * 
   * @throws atg.commerce.inventory.InventoryException if there was an error while attempting 
   *                                                   to return the inventory information.
   */
  protected long getInventoryLevel(RepositoryItem pInventory, 
                                   String pInventoryLevelPropertyName, 
                                   long pDefaultLevel) throws InventoryException {
    long level = 0;
    Long value = (Long) getPropertyValue(pInventory, pInventoryLevelPropertyName);

    if (value == null) {
      level = pDefaultLevel;
    } 
    else {
      level = value.longValue();
    }

    return level;
  }

  /**
   * Returns the object associated with the given property name.
   *
   * @param  pItem the repository item to fetch the value from.
   * @param  pPropertyName the property value to return.
   * 
   * @return The object, null if pItem is null or pPropertyName is null.
   * 
   * @throws InventoryException if there was an error while attempting to return the inventory 
   *                            information. An error can occur if no item can be found with the 
   *                            given id; if the value from the named property is null, or a general 
   *                            RepositoryException occurs.
   */
  protected Object getPropertyValue(RepositoryItem pItem, String pPropertyName) throws InventoryException {
    
    if ((pItem != null) && (pPropertyName != null)) {
      return pItem.getPropertyValue(pPropertyName);
    } 

    return null;
  }
  
  /* (non-Javadoc)
   * @see atg.projects.store.inventory.StoreInventoryManagerInterface#isBackInStockItemExists(atg.repository.MutableRepository, java.lang.String, java.lang.String, java.lang.String)
   */
  @Override
  public boolean isBackInStockItemExists(MutableRepository pRepository, 
      String pCatalogRefId, 
      String pEmail, 
      String pProductId) throws RepositoryException {
    return isBackInStockItemExists(pRepository, pCatalogRefId, pEmail, pProductId, null);
  }
  
  /* (non-Javadoc)
   * @see atg.projects.store.inventory.StoreInventoryManagerInterface#isBackInStockItemExists(atg.repository.MutableRepository, java.lang.String, java.lang.String, java.lang.String, java.lang.String)
   */
  @Override
  public boolean isBackInStockItemExists(MutableRepository pRepository, 
                                         String pCatalogRefId, 
                                         String pEmail, 
                                         String pProductId,
                                         String pLocationId) throws RepositoryException {
    boolean isExist = false;
    
    RepositoryView view = pRepository.getView(getPropertyManager().getBackInStockNotifyItemDescriptorName());
    Object[] params;
    RqlStatement statement;
    if (StringUtils.isEmpty(pLocationId)) {
      params = new Object[] { pCatalogRefId, pEmail, pProductId };
      statement = RqlStatement.parseRqlStatement(RQL_QUERY_DUPLICATE_BACK_IN_STOCK_ITEM);
    } else {
      params = new Object[] { pCatalogRefId, pEmail, pProductId, pLocationId };
      statement = RqlStatement.parseRqlStatement(RQL_QUERY_DUPLICATE_BACK_IN_STOCK_ITEM_WITH_LOCATION);
    }
    
    RepositoryItem[] items = statement.executeQuery(view, params);

    isExist = (items != null) && (items.length > 0);

    return isExist;
  }
  
  /**
   * Creates the required item in the repository.
   * 
   * @param pRepository - Repository where to create item.
   * @param pCatalogRefId - repository id.
   * @param pEmail - string that represents email.
   * @param pProductId - product id.
   * 
   * @throws RepositoryException if there was an error while creating repository item.
   */
  protected void createBackInStockNotifyItem(MutableRepository pRepository, 
      String pCatalogRefId, 
      String pEmail, 
      String pProductId) throws RepositoryException {
    createBackInStockNotifyItem(pRepository, pCatalogRefId, pEmail, pProductId, null, null);
  }
  
  /**
   * Creates the required item in the repository.
   * 
   * @param pRepository - Repository where to create item.
   * @param pCatalogRefId - repository id.
   * @param pEmail - string that represents email.
   * @param pProductId - product id.
   * @param pLocale - local.
   * @param pSiteId - site id.
   * 
   * @throws RepositoryException if there was an error while creating repository item.
   */
  public void createBackInStockNotifyItem(MutableRepository pRepository, 
                                             String pCatalogRefId, 
                                             String pEmail, 
                                             String pProductId,
                                             String pLocale, 
                                             String pSiteId) throws RepositoryException {
    createBackInStockNotifyItem(pRepository, pCatalogRefId, pEmail, pProductId, pLocale, pSiteId, null);
  }
  
  protected void createBackInStockNotifyItem(MutableRepository pRepository, 
                                             String pCatalogRefId, 
                                             String pEmail, 
                                             String pProductId,
                                             String pLocale, 
                                             String pSiteId,
                                             String pLocationId) throws RepositoryException {
    
    String itemDescriptor = getPropertyManager().getBackInStockNotifyItemDescriptorName();
    String skuIdProp = getPropertyManager().getBisnSkuIdPropertyName();
    String emailProp = getPropertyManager().getBisnEmailPropertyName();
    String productIdProp = getPropertyManager().getBisnProductIdPropertyName();
    
    MutableRepositoryItem item = pRepository.createItem(itemDescriptor);
    
    item.setPropertyValue(skuIdProp, pCatalogRefId);
    item.setPropertyValue(emailProp, pEmail);
    item.setPropertyValue(productIdProp, pProductId);
    item.setPropertyValue(getPropertyManager().getLocalePropertyName(), pLocale);
    item.setPropertyValue(PARAM_SITE_ID, pSiteId);
    
    if (!StringUtils.isEmpty(pLocationId)) {
      item.setPropertyValue(PARAM_LOCATION_ID, pLocationId);
    }
    
    pRepository.addItem(item);
  }
  
  /**
   * The method logs InventoryException. MissingInventoryException is logged 
   * only if <code>logMissingInventoryExceptionsAsError</code> property is configured
   * to true.
   * @param pException The InventoryException to log.
   * @return true if exception has been logged as error.
   */
  public boolean logInventoryException(InventoryException pException) {
    if ((!isLogMissingInventoryExceptionsAsError()) &&
        (pException instanceof MissingInventoryItemException)) {
      return false;
    }
     
    if(isLoggingError()){
      logError(pException);
    }
    return true;
  }
  
}
