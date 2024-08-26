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

namespace BulletinFusion\Data\QueryBuilder\Providers;

// This file should not be accessed directly, only through the wrapper.
if (!defined('BF_RUNTIME') || BF_RUNTIME != true) {
    die('<h1>Bulletin Fusion Error</h1>This file cannot be accessed directly!');
}

use BulletinFusion\Data\QueryBuilder\QueryBuilderProviderInterface;
use BulletinFusion\Data\Database\DatabaseProviderFactory;
use BulletinFusion\Exceptions\QueryBuilderException;

/**
 * MySQLi query builder provider.
 */
class MySQLiQueryBuilderProvider implements QueryBuilderProviderInterface {
    /**
     * Singleton instance.
     * @var object
     */
    protected static $instance;

    /**
     * Database object
     * @var DatabaseProviderFactory
     */
    protected $db;

    /**
     * Holds the built query string.
     * @var string
     */
    protected $query = '';

    /**
     * Holds the values from the built query.
     * @var array
     */
    protected $values = [];

    /**
     * Holds all the parts for building the query string.
     * @var object
     */
    protected $parts;

    /**
     * The database prefix string.
     * @var string
     */
    protected $prefix = '';

    /**
     * Constructor that sets up MySQLiQueryBuilderProvider.
     */
    public function __construct() {
        $this->db = DatabaseProviderFactory::getInstance();

        $this->parts = (object) [
            'select' => '',
            'insert' => '',
            'update' => '',
            'delete' => '',
            'from' => '',
            'join' => '',
            'where' => '',
            'groupBy' => '',
            'having' => '',
            'orderBy' => '',
            'limit' => '',
            'set' => '',
            'values' => ''
        ];

        $this->prefix = $_ENV['MYSQLI_PREFIX'];
    }

    /**
     * Get singleton instance of MySQLiQueryBuilderProvider.
     * @return MySQLiQueryBuilderProvider
     */
    public static function getInstance() {
        if (!self::$instance) self::$instance = new self;
        return self::$instance;
    }

    /**
     * Select columns.
     * @param string [$columns=*] - Columns to select.
     * @return self
     */
    public function select($columns = '*') {
        if (is_array($columns)) {
            $this->parts->select = "SELECT " . \implode(', ', $columns);
        } else {
            $this->parts->select = "SELECT {$columns}";
        }

        return $this;
    }

    /**
     * From table.
     * @param string $table - The table name.
     * @param string [$alias=null] - Optional alias.
     * @return self
     */
    public function from($table, $alias = null) {
        if (empty($this->parts->from)) {
            $this->parts->from = "FROM {$this->prefix}{$table}" . ($alias != null ? " AS {$alias}" : "");
        } else {
            $this->parts->from .= ", {$this->prefix}{$table}" . ($alias != null ? " AS {$alias}" : "");
        }

        return $this;
    }

    /**
     * Perform a join.
     * @param string $type - The type of join (e.g., INNER).
     * @param string $table - The table name.
     * @param string $condition - The conditions for the join.
     * @param string [$alias=null] - Optional alias.
     * @return self
     */
    public function join($type, $table, $condition, $alias = null) {
        $this->parts->join .= " " . \strtoupper($type) . " JOIN {$this->prefix}{$table}" . $alias != null ? " AS {$alias}" : "" . " ON {$condition}";
        return $this;
    }
    
    /**
     * Where clause conditions.
     * @param string $condition - The conditions for the where clause.
     * @param array [$values=[]] - Optional parameter values.
     * @return self
     */
    public function where($condition, $values = []) {
        if (empty($this->parts->where)) {
            $this->parts->where = "WHERE {$condition}";
        } else {
            $this->parts->where .= " AND {$condition}";
        }

        $this->values = \array_merge($this->values, $values);

        return $this;
    }

    /**
     * Group by clause.
     * @param string $column - The column to group by.
     * @return self
     */
    public function groupBy($column) {
        $this->parts->groupBy = "GROUP BY {$column}";
        return $this;
    }

    /**
     * Having clause.
     * @param string $condition - The conditions for the having clause.
     * @param array [$values=[]] - Optional parameter values.
     * @return self
     */
    public function having($condition, $values = []) {
        $this->parts->having = "HAVING {$condition}";
        $this->values = \array_merge($this->values, $values);
        return $this;
    }

    /**
     * Order by clause.
     * @param string $column - The column to order by.
     * @param string [$direction=ASC] - The direction to order by.
     * @return self
     */
    public function orderBy($column, $direction = 'ASC') {
        $this->parts->orderBy = "ORDER BY {$column} " . \strtoupper($direction);
        return $this;
    }

