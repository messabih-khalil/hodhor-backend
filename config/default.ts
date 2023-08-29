export default {
    server_port: process.env.SERVER_PORT || 5000,
    node_env: process.env.NODE_ENV,
    database_uri: process.env.DATABASE_URI,
    redis_client: process.env.REDIS_CLIENT,
    jwt_secret_key: process.env.JWT_SECRET_KEY,
    secret_key_one: process.env.SECRET_KEY_ONE,
    secret_key_two: process.env.SECRET_KEY_TWO,
};
