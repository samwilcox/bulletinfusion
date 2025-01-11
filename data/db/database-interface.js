/**
 * BULLETIN FUSION
 * by Sam Wilcox <sam@bulletinfusion.com>
 * 
 * https://www.bulletinfusion.com
 * 
 * Bulletin Fusion is released under the GPL v3 license.
 * To view the license, visit:
 * https://license.bulletinfusion.com
 */

/**
 * Interface contract for Database Providers.
 */
class DatabaseInterface {
    /**
     * Establishes a connection to the database.
     * This method must be implemented by a concrete database class.
     * 
     * @throws {Error} If this method is not implemented.
     */
    connect() {
        throw new Error("connect() method must be implemented");
    }

    /**
     * Executes a raw SQL query on the database.
     * This method must be implemented by a concrete database class.
     * 
     * @param {string} sql - The SQL query string to be executed.
     * @param {Array} [params=[]] - The parameters to be used in the query.
     * @returns {Promise} A promise that resolves with the result of the query.
     * @throws {Error} If this method is not implemented.
     */
    query(sql, params = []) {
        throw new Error("query() method must be implemented");
    }

    /**
     * Executes a query and fetches all rows from the result.
     * This method must be implemented by a concrete database class.
     * 
     * @param {string} sql - The SQL query string to be executed.
     * @param {Array} [params=[]] - The parameters to be used in the query.
     * @returns {Promise} A promise that resolves with an array of rows returned by the query.
     * @throws {Error} If this method is not implemented.
     */
    fetchAll(sql, params = []) {
        throw new Error("fetchAll() method must be implemented");
    }

    /**
     * Inserts data into a specified table.
     * This method must be implemented by a concrete database class.
     * 
     * @param {string} table - The name of the table where data should be inserted.
     * @param {Object} data - An object containing key-value pairs representing the columns and their values.
     * @returns {Promise} A promise that resolves when the insert operation is complete.
     * @throws {Error} If this method is not implemented.
     */
    insert(table, data) {
        throw new Error("insert() method must be implemented");
    }

    /**
     * Updates existing records in a specified table.
     * This method must be implemented by a concrete database class.
     * 
     * @param {string} table - The name of the table where the data should be updated.
     * @param {Object} data - An object containing key-value pairs representing the columns and their values.
     * @param {string} where - The condition for which rows to update.
     * @param {Array} [params=[]] - Additional parameters for more complex queries, if neccessary. 
     * @returns {Promise} A promise tha resolves when the update operation is complete.
     * @throws {Error} If this method is not implemented.
     */
    update(table, data, where, params = []) {
        throw new Error("update() method must be implemented");
    }

    /**
     * Deletes records from a specified table.
     * This method must be implemented by a concrete database class.
     * 
     * @param {string} table - The name of the table where data should be deleted.
     * @param {string} where - The condition for which rows to delete (e.g., "id = ?").
     * @param {Array} [params=[]] - The values to replace the placeholders in the 'where' condition. 
     * @returns {Promise} A promise that resolves when the delete operation is complete.
     * @throws {Error} If this method is not implemented.
     */
    delete(table, where, params = []) {
        throw new Error("delete() method must be implemented");
    }

    /**
     * Closes the database connection.
     * This method must be implemented by a concrete database class.
     * 
     * @returns {Promise} A promise that resolves when the connection has been successfully closed.
     * @throws {Error} If this method is not implemented.
     */
    close() {
        throw new Error("close() method must be implemented");
    }
}

module.exports = DatabaseInterface;