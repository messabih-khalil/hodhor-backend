import cloudinary from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import config from 'config'



cloudinary.v2.config({
    cloud_name: config.get('cloudinary_cloud_name'),
    api_key: config.get('cloudinary_api_key'),
    api_secret: config.get('cloudinary_api_secert'),
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary.v2,
    params: async (req, file) => {
        return {
            folder: 'hodhor',
            public_id: 'absent-image',
            allowed_formats: ['jpg', 'png'],
        };
    },
});

const parser = multer({ storage });

export { parser };
