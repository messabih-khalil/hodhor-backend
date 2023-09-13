export default {
    server_port: process.env.SERVER_PORT || 5000,
    client_url: process.env.CLIENT_URL,
    node_env: process.env.NODE_ENV,
    database_uri: process.env.DATABASE_URI,
    redis_host: process.env.REDIS_HOST,
    jwt_secret_key: process.env.JWT_SECRET_KEY,
    secret_key_one: process.env.SECRET_KEY_ONE,
    secret_key_two: process.env.SECRET_KEY_TWO,
    sendgrid_api_key: process.env.SENDGRID_API_KEY,
    sender_email: process.env.SENDER_EMAIL,
    sender_email_password: process.env.SENDER_EMAIL_PASSWORD,
};
