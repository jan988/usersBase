// storages/usersStorage.js
const { Pool } = require('pg');
require('dotenv').config();

class UsersStorage {
    constructor() {
      this.pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false,  // Required for secure connections in production
        },
    });
    }

    async addUser({ firstName, lastName, email, age, bio }) {
        const query = `
            INSERT INTO users (first_name, last_name, email, age, bio)
            VALUES ($1, $2, $3, $4, $5) RETURNING id;
        `;
        const values = [firstName, lastName, email, age, bio];
        const res = await this.pool.query(query, values);
        return res.rows[0].id;
    }

    async getUsers() {
        const res = await this.pool.query('SELECT * FROM users;');
        return res.rows;
    }

    async getUser(id) {
        const query = 'SELECT * FROM users WHERE id = $1;';
        const res = await this.pool.query(query, [id]);
        return res.rows[0];
    }

    async updateUser(id, { firstName, lastName, email, age, bio }) {
        const query = `
            UPDATE users SET first_name = $1, last_name = $2, email = $3, age = $4, bio = $5
            WHERE id = $6;
        `;
        const values = [firstName, lastName, email, age, bio, id];
        await this.pool.query(query, values);
    }

    async deleteUser(id) {
        const query = 'DELETE FROM users WHERE id = $1;';
        await this.pool.query(query, [id]);
    }
}

module.exports = new UsersStorage();
