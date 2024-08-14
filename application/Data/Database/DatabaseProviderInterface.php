<?php

/**
 * BULLETIN FUSION
 * 
 * By Sam Wilcox <sam@bulletinfusion.com>
 * https://www.bulletinfusion.com
 * 
 * This software is released under the MIT license.
 * For further details, visit:
 * https://license.bulletinfusion.com
 */

 namespace BulletinFusion\Data\Database;

 /**
  * Interface for database providers to implement.
  */
 interface DatabaseProviderInterface {
   /**
    * Establishes a connection to the database.
    * @return void
    */
    public function connect();

    /**
     * Execute a query.
     *
     * @param string $query - Query string to execute.
     * @param object [$params=null] - Optional parameters.
     * @return object - Query specific resource object.
     */
    public function query($query, $params = null);

    /**
     * Begin a transaction.
     * @return void
     */
    public function beginTransaction();

    /**
     * Commit a transaction.
     * @return void
     */
    public function commit();

    /**
     * Rollback a transaction.
     * @return void
     */
    public function rollback();

    /**
     * Perform a transaction.
     * @param array $queryList - Collection of queries.
     * @return void
     */
    public function transaction($queryList);

    /**
     * Free result to remove from memory.
     * @param object $resource - Query specific resource object.
     * @return void
     */
    public function freeResult($resource);

    /**
     * Fetch data.
     * @param object $resource - Query specific resource object.
     * @return array - Associate array of data.
     */
    public function fetch($resource);

    /**
     * Get number of rows returned.
     * @param object $resource - Query specific resource object.
     * @return integer - Total number of rows.
     */
    public function numRows($resource);

    /**
     * Get the last insert ID.
     * @return integer - Last insert identifier.
     */
    public function insertId();

    /**
     * Get the total affected rows.
     * @return integer - Total affected rows.
     */
    public function affectedRows();

    /**
     * Disconnect from the database.
     * @return void
     */
    public function disconnect();
 }