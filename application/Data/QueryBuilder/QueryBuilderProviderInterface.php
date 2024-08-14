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

namespace BulletinFusion\Data\QueryBuilder;

/**
 * Interface for Query Builder providers to implement.
 */
interface QueryBuilderProviderInterface {
    /**
     * Select columns.
     * @param string [$columns=*] - Columns to select.
     * @return self
     */
    public function select($columns = '*');

    /**
     * From table.
     * @param string $table - The table name.
     * @param string [$alias=null] - Optional alias.
     * @return self
     */
    public function from($table, $alias = null);

    /**
     * Perform a join.
     * @param string $type - The type of join (e.g., INNER).
     * @param string $table - The table name.
     * @param string $condition - The conditions for the join.
     * @param string [$alias=null] - Optional alias.
     * @return self
     */
    public function join($type, $table, $condition, $alias = null);

    /**
     * Where clause conditions.
     * @param string $condition - The conditions for the where clause.
     * @param array [$values=[]] - Optional parameter values.
     * @return self
     */
    public function where($condition, $values = []);

    /**
     * Group by clause.
     * @param string $column - The column to group by.
     * @return self
     */
    public function groupBy($column);

    /**
     * Having clause.
     * @param string $condition - The conditions for the having clause.
     * @param array [$values=[]] - Optional parameter values.
     * @return self
     */
    public function having($condition, $values = []);

    /**
     * Order by clause.
     * @param string $column - The column to order by.
     * @param string [$direction=ASC] - The direction to order by.
     * @return self
     */
    public function orderBy($column, $direction = 'ASC');

    /**
     * Limit clause.
     * @param integer $limit - The limit value.
     * @param integer [$offset=0] - The offset value (default: 0)
     * @return self
     */
    public function limit($limit, $offset = 0);
    
    /**
     * Perform a count clause.
     *
     * @param string [$column=*] - The column to get count for.
     * @param string [$alias=count] - The alias.
     * @return self
     */
    public function count($column = '*', $alias = 'count');

    /**
     * Update clause.
     * @param string $table - The table name to update.
     * @return self
     */
    public function update($table);

    /**
     * Set clause for update clause.
     * @param array $values - The values to set.
     * @return self
     */
    public function set($values);

    /**
     * Delete clause.
     * @param string $table - The table to delete from.
     * @return self
     */
    public function delete($table);

    /**
     * Execute the query on the database.
     * @return object - Resource object instance.
     */
    public function execute();

    /**
     * Executes the query as a transaction on the database.
     * @return void
     */
    public function executeTransaction();

    /**
     * Resets the current query.
     * @return void
     */
    public function reset();

    /**
     * Get the built query string.
     * @return string - Query string.
     */
    public function getQuery();
}