    /**
     * Limit clause.
     * @param integer $limit - The limit value.
     * @param integer [$offset=0] - The offset value (default: 0)
     * @return self
     */
    public function limit($limit, $offset = 0) {
        $this->parts->limit = "LIMIT {$offset}, {$limit}";
        return $this;
    }
    
    /**
     * Perform a count clause.
     *
     * @param string [$column=*] - The column to get count for.
     * @param string [$alias=count] - The alias.
     * @return self
     */
    public function count($column = '*', $alias = 'count') {
        $this->parts->select = "SELECT COUNT({$column}) AS {$alias}";
        return $this;
    }

    /**
     * Update clause.
     * @param string $table - The table name to update.
     * @return self
     */
    public function update($table) {
        $this->parts->update = "UPDATE {$this->prefix}{$table}";
        return $this;
    }

    /**
     * Set clause for update clause.
     * @param array $values - The values to set.
     * @return self
     */
    public function set($values) {
        $setClause = \implode(', ', \array_map(function($key) {
            return "{$key} = ?";
        }, \array_keys($values)));

        $this->parts->set = "SET {$setClause}";
        $this->values = \array_merge($this->values, \array_values($values));
        return $this;
    }

    /**
     * Delete clause.
     * @param string $table - The table to delete from.
     * @return self
     */
    public function delete($table) {
        $this->parts->delete = "DELETE FROM {$this->prefix}{$table}";
        return $this;
    }

    /**
     * Insert clause.
     * @param string $table - The table name to insert into.
     * @param array [$column[]] - The columns to insert into.
     * @return self
     */
    public function insert($table, $columns = []) {
        $this->parts->insert = "INSERT INTO {$this->prefix}{$table}";

        if (!empty($columns)) {
            $columns = \implode(', ', $columns);
            $this->parts->insert .= " ({$columns})";
        }

        return $this;
    }

    /**
     * Values for insert clause.
     * @param array $values - The values to insert.
     * @return self
     */
    public function values($values) {
        $placeholders = \implode(', ', \array_fill(0, \count($values), '?'));
        $this->parts->values = "VALUES ({$placeholders})";
        $this->values = \array_merge($this->values, \array_values($values));
        return $this;
    }

    /**
     * Execute the query on the database.
     * @return object - Resource object instance.
     */
    public function execute() {
        $this->buildQuery();

        if (!isset($this->query) || !is_string($this->query) || trim($this->query) === '') {
            throw new QueryBuilderException('Query sring is undefined, empty, or not a string');
        }

        $resourceObj = $this->db->query($this->query, $this->values);
        return $resourceObj;
    }

    /**
     * Executes the query as a transaction on the database.
     * @return void
     */
    public function executeTransaction() {
        $this->buildQuery();

        if (!isset($this->query) || !is_string($this->query) || trim($this->query) === '') {
            throw new QueryBuilderException('Query sring is undefined, empty, or not a string');
        }
        
        $this->db->transaction([['sql' => $this->query, 'params' => $this->values]]);
    }

    /**
     * Resets the current query.
     * @return void
     */
    public function reset() {
        $this->query = '';
        $this->values = [];
        $this->parts->select = '';
        $this->parts->from = '';
        $this->parts->join = '';
        $this->parts->where = '';
        $this->parts->groupBy = '';
        $this->parts->having = '';
        $this->parts->orderBy = '';
        $this->parts->limit = '';
        $this->parts->insert = '';
        $this->parts->update = '';
        $this->parts->delete = '';
        $this->parts->set = '';
        $this->parts->values = '';
        return $this;
    }

    /**
     * Get the built query string.
     * @return string - Query string.
     */
    public function getQuery() {
        return $this->query;
    }

    /**
     * Helper method that builds the query.
     * @return void
     */
    private function buildQuery() {
        $this->query = trim(
            implode(' ', array_filter([
                $this->parts->select,
                $this->parts->update,
                $this->parts->delete,
                $this->parts->insert,
                $this->parts->set,
                $this->parts->from,
                $this->parts->join,
                $this->parts->where,
                $this->parts->groupBy,
                $this->parts->having,
                $this->parts->orderBy,
                $this->parts->limit,
                $this->parts->values
            ], function($part) {
                return !empty($part);
            }))
        );
    }

    /**
     * Get the bound values for the query.
     * @return array - The bound values.
     */
    public function getBoundValues() {
        return $this->values;
    }
}