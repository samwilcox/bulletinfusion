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

const mysql = require('mysql2');
const DatabaseInterface = require('../database-interface');

/**
 * Database provider for MySQL database server.
 */
class MySQLDatabaseProvider extends DatabaseInterface {
    /**
     * Constructor that sets up MySQLDatabaseProvider.
     */
    constructor() {
        super();
        this.connection = null;
        this.tablePrefix = process.env.MYSQL_DATABASE_PREFIX || '';
    }

    /**
     * Establishes a connection to the database.
     * 
     * @throws {Error} If this method is not implemented.
     */
    connect() {
        const configs = {
            host: process.env.MYSQL_DATABASE_HOST,
            port: parseInt(process.env.MYSQL_DATABASE_PORT),
            user: process.env.MYSQL_DATABASE_USER,
            password: process.env.MYSQL_DATABASE_PASSWORD,
            database: process.env.MYSQL_DATABASE_NAME
        };

        this.connection = mysql.createConnection(configs);

        return new Promise((resolve, reject) => {
            this.connection.connect((err) => {
                if (err) {
                    return reject(err);
                }

                console.log('Connected to the database server.');
                resolve();
            });
        });
    }

    /**
     * Executes a raw SQL query on the database.
     * 
     * @param {string} sql - The SQL query string to be executed.
     * @param {Array} [params=[]] - The parameters to be used in the query.
     * @returns {Promise} A promise that resolves with the result of the query.
     * @throws {Error} If this method is not implemented.
     */
    query(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.connection.execute(sql, params, (err, results) => {
                if (err) {
                    return reject(err);
                }

                resolve(results);
            });
        });
    }

    /**
     * Executes a query and fetches all rows from the result.
     * 
     * @param {string} sql - The SQL query string to be executed.
     * @param {Array} [params=[]] - The parameters to be used in the query.
     * @returns {Promise} A promise that resolves with an array of rows returned by the query.
     * @throws {Error} If this method is not implemented.
     */
    fetchAll(sql, params = []) {
        return this.query(sql, params);
    }

    /**
     * Inserts data into a specified table.
     * 
     * @param {string} table - The name of the table where data should be inserted.
     * @param {Object} data - An object containing key-value pairs representing the columns and their values.
     * @returns {Promise} A promise that resolves when the insert operation is complete.
     * @throws {Error} If this method is not implemented.
     */
    insert(table, data) {
        const columns = Object.keys(data).join(',');
        const values = Object.values(data);
        const placeHolders = values.map(() => '?').join(',');

        const sql = `INSERT INTO ${this.tablePrefix}${table} (${columns}) VALUES (${placeHolders})`;

        return this.query(sql, values);
    }

    /**
     * Updates existing records in a specified table.
     * 
     * @param {string} table - The name of the table where the data should be updated.
     * @param {Object} data - An object containing key-value pairs representing the columns and their values.
     * @param {Object} where - The condition for which rows to update.
     * @param {Array} [params=[]] - Additional parameters for more complex queries, if neccessary. 
     * @returns {Promise} A promise tha resolves when the update operation is complete.
     * @throws {Error} If this method is not implemented.
     */
    update(table, data, where, params = []) {
        try {
            if (typeof where !== 'object' || !where) {
                throw new Error("The 'where' parameter must be an object");
            }

            const setClause = Object.keys(data).map((key) => `${key} = ?`).join(',');
            const whereClause = Object.keys(where).map((key) => `${key} = ?`).join(' AND ');
            const values = [...Object.values(data), ...Object.values(where)];
            const sql = `UPDATE ${this.tablePrefix}${table} SET ${setClause} WHERE ${whereClause}`;
            const allParams = [...values, ...params];

            return this.query(sql, allParams);
        } catch (error) {
            console.error('Error updating record:', error);
            throw error;
        }
    }

    /**
     * Deletes records from a specified table.
     * 
     * @param {string} table - The name of the table where data should be deleted.
     * @param {Object} where - An object representing the conditions for which rows to delete.
     * @param {Array} [params=[]] - Additional parameters for more complex queries, if necessary.
     * @returns {Promise} A promise that resolves when the delete operation is complete.
     */
    delete(table, where, params = []) {
        try {
            if (typeof where !== 'object' || !where) {
                throw new Error("The 'where' parameter must be an object");
            }

            const whereClause = Object.keys(where)
                .map((key) => `${key} = ?`)
                .join(' AND ');

            const values = [...Object.values(where), ...params];
            const sql = `DELETE FROM ${this.tablePrefix}${table} WHERE ${whereClause}`;

            return this.query(sql, values);
        } catch (error) {
            console.error('Error deleting records:', error);
            throw error;
        }
    } 

    /**
     * Closes the database connection.
     * 
     * @returns {Promise} A promise that resolves when the connection has been successfully closed.
     * @throws {Error} If this method is not implemented.
     */
    close() {
        return new Promise((resolve, reject) => {
            if (this.connection) {
                this.connection.end((err) => {
                    if (err) {
                        return reject(err);
                    }

                    resolve();
                });
            } else {
                reject(new Error("No active connection to close"));
            }
        });
    }
}

module.exports = new MySQLDatabaseProvider();