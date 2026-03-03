// lightning-pay-server-list.js

/**
 * This module manages Lightning Payment Server Pools and configurations.
 * It allows for the addition of new servers, retrieval of existing ones,
 * and management of their configurations.
 */

class LightningPayServerList {
    constructor() {
        this.servers = [];
    }

    /**
     * Add a new server to the pool.
     * @param {Object} server - The server configuration.
     */
    addServer(server) {
        this.servers.push(server);
    }

    /**
     * Get a list of all servers.
     * @returns {Array} - An array of server configurations.
     */
    getServers() {
        return this.servers;
    }

    /**
     * Find a server by its identifier.
     * @param {string} id - The server identifier.
     * @returns {Object|null} - The server configuration or null if not found.
     */
    findServerById(id) {
        return this.servers.find(server => server.id === id) || null;
    }

    /**
     * Update a server's configuration.
     * @param {string} id - The server identifier.
     * @param {Object} newConfig - The new configuration for the server.
     */
    updateServer(id, newConfig) {
        const serverIndex = this.servers.findIndex(server => server.id === id);
        if (serverIndex !== -1) {
            this.servers[serverIndex] = {...this.servers[serverIndex], ...newConfig};
        }
    }

    /**
     * Remove a server from the pool.
     * @param {string} id - The server identifier.
     */
    removeServer(id) {
        this.servers = this.servers.filter(server => server.id !== id);
    }
}

module.exports = LightningPayServerList;
