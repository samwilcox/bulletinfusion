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

namespace BulletinFusion\Data\Database\Providers;

// This file should not be accessed directly, only through the wrapper.
if (!defined('BF_RUNTIME') || BF_RUNTIME != true) {
    die('<h1>Bulletin Fusion Error</h1>This file cannot be accessed directly!');
}

use BulletinFusion\Data\Database\DatabaseProviderInterface;
use BulletinFusion\Exceptions\DatabaseException;

 /**
  * MySQLi database provider.
  */
 class MySQLiDatabaseProvider implements DatabaseProviderInterface {
    /**
     * Singleton instance.
     * @var object
     */
    protected static $instance;

    /**
     * Connection object instance.
     * @var object
     */
    protected $connection = null;

    /**
     * Total queries executed.
     * @var integer
     */
    protected $totalQueries = 0;

    /**
     * Last SQL query executed.
     * @var string
     */
    protected $lastQuery;

    /**
     * Debug informatin object instance.
     * @var object
     */
    protected $debug;

    /**
     * Constructor for MySQLiDatabaseProvider.
     */
    public function __construct() {
        $this->debug = new \stdClass();
    }

    /**
     * Returns an instance of MySQLiDatabaseProvider.
     * @return MySqliDatabaseProvider
     */
    public static function getInstance() {
        if (!self::$instance) self::$instance = new self;
        return self::$instance;
    }

    /**
    * Establishes a connection to the database.
    * @return void
    */
    public function connect() {
        try {
            $this->connection = new \mysqli(
                $_ENV['MYSQLI_HOST'],
                $_ENV['MYSQLI_USERNAME'],
                $_ENV['MYSQLI_PASSWORD'],
                $_ENV['MYSQLI_DATABASE'],
                $_ENV['MYSQLI_PORT']
            );

            if ($this->connection->connect_error) {
                throw new DatabaseException(\sprintf('Failed to connect to the MySQL database: %s', $this->connection->connect_error));
            }
        } catch (\Exception $e) {
            throw new DatabaseException('Failed to connect to the MySQL database', 0, $e);
        }
    }

    /**
     * Execute a query.
     *
     * @param string $query - Query string to execute.
     * @param object [$params=null] - Optional parameters.
     * @return object - Query specific resource object.
     */
    public function query($query, $params = null) {
        $this->timer();
        $this->lastQuery = $query;
        $statement = $this->connection->prepare($query);

        $types = ['integer' => 'i', 'double' => 'd', 'string' => 's', 'blob' => 'b'];
        $typesList = '';
        $bind = [];

        try {
            if ($params != null && \count($params) > 0) {
                foreach ($params as $k => $v) {
                    $typesList .= $v == null ? 's' : $types[\gettype($v)];
                    $$k = $v;
                    $bind[] = &$$k;
                }
    
                \array_unshift($bind, $typesList);
                \call_user_func_array([$statement, 'bind_param'], $bind);
            }
    
            if ($statement === false) {
                throw new DatabaseException('Failed to prepare the MySQL query statement');
            }
    
            $statement->execute();
        } catch (\Exception $e) {
            throw new DatabaseException('Failed to execute the MySQL query statement: ' . $e, 0, $e);
        }

        $this->totalQueries++;
        $this->timer(false);

        return $statement->get_result();
    }

    /**
     * Begin a transaction.
     * @return void
     */
    public function beginTransaction() {
        $this->connection->begin_transaction();
    }

    /**
     * Commit a transaction.
     * @return void
     */
    public function commit() {
        $this->connection->commit();
    }

    /**
     * Rollback a transaction.
     * @return void
     */
    public function rollback() {
        $this->connection->rollback();
    }

    /**
     * Perform a transaction.
     * @param array $queryList - Collection of queries.
     * @return void
     */
    public function transaction($queryList) {
        $this->timer();
        $prevCount = $this->totalQueries;

        try {
            $this->beginTransaction();

            foreach ($queryList as $queryData) {
                $this->query($queryData['sql'], $queryData['params']);
                $this->totalQueries++;
            }

            $this->commit();
            $this->timer(false);
            return true;
        } catch (\Exception $e) {
            $this->timer(false);
            $this->totalQueries = $prevCount;
            $this->rollback();
            throw new DatabaseException('Database transaction failed', 0, $e);
        }
    }

    /**
     * Free result to remove from memory.
     * @param object $resource - Query specific resource object.
     * @return void
     */
    public function freeResult($resource) {
        $resource->close();
    }

    /**
     * Fetch data.
     * @param object $resource - Query specific resource object.
     * @return array - Associate array of data.
     */
    public function fetch($resource) {
        return $resource->fetch_assoc();
    }

    /**
     * Get number of rows returned.
     * @param object $resource - Query specific resource object.
     * @return integer - Total number of rows.
     */
    public function numRows($resource) {
        return $resource->num_rows;
    }

    /**
     * Get the last insert ID.
     * @return integer - Last insert identifier.
     */
    public function insertId() {
        return $this->connection->insert_id;
    }

    /**
     * Get the total affected rows.
     * @return integer - Total affected rows.
     */
    public function affectedRows() {
        return $this->connection->affected_rows;
    }

    /**
     * Disconnect from the database.
     * @return void
     */
    public function disconnect() {
        if ($this->connection) {
            $this->connection->close();
            $this->connection = null;
            $this->instance = null;
        }
    }

    /**
     * Helper method that starts/stop the exection timer.
     * @param boolean [$start=true] - True to start the timer, false to stop it
     * @return void
     */
    private function timer($start = true) {
        if ($start) {
            $this->debug->start = \microtime(true);
        } else {
            $this->debug->result = $this->debug->result + (\microtime(true) - $this->debug->start);
        }
    }
 }