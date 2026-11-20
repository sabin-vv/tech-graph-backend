import {
    GetObjectCommand,
    HeadObjectCommand,
    PutObjectCommand,
    S3Client,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const AVATAR_UPLOAD_EXPIRY_SECONDS = 300
const AVATAR_READ_EXPIRY_SECONDS = 900

const getBucket = () => {
    const bucket = process.env.AWS_S3_BUCKET?.trim()
    if (!bucket) throw new Error('AWS_S3_BUCKET is not configured')
    return bucket
}

const getS3Client = () => {
    const region = process.env.AWS_REGION?.trim()
    if (!region) throw new Error('AWS_REGION is not configured')

    return new S3Client({ region })
}

export const createAvatarUploadUrl = async (key: string, contentType: string) => {
    const command = new PutObjectCommand({
        Bucket: getBucket(),
        Key: key,
        ContentType: contentType,
    })

    return getSignedUrl(getS3Client(), command, {
        expiresIn: AVATAR_UPLOAD_EXPIRY_SECONDS,
    })
}

export const createAvatarReadUrl = async (key: string) => {
    const command = new GetObjectCommand({
        Bucket: getBucket(),
        Key: key,
    })

    return getSignedUrl(getS3Client(), command, {
        expiresIn: AVATAR_READ_EXPIRY_SECONDS,
    })
}

export const assertObjectExists = async (key: string) => {
    await getS3Client().send(
        new HeadObjectCommand({
            Bucket: getBucket(),
            Key: key,
        }),
    )
}